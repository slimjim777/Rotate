from schedule import app
from schedule.authorize import login_required
from schedule.model.event import Person
from schedule.model.event import Rota
from flask import render_template
from flask import request
from schedule.model.event import EventDate
import datetime
from datetime import timedelta


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
