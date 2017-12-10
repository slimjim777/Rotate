import datetime
import time

from flask import render_template
from flask import jsonify
from flask import request
from flask import abort
from flask import session
from sqlalchemy import or_
import json

from schedule.model.query import FastQuery
from schedule.model.query_runsheet import QueryRunsheet
from schedule import app
from schedule import db
from schedule.model.event import Event
from schedule.model.event import EventDate
from schedule.model.event import Role
from schedule.model.event import Person
from schedule.authorize_pw import login_required


@app.route('/', methods=['GET'])
def home():
    return render_template('app.html')


@app.route('/error')
def error():
    return render_template('alerts.html')


@app.errorhandler(404)
def not_found(e):
    return render_template('error.html', error=e), 404


@app.route("/admin", methods=['GET'])
@login_required
def admin():
    if session['role'] != 'admin':
        abort(403)

    # Get the required status of events
    status = request.args.get('status')
    if status not in ['active', 'inactive']:
        status = 'active'

    if status == 'active':
        rows = Event.query.filter(Event.active)
    else:
        rows = Event.query.filter(Event.active.op('IS NOT')(True))

    parent_events = Event.query.filter_by(
        active=True, parent_event=None).order_by(Event.name)

    return render_template(
        'admin.html', rows=rows, status=status, parent_events=parent_events)


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
        if len(request.form.get('parent_event')) > 0:
            event.parent_event = int(request.form.get('parent_event'))
        db.session.add(event)
        db.session.commit()
        return jsonify({'response': 'Success'})
    except Exception as v:
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
        if len(request.form.get('parent_event')) > 0:
            event.parent_event = int(request.form.get('parent_event'))
        db.session.add(event)
        db.session.commit()
        return jsonify({'response': 'Success'})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/admin/<int:event_id>", methods=['GET'])
@login_required
def admin_event(event_id):
    if session['role'] != 'admin':
        abort(403)

    event = Event.query.get(event_id)
    if not event:
        abort(404)
    return render_template('admin_event.html', row=event,
                           events=FastQuery.events())


@app.route("/admin/event/<int:event_id>/roles", methods=['POST'])
@login_required
def admin_event_roles(event_id):
    if session['role'] != 'admin':
        abort(403)

    event = Event.query.get(event_id)

    role_count = {}
    for r in event.roles:
        role_count[r.id] = len([p.id for p in r.people if p.active])

    return render_template('snippet_event_roles.html', roles=event.roles,
                           role_count=role_count)


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
        except Exception as v:
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
        except Exception as v:
            return jsonify({'response': 'Error', 'message': str(v)})


@app.route(
    "/admin/event/<int:event_id>/roles/<int:role_id>/copy", methods=['POST'])
@login_required
def admin_event_role_copy(event_id, role_id):
    if session['role'] != 'admin':
        abort(403)

    try:
        # Check to see if the role already exists
        name = request.form.get('name')
        sequence = int(request.form.get('sequence'))

        roles = Role.query.filter_by(name=name, event_id=event_id).all()
        if len(roles) > 0:
            raise Exception("The role name '%s' already exists" % name)

        # Clone the role
        Role.clone(role_id, name, sequence)

        return jsonify({'response': 'Success'})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/admin/event/<int:event_id>/roles/copy", methods=['POST'])
@login_required
def admin_event_roles_copy(event_id):
    if session['role'] != 'admin':
        abort(403)

    try:
        from_event_id = request.form.get('from_event_id')
        copy_type = request.form.get('copy_type')
        Event.copy_roles(from_event_id, event_id, copy_type)
        return jsonify({'response': 'Success'})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/admin/event/<int:event_id>/roles/<int:role_id>/people",
           methods=['GET', 'POST'])
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
            unselected = Person.query.filter(
                ~ Person.id.in_(selected_ids),
                Person.active).order_by(Person.firstname, Person.lastname)
        else:
            unselected = Person.query.filter(Person.active).order_by(
                Person.firstname, Person.lastname).all()
        return render_template(
            'snippet_event_role_people.html',
            role_id=role_id, selected=selected, unselected=unselected)
    elif request.method == 'POST':
        try:
            # Update the selected people for the role
            role = Role.query.get(role_id)
            if 'selected' not in request.json:
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
        except Exception as v:
            return jsonify({'response': 'Error', 'message': str(v)})


