from schedule import db, app
from schedule.model.role import Role        # noqa
from schedule.model.person import Person    # noqa
import datetime


def next_weekday(d, weekday):
    days_ahead = weekday - d.weekday()
    if days_ahead < 0:
        days_ahead += 7
    return d + datetime.timedelta(days_ahead)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    roles = db.relationship('Role', backref='event', lazy='dynamic', order_by='Role.sequence',)
    active = db.Column(db.Boolean, default=True)
    created = db.Column(db.DateTime, default=datetime.datetime.now)
    eventdates = db.relationship('EventDate', backref='event_ref', lazy='dynamic', order_by='EventDate.on_date')
    frequency = db.Column(db.Enum('irregular', 'weekly', name='frequency_types'), default='weekly')
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
        if ev_date:
            return ev_date.on_date
        else:
            return None

    def create_dates(self, event_id, frequency, repeats_every, repeats_on, from_date, to_date):
        """
        Create one or more event dates for the event.
        """
        records = []
        current_date = datetime.datetime.strptime(from_date, '%Y-%m-%d')
        end_date = datetime.datetime.strptime(to_date, '%Y-%m-%d')
        if frequency == 'weekly':
            # Create multiple dates for the Event
            while current_date < end_date:
                for index, day in enumerate(repeats_on):
                    if not day:
                        continue
                    this_day = next_weekday(current_date, index)
                
                    if this_day > end_date:
                        break

                    # Check if the date already exists for the Event
                    ed = self.eventdates.filter_by(on_date=this_day).first()
                    if ed:
                        # Record already exists so skip it
                        continue
                    else:
                        app.logger.debug('Create date %s' % this_day)
                        new_date = EventDate(this_day, event_id)
                        records.append(new_date)
            
                # Look a week ahead
                current_date += datetime.timedelta(7)
        
        # Create the new date records    
        if len(records)>0:
            [db.session.add(x) for x in records]
            db.session.commit()
        return True, len(records)

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
