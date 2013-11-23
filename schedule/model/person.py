from schedule import db
from schedule.model.role import role_people
from schedule.model.role import Role

class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    firstname = db.Column(db.String(100))
    lastname = db.Column(db.String(100))
    person_roles = db.relationship('Role', secondary=role_people, backref=db.backref('people', lazy='dynamic'))

    def __init__(self, firstname, lastname):
        self.name = '%s %s' % (firstname,lastname)
        self.firstname = firstname
        self.lastname = lastname

    def __repr__(self):
        return '<Person %r>' % self.name
        