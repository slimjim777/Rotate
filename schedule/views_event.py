from flask import render_template
from flask import jsonify
from flask import request
from flask import flash
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


@app.route('/events/', methods=['GET'])
@login_required
def events():
    rows = Event.query.all()
    return render_template('events.html', rows=rows)


@app.route("/events/<int:event_id>", methods=['GET'])
@login_required
def event_get(event_id):
    start = time.time()
    row = Event.query.get(event_id)
    if not row:
        abort(404)

    h = render_template('event.html', row=row, event_id=event_id)
    app.logger.debug(time.time() - start)
    return h


@app.route("/events/<int:event_id>/dates", methods=['POST'])
@login_required
def event_dates_get(event_id):
    start = time.time()
    weeks = int(request.form.get('range'))
    delta = datetime.date.today() + timedelta(weeks=weeks)

    event = Event.query.get(event_id)

    if weeks > 0:
        # Next n weeks
        #event_dates = EventDate.query.filter(EventDate.event_id == event_id,
        event_dates = event.event_dates.filter(EventDate.on_date.between(datetime.date.today().strftime('%Y-%m-%d'),
                                                                         delta.strftime('%Y-%m-%d')))
    else:
        # Last n weeks
        event_dates = event.event_dates.filter(EventDate.on_date.between(delta.strftime('%Y-%m-%d'),
                                                                         datetime.date.today().strftime('%Y-%m-%d')))

    h = render_template('snippet_event_dates.html', event_dates=event_dates.all(),
                        event_id=event_id, event=event)
    app.logger.debug(time.time() - start)
    return h


@app.route("/events/<int:event_id>/dates/<int:date_id>/edit", methods=['GET', 'POST'])
@login_required
def event_date_edit(event_id, date_id):
    """
    Edit an existing event date.
    """
    ed = EventDate.query.get(date_id)
    if request.method == "GET":
        return render_template('snippet_event_date.html', ed=ed, event_id=event_id)
    else:
        # Save the modified event date details
        records = []
        for k, v in request.form.iteritems():
            rec = {
                'role_id': int(k.replace('role', '')),
                'person_id': int(v)
            }
            records.append(rec)
        result = ed.update_rota(records)
        if not result:
            flash('Updated rota for %s' % ed.on_date)
            return jsonify({'response': 'Success'})
        else:
            return jsonify({'response': 'Failed', 'message': result})


@app.errorhandler(404)
def not_found(e):
    return render_template('error.html', error=e), 404


@app.route("/admin", methods=['GET'])
@login_required
def admin():
    rows = Event.query.all()
    return render_template('admin.html', rows=rows)


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
    return render_template('snippet_event_roles.html', roles=event.roles)


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

        # Get the people that are not in the role
        selected_ids = [p.id for p in role.people]
        if len(selected_ids) > 0:
            unselected = Person.query.filter(~ Person.id.in_(selected_ids))
        else:
            unselected = Person.query.all()
        return render_template('snippet_event_role_people.html', role_id=role_id, selected=role.people, unselected=unselected)
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
