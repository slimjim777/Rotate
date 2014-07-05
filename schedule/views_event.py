from flask import render_template
from flask import jsonify
from flask import request
from flask import abort
from flask import session
from schedule import app
from schedule import db
from schedule.model.event import Event
from schedule.model.event import EventDate
from schedule.model.event import Role
from schedule.model.event import Person
from schedule.authorize import login_required
import time
import datetime
from datetime import timedelta


@app.route('/', methods=['GET'])
def home():
    return render_template('home.html')


@app.route('/error')
def error():
    return render_template('alerts.html')


@app.errorhandler(404)
def not_found(e):
    return render_template('error.html', error=e), 404


@app.route("/admin", methods=['GET'])
@login_required
def admin():
    rows = Event.query.all()
    return render_template('admin.html', rows=rows)


@app.route("/admin/event/new", methods=['POST'])
@login_required
def admin_event_new():
    if session['role'] != 'admin':
        abort(403)

    try:
        if not request.form.get('name'):
            raise Exception('The event name must be entered')

        event = Event(request.form.get('name'))
        event.active = request.form.get('active')
        event.frequency = request.form.get('frequency')
        event.repeats_every = request.form.get('repeats_every')
        event.day_mon = request.form.get('day_mon')
        event.day_tue = request.form.get('day_tue')
        event.day_wed = request.form.get('day_wed')
        event.day_thu = request.form.get('day_thu')
        event.day_fri = request.form.get('day_fri')
        event.day_sat = request.form.get('day_sat')
        event.day_sun = request.form.get('day_sun')
        db.session.add(event)
        db.session.commit()
        return jsonify({'response': 'Success'})
    except Exception, v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/admin/event/<int:event_id>", methods=['POST'])
@login_required
def admin_event_update(event_id):
    if session['role'] != 'admin':
        abort(403)

    try:
        if not request.form.get('name'):
            raise Exception('The event name must be entered')

        event = Event.query.get(event_id)
        if not event:
            raise Exception('Cannot find the event')
        event.name = request.form.get('name')
        event.active = request.form.get('active')
        event.frequency = request.form.get('frequency')
        event.repeats_every = request.form.get('repeats_every')
        event.day_mon = request.form.get('day_mon')
        event.day_tue = request.form.get('day_tue')
        event.day_wed = request.form.get('day_wed')
        event.day_thu = request.form.get('day_thu')
        event.day_fri = request.form.get('day_fri')
        event.day_sat = request.form.get('day_sat')
        event.day_sun = request.form.get('day_sun')
        db.session.add(event)
        db.session.commit()
        return jsonify({'response': 'Success'})
    except Exception, v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/admin/<int:event_id>", methods=['GET'])
@login_required
def admin_event(event_id):
    if session['role'] != 'admin':
        abort(403)

    event = Event.query.get(event_id)
    if not event:
        abort(404)
    return render_template('admin_event.html', row=event)


@app.route("/admin/event/<int:event_id>/roles", methods=['POST'])
@login_required
def admin_event_roles(event_id):
    if session['role'] != 'admin':
        abort(403)

    event = Event.query.get(event_id)

    role_count = {}
    for r in event.roles:
        role_count[r.id] = len([p.id for p in r.people if p.active])

    return render_template('snippet_event_roles.html', roles=event.roles, role_count=role_count)


@app.route("/admin/event/<int:event_id>/roles/update", methods=['POST', 'PUT'])
@login_required
def admin_event_roles_update(event_id):
    if session['role'] != 'admin':
        abort(403)

    if request.method == 'POST':
        try:
            # Create a new role
            role = Role(request.form.get('name'), event_id)
            role.sequence = int(request.form.get('sequence'))
            db.session.add(role)
            db.session.commit()
            return jsonify({'response': 'Success'})
        except Exception, v:
            return jsonify({'response': 'Error', 'message': str(v)})
    elif request.method == 'PUT':
        try:
            # Update an existing role
            role = Role.query.get(request.form.get('role_id'))
            if not role:
                raise Exception('Cannot find the role.')
            role.name = request.form.get('name')
            role.sequence = int(request.form.get('sequence'))
            db.session.commit()
            return jsonify({'response': 'Success'})
        except Exception, v:
            return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/admin/event/<int:event_id>/roles/<int:role_id>/people", methods=['GET', 'POST'])
@login_required
def admin_event_roles_people(event_id, role_id):
    if session['role'] != 'admin':
        abort(403)

    if request.method == 'GET':
        # Get the people that are in a role
        role = Role.query.get(role_id)
        if not role:
            raise Exception('Cannot find the role.')

        # Active people in the role
        selected = [p for p in role.people if p.active]
        selected_ids = [p.id for p in selected]

        # Get the people that are not in the role
        if len(selected_ids) > 0:
            unselected = Person.query.filter(~ Person.id.in_(selected_ids), Person.active)
        else:
            unselected = Person.query.filter(Person.active).all()
        return render_template('snippet_event_role_people.html', role_id=role_id, selected=selected, unselected=unselected)
    elif request.method == 'POST':
        try:
            # Update the selected people for the role
            role = Role.query.get(role_id)
            if not 'selected' in request.json:
                raise Exception('The selected Person IDs are missing.')
            selected = [int(s) for s in request.json['selected']]
            done = []
            for p in role.people:
                # Remove the people that are no longer in the role
                if p.id not in selected:
                    role.people.remove(p)
                    done.append(p.id)

            outstanding = set(selected) - set(done)
            for o in outstanding:
                # Add the additional people to the role
                p = Person.query.get(o)
                role.people.append(p)
            db.session.commit()
            return jsonify({'response': 'Success'})
        except Exception, v:
            return jsonify({'response': 'Error', 'message': str(v)})


