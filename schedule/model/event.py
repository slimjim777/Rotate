from schedule import db
from schedule import app
from sqlalchemy.orm import validates
import datetime


def next_weekday(d, weekday):
    days_ahead = weekday - d.weekday()
    if days_ahead < 0:
        days_ahead += 7
    return d + datetime.timedelta(days_ahead)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    roles = db.relationship('Role', backref='event', lazy='joined', order_by='Role.sequence',)
    active = db.Column(db.Boolean, default=True)
    created = db.Column(db.DateTime, default=datetime.datetime.now)
    event_dates = db.relationship('EventDate', backref='event_ref', lazy='dynamic', order_by='EventDate.on_date')
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

    @staticmethod
    def last_date():
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
                    ed = self.event_dates.filter_by(on_date=this_day).first()
                    if ed:
                        # Record already exists so skip it
                        continue
                    else:
                        new_date = EventDate(this_day, event_id)
                        records.append(new_date)

                # Look a week ahead
                current_date += datetime.timedelta(7)

        # Create the new date records
        if len(records) > 0:
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
        rota_list = self.on_rota

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

    def update_rota(self, records):
        """
        Update the rota by updating the people for each role on this event date.
        """
        try:
            for rec in records:
                # Check if there is a setting for this role
                r = self.on_rota.filter_by(role_id=rec['role_id']).first()
                if r:
                    # Update the person for who is on rota
                    if rec['person_id'] == 0:
                        # Remove the existing record
                        db.session.delete(r)
                    else:
                        # Update the existing record
                        r.person_id = rec['person_id']
                else:
                    # Create a new rota record
                    if rec['person_id'] != 0:
                        r = Rota(self.id, rec['role_id'], rec['person_id'])
                        db.session.add(r)

            db.session.commit()
            return None
        except Exception, e:
            db.session.rollback()
            return str(e)


role_people = db.Table(
    'role_people',
    db.Column('role_id', db.Integer, db.ForeignKey('role.id')),
    db.Column('person_id', db.Integer, db.ForeignKey('person.id'))
)


class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))
    people = db.relationship('Person', secondary=role_people, backref=db.backref('roles_ref', lazy='joined'))
    sequence = db.Column(db.Integer, default=1)

    def __init__(self, name, event_id):
        self.name = name
        self.event_id = event_id

    def __repr__(self):
        return '<Role %r>' % self.name


class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255))
    firstname = db.Column(db.String(100))
    lastname = db.Column(db.String(100))
    person_roles = db.relationship('Role', secondary=role_people, backref=db.backref('people_ref', lazy='joined'))
    user_role = db.Column(db.Enum('admin', 'standard', name='user_roles'), default='standard')
    last_login = db.Column(db.DateTime())
    active = db.Column(db.Boolean, default=True)
    away_dates = db.relationship('AwayDate', backref='person_ref', lazy='dynamic')

    def __init__(self, email, firstname, lastname):
        self.firstname = firstname
        self.lastname = lastname
        self.email = email

    def __repr__(self):
        return '<Person %r>' % self.name

    def is_on_rota(self, event_date_id, role_id):
        """
        Check to see if this person is on rota for a specific role on a specific date.
        """
        r = Rota.query.filter_by(person_id=self.id, event_date_id=event_date_id, role_id=role_id).first()
        if r:
            return True
        else:
            return False

    def is_away(self, event_date):
        """
        Check to see if the person has away dates booked for a date.
        """
        a = AwayDate.query.filter(AwayDate.person_id == self.id, AwayDate.from_date <= event_date, AwayDate.to_date >= event_date).first()
        if a:
            return True
        else:
            return False

    @property
    def name(self):
        return '%s %s' % (self.firstname, self.lastname)

    @staticmethod
    def update_last_login(user_id):
        user = Person.query.get(user_id)
        user.last_login = datetime.datetime.utcnow()
        db.session.commit()

    @staticmethod
    def user_by_email(email):
        """
        Get the user by the Email address.
        """
        user = Person.query.filter_by(email=email).first()
        return user


class Rota(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_date_id = db.Column(db.Integer, db.ForeignKey('event_date.id'))
    event_date = db.relationship('EventDate')
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))
    role = db.relationship('Role', order_by='Role.sequence')
    person_id = db.Column(db.Integer, db.ForeignKey('person.id'))
    person = db.relationship('Person')

    def __init__(self, event_date_id, role_id, person_id):
        self.event_date_id = event_date_id
        self.role_id = role_id
        self.person_id = person_id

    def __repr__(self):
        return '<Rota %s as %s on %s>' % (self.person_id, self.role_id, self.event_date_id)


class AwayDate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    person_id = db.Column(db.Integer, db.ForeignKey('person.id'))
    person = db.relationship('Person')
    from_date = db.Column(db.Date)
    to_date = db.Column(db.Date)

    @validates('from_date', 'to_date')
    def check_values(self, key, value):
        if not value or len(value.strip()) == 0:
            raise ValueError('The field `%s` must not be empty' % key)
        else:
            return value.strip()

    def validate_dates(self):
        f = datetime.datetime.strptime(self.from_date, '%Y-%m-%d')
        t = datetime.datetime.strptime(self.to_date, '%Y-%m-%d')
        if t < f:
            raise ValueError("The 'from date' must not be less than the 'to date'")

    def __repr__(self):
        return '<AwayDate %s to %s for %s>' % (self.from_date, self.to_date, self.person_id)
