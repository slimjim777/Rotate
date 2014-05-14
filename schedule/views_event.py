from flask import render_template
from flask import jsonify
from flask import request
from flask import flash
from flask import abort
from schedule import app
from schedule.model.event import Event
from schedule.model.event import EventDate
from schedule.authorize import login_required


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
    row = Event.query.get(event_id)
    if not row:
        abort(404)

    return render_template('event.html', row=row, event_id=event_id)


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
def not_found(error):
    return render_template('error.html'), 404

