import time
from schedule.model.query import FastQuery
from schedule import app
from schedule.authorize import login_required
from flask import render_template, session, url_for


@app.route('/vintage')
@login_required
def view_vintage_my_rota():
    # Getting the person details
    person_id = session['user_id']
    p = FastQuery.person(person_id)

    # Get the user's rota
    from_date, to_date = FastQuery.date_range(12)
    rota = FastQuery.rota_for_person(person_id, from_date, to_date)
    away_dates = FastQuery.away_date(person_id, from_date, to_date)

    return render_template(
        'vintage.html',
        person=p, rota=rota, away_dates=away_dates, active="myrota")


@app.route('/vintage/events/<int:event_id>')
@app.route('/overview/<int:event_id>')
@login_required
def view_vintage_event_date(event_id):
    try:
        from_date, to_date = FastQuery.date_range_from(
            time.strftime('%Y-%m-%d'))
        model = FastQuery.rota_for_event(
            event_id, from_date, to_date, date_format='%d %b')
        error_message = None
    except Exception as e:
        error_message = str(e)
        model = None

    return render_template(
        'vintage_event.html',
        model=model, active="events", error=error_message)