# API

@app.route('/api/events', methods=['GET'])
@login_required
def api_events():
    events = FastQuery.events()
    return jsonify({'response': 'Success', 'events': events})


@app.route("/api/events/<int:event_id>", methods=['GET'])
@login_required
def api_event_get(event_id):
    try:
        event = FastQuery.event(event_id)
        return jsonify({'response': 'Success', 'event': event})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/<int:event_id>/event_dates", methods=['POST'])
@login_required
def api_event_dates(event_id):
    from_date, to_date = FastQuery.date_range(request.json.get('range'))
    ev_dates = FastQuery.event_dates_in_range(event_id, from_date, to_date)
    return jsonify({'response': 'Success', 'event_dates': ev_dates})


@app.route("/api/events/<int:event_id>/overview", methods=['POST'])
@login_required
def api_event_overview(event_id):
    weeks_to_view = 18
    if request.json.get('from_date'):
        from_date, to_date = FastQuery.date_range_from(
            request.json.get('from_date'), weeks=weeks_to_view)
    else:
        from_date, to_date = FastQuery.date_range(ui_range=weeks_to_view)

    ev_dates = FastQuery.rota_for_event(event_id, from_date, to_date)
    return jsonify({'response': 'Success', 'event_dates': ev_dates})


@app.route("/api/events/<int:event_id>/date/<on_date>", methods=['GET'])
@login_required
def api_event_date_ondate(event_id, on_date):
    try:
        e = FastQuery.rota_for_event_date_ondate(event_id, on_date)
        return jsonify({'response': 'Success', 'event_date': e})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/<int:event_id>/rota/<from_date>", methods=['GET'])
@login_required
def api_event_date_from_date(event_id, from_date):
    try:
        to_date = datetime.datetime.strptime(from_date, '%Y-%m-%d') + \
            datetime.timedelta(weeks=12)

        e = FastQuery.event_rota(
            event_id, from_date, to_date.strftime('%Y-%m-%d'))
        return jsonify({'response': 'Success', 'rota': e})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/event_date/<int:event_date_id>", methods=['GET'])
@login_required
def api_event_date(event_date_id):
    try:
        e = FastQuery.rota_for_event_date(event_date_id)
        return jsonify({'response': 'Success', 'event_date': e})
    except Exception as v:
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
        ed.url = request.json.get('url')

        # Save the modified event date details
        records = request.json.get('rota')
        result = ed.update_rota(records)
        if not result:
            e = FastQuery.rota_for_event_date(event_date_id)
            return jsonify({'response': 'Success', 'event_date': e})
        else:
            return jsonify({'response': 'Failed', 'message': result})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/event_date/<int:event_date_id>", methods=['DELETE'])
@login_required
def api_event_date_delete(event_date_id):
    """
    Delete an existing event date.
    """
    try:
        ed = EventDate.query.get(event_date_id)
        if not ed:
            return jsonify({'response': 'Success'})

        db.session.delete(ed)
        db.session.commit()
        return jsonify({'response': 'Success'})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/<int:event_id>/upsert", methods=['POST'])
@login_required
def api_event_upsert(event_id):
    """
    Upsert an event date for the event and create the rota.
    """
    on_date = request.json.get('on_date')
    focus = request.json.get('focus')
    notes = request.json.get('notes')
    url = request.json.get('url')
    rota = request.json.get('rota')

    try:
        # Get the event
        event = FastQuery.event(event_id)

        # Upsert the event date
        FastQuery.upsert_event_date(event_id, on_date, focus, notes, url)

        # Get the updated event dates
        ed = FastQuery.event_date_ondate(event_id, on_date)

        # Update the rota for the event dates
        for r in rota:
            FastQuery.upsert_rota_for_role(
                ed['id'], r['role_id'], r['person_id'])

    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})

    return jsonify({'response': 'Success'})


@app.route("/api/events/<int:event_id>/add_date", methods=['POST'])
@login_required
def event_add_date(event_id):
    """
    Create an additional event date.
    """
    on_date = request.json.get('on_date')
    FastQuery.upsert_event_date_add(event_id, on_date)
    return jsonify({'response': 'Success'})


