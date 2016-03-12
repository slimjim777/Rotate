import time
from flask import session
from schedule import db, app
from schedule.model.filestore import FileStore
import json


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
        start = time.time()
        sql = "select * from song where id=:song_id"
        rows = db.session.execute(sql, {'song_id': song_id})

        s = rows.fetchone()
        if not s:
            raise Exception("Cannot find the song")

        app.logger.debug('Song: %s' % (time.time() - start))
        return dict(s)

    @staticmethod
    def song_update(song):
        start = time.time()
        sql = """
            update song
            set name=:name, active=:active, url=:url, tempo=:tempo,
                time_signature=:time_signature
            where id=:id"""
        rows = db.session.execute(sql, song)
        print(rows)
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
    def song_attachments_add(song_id, filename, file_data):
        """
        Upload the file to the storage site. Check first that the attachment
        does not exist for the song.
        """
        sql = "select * from attachment where song_id=:song_id and name=:name"
        rows = db.session.execute(sql, {'song_id': song_id, 'name': filename})

        if rows.rowcount > 0:
            raise Exception("A file with the same name exists for the song")

        resp = FileStore().put(song_id, filename, file_data)

        r = json.loads(resp)
        if r['response'] == 'Success':
            # Add the attachment record
            sql = """insert into attachment (song_id, name, path, mime_type)
                values (:song_id, :filename, :path, :mime_type)
            """
            db.session.execute(
                sql, {'song_id': song_id, 'filename': filename,
                      'path': r['path'], 'mime_type': ''})

            db.session.commit()
            return resp
        else:
            return resp
