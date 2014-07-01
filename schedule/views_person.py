from schedule import app
from schedule.authorize import login_required
from schedule.model.event import Person
from schedule.model.event import Rota
from flask import render_template, session, url_for
from flask import request
from flask import redirect
from schedule.model.event import EventDate
from schedule.model.event import AwayDate
import datetime
from datetime import timedelta
from flask import jsonify
from schedule import db


PAGE_SIZE = int(app.config['PAGE_SIZE'])


# -- Ember ---
@app.route('/my_rota')
def view_person_my_rota():
    return redirect(url_for('view_person'))


@app.route('/rota', methods=['GET'])
@login_required
def view_person():
    return render_template('ember_person.hbs')


@app.route('/api/people/me', methods=['GET'])
@app.route('/api/people/<int:person_id>', methods=['POST'])
@login_required
def api_person(person_id=None):
    if request.method == "GET":
        try:
            if not person_id:
                person_id = session['user_id']
            p = Person.query.get(person_id)
            if not p:
                raise Exception('Cannot find the person')
            result = {
                'response': 'Success',
                'person': p.to_dict(),
            }
            return jsonify(result)
        except Exception, v:
            return jsonify({'response': 'Error', 'message': str(v)})

    elif request.method == "POST":
        try:
            if not person_id:
                raise Exception('The person_id must be supplied')
            p = Person.query.get(person_id)
            if not p:
                raise Exception('Cannot find the person')
            p.firstname = request.json.get('firstname')
            p.lastname = request.json.get('lastname')
            p.active = request.json.get('active')
            p.email = request.json.get('email')
            p.user_role = request.json.get('user_role')
            db.session.commit()
            result = {
                'response': 'Success',
                'person': p.to_dict(),
            }
            return jsonify(result)
        except Exception, v:
            return jsonify({'response': 'Error', 'message': str(v)})


@app.route('/api/people/me/rota', methods=['POST'])
@app.route('/api/people/<int:person_id>/rota', methods=['POST'])
@login_required
def api_person_rota(person_id=None):
    if not person_id:
        person_id = session['user_id']
    weeks = int(request.json.get('range') or 8)
    delta = datetime.date.today() + timedelta(weeks=weeks)

    if weeks > 0:
        # Next n weeks
        rota = Rota.query.join(Person).join(EventDate).filter(Person.id == person_id, EventDate.on_date.between(datetime.date.today().strftime('%Y-%m-%d'), delta.strftime('%Y-%m-%d')))
    else:
        # Last n weeks
        rota = Rota.query.join(Person).join(EventDate).filter(Person.id == person_id, EventDate.on_date.between(delta.strftime('%Y-%m-%d'), datetime.date.today().strftime('%Y-%m-%d')))

    result = {
        'response': 'Success',
        'rota': [r.to_dict() for r in rota.order_by(EventDate.on_date).all()]
    }

    return jsonify(result)


@app.route('/api/people/me/away_dates', methods=['POST'])
@app.route('/api/people/<int:person_id>/away_dates', methods=['POST'])
@login_required
def api_person_away(person_id=None):
    if not person_id:
        person_id = session['user_id']
    weeks = int(request.json.get('range') or 8)
    delta = datetime.date.today() + timedelta(weeks=weeks)

    if weeks > 0:
        # Next n weeks
        away_dates = AwayDate.query.filter(AwayDate.person_id == person_id, AwayDate.to_date.between(datetime.date.today().strftime('%Y-%m-%d'), delta.strftime('%Y-%m-%d')))
    else:
        # Last n weeks
        away_dates = AwayDate.query.filter(AwayDate.person_id == person_id, AwayDate.to_date.between(delta.strftime('%Y-%m-%d'), datetime.date.today().strftime('%Y-%m-%d')))

    result = {
        'response': 'Success',
        'away_dates': [a.to_dict() for a in away_dates.all()]
    }

    return jsonify(result)


@app.route('/api/people/<int:person_id>/away_date', methods=['POST', 'DELETE'])
@login_required
def person_away_date_update(person_id):
    if request.method == 'POST':
        try:
            away_id = request.json.get('id')

            if away_id:
                # Update existing away date
                away = AwayDate.query.get(away_id)
                if not away:
                    raise Exception('Cannot find the away date.')
                away.from_date = request.json.get('from_date')
                away.to_date = request.json.get('to_date')
                away.validate_dates()
            else:
                # Add new away date
                away = AwayDate()
                away.person_id = person_id
                away.from_date = request.json.get('from_date')
                away.to_date = request.json.get('to_date')
                away.validate_dates()
                db.session.add(away)
            db.session.commit()
            return jsonify({'response': 'Success', 'away_date': away.to_dict()})
        except Exception, v:
            return jsonify({'response': 'Error', 'message': str(v)})

    elif request.method == 'DELETE':
        try:
            # Remove the existing away date
            away = AwayDate.query.get(request.json.get('id'))
            if not away:
                raise Exception('Cannot find the away date.')
            db.session.delete(away)
            db.session.commit()
            return jsonify({'response': 'Success'})
        except Exception, v:
            return jsonify({'response': 'Error', 'message': str(v)})


@app.route('/api/people', methods=['GET'])
@login_required
def api_people():
    # Get the page number for pagination
    page = int(request.args.get('page', 1))
    if page < 1:
        page = 1

    rows = Person.query.order_by('lastname').all()
    people = [p.to_dict() for p in rows]
    return jsonify({'response': 'Success', 'people': people})


@app.route('/api/people/new', methods=['POST'])
@login_required
def api_people_new():
    try:
        if session['role'] != 'admin':
            raise Exception('You do not have permissions to create users')

        p = Person(request.json.get('email'), request.json.get('firstname'), request.json.get('lastname'))
        db.session.add(p)
        db.session.commit()
        return jsonify({'response': 'Success', 'person': p.to_dict()})
    except Exception, v:
        return jsonify({'response': 'Error', 'message': str(v)})
