import datetime
from flask import session
from schedule import db, app
from schedule.model.query import FastQuery


class QueryRunsheet(object):

    @staticmethod
    def runsheets(from_date, to_date):
        sql = """
            select r.*, e.name event_name, ed.focus, ed.url, ed.notes
            from runsheet r
            inner join event e on e.id=r.event_id
            left outer join event_date ed
                on ed.event_id=r.event_id and ed.on_date=r.on_date
            where r.on_date between :from_date and :to_date
            order by r.on_date, e.name
        """
        rows = db.session.execute(
            sql, {'from_date': from_date, 'to_date': to_date})

        sheets = []
        for row in rows.fetchall():
            r = dict(row)
            r['on_date'] = row['on_date'].strftime('%Y-%m-%d')
            sheets.append(r)

        return sheets

    @staticmethod
    def runsheet(event_id, on_date):
        sql = """
            select r.*, e.name event_name, ed.focus, ed.url, ed.notes
            from runsheet r
            inner join event e on e.id=r.event_id
            left outer join event_date ed
                on ed.event_id=r.event_id and ed.on_date=r.on_date
            where r.event_id = :event_id and r.on_date = :on_date
        """
        rows = db.session.execute(
            sql, {'event_id': event_id, 'on_date': on_date})

        if rows.rowcount == 0:
            ed = FastQuery.event_date_ondate(event_id, on_date)
            return ed

        sheet = rows.fetchone()
        r = dict(sheet)
        r['on_date'] = sheet['on_date'].strftime('%Y-%m-%d')
        return r

    @staticmethod
    def update_event_date_runsheet(event_id, on_date, runsheet):
        sql = """WITH upsert AS (
            update runsheet set runsheet=:runsheet
            where event_id=:event_id and on_date=:on_date RETURNING *)
            insert into runsheet (event_id,on_date,runsheet)
            select :event_id,:on_date,:runsheet
            WHERE NOT EXISTS (SELECT * from upsert)
        """
        data = {
            'event_id': event_id, 'on_date': on_date, 'runsheet': runsheet
        }
        rows = db.session.execute(sql, data)
        db.session.commit()

    @staticmethod
    def update_event_date_runsheet_notes(event_id, on_date, notes):
        sql = """WITH upsert AS (
            update runsheet set runsheet_notes=:runsheet_notes
            where event_id=:event_id and on_date=:on_date RETURNING *)
            insert into runsheet (event_id,on_date,runsheet_notes)
            select :event_id,:on_date,:runsheet_notes
            WHERE NOT EXISTS (SELECT * from upsert)
        """
        data = {
            'event_id': event_id, 'on_date': on_date,
            'runsheet_notes': notes
        }

        rows = db.session.execute(sql, data)
        db.session.commit()

    @staticmethod
    def runsheet_events(event_id=None):
        sql = """
            select * from event
            where id=:event_id or parent_event=:event_id
            and active
            order by name
        """
        data = {'event_id': event_id}
        rows = db.session.execute(sql, data)

        events = []
        for row in rows.fetchall():
            events.append(dict(row))

        return events

    @staticmethod
    def runsheet_templates():
        sql = """
            select r.*, e.name event_name
            from runsheet_template r
            inner join event e on e.id=r.event_id
            order by r.name
        """
        rows = db.session.execute(sql)

        templates = []
        for row in rows.fetchall():
            templates.append(dict(row))
        return templates

    @staticmethod
    def parent_events():
        person_id = session['user_id']

        if session['role'] == 'admin':
            sql = """
                select * from event
                where parent_event is null
                and active
                order by name
            """
            rows = db.session.execute(sql)
        else:
            # For non-admins, restrict to events they can administrate
            sql = """
                select e.* from event e
                  inner join person p on p.id=:person_id
                  inner join event_admins ad on ad.event_id=e.id
                    and ad.person_id=p.id
                where parent_event is null
                and e.active and p.active
                order by e.name
            """
            rows = db.session.execute(sql, {'person_id': session['user_id']})

        events = []
        for row in rows.fetchall():
            events.append(dict(row))
        return events

    @staticmethod
    def get_template_by_id(template_id):
        """
        Fetch an existing template.
        """
        sql = """
            select r.*, e.name event_name
            from runsheet_template r
            inner join event e on e.id=r.event_id
            where r.id=:template_id
        """
        data = {'template_id': template_id}

        rows = db.session.execute(sql, data)
        if rows.rowcount == 0:
            return
        else:
            return dict(rows.fetchone())

    @staticmethod
    def get_template_by_name(name, event_id):
        """
        Fetch an existing template.
        """
        sql = """
            select r.*, e.name event_name
            from runsheet_template r
            inner join event e on e.id=r.event_id
            where r.name=:name and e.id=:event_id
        """
        data = {'name': name, 'event_id': event_id}

        rows = db.session.execute(sql, data)
        if rows.rowcount == 0:
            return
        else:
            return rows.fetchone()

    @staticmethod
    def create_template(name, event_id):
        """
        Create a new template and return the ID.
        """
        # Check that the template does not exist
        exists = QueryRunsheet.get_template_by_name(name, event_id)
        if exists:
            raise Exception("A template with that name exists for the event")

        sql = """
            insert into runsheet_template (name, event_id)
            values (:name, :event_id) returning id
        """
        data = {'name': name, 'event_id': event_id}
        rows = db.session.execute(sql, data)
        db.session.commit()
        row = rows.fetchone()
        return dict(row)['id']

    @staticmethod
    def update_template(template_id, name, event_id, runsheet, notes):
        sql = """
            update runsheet_template
            set name=:name, event_id=:event_id, runsheet=:runsheet,notes=:notes
            where id=:id
        """
        data = {
            'id': template_id, 'name': name, 'event_id': event_id,
            'runsheet': runsheet, 'notes': notes,
        }
        db.session.execute(sql, data)
        db.session.commit()

    @staticmethod
    def templates_for_event(event_id):
        sql = """
            select * from runsheet_template
            where event_id=:event_id
        """
        data = {'event_id': event_id}
        rows = db.session.execute(sql, data)

        templates = []
        for row in rows.fetchall():
            templates.append(dict(row))
        return templates
