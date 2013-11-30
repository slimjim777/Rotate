from schedule import db
from schedule.model.role import Role
from schedule.model.person import Person
import datetime


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    roles = db.relationship('Role', backref='event', lazy='dynamic', order_by='Role.sequence',)
    active = db.Column(db.Boolean, default=True)
    created = db.Column(db.DateTime, default=datetime.datetime.now)
    eventdates = db.relationship('EventDate', backref='event', lazy='dynamic', order_by='EventDate.on_date',)
    
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<Event %r>' % self.name

class EventDate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))
    on_date = db.Column(db.Date)
    on_rota = db.relationship('Rota', backref='eventdate', lazy='dynamic')

    def __init__(self, on_date, event_id):
        self.on_date = on_date
        self.event_id = event_id
    
    def __repr__(self):
        return '<Event Date %r>' % self.on_date
        
class Rota(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    eventdate_id = db.Column(db.Integer, db.ForeignKey('event_date.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))
    person_id = db.Column(db.Integer, db.ForeignKey('person.id'))

    def __init__(self, eventdate_id, role_id, person_id):
        self.eventdate_id = eventdate_id
        self.role_id = role_id
        self.person_id = person_id
        
