import datetime
from flask import session
from schedule import db, app
import time


class FastQuery(object):
    """
    Faster database queries by bypassing SQLAlchemy and going direct to the
    database with optimised queries.
    """
    @staticmethod
    def events():
        start = time.time()
        sql = "select * from event where active order by name"
        rows = db.session.execute(sql)

        event_list = []
        for e in rows.fetchall():
            ev = dict(e)
            ev['created']= ev['created'].strftime('%Y-%m-%dT%H:%M:%S')
            event_list.append(ev)
        app.logger.debug('Events: %s' % (time.time() - start))
        return event_list

    @staticmethod
    def event(event_id):
        start = time.time()
        sql = """select * from event where id=:event_id"""
        row = db.session.execute(sql, {'event_id': event_id})
        e = row.fetchone()
        if not e:
            raise Exception("Cannot find the event")

        app.logger.debug('Event: %s' % (time.time() - start))
        return dict(e)

    @staticmethod
    def event_dates(event_id, from_date, to_date):
        start = time.time()
        sql = """select * from event_date
                  where on_date between :from_date and :to_date
                  and event_id = :event_id
                  order by on_date"""
        date_range = {
            'event_id': event_id,
            'from_date': from_date,
            'to_date': to_date,
        }
        rows = db.session.execute(sql, date_range)

        ev_dates = []
        for ed in rows.fetchall():
            ev_date = FastQuery.event_date_to_dict(ed)
            ev_dates.append(ev_date)

        app.logger.debug('Event Dates: %s' % (time.time() - start))
        return ev_dates

    @staticmethod
    def event_date(event_date_id):
        start = time.time()
        sql = "select * from event_date where id = :event_date_id"
        params = {
            'event_date_id': event_date_id
        }
        row = db.session.execute(sql, params)
        ev_date = row.fetchone()
        if not ev_date:
            raise Exception("Cannot find the event date")

        app.logger.debug('Event Date: %s' % (time.time() - start))
        return FastQuery.event_date_to_dict(ev_date)

    @staticmethod
    def rota_for_event_date(event_date_id):
        start = time.time()
        # Get the roles for the event date
        roles, role_people = FastQuery.roles(event_date_id=event_date_id)

        sql = """select ev.name event_name, ev.id event_id, on_date, role.name role_name,
                 firstname, lastname, role.id role_id, ed.id event_date_id,
                 p.active person_active, p.id person_id,
                 exists(select 1 from away_date where person_id=p.id
                  and on_date between from_date and to_date) is_away,
                 ed.focus, ed.notes
              from rota r
              inner join event_date ed on r.event_date_id=ed.id
              inner join event ev on ed.event_id=ev.id
              inner join person p on r.person_id=p.id
              inner join role on role.id = r.role_id
              where ed.id = :event_date_id"""

        params = {
            'event_date_id': event_date_id,
        }
        rows = db.session.execute(sql, params)
        r = {'rota': []}
        role_dict = {}
        for row in rows.fetchall():
            if not r.get('event_id'):
                r = {
                    'event_id': row['event_id'],
                    'event_name': row['event_name'],
                    'id': row['event_date_id'],
                    'focus': row['focus'],
                    'notes': row['notes'],
                    'on_date': row['on_date'].strftime('%Y-%m-%d'),
                    'rota': [],
                }

            on_rota = {
                'role_id': row['role_id'],
                'role': {
                    'id': row['role_id'],
                    'name': row['role_name'],
                },
                'person_id': row['person_id'],
                'firstname': row['firstname'],
                'lastname': row['lastname'],
                'person_name': '%s %s' % (row['firstname'], row['lastname']),
                'active': row['person_active'],
                'is_away': row['is_away'],
                'people': role_people.get(row['role_name'], [])
            }
            role_dict[row['role_name']] = on_rota

        # Sort the roles in to the sequence order
        for role in roles:
            rl = role['name']
            if role_dict.get(rl):
                r['rota'].append(role_dict[rl])
            else:
                # Nobody on rota, so create an empty entry
                r['rota'].append({
                    'role': {
                        'id': role['id'],
                        'name': rl
                    },
                    'people': role_people.get(rl, []),
                })

        # Get some basic details when we have an empty rota
        if not r.get('event_id'):
            ed = FastQuery.event_date(event_date_id)
            r.update(ed)

        app.logger.debug('Rota: %s' % (time.time() - start))
        return r

    @staticmethod
    def rota_for_person(person_id, from_date, to_date):
        """
        Get the rota details for an individual for a set date range. Used on the
        person's home screen.
        """
        start = time.time()
        sql = """select ev.name event_name, ev.id event_id, on_date, role.name role_name,
                 firstname, lastname, role.id role_id, ed.id event_date_id,
                 p.active person_active, p.id person_id, r.id,
                 exists(select 1 from away_date where person_id=p.id
                  and on_date between from_date and to_date) is_away
              from rota r
              inner join event_date ed on r.event_date_id=ed.id
              inner join event ev on ed.event_id=ev.id
              inner join person p on r.person_id=p.id
              inner join role on role.id = r.role_id
              where p.id = :person_id
              and ed.on_date between :from_date and :to_date"""
        params = {
            'person_id': person_id,
            'from_date': from_date,
            'to_date': to_date,
        }
        rows = db.session.execute(sql, params)

        rota = []
        for row in rows.fetchall():
            rota.append({
                'id': row['id'],
                'person_id': row['person_id'],
                'person_name': '%s %s' % (row['firstname'], row['lastname']),
                'active': row['person_active'],
                'is_away': row['is_away'],
                'role': {
                    'id': row['role_id'],
                    'name': row['role_name'],
                },
                'event_date': {
                    'id': row['event_date_id'],
                    'event_id': row['event_id'],
                    'event': row['event_name'],
                    'on_date': row['on_date'].strftime('%Y-%m-%dT%H:%M:%S'),
                },
            })

        app.logger.debug('Rota (person): %s' % (time.time() - start))
        return rota

    @staticmethod
    def rota_for_event(event_id, from_date, to_date):
        """
        Get the rota dates for an event for a given date range.
        """
        start = time.time()
        sql = """select ev.name event_name, ev.id event_id, on_date, role.name role_name,
                 firstname, lastname, role.id role_id, ed.id event_date_id,
                 p.active person_active, p.id person_id,
                 exists(select 1 from away_date where person_id=p.id
                  and on_date between from_date and to_date) is_away,
                 ed.focus, ed.notes
              from event_date ed
              inner join event ev on ed.event_id=ev.id
              inner join rota r on r.event_date_id=ed.id
              inner join role on r.role_id = role.id
              inner join person p on r.person_id=p.id
              where ev.id = :event_id
              and ed.on_date between :from_date and :to_date
              order by on_date, sequence"""

        params = {
            'event_id': event_id,
            'from_date': from_date,
            'to_date': to_date,
        }
        rows = db.session.execute(sql, params)

        r = None
        got_event_date_ids = []
        for row in rows.fetchall():
            got_event_date_ids.append(row['event_date_id'])
            if not r:
                r = {
                    'event_id': row['event_id'],
                    'event_name': row['event_name'],
                    'dates': {},
                }
            on_date = row['on_date'].strftime('%Y-%m-%d')
            if not r['dates'].get(on_date):
                r['dates'][on_date] = {
                    'on_date': row['on_date'].strftime('%Y-%m-%d'),
                    'event_date_id': row['event_date_id'],
                    'focus': row['focus'],
                    'notes': row['notes'],
                    'rota': {},
                }

            if row['firstname'] and row['lastname']:
                person_name = '%s %s' % (row['firstname'], row['lastname'])
            else:
                person_name = None

            r['dates'][on_date]['rota'][row['role_name']] = {
                'person_id': row['person_id'],
                'person_name': person_name,
                'active': row['person_active'],
                'is_away': row['is_away'],
            }

        # Make sure that we at least have some event details
        if not r:
            event = FastQuery.event(event_id)
            r = {
                'event_id': event_id,
                'event_name': event['name'],
            }

        # Get the roles for the event
        roles, role_people = FastQuery.roles(event_id=event_id)
        r['role_names'] = [x['name'] for x in roles]

        # Reorganise the dates and rota for each date into lists
        r['event_dates'] = []
        for key in sorted(r.get('dates', {}).keys()):
            on_date = r['dates'][key]

            # Re-organise the rota into the display sequence
            rota = []
            for role in roles:
                if on_date['rota'].get(role['name']):
                    rota.append(on_date['rota'][role['name']])
                else:
                    rota.append({})
            on_date['rota'] = rota

            # Re-organise the dates into a list
            r['event_dates'].append(on_date)
        if r.get('dates'):
            del r['dates']

        # Add in blank rows with dates without a rota
        r['event_dates'].extend(FastQuery._dates_without_rota(event_id,
            got_event_date_ids, from_date, to_date, roles))

        app.logger.debug('Rota (event): %s' % (time.time() - start))
        return r

    @staticmethod
    def _dates_without_rota(event_id, ignore_ids, from_date, to_date, roles):
        """
        Add the event_dates where we don't have any rota defined that
        still meet the date range: got_event_date_ids
        """
        on_dates = []
        if len(ignore_ids) == 0:
            return on_dates

        sql = """select e.id event_id, e.name event_name, on_date,
                  ed.id event_date_id, focus, notes
                  from event_date ed
                  inner join event e on e.id=ed.event_id
                  where ed.id not in :ids
                  and ed.on_date between :from_date and :to_date
                  and ed.event_id = :event_id
                  order by on_date"""
        rows = db.session.execute(sql, {'ids': tuple(ignore_ids),
                                        'event_id': event_id,
                                        'from_date': from_date,
                                        'to_date': to_date})
        for row in rows.fetchall():
            on_date = {
                'on_date': row['on_date'].strftime('%Y-%m-%d'),
                'event_date_id': row['event_date_id'],
                'focus': row['focus'],
                'notes': row['notes'],
                'rota': [{} for role in roles],
            }
            on_dates.append(on_date)
        return on_dates

    @staticmethod
    def roles(event_date_id=None, event_id=None):
        sql = """select r.id role_id, r.name role_name, firstname, lastname,
                  p.active person_active, p.id person_id,
                  exists(select 1 from away_date where person_id=p.id
                    and on_date between from_date and to_date) is_away
                  from role r
                  left outer join role_people rp on rp.role_id=r.id
                  left outer join person p on p.id=rp.person_id
                  inner join event_date ed on r.event_id=ed.event_id and """

        if event_date_id:
            sql += """ed.id = :param_id
                    order by sequence, r.id"""
            param_id = event_date_id
        else:
            sql += """ed.event_id = :param_id
                    order by sequence, r.id"""
            param_id = event_id

        rows = db.session.execute(sql, {'param_id': param_id})
        role_list = []
        role_people = {}
        for row in rows:
            r = {'id': row['role_id'], 'name': row['role_name']}
            if r not in role_list:
                role_list.append(r)

            if not row['person_active']:
                continue
            if not role_people.get(row['role_name']):
                role_people[row['role_name']] = [{}]

            # Add the person to the role
            if row['is_away']:
                person_name_status = '%s %s (away)' % (row['firstname'],
                                                       row['lastname'])
            else:
                person_name_status = '%s %s' % (row['firstname'],
                                                row['lastname'])

            role_people[row['role_name']].append({
                'person_id': row['person_id'],
                'person_name': '%s %s' % (row['firstname'], row['lastname']),
                'is_away': row['is_away'],
                'person_name_status': person_name_status,
            })

        return role_list, role_people

    @staticmethod
    def event_date_to_dict(ed):
        ev_date = dict(ed)
        ev_date['on_date'] = ev_date['on_date'].strftime('%Y-%m-%d')
        return ev_date

    @staticmethod
    def permissions(person_id):
        """
        Get the role and permissions to events for a person.
        """
        start = time.time()
        sql = """select p.id, e.id event_id, e.name event_name
                  from person p
                  inner join event_admins ad on ad.person_id=p.id
                  inner join event e on e.id=ad.event_id
                  where person_id=:person_id"""
        rows = db.session.execute(sql, {'person_id': person_id})

        events_admin = []
        for row in rows.fetchall():
            events_admin.append({
                'id': row['event_id'],
                'name': row['event_name'],
            })

        permissions = {
            'name': session['name'],
            'role': session['role'],
            'is_admin': session['role'] == 'admin',
            'user_id': session['user_id'],
            'events_admin': events_admin,
        }
        app.logger.debug('Permissions: %s' % (time.time() - start))
        return permissions

    @staticmethod
    def away_date(person_id, from_date, to_date):
        """
        Get the away dates for a person.
        """
        start = time.time()
        sql = """select * from away_date
                  where person_id = :person_id
                  and from_date >= :from_date
                  and from_date < :to_date"""
        rows = db.session.execute(sql, {'person_id': person_id,
                                        'from_date': from_date,
                                        'to_date': to_date})

        away_dates = []
        for row in rows.fetchall():
            away_dates.append({
                'id': row['id'],
                'person_id': row['person_id'],
                'from_date': row['from_date'].strftime('%Y-%m-%d'),
                'to_date': row['to_date'].strftime('%Y-%m-%d'),
            })

        app.logger.debug('Away Dates: %s' % (time.time() - start))
        return away_dates

    @staticmethod
    def date_range(ui_range='12'):
        """
        Get the from and to date when given an number of weeks. Used for the
        'Recent', 'Upcoming' menus.
        """
        if not ui_range:
            ui_range = 12
        weeks = int(ui_range)
        delta = datetime.date.today() + datetime.timedelta(weeks=weeks)
        if weeks > 0:
            # Next n weeks
            from_date = datetime.date.today().strftime('%Y-%m-%d')
            to_date = delta.strftime('%Y-%m-%d')
        else:
            # Last n weeks
            from_date = delta.strftime('%Y-%m-%d')
            to_date = datetime.date.today().strftime('%Y-%m-%d')
        return from_date, to_date

    @staticmethod
    def date_range_from(from_str):
        """
        Get the from and to date when given an number of weeks.
        """
        if not from_str:
            from_date = datetime.date.today()
        from_date = datetime.datetime.strptime(from_str, '%Y-%m-%d')
        to_date = from_date + datetime.timedelta(weeks=12)
        return from_date.strftime('%Y-%m-%d'), to_date.strftime('%Y-%m-%d')
