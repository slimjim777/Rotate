from flask import render_template
from flask import request, redirect, url_for, flash, session, abort
from schedule import app
from schedule.model.event import Event
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
    