# API

@app.route('/api/events', methods=['GET'])
@login_required
def api_events():
    rows = Event.query.all()
    evts = [e.to_dict() for e in rows]
    return jsonify({'response': 'Success', 'events': evts})


@app.route("/api/events/<int:event_id>", methods=['GET'])
@login_required
def api_event_get(event_id):
    try:
        start = time.time()
        row = Event.query.get(event_id)
        if not row:
            raise Exception("Cannot find the event")

        app.logger.debug(time.time() - start)
        return jsonify({'response': 'Success', 'event': row.to_dict()})
    except Exception, v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/<int:event_id>/event_dates", methods=['POST'])
@login_required
def api_event_dates(event_id):
    start = time.time()
    weeks = int(request.json.get('range') or 12)
    delta = datetime.date.today() + timedelta(weeks=weeks)

    event = Event.query.get(event_id)

    if weeks > 0:
        # Next n weeks
        event_dates = event.event_dates.filter(EventDate.on_date.between(datetime.date.today().strftime('%Y-%m-%d'),
                                                                         delta.strftime('%Y-%m-%d')))
    else:
        # Last n weeks
        event_dates = event.event_dates.filter(EventDate.on_date.between(delta.strftime('%Y-%m-%d'),
                                                                          datetime.date.today().strftime('%Y-%m-%d')))
    ev_dates = []
    for ed in event_dates.all():
        e = ed.to_dict()
        ev_dates.append(e)

    app.logger.debug(time.time() - start)
    return jsonify({'response': 'Success', 'event_dates': ev_dates})


@app.route("/api/event_date/<int:event_date_id>", methods=['GET'])
@login_required
def api_event_date(event_date_id):
    try:
        start = time.time()
        ed = EventDate.query.get(event_date_id)
        if not ed:
            raise Exception("Cannot find the event date")

        e = ed.to_dict()
        e['roles'] = []
        for r in ed.event.roles:
            role = r.to_dict()
            role['people'] = [{}]
            for person in r.people:
                if not person.active:
                    continue
                p = {
                    'person_id': person.id,
                    'person_name': person.name,
                    'is_away': person.is_away(ed.on_date),
                }
                if p['is_away']:
                    p['person_name_status'] = '%s (away)' % p['person_name']
                else:
                    p['person_name_status'] = p['person_name']
                role['people'].append(p)
            e['roles'].append(role)
        e['rota'] = []
        for index, rota in enumerate(ed.people_for_roles()):
            r = {
                'role': e['roles'][index],
            }
            if rota:
                r = rota.to_dict()
            r['people'] = e['roles'][index]['people'],
            r['people'] = r['people'][0]
            e['rota'].append(r)

        app.logger.debug(time.time() - start)
        return jsonify({'response': 'Success', 'event_date': e})
    except Exception, v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/event_date/<int:event_date_id>", methods=['POST'])
@login_required
def api_event_date_edit(event_date_id):
    """
    Edit an existing event date.
    """
    try:
        ed = EventDate.query.get(event_date_id)
        ed.focus = request.json.get('focus')
        ed.notes = request.json.get('notes')

        # Save the modified event date details
        records = request.json.get('rota')
        result = ed.update_rota(records)
        if not result:
            return jsonify({'response': 'Success'})
        else:
            return jsonify({'response': 'Failed', 'message': result})
    except Exception, v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/<int:event_id>/event_dates/create", methods=['POST'])
@login_required
def event_dates_create(event_id):
    """
    Create the events for an event.
    """
    frequency = request.json.get('frequency', 'irregular')
    repeats_every = int(request.json.get('repeats_every', 1))
    repeats_on = [
        request.json.get('day_mon'), request.json.get('day_tue'), request.json.get('day_wed'),
        request.json.get('day_thu'), request.json.get('day_fri'), request.json.get('day_sat'),
        request.json.get('day_sun')
    ]
    from_date = request.json.get('from_date', None)
    to_date = request.json.get('to_date', None)
    if not from_date and not to_date:
        return jsonify({'response': 'Failed', 'message': "Both 'From Date' and 'To Date' must be entered"})

    # Get the event
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'response': 'Failed', 'message': "Could not find the event with ID '%s'" % event_id})

    # Create the dates for the event
    result, qty = event.create_dates(event_id, frequency, repeats_every, repeats_on, from_date, to_date)
    app.logger.debug(result)

    return jsonify({'response': 'Success'})
