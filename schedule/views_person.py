from schedule import app
from schedule.authorize import login_required
from schedule.model.event import Person
from schedule.model.event import Rota
from flask import render_template
from flask import request
from schedule.model.event import EventDate
from schedule.model.event import AwayDate
import datetime
from datetime import timedelta
from flask import jsonify
from schedule import db


@app.route('/people/', methods=['GET'])
@login_required
def people():
    rows = Person.query.all()
    return render_template('people.html', rows=rows)


@app.route('/people/<int:person_id>', methods=['GET'])
@login_required
def person(person_id):
    row = Person.query.get(person_id)
    return render_template('person.html', row=row)


@app.route('/people/<int:person_id>/rota', methods=['POST'])
@login_required
def person_rota(person_id):
    weeks = int(request.form.get('range'))
    delta = datetime.date.today() + timedelta(weeks=weeks)

    if weeks > 0:
        # Next n weeks
        rota = Rota.query.join(Person).join(EventDate).filter(Person.id == person_id, EventDate.on_date.between(datetime.date.today().strftime('%Y-%m-%d'), delta.strftime('%Y-%m-%d')))
    else:
        # Last n weeks
        rota = Rota.query.join(Person).join(EventDate).filter(Person.id == person_id, EventDate.on_date.between(delta.strftime('%Y-%m-%d'), datetime.date.today().strftime('%Y-%m-%d')))
    return render_template('snippet_person_rota.html', rota=rota.order_by(EventDate.on_date).all())


@app.route('/people/<int:person_id>/away', methods=['POST'])
@login_required
def person_away(person_id):
    weeks = int(request.form.get('range'))
    delta = datetime.date.today() + timedelta(weeks=weeks)

    if weeks > 0:
        # Next n weeks
        away_dates = AwayDate.query.filter(AwayDate.person_id == person_id, AwayDate.to_date.between(datetime.date.today().strftime('%Y-%m-%d'), delta.strftime('%Y-%m-%d')))
    else:
        # Last n weeks
        away_dates = AwayDate.query.filter(AwayDate.person_id == person_id, AwayDate.to_date.between(delta.strftime('%Y-%m-%d'), datetime.date.today().strftime('%Y-%m-%d')))

    return render_template('snippet_person_away.html', away_dates=away_dates.all())


@app.route('/people/<int:person_id>/away/update', methods=['POST', 'PUT', 'DELETE'])
@login_required
def person_away_update(person_id):
    if request.method == 'POST':
        try:
            away = AwayDate()
            away.person_id = person_id
            away.from_date = request.form.get('from_date')
            away.to_date = request.form.get('to_date')
            away.validate_dates()
            db.session.add(away)
            db.session.commit()
            return jsonify({'response': 'Success'})
        except Exception, v:
            return jsonify({'response': 'Error', 'message': str(v)})
    elif request.method == 'PUT':
        try:
            # Update the existing away date
            away = AwayDate.query.get(request.form.get('away_id'))
            if not away:
                raise Exception('Cannot find the away date.')
            away.from_date = request.form.get('from_date')
            away.to_date = request.form.get('to_date')
            away.validate_dates()
            db.session.commit()
            return jsonify({'response': 'Success'})
        except Exception, v:
            return jsonify({'response': 'Error', 'message': str(v)})
    elif request.method == 'DELETE':
        try:
            # Remove the existing away date
            away = AwayDate.query.get(request.form.get('away_id'))
            if not away:
                raise Exception('Cannot find the away date.')
            db.session.delete(away)
            db.session.commit()
            return jsonify({'response': 'Success'})
        except Exception, v:
            return jsonify({'response': 'Error', 'message': str(v)})
