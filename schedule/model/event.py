from schedule import db, app
from schedule.model.role import Role
from schedule.model.person import Person
import datetime


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    roles = db.relationship('Role', backref='event', lazy='dynamic', order_by='Role.sequence',)
    active = db.Column(db.Boolean, default=True)
    created = db.Column(db.DateTime, default=datetime.datetime.now)
    eventdates = db.relationship('EventDate', backref='event_ref', lazy='dynamic', order_by='EventDate.on_date')
    frequency = db.Column(db.Enum('irregular','weekly', name='frequency_types'), default='weekly')
    repeat_every = db.Column(db.Integer, default=1)
    day_mon = db.Column(db.Boolean, default=False) 
    day_tue = db.Column(db.Boolean, default=False) 
    day_wed = db.Column(db.Boolean, default=False) 
    day_thu = db.Column(db.Boolean, default=False) 
    day_fri = db.Column(db.Boolean, default=False) 
    day_sat = db.Column(db.Boolean, default=False) 
    day_sun = db.Column(db.Boolean, default=False) 
    
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<Event %r>' % self.name

    def last_date(self):
        """
        Get the last event-date.
        """
        ev_date = EventDate.query.order_by(EventDate.on_date.desc()).first()
        app.logger.debug(ev_date)
        if ev_date:
            return ev_date.on_date
        else:
            return None

class EventDate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))
    event = db.relationship('Event')
    on_date = db.Column(db.Date)
    on_rota = db.relationship('Rota', backref='event_date_ref', lazy='dynamic')

    def __init__(self, on_date, event_id):
        self.on_date = on_date
        self.event_id = event_id
    
    def __repr__(self):
        return '<Event Date %r>' % self.on_date
        
    def people_for_roles(self):
        """
        Get the scheduled people for the rota in the role-sequence order, leaving gaps
        for when no one is scheduled for a role.
        """
        scheduled = []
        
        # Get the list of people that are on rota for this event date
        rota_list = self.on_rota.all()
        
        for r in self.event.roles:
            in_list = False
            for rl in rota_list:
                if r.id == rl.role_id:
                    scheduled.append(rl)
                    rota_list.remove(rl)
                    in_list = True
                    break
            if not in_list:
                # Put a null entry in the scheduled list if no one is scheduled
                scheduled.append(None)
        return scheduled        
            
class Rota(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    eventdate_id = db.Column(db.Integer, db.ForeignKey('event_date.id'))
    eventdate = db.relationship('EventDate')
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))
    role = db.relationship('Role', order_by='Role.sequence')
    person_id = db.Column(db.Integer, db.ForeignKey('person.id'))
    person = db.relationship('Person')

    def __init__(self, eventdate_id, role_id, person_id):
        self.eventdate_id = eventdate_id
        self.role_id = role_id
        self.person_id = person_id
        
    def __repr__(self):
        return '<Rota %s as %s on %s>' % (self.person.name, self.role.name, self.eventdate.on_date)
        
