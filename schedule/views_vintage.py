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
        'vintage.html', person=p, rota=rota, away_dates=away_dates)
