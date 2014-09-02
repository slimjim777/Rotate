from model.query import FastQuery
from schedule import app
from schedule.authorize import login_required
from schedule.model.event import Person
from flask import render_template, session, url_for
from flask import request
from flask import redirect
from schedule.model.event import AwayDate
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
@app.route('/api/people/<int:person_id>', methods=['GET', 'POST'])
@login_required
def api_person(person_id=None):
    """
    Get or update a person's details.
    """
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
            if session['role'] != 'admin':
                raise Exception('You do not have permissions to amend users')
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
            p.guest = request.json.get('guest')

            if not p.guest:
                if not p.email or len(p.email.strip()) == 0:
                    raise Exception("Email must be entered for non-guest users")

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
    """
    Get the rota for a person.
    """
    if not person_id:
        person_id = session['user_id']

    from_date, to_date = FastQuery.date_range(request.json.get('range'))
    rota = FastQuery.rota_for_person(person_id, from_date, to_date)
    result = {
        'response': 'Success',
        'rota': rota,
    }
    return jsonify(result)


@app.route('/api/people/me/away_dates', methods=['POST'])
@app.route('/api/people/<int:person_id>/away_dates', methods=['POST'])
@login_required
def api_person_away(person_id=None):
    """
    Get the away dates for a person.
    """
    if not person_id:
        person_id = session['user_id']

    from_date, to_date = FastQuery.date_range(request.json.get('range'))
    away_dates = FastQuery.away_date(person_id, from_date, to_date)
    result = {
        'response': 'Success',
        'away_dates': away_dates,
    }
    return jsonify(result)


@app.route('/api/people/<int:person_id>/away_date', methods=['POST', 'DELETE'])
@login_required
def person_away_date_update(person_id):
    """
    Update the away dates for a person.
    """
    if session['role'] != 'admin' and session['user_id'] != person_id:
        return jsonify({
            'response': 'Error',
            'message': 'You do not have permissions to this person'})

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
    # Returning page 1
    response = get_people(1)
    return jsonify(response)


@app.route('/api/people/page/<int:page_no>', methods=['GET'])
@login_required
def api_people_page(page_no):
    # Returning the requested page
    response = get_people(page_no)
    return jsonify(response)


def get_people(page):
    paginate = Person.query.filter(Person.active).\
        order_by(Person.lastname).order_by(Person.firstname).\
        paginate(page, PAGE_SIZE, False)
    return paginated_people(paginate)


def paginated_people(paginate):
    rows = paginate.items
    meta = {
        'total': paginate.pages,
        'page': paginate.page,
        'has_next': paginate.has_next,
        'has_prev': paginate.has_prev,
        'next_num': paginate.next_num,
        'prev_num': paginate.prev_num,
    }
    people = [p.to_dict() for p in rows]
    return {'response': 'Success', 'people': people, 'meta': meta}


@app.route('/api/people/new', methods=['POST'])
@login_required
def api_people_new():
    """
    Add a new person.
    """
    try:
        if session['role'] != 'admin':
            raise Exception('You do not have permissions to create users')

        p = Person(request.json.get('email'), request.json.get('firstname'),
                   request.json.get('lastname'))
        p.guest = request.json.get('guest')
        if not p.guest:
            if not p.email or len(p.email.strip()) == 0:
                raise Exception("Email must be entered for non-guest users")

        db.session.add(p)
        db.session.commit()
        return jsonify({'response': 'Success', 'person': p.to_dict()})
    except Exception, v:
        return jsonify({'response': 'Error', 'message': str(v)})


@app.route('/api/people/find', methods=['POST'])
@login_required
def api_people_find():
    first = request.json.get('firstname')
    last = request.json.get('lastname', '')
    active = request.json.get('active', 'active')

    if first:
        query = Person.query.filter(Person.firstname.ilike('%' + first + '%'))
    else:
        query = Person.query
    if last:
        query = query.filter(Person.lastname.ilike('%' + last + '%'))
    if active == 'active':
        query = query.filter(Person.active)
    elif active == 'inactive':
        query = query.filter(~Person.active)

    paginate = query.order_by(Person.lastname).order_by(Person.firstname).\
        paginate(1, PAGE_SIZE*10, False)
    result = paginated_people(paginate)
    return jsonify(result)


@app.route('/api/permissions', methods=['POST'])
@login_required
def api_permissions():
    """
    Get the permissions for the current user.
    """
    permissions = FastQuery.permissions(session['user_id'])
    return jsonify({'response': 'Success', 'permissions': permissions})