@app.route("/api/events/<int:event_id>/<on_date>", methods=['DELETE'])
@login_required
def event_delete_date(event_id, on_date):
    """
    Delete an event date.
    """
    try:
        FastQuery.event_date_delete(event_id, on_date)
        return jsonify({'response': 'Success'})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/<int:event_id>/event_dates/create", methods=['POST'])
@login_required
def event_dates_create(event_id):
    """
    Create the event dates for an event.
    """
    frequency = request.json.get('frequency', 'irregular')
    repeats_every = int(request.json.get('repeats_every', 1))
    repeats_on = [
        request.json.get('day_mon'), request.json.get('day_tue'),
        request.json.get('day_wed'),
        request.json.get('day_thu'), request.json.get('day_fri'),
        request.json.get('day_sat'),
        request.json.get('day_sun')
    ]
    from_date = request.json.get('from_date', None)
    to_date = request.json.get('to_date', None)
    if not from_date and not to_date:
        return jsonify({
            'response': 'Failed',
            'message': "Both 'From Date' and 'To Date' must be entered"})

    # Get the event
    event = Event.query.get(event_id)
    if not event:
        return jsonify({
            'response': 'Failed',
            'message': "Could not find the event with ID '%s'" % event_id})

    # Create the dates for the event
    result, qty = event.create_dates(event_id, frequency, repeats_every,
                                     repeats_on, from_date, to_date)

    return jsonify({'response': 'Success'})


@app.route("/api/events/<int:event_id>/event_admins/find", methods=['POST'])
@login_required
def api_event_admins_find(event_id):
    try:
        event = Event.query.get(event_id)
        if not event:
            raise Exception('Cannot find the event')

        # Search for people who are not already event admins
        q = request.form.get('search', '').strip()
        app.logger.debug('Search: ' + q)
        qq = q.split(' ')
        q1 = qq[0]
        q2 = ''.join(qq[1:])

        # Get the IDs of the existing admins
        person_ids = []
        for p in event.event_admins:
            person_ids.append(p.id)

        if len(q1) > 0 and len(q2) > 0:
            query = Person.query.filter(
                Person.firstname.ilike('%%%s%%' % q1),
                Person.lastname.ilike('%%%s%%' % q2)).filter(
                ~Person.id.in_(person_ids))
        elif len(q) > 0:
            query = Person.query.filter(
                or_(Person.firstname.ilike('%%%s%%' % q),
                    Person.lastname.ilike('%%%s%%' % q))).filter(
                ~Person.id.in_(person_ids))
        else:
            query = Person.query.filter(~Person.id.in_(person_ids))

        people = query.filter(
            Person.active).order_by(Person.lastname).limit(20)
        not_admins = [p.to_dict() for p in people]
        return render_template('snippet_event_admins_find.html', event=event,
                               people=not_admins, error='')
    except Exception as v:
        return render_template('snippet_event_admins_find.html', event=event,
                               people=[], error=str(v))


@app.route("/api/events/<int:event_id>/event_admins/add", methods=['POST'])
@login_required
def api_event_admins_add(event_id):
    try:
        if session['role'] != 'admin':
            raise Exception('You do not have permissions to add event admins')

        event = Event.query.get(event_id)
        if not event:
            raise Exception('Cannot find the event')

        # Get the person
        person = Person.query.get(request.json.get('person_id'))
        if not person:
            raise Exception('Cannot find the person')
        if not person.active:
            raise Exception('The person is inactive')

        # Check that the person is not already an admin
        is_existing = [p.id for p in event.event_admins if p.id == person.id]
        if len(is_existing) > 0:
            return jsonify({'response': 'Success'})
        else:
            # Add the person as an event admin
            event.event_admins.append(person)
            db.session.commit()
            return jsonify(
                {'response': 'Success',
                 'message':
                 '%s can now administrate this event' % person.name})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/<int:event_id>/event_admins/remove", methods=['POST'])
@login_required
def api_event_admins_remove(event_id):
    try:
        if session['role'] != 'admin':
            raise Exception(
                'You do not have permissions to remove event admins')

        event = Event.query.get(event_id)
        if not event:
            raise Exception('Cannot find the event')

        # Get the person
        person = Person.query.get(request.json.get('person_id'))
        if not person:
            raise Exception('Cannot find the person')

        # Remove the person as an event admin
        event.event_admins.remove(person)
        db.session.commit()
        return jsonify({'response': 'Success'})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/<int:event_id>/roles", methods=['GET'])
