from schedule import db
from schedule.model.role import Role
from schedule.model.person import Person
import datetime


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    roles = db.relationship('Role', backref='event', lazy='dynamic')
    active = db.Column(db.Boolean, default=True)
    created = db.Column(db.DateTime, default=datetime.datetime.now)
    
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<Event %r>' % self.name
        