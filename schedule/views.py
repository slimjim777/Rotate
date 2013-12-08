from flask import render_template, jsonify
from flask import request, redirect, url_for, flash, session, abort
from schedule import app
from schedule.model.event import Event
from schedule.model.event import EventDate
import time


@app.route('/', methods=['GET'])
def index():
    return redirect(url_for('events'))


@app.route('/events/', methods=['GET'])
def events():
    rows = Event.query.all()
    return render_template('events.html', rows=rows)


@app.route("/events/<int:event_id>", methods=['GET'])
def event_get(event_id):
    row = Event.query.get(event_id)
    if not row:
        abort(404)

    return render_template('event.html', row=row, event_id=event_id)


@app.route("/events/<int:event_id>/dates/<int:date_id>/edit", methods=['GET', 'POST'])
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
def not_found(error):
    return render_template('error.html'), 404


def is_authenticated():
    return True
    if 'username' not in session:
        return False

    # Expire sessions greater than 20 hours
    if time.time() - session.get('login_time', 0) > 72000:
        session.clear()
        flash("Your session has expired. Please login again.")
        return redirect(url_for('index'))
    else:
        return True