@login_required
def api_event_roles(event_id):
    try:
        roles = FastQuery.event_roles(event_id)
        return jsonify({'response': 'Success', 'roles': roles})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route(
    "/api/events/<int:event_id>/roles/<int:role_id>", methods=['DELETE'])
@login_required
def api_event_role_delete(event_id, role_id):
    if session['role'] != 'admin':
        abort(403)

    try:
        role = Role.query.get(role_id)
        if not role:
            return jsonify({'response': 'Success'})

        db.session.delete(role)
        db.session.commit()
        return jsonify({'response': 'Success'})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/runsheets", methods=['GET'])
@login_required
def api_runsheets():
    try:
        from_date, to_date = FastQuery.date_range(
            request.args.get('range', 12))
        sheets = QueryRunsheet.runsheets(from_date, to_date)
        return jsonify({'response': 'Success', 'sheets': sheets})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/<int:event_id>/runsheets", methods=['GET'])
@login_required
def api_runsheet_events(event_id):
    """
    Get the rotas linked to a runsheet.
    """
    try:
        events = QueryRunsheet.runsheet_events(event_id)
        return jsonify({'response': 'Success', 'events': events})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/<int:event_id>/<on_date>/runsheet", methods=['GET'])
@login_required
def api_runsheet(event_id, on_date):
    try:
        sheet = QueryRunsheet.runsheet(event_id, on_date)
        return jsonify({'response': 'Success', 'runsheet': sheet})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/<int:event_id>/<on_date>/runsheet", methods=['POST'])
@login_required
def api_event_runsheet(event_id, on_date):
    """
    Update the runsheet as a JSON string.
    """
    runsheet = request.json.get('runsheet')

    QueryRunsheet.update_event_date_runsheet(
        event_id, on_date, json.dumps(runsheet))
    return jsonify({'response': 'Success'})


@app.route(
    "/api/events/<int:event_id>/<on_date>/runsheet_notes", methods=['POST'])
@login_required
def api_event_runsheet_notes(event_id, on_date):
    """
    Update the runsheet notes as a JSON string.
    """
    runsheet_notes = request.json.get('runsheet_notes')

    QueryRunsheet.update_event_date_runsheet_notes(
        event_id, on_date, json.dumps(runsheet_notes))
    return jsonify({'response': 'Success'})


@app.route("/api/events/runsheet_templates", methods=['GET'])
@login_required
def api_event_runsheet_templates():
    """
    Get the runsheet templates for all events.
    """
    templates = QueryRunsheet.runsheet_templates()
    return jsonify({'response': 'Success', 'templates': templates})


@app.route("/api/events/runsheet_templates", methods=['POST'])
@login_required
def api_event_runsheet_templates_new():
    """
    Create a new runsheet template
    """
    try:

        template_id = QueryRunsheet.create_template(
            request.json.get('name'), request.json.get('event_id'))
        return jsonify({'response': 'Success', 'template_id': template_id})
    except Exception as v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route("/api/events/parent_events", methods=['GET'])
@login_required
def api_event_parent_events():
    """
    Get all the parent_events.
    """
    events = QueryRunsheet.parent_events()
    return jsonify({'response': 'Success', 'events': events})


@app.route("/api/events/runsheet_templates/<int:template_id>", methods=['GET'])
@login_required
def api_event_runsheet_template_get(template_id):
    template = QueryRunsheet.get_template_by_id(template_id)
    return jsonify(
        {'response': 'Success', 'template': template})


@app.route("/api/events/runsheet_templates/<int:template_id>", methods=['PUT'])
@login_required
def api_event_runsheet_template_update(template_id):
    template = request.json.get('template')
    if template.get('runsheet'):
        runsheet = json.dumps(template.get('runsheet'))
    else:
        runsheet = None
    if template.get('notes'):
        notes = json.dumps(template.get('notes'))
    else:
        notes = None

    template = QueryRunsheet.update_template(
        template_id, template['name'], template['event_id'], runsheet, notes)
    return jsonify(
        {'response': 'Success', 'template': template})


@app.route("/api/events/<int:event_id>/runsheet_templates", methods=['GET'])
@login_required
def api_event_templates(event_id):
    templates = QueryRunsheet.templates_for_event(event_id)
    return jsonify(
        {'response': 'Success', 'templates': templates})
