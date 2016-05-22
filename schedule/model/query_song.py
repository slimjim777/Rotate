import time
from flask import session
from schedule import db, app
from schedule.model.query import FastQuery
from schedule.model.filestore import FileStore
from schedule.model.song import Onsong, ChordPro
from schedule.model.transpose import Transpose
import json
import requests


class SongQuery(object):

    @staticmethod
    def songs(active):
        if active == 'all':
            sql = "select * from song order by name"
        elif active == 'inactive':
            sql = "select * from song where inactive order by name"
        else:
            sql = "select * from song where active order by name"

        rows = db.session.execute(sql)

        song_list = []
        for row in rows.fetchall():
            song_list.append(dict(row))
        return song_list

    @staticmethod
    def song(song_id):
        sql = "select * from song where id=:song_id"
        rows = db.session.execute(sql, {'song_id': song_id})

        s = rows.fetchone()
        if not s:
            raise Exception("Cannot find the song")
        return dict(s)

    @staticmethod
    def song_upload(name, filename, file_data):
        """
        Check if a song exists with the name, if not, create it. Then upload
        the attachment.
        """
        # Get or create the song
        try:
            song = SongQuery.song_by_name(name)
        except Exception as v:
            song = SongQuery.song_new({'name': name})

        # Upload the attachment, ignore the error if the file already exists
        try:
            SongQuery.song_attachments_add(
                song['id'], filename, file_data, False)
        except Exception as v:
            app.logger.warn(
                "Ignore song upload error for '%s': %s" % (filename, str(v)))
        return song

    @staticmethod
    def song_by_name(name):
        sql = "select * from song where name=:name"
        rows = db.session.execute(sql, {'name': name})

        s = rows.fetchone()
        if not s:
            raise Exception("Cannot find the song")

        return dict(s)

    @staticmethod
    def song_new(song):
        sql = """
            insert into song
            (name, active, url, tempo, time_signature)
            values (:name, :active, :url, :tempo, :time_signature)
            RETURNING id
        """
        data = {
            'name': song.get('name'), 'active': True, 'url': song.get('url'),
            'tempo': song.get('tempo'),
            'time_signature': song.get('time_signature')
        }

        rows = db.session.execute(sql, data)
        song_id = rows.fetchone()[0]
        db.session.commit()
        return SongQuery.song(song_id)

    @staticmethod
    def song_update(song):
        start = time.time()
        sql = """
            update song
            set name=:name, active=:active, url=:url, tempo=:tempo,
                time_signature=:time_signature
            where id=:id"""
        db.session.execute(sql, song)
        db.session.commit()

    @staticmethod
    def song_attachments(song_id):
        sql = "select * from attachment where song_id=:song_id order by name"

        rows = db.session.execute(sql, {'song_id': song_id})

        attachments = []
        for row in rows.fetchall():
            r = dict(row)
            r['created_date'] = r['created_date'].strftime('%Y-%m-%dT%H:%M:%S')
            attachments.append(r)
        return attachments

    @staticmethod
    def song_attachments_add(song_id, filename, file_data, encoded=True):
        """
        Upload the file to the storage site. Check first that the attachment
        does not exist for the song.
        """
        sql = "select * from attachment where song_id=:song_id and name=:name"
        rows = db.session.execute(sql, {'song_id': song_id, 'name': filename})

        if rows.rowcount > 0:
            raise Exception("A file with the same name exists for the song")

        file_path = FileStore().put(song_id, filename, file_data, encoded)

        if file_path:
            # Add the attachment record
            sql = """insert into attachment (song_id, name, path, mime_type)
                values (:song_id, :filename, :path, :mime_type)
            """
            db.session.execute(
                sql, {'song_id': song_id, 'filename': filename,
                      'path': file_path, 'mime_type': ''})

            db.session.commit()

        return file_path

    @staticmethod
    def song_attachment_get(attachment_id):
        sql = """
            select * from attachment where id=:attachment_id order by name"""

        rows = db.session.execute(sql, {'attachment_id': attachment_id})

        if rows.rowcount == 0:
            return None
        row = rows.fetchone()
        return dict(row)

    @staticmethod
    def song_attachments_delete(song_id, att_id):
        # Get the attachment name
        sql = "select * from attachment where song_id=:song_id and id=:id"
        rows = db.session.execute(sql, {'song_id': song_id, 'id': att_id})
        row = rows.fetchone()

        # Remove the file from the filestore
        FileStore().delete(song_id, row['name'])

        # Remove the attachment record
        sql = "DELETE from attachment where song_id=:song_id and id=:id"
        rows = db.session.execute(sql, {'song_id': song_id, 'id': att_id})
        db.session.commit()

    @staticmethod
    def setlists(from_date, to_date):
        sql = """
            select s.*, e.name event_name, ed.focus, ed.url, ed.notes
            from setlist s
            inner join event e on e.id=s.event_id
            left outer join event_date ed
                on ed.event_id=s.event_id and ed.on_date=s.on_date
            where s.on_date between :from_date and :to_date
            order by s.on_date, e.name
        """
        rows = db.session.execute(
            sql, {'from_date': from_date, 'to_date': to_date})

        records = []
        for row in rows.fetchall():
            r = dict(row)
            if row['on_date']:
                r['on_date'] = row['on_date'].strftime('%Y-%m-%d')
            records.append(r)

        return records

    @staticmethod
    def upsert_event_date_setlist(event_id, on_date, setlist):
        sql = """WITH upsert AS (
            update setlist set on_date=:on_date
            where event_id=:event_id and on_date=:on_date RETURNING *)
            insert into setlist (event_id,on_date)
            select :event_id,:on_date
            WHERE NOT EXISTS (SELECT * from upsert)
        """
        data = {
            'event_id': event_id, 'on_date': on_date
        }
        rows = db.session.execute(sql, data)

        # Get the setlist
        sl = SongQuery.get_setlist(event_id, on_date)

        # Delete the setlist rows (not for new setlist)
        if setlist:
            SongQuery._delete_setlist_rows(sl['id'])

        # Add the setlist songs (only for existing setlists)
        if setlist:
            if not setlist['rows']:
                setlist['rows'] = []
            for index, row in enumerate(setlist['rows']):
                SongQuery._add_setlist_rows(sl['id'], row, index)

        db.session.commit()

    @staticmethod
    def get_setlist(event_id, on_date):
        sql = """
            select * from setlist
            where event_id=:event_id and on_date=:on_date
        """
        data = {
            'event_id': event_id, 'on_date': on_date
        }
        rows = db.session.execute(sql, data)
        row = rows.fetchone()
        return dict(row)

    @staticmethod
    def _delete_setlist_rows(setlist_id):
        sql = """
            delete from setlist_song
            where setlist_id = :setlist_id
        """
        rows = db.session.execute(sql, {'setlist_id': setlist_id})

    @staticmethod
    def _add_setlist_rows(setlist_id, row, index):
        sql = """
            insert into setlist_song
            (setlist_id, name, song_id, key, tempo, time_signature, position,
             url, notes)
            values (:setlist_id, :name, :song_id, :key, :tempo,
                    :time_signature, :position, :url, :notes)
        """
        row['setlist_id'] = setlist_id
        row['position'] = index
        row['tempo'] = row.get('tempo')
        row['key'] = row.get('key')
        row['song_id'] = row.get('song_id')
        row['url'] = row.get('url')
        row['notes'] = row.get('notes')
        db.session.execute(sql, row)

    @staticmethod
    def setlist_exists(event_id, on_date):
        sql = """
            select exists(
                select *
                from setlist
                where event_id = :event_id and on_date = :on_date
            )
        """
        rows = db.session.execute(
            sql, {'event_id': event_id, 'on_date': on_date})

        return rows.fetchone()[0]

    @staticmethod
    def setlist(event_id, on_date):
        sql = """
            select s.*, e.name event_name, ed.focus, ed.url, ed.notes
            from setlist s
            inner join event e on e.id=s.event_id
            left outer join event_date ed
                on ed.event_id=s.event_id and ed.on_date=s.on_date
            where s.event_id = :event_id and s.on_date = :on_date
        """
        rows = db.session.execute(
            sql, {'event_id': event_id, 'on_date': on_date})

        if rows.rowcount == 0:
            ed = FastQuery.event_date_ondate(event_id, on_date)
            return ed

        sheet = rows.fetchone()
        r = dict(sheet)
        r['on_date'] = sheet['on_date'].strftime('%Y-%m-%d')
        r['rows'] = SongQuery.setlist_rows(event_id, on_date)
        return r

    @staticmethod
    def setlist_rows(event_id, on_date):
        sql = """
            select s.*
            from setlist sl
            inner join setlist_song s on sl.id=s.setlist_id
            where sl.event_id = :event_id and sl.on_date = :on_date
            order by position
        """
        rows = db.session.execute(
            sql, {'event_id': event_id, 'on_date': on_date})

        if rows.rowcount == 0:
            return []

        return [dict(r) for r in rows.fetchall()]

    @staticmethod
    def song_find(q):
        sql = """
            select * from song
            where name ilike :q
            order by name
        """
        q = q.strip()
        if len(q) == 0:
            return []

        rows = db.session.execute(sql, {'q': '%' + q + '%'})
        return [dict(r) for r in rows.fetchall()]

    @staticmethod
    def song_chart(attachment_id, key=None):
        attachment = SongQuery.song_attachment_get(attachment_id)
        if not attachment:
            return

        # Check if we have the right file type
        extension = attachment['name'].split('.')[-1].lower()
        if extension != 'onsong' and extension != 'pro':
            return

        # Get the song file
        req = requests.get(app.config['FILESTORE_URL'] + attachment['path'])
        content = req.content.decode('utf-8')

        if extension == 'onsong':
            # Parse the Onsong file
            on_song = Onsong(content)
            song_chart = on_song.parsed
        else:
            # Parse the ChordPro file
            song_pro = ChordPro(content)
            song_chart = song_pro.parsed

        # Transpose to 'OriginalKey' if it is provided
        if key:
            t = Transpose(song_chart, key)
            song_chart = t.song
        elif song_chart.get('OriginalKey'):
            t = Transpose(song_chart, song_chart['OriginalKey'])
            song_chart = t.song

        return song_chart
