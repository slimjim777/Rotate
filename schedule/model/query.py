import datetime
from flask import session
from schedule import db, app
import time


ROLES_QUERY = """select r.id role_id, r.name role_name, firstname, lastname,
          p.active person_active, p.id person_id, on_date, sequence,
          exists(select 1 from away_date where person_id=p.id
            and on_date between from_date and to_date) is_away
          from role r
          left outer join role_people rp on rp.role_id=r.id
          left outer join person p on p.id=rp.person_id
          inner join event_date ed on r.event_id=ed.event_id and """


DAY_OF_WEEK = {
    'day_mon': 0,
    'day_tue': 1,
    'day_wed': 2,
    'day_thu': 3,
    'day_fri': 4,
    'day_sat': 5,
    'day_sun': 6,
}

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
            ev['created'] = ev['created'].strftime('%Y-%m-%dT%H:%M:%S')
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
    def event_dates_in_range(event_id, from_date, to_date):
        """
        Generate the next 12 event dates for the event.
        """
        # Get the event to find the frequency
        e = FastQuery.event(event_id)

        # If it is irregular, just return the dates in the range
        if e['frequency'] == 'irregular':
            return FastQuery.event_dates(event_id, from_date, to_date)

        if e['frequency'] == 'weekly':
            # Get the monday of the week
            from_d = datetime.datetime.strptime(from_date, '%Y-%m-%d')
            if from_d.weekday() == 0:
                current_date = from_d
            else:
                current_date = from_d - datetime.timedelta(days=from_d.weekday())
        elif e['frequency'] == 'monthly':
            pass

        rota_dates = []
        while len(rota_dates) < 12:
            for day, value in DAY_OF_WEEK.items():
                if e[day]:
                    on_date = current_date + datetime.timedelta(days=value)
                    rota_dates.append({
                        'id': len(rota_dates), # fake event date ID
                        'event_id': e['id'],
                        'on_date': datetime.datetime.strftime(on_date, '%Y-%m-%d'),
                    })
            if e['frequency'] == 'monthly':
                current_date += datetime.timedelta(months=1)
            else:
                current_date += datetime.timedelta(weeks=1)
        return rota_dates

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
    def event_date_ondate(event_id, on_date):
        start = time.time()
        sql = "select * from event_date where event_id=:event_id and on_date=:on_date"
        params = {
            'event_id': event_id, 'on_date': on_date
        }
        row = db.session.execute(sql, params)
        ev_date = row.fetchone()
        if not ev_date:
            return {
                'event_id': event_id,
                'on_date': on_date
            }

        app.logger.debug('Event Date: %s' % (time.time() - start))
        return FastQuery.event_date_to_dict(ev_date)

    @staticmethod
    def rota_for_event_date_ondate(event_id, on_date):
        start = time.time()

        # Get event date details
        e = FastQuery.event_date_ondate(event_id, on_date)

        # Get the roles for the date
        roles = FastQuery.roles_for_event_ondate(event_id, on_date)

        # Get the rota for the date
        rota = FastQuery._rota_for_event_date_ondate(event_id, on_date)

        # Reformat the details
        #event_date = {summary:e, roles: roles, rota: rota}
        event_date = {"summary":e, "roles": roles, "rota": rota}

        # Pivot roles by sequence
        rroles = {}
        for r in roles:
            seq = str(r['sequence']).zfill(4)
            if seq in rroles:
                rroles[seq].append(r)
            else:
                rroles[seq] = [r]

        # Convert to an array
        role_array = []
        for key,value in sorted(rroles.items()):
            role_list = value
            role_name = ''
            role_id = None
            if len(role_list) > 0:
                role_name = role_list[0]['role_name']
                role_id = role_list[0]['role_id']

            # Find the person in the rota for the role
            rr = {"person_id": None, "is_away": False}
            for r in rota:
                if r['role_id'] == role_id:
                    rr = r
                    break

            # Reformat the role info for display
            role_rota = {
                "role_id": role_id, "role_name": role_name, "roles": role_list,
                "person_id": rr["person_id"], "is_away": rr["is_away"]
            }
            role_array.append(role_rota)

        event_date["roles"] = role_array

        app.logger.debug('Event Date Rota: %s' % (time.time() - start))
        return event_date

    @staticmethod
    def _rota_for_event_date_ondate(event_id, on_date):
        start = time.time()

        sql = """select ev.name event_name, ev.id event_id, on_date,
                 role.name role_name, firstname, lastname, role.id role_id,
                 ed.id event_date_id, p.active person_active, p.id person_id,
                 exists(select 1 from away_date where person_id=p.id
                  and on_date between from_date and to_date) is_away,
                 ed.focus, ed.notes, ed.url, role.sequence,
                 exists(select 1 from rota rr
                        inner join event_date eded on rr.event_date_id=eded.id
                        where rr.person_id=p.id
                        and eded.id<>ed.id
                        and eded.on_date=ed.on_date) on_rota
              from rota r
              inner join event_date ed on r.event_date_id=ed.id
              inner join event ev on ed.event_id=ev.id
              inner join person p on r.person_id=p.id
              inner join role on role.id = r.role_id
              where ed.event_id = :event_id
              and ed.on_date = :on_date
              order by role.sequence"""

        params = {
            'event_id': event_id, 'on_date': on_date
        }
        rows = db.session.execute(sql, params)

        rota = []
        for row in rows:
            r = dict(row)
            r["on_date"] = str(r["on_date"])
            rota.append(r)
        return rota

    @staticmethod
    def rota_for_event_date(event_date_id):
        start = time.time()
        # Get the roles for the event date
        roles, role_people = FastQuery.roles_for_eventdate(event_date_id)

        sql = """select ev.name event_name, ev.id event_id, on_date,
                 role.name role_name, firstname, lastname, role.id role_id,
                 ed.id event_date_id, p.active person_active, p.id person_id,
                 exists(select 1 from away_date where person_id=p.id
                  and on_date between from_date and to_date) is_away,
                 ed.focus, ed.notes, ed.url,
                 exists(select 1 from rota rr
                        inner join event_date eded on rr.event_date_id=eded.id
                        where rr.person_id=p.id
                        and eded.id<>ed.id
                        and eded.on_date=ed.on_date) on_rota
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
        return FastQuery.rota_for_event_date_process(
            rows, roles, role_people, start)

    @staticmethod
    def rota_for_event_date_process(rows, roles, role_people, start):
        r = {'rota': []}
        role_dict = {}
        for row in rows.fetchall():
            if not r.get('event_id'):
                r = {
                    'summary': {
                        'on_date': row['on_date'].strftime('%Y-%m-%d'),
                        'focus': row['focus'],
                        'notes': row['notes'],
                        'url': row['url'],
                        'event_name': row['event_name'],
                        'event_id': row['event_id'],
                    },
                    'event_id': row['event_id'],
                    'event_name': row['event_name'],
                    'id': row['event_date_id'],
                    'focus': row['focus'],
                    'notes': row['notes'],
                    'url': row['url'],
                    'on_date': row['on_date'].strftime('%Y-%m-%d'),
                    'isEditing': False,
                    'roles': roles,
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
                'on_rota': row['on_rota'],
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
        Get the rota details for an individual for a set date range. Used on
        the person's home screen.
        """
        start = time.time()
        sql = """select ev.name event_name, ev.id event_id, on_date,
                 role.name role_name, firstname, lastname, role.id role_id,
                 ed.id event_date_id, p.active person_active, p.id person_id,
                 r.id, exists(select 1 from away_date where person_id=p.id
                  and on_date between from_date and to_date) is_away
              from rota r
              inner join event_date ed on r.event_date_id=ed.id
              inner join event ev on ed.event_id=ev.id
              inner join person p on r.person_id=p.id
              inner join role on role.id = r.role_id
              where p.id = :person_id
              and ed.on_date between :from_date and :to_date
              order by ed.on_date, ev.name"""
        params = {
            'person_id': person_id,
            'from_date': from_date,
            'to_date': to_date,
        }
        rows = db.session.execute(sql, params)

        rota_for_date = {}
        for row in rows.fetchall():
            on_date = row['on_date'].strftime('%Y-%m-%dT%H:%M:%S')
            event_name = row['event_name']
            available_people = FastQuery.available_people(
                row['role_id'], row['on_date'])
            if rota_for_date.get(on_date):
                # See if we a rota for this event
                if rota_for_date[on_date]['events'].get(event_name):
                    # Already have a role for this event date, add another
                    rota_for_date[on_date]['events'][event_name]['roles'].\
                        append({
                            'id': row['role_id'],
                            'name': row['role_name'],
                        })
                else:
                    # New event and role to add to this date
                    rota_for_date[on_date]['events'][event_name] = {
                        'event_id': row['event_id'],
                        'event': event_name,
                        'event_date_id': row['event_date_id'],
                        'available_people': available_people,
                        'roles': [{
                            'id': row['role_id'],
                            'name': row['role_name'],
                        }]
                    }
            else:
                # New date to add
                rota_for_date[on_date] = {
                    'on_date': on_date,
                    'person_id': row['person_id'],
                    'person_name': '%s %s' % (
                        row['firstname'], row['lastname']),
                    'active': row['person_active'],
                    'is_away': row['is_away'],
                    'available_people': available_people,
                    'events': {
                        event_name: {
                            'event_id': row['event_id'],
                            'event': event_name,
                            'event_date_id': row['event_date_id'],
                            'roles': [{
                                'id': row['role_id'],
                                'name': row['role_name'],
                            }]
                        }
                    }
                }

        # Sort the rota into date order
        rota = []
        for r in sorted(rota_for_date.keys()):
            # Sort the events by name
            on_date = rota_for_date[r]
            events = []
            for key in sorted(on_date['events'].keys()):
                events.append(on_date['events'][key])
                del on_date['events'][key]
            on_date['events'] = events
            rota.append(on_date)

        app.logger.debug('Rota (person): %s' % (time.time() - start))
        return rota

    @staticmethod
    def rota_for_event(event_id, from_date, to_date, date_format='%Y-%m-%d'):
        """
        Get the rota dates for an event for a given date range.
        """
        start = time.time()
        sql = """select ev.name event_name, ev.id event_id, on_date,
                 role.name role_name, firstname, lastname, role.id role_id,
                 ed.id event_date_id, p.active person_active, p.id person_id,
                 exists(select 1 from away_date where person_id=p.id
                  and on_date between from_date and to_date) is_away,
                 ed.focus, ed.notes, ed.url,
                 exists(select 1 from rota rr
                        inner join event_date eded on rr.event_date_id=eded.id
                        where rr.event_date_id<>ed.id
                        and rr.person_id=p.id
                        and eded.on_date=ed.on_date) on_rota
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

        r = {
            'event_id': event_id,
            'event_name': FastQuery.event(event_id)['name'],
            'dates': {},
        }
        got_event_date_ids = []
        for row in rows.fetchall():
            got_event_date_ids.append(row['event_date_id'])
            on_date = row['on_date'].strftime('%Y-%m-%d')

            if not r['dates'].get(on_date):
                r['dates'][on_date] = {
                    'id': row['event_date_id'],
                    'focus': row['focus'],
                    'notes': row['notes'],
                    'url': row['url'],
                    'on_date': row['on_date'].strftime(date_format),
                    'isEditing': False,
                    'rota': {},
                }

            if row['firstname'] and row['lastname']:
                person_name = '%s %s' % (row['firstname'], row['lastname'])
            else:
                person_name = None

            r['dates'][on_date]['rota'][row['role_name']] = {
                'person_id': row['person_id'],
                'firstname': row['firstname'],
                'lastname': row['lastname'],
                'person_name': person_name,
                'active': row['person_active'],
                'is_away': row['is_away'],
                'on_rota': row['on_rota'],
            }

        # Make sure that we at least have some event details
        if not r:
            event = FastQuery.event(event_id)
            r = {
                'event_id': event_id,
                'event_name': event['name'],
            }

        # Get the roles for the event
        roles, role_people = FastQuery.roles_for_event(event_id)
        r['role_names'] = [x['name'] for x in roles]

        # Get a list of the dates that we have planned
        date_list = []
        for key in sorted(r.get('dates', {}).keys()):
            on_date = key
            if on_date not in date_list:
                date_list.append(on_date)

        # Add in the dates that have not been planned yet
        unplanned = FastQuery._dates_without_rota(
            event_id, got_event_date_ids, from_date, to_date, roles,
            role_people, date_format='%Y-%m-%d')

        unplanned_rota = {}
        for row in unplanned:
            date_list.append(row['on_date'])
            unplanned_rota[row['on_date']] = row

        # Bring the planned and unplanned rotas into single list in date order
        r['event_dates'] = []
        for key in sorted(date_list):
            if r['dates'].get(key):
                on_date = r['dates'][key]
            else:
                on_date = unplanned_rota[key]
                on_date['on_date'] = time.strftime(
                    date_format, time.strptime(key, '%Y-%m-%d'))
                r['event_dates'].append(on_date)
                continue

            # Re-organise the rota into the display sequence
            rota = []
            for role in roles:
                people = [
                    p for p in role_people[role['name']] if p.get(
                        'on_date') == key]
                people.insert(0, {})

                if on_date['rota'].get(role['name']):
                    r_rota = on_date['rota'][role['name']]
                    r_rota['people'] = people
                    r_rota['role'] = role
                    rota.append(r_rota)
                else:
                    rota.append({'people': people, 'role': role})
            on_date['rota'] = rota

            # Re-organise the dates into a list
            r['event_dates'].append(on_date)
        if r.get('dates'):
            del r['dates']

        app.logger.debug('Rota (event): %s' % (time.time() - start))
        return r

    @staticmethod
    def _dates_without_rota(event_id, ignore_ids, from_date, to_date, roles,
                            role_people, date_format='%Y-%m-%d'):
        """
        Add the event_dates where we don't have any rota defined that
        still meet the date range: got_event_date_ids
        """
        on_dates = []
        if len(ignore_ids) == 0:
            ignore_ids = [0]

        sql = """select e.id event_id, e.name event_name, on_date,
                  ed.id event_date_id, focus, notes, url
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
            rota = []
            for role in roles:
                key = row['on_date'].strftime('%Y-%m-%d')
                people = [p for p in role_people[role['name']]
                          if p.get('on_date') == key]
                people.insert(0, {})
                rota.append({'people': people, 'role': role})

            on_date = {
                'on_date': row['on_date'].strftime(date_format),
                'id': row['event_date_id'],
                'focus': row['focus'],
                'notes': row['notes'],
                'url': row['url'],
                'isEditing': False,
                'rota': rota,
            }
            on_dates.append(on_date)
        return on_dates

    @staticmethod
    def roles_for_eventdate(event_date_id):
        sql = ROLES_QUERY + "ed.id = :param_id order by sequence, r.id"
        rows = db.session.execute(sql, {'param_id': event_date_id})
        return FastQuery.roles_process(rows)

    @staticmethod
    def roles_for_event(event_id):
        sql = ROLES_QUERY + "ed.event_id = :param_id order by sequence, r.id"
        rows = db.session.execute(sql, {'param_id': event_id})
        return FastQuery.roles_process(rows)

    @staticmethod
    def roles_for_event_ondate(event_id, on_date):
        sql = """select r.id role_id, r.name role_name, firstname, lastname,
                  p.active person_active, p.id person_id, sequence,
                  exists(select 1 from away_date where person_id=p.id
                    and :on_date between from_date and to_date) is_away
                  from role r
                  left outer join role_people rp on rp.role_id=r.id
                  left outer join person p on p.id=rp.person_id
                  where r.event_id = :event_id
                  order by sequence, r.id"""

        rows = db.session.execute(
            sql, {'event_id': event_id, 'on_date': on_date})
        roles = []
        for row in rows:
            r = dict(row)
            roles.append(r)
        return roles

    @staticmethod
    def roles_process(rows):
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
                'on_date': row['on_date'].strftime('%Y-%m-%d')
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
        range = int(ui_range)
        today = datetime.datetime.now()
        if range > 0:
            from_date = today + datetime.timedelta(weeks=range - 12,)
            to_date = today + datetime.timedelta(weeks=range)
        else:
            to_date = today + datetime.timedelta(weeks=range + 12)
            from_date = today + datetime.timedelta(weeks=range)

        return from_date.strftime('%Y-%m-%d'), to_date.strftime('%Y-%m-%d')

    @staticmethod
    def date_range_from(from_str, weeks=12):
        """
        Get the from and to date when given an number of weeks.
        """
        if not from_str:
            from_date = datetime.date.today()
        from_date = datetime.datetime.strptime(from_str, '%Y-%m-%d')
        to_date = from_date + datetime.timedelta(weeks=weeks)
        return from_date.strftime('%Y-%m-%d'), to_date.strftime('%Y-%m-%d')

    @staticmethod
    def notify_people_on_rota(days):
        """
        Get the people that are on rota in x days time.
        """
        start = time.time()
        sql = """select p.firstname, p.lastname, p.email, e.id event_id,
                        e.name event_name, ed.on_date, ed.id event_date_id,
                        rl.name role_name, p.id person_id,
                        p.user_role user_role,
                        exists(select 1 from away_date where person_id=p.id
                    and on_date between from_date and to_date) is_away
              from rota r
              inner join event_date ed on ed.id=r.event_date_id
              inner join event e on e.id=ed.event_id
              inner join person p on p.id=r.person_id and p.active
              inner join role rl on rl.id=r.role_id
              where ed.on_date = current_date + :days
              and not p.guest
              """
        rows = db.session.execute(sql, {'days': days})

        notify = {}
        for row in rows.fetchall():
            person_name = '%s %s' % (row['firstname'], row['lastname'])
            event_name = row['event_name']
            if not notify.get(person_name):
                notify[person_name] = {
                    'person_firstname': row['firstname'],
                    'person_email': row['email'],
                    'person_away': row['is_away'],
                    'on_date': row['on_date'],
                    'events': {
                        event_name: {
                            'event_name': row['event_name'],
                            'on_date': row['on_date'],
                            'roles': [row['role_name']],
                            'person_away': row['is_away'],
                        }
                    },
                }
            else:
                if notify[person_name]['events'].get(event_name):
                    notify[person_name]['events'][event_name]['roles'].append(
                        row['role_name']
                    )
                else:
                    notify[person_name]['events'][event_name] = {
                        'event_name': row['event_name'],
                        'on_date': row['on_date'],
                        'roles': [row['role_name']],
                        'person_away': row['is_away'],
                    }

        app.logger.debug('Notify People: %s' % (time.time() - start))
        return notify

    @staticmethod
    def available_people(role_id, on_date):
        """
        Find alternative people for a role on a specific date. Ignore people
        who are away or are doing another role on that date.
        """
        sql = """select p.* from person p
        inner join role_people rp on rp.person_id=p.id
        where not exists(
            select * from away_date
            where :on_date between from_date and to_date
            and person_id=p.id)
        and person_id not in (
            select person_id from rota where event_date_id in (
                select id from event_date where on_date = :on_date))
        and role_id=:role_id
        """
        rows = db.session.execute(
            sql, {'on_date': on_date, 'role_id': role_id})

        people = []
        for row in rows.fetchall():
            people.append({
                'name': '%s %s' % (row['firstname'], row['lastname']),
                'email': row['email'],
            })
        return people

    @staticmethod
    def upsert_event_date(event_id, on_date, focus, notes, url):
        sql = """WITH upsert AS (
            update event_date set focus=:focus,notes=:notes,url=:url
            where event_id=:event_id and on_date=:on_date RETURNING *)
            insert into event_date (event_id,on_date,focus,notes,url)
            select :event_id,:on_date,:focus,:notes,:url
            WHERE NOT EXISTS (SELECT * from upsert)"""
        data = {
            'event_id': event_id, 'on_date': on_date, 'focus': focus,
            'notes': notes, 'url': url,
        }

        rows = db.session.execute(sql, data)
        db.session.commit()

    @staticmethod
    def _rota_for_event_date(event_date_id, role_id):
        sql = "select * from rota where event_date_id=:ed and role_id=:r"
        rows = db.session.execute(
            sql, {'ed': event_date_id, 'r': role_id})
        rota = []
        for row in rows.fetchall():
            rota.append(dict(row))
        return rota

    @staticmethod
    def _add_rota_for_event_date(event_date_id, role_id, person_id):
        sql = """insert into rota (
            event_date_id, role_id, person_id) values (:ed, :r, :p)"""
        result = db.session.execute(
            sql, {'ed': event_date_id, 'r': role_id, 'p': person_id})
        db.session.commit()

    @staticmethod
    def _update_rota_for_event_date(rota_id, person_id):
        sql = "update rota set person_id=:p where id=:r"
        db.session.execute(sql, {'r': rota_id, 'p': person_id})
        db.session.commit()

    @staticmethod
    def _delete_rota_for_event_date(rota_id):
        sql = "delete from rota where id=:rota_id"
        db.session.execute(sql, {'rota_id': rota_id})
        db.session.commit()

    @staticmethod
    def upsert_rota_for_role(event_date_id, role_id, person_id):
        person_id = int(person_id)

        # Look for an existing record
        rows = FastQuery._rota_for_event_date(event_date_id, role_id)

        if len(rows) == 0:
            # Not found, add a new records
            if person_id > 0:
                FastQuery._add_rota_for_event_date(
                    event_date_id, role_id, person_id)
        else:
            rota_id = rows[0]['id']
            if person_id > 0:
                # Update the person
                FastQuery._update_rota_for_event_date(rota_id, person_id)
            else:
                # Delete the record
                FastQuery._delete_rota_for_event_date(rota_id)

    @staticmethod
    def person_update_last_login(person_id):
        """
        Update the last time a person logged in.
        """
        sql = "update person set last_login=:last_login where id=:person_id"
        db.session.execute(
            sql, {'last_login': datetime.datetime.utcnow(), 'person_id': person_id})
        db.session.commit()

    @staticmethod
    def people():
        start = time.time()
        sql = "select * from person order by firstname, lastname"
        rows = db.session.execute(sql)

        people = []
        for row in rows.fetchall():
            r = dict(row)
            if r['last_login']:
                r['last_login'] = str(r['last_login'])
            else:
                r['last_login'] = ''
            people.append(r)

        app.logger.debug('People: %s' % (time.time() - start))
        return people

    @staticmethod
    def person(person_id):
        start = time.time()
        sql = "select * from person where id=:person_id"
        rows = db.session.execute(sql, {'person_id': person_id})

        p = rows.fetchone()
        if not p:
            raise Exception("Cannot find the person")

        p = dict(p)
        if p['last_login']:
            p['last_login'] = str(p['last_login'])
        else:
            p['last_login'] = ''

        app.logger.debug('Person: %s' % (time.time() - start))
        return p

    @staticmethod
    def person_update(person):
        sql = """update person set firstname=:firstname, lastname=:lastname,
            active=:active, email=:email, user_role=:user_role,
            music_role=:music_role, guest=:guest
            where id=:person_id"""
        db.session.execute(sql, person)
        db.session.commit()

    @staticmethod
    def event_roles(event_id):
        start = time.time()
        sql = "select * from role where event_id=:event_id order by sequence"
        rows = db.session.execute(sql, {'event_id': event_id})

        roles = []
        for row in rows.fetchall():
            roles.append(dict(row))

        app.logger.debug('Roles: %s' % (time.time() - start))
        return roles

    @staticmethod
    def event_rota(event_id, from_date, to_date):
        """
        Get the full event rota for a date range.
        """
        event = FastQuery.event(event_id)
        roles = FastQuery.event_roles(event_id)
        records = FastQuery._event_rota(event_id, from_date, to_date)

        # Get the frequency
        frequency = 'weeks'
        if event['frequency'] == 'irregular':
            frequency = 'irregular'
        if event['frequency'] == 'monthly':
            frequency = 'months'

        # Get the nearest Monday from the 'from date'
        to_d = datetime.datetime.strptime(to_date, '%Y-%m-%d')
        from_d = datetime.datetime.strptime(from_date, '%Y-%m-%d')
        if from_d.weekday() == 0:
            current_date = from_d
        else:
            current_date = from_d - datetime.timedelta(days=from_d.weekday())

        rota_dates = []
        while current_date.strftime('%Y-%m-%d') < to_date:
            rota_for_date = {}
            if frequency == 'weeks':
                for key, value in DAY_OF_WEEK.items():
                    if event[key]:
                        day = current_date + datetime.timedelta(days=value)
                        rota_for_date = FastQuery._check_rota_for_date(
                            day.strftime('%Y-%m-%d'), records, roles)
                        rota_dates.append(rota_for_date)

            # Increment the current date
            current_date = current_date + datetime.timedelta(weeks=1)
        return rota_dates

    @staticmethod
    def _check_rota_for_date(current_date, records, roles):
        event_detail = {'on_date': current_date, 'roles': {}}
        for rec in records:
            # Check if we have a rota for the date
            if rec['on_date'] > current_date:
                break

            if current_date == rec['on_date']:
                if rec['role_id']:
                    event_detail['roles'][rec['role_id']] = rec
                if not event_detail.get('focus', None):
                    event_detail['event_date_id'] = rec['event_date_id']
                    event_detail['focus'] = rec['focus']
                    event_detail['notes'] = rec['notes']
                    event_detail['url'] = rec['url']

        # Fill in the blanks for the unassigned roles
        for role in roles:
            if not event_detail['roles'].get(role['id'], None):
                event_detail['roles'][role['id']] = {}

        return event_detail


    @staticmethod
    def _event_rota(event_id, from_date, to_date):
        sql = """
            select ev.name event_name, ev.id event_id, on_date,
            role.name role_name, firstname, lastname, role.id role_id,
            ed.id event_date_id, p.active person_active, p.id person_id,
            exists(select 1 from away_date where person_id=p.id
            and on_date between from_date and to_date) is_away,
            ed.focus, ed.notes, ed.url,
            exists(select 1 from rota rr
            inner join event_date eded on rr.event_date_id=eded.id
            where rr.event_date_id<>ed.id
            and rr.person_id=p.id
            and eded.on_date=ed.on_date) on_rota
            from event_date ed
            inner join event ev on ed.event_id=ev.id
            left outer join rota r on r.event_date_id=ed.id
            left outer join role on r.role_id = role.id
            left outer join person p on r.person_id=p.id
            where ev.id = :event_id
            and ed.on_date >= :from_date
            and ed.on_date <= :to_date
            order by on_date, sequence
        """
        rotas = []
        rows = db.session.execute(
            sql, {'event_id': event_id, 'from_date': from_date,
                'to_date': to_date})

        for row in rows.fetchall():
            r = dict(row)
            r['on_date'] = str(r['on_date'])
            rotas.append(r)

        return rotas
