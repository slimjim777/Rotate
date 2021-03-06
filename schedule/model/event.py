import base64
from dateutil.relativedelta import relativedelta
from schedule import db
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import validates
import datetime
from schedule import app
from schedule.model.query import FastQuery
from cryptography.fernet import Fernet


def next_weekday(d, weekday):
    days_ahead = weekday - d.weekday()
    if days_ahead < 0:
        days_ahead += 7
    return d + datetime.timedelta(days_ahead)


event_admins = db.Table(
    'event_admins',
    db.Column('event_id', db.Integer, db.ForeignKey('event.id')),
    db.Column('person_id', db.Integer, db.ForeignKey('person.id'))
)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    roles = db.relationship(
        'Role', backref='event', lazy='joined', order_by='Role.sequence',)
    active = db.Column(db.Boolean, default=True)
    created = db.Column(db.DateTime, default=datetime.datetime.now)
    event_dates = db.relationship(
        'EventDate', backref='event_ref', lazy='dynamic',
        order_by='EventDate.on_date')
    frequency = db.Column(
        db.Enum('irregular', 'weekly', 'monthly', name='frequency_types'),
        default='weekly')
    repeat_every = db.Column(db.Integer, default=1)
    day_mon = db.Column(db.Boolean, default=False)
    day_tue = db.Column(db.Boolean, default=False)
    day_wed = db.Column(db.Boolean, default=False)
    day_thu = db.Column(db.Boolean, default=False)
    day_fri = db.Column(db.Boolean, default=False)
    day_sat = db.Column(db.Boolean, default=False)
    day_sun = db.Column(db.Boolean, default=False)
    event_admins = db.relationship(
        'Person', secondary=event_admins,
        backref=db.backref('event_ref', lazy='joined'))
    parent_event = db.Column(db.Integer)

    def __init__(self, name):
        self.name = name

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'active': self.active,
            'created': self.created.strftime('%Y-%m-%dT%H:%M:%S'),
            'frequency': self.frequency,
            'repeat_every': self.repeat_every,
            'day_mon': self.day_mon,
            'day_tue': self.day_tue,
            'day_wed': self.day_wed,
            'day_thu': self.day_thu,
            'day_fri': self.day_fri,
            'day_sat': self.day_sat,
            'day_sun': self.day_sun,
            'roles': [r.name for r in self.roles],
        }

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

    def create_dates(
            self, event_id, frequency, repeats_every, repeats_on, from_date,
            to_date):
        """
        Create one or more event dates for the event.
        """
        records = []
        current_date = datetime.datetime.strptime(from_date, '%Y-%m-%d')

        if frequency in ['weekly', 'monthly']:
            end_date = datetime.datetime.strptime(to_date, '%Y-%m-%d')

            # Create weekly schedule of dates
            while current_date < end_date:
                for index, day in enumerate(repeats_on):
                    if not day:
                        continue
                    this_day = next_weekday(current_date, index)

                    if this_day > end_date:
                        break

                    # Check if the date already exists for the Event
                    new_date = self._get_or_create_date(event_id, this_day)
                    if not new_date:
                        # Record already exists so skip it
                        continue
                    else:
                        records.append(new_date)

                if frequency == 'weekly':
                    # Look a week ahead
                    current_date += datetime.timedelta(7)
                else:
                    current_date += relativedelta(months=1)
        elif frequency == 'irregular':
            # Create a single date
            new_date = self._get_or_create_date(event_id, current_date)
            if new_date:
                records.append(new_date)

        # Create the new date records
        if len(records) > 0:
            [db.session.add(x) for x in records]
            db.session.commit()
        app.logger.debug(records)
        return True, len(records)

    def _get_or_create_date(self, event_id, this_day):
        # Check if the date already exists for the Event
        ed = self.event_dates.filter_by(on_date=this_day).first()
        if ed:
            # Record already exists so skip it
            return
        else:
            new_date = EventDate(this_day, event_id)
            return new_date

    @staticmethod
    def copy_roles(from_event_id, to_event_id, copy_type):
        """
        Copy the roles and assigned people from one event to another.
        """
        app.logger.debug(from_event_id)
        from_event = Event.query.get(from_event_id)
        to_event = Event.query.get(to_event_id)

        for role in from_event.roles:
            # Check that a role with the name does not exist in 'to-event'
            role_new = None
            for to_role in to_event.roles:
                if to_role.name == role.name:
                    role_new = to_role
                    break

            # Create the role for the 'to-event', if it does not exist
            if not role_new:
                role_new = Role(role.name, to_event_id)
                role_new.sequence = role.sequence
                db.session.add(role_new)

            # Add people to the role, if requested
            if copy_type == 'role':
                continue

            # Add the people to the role
            for person in role.people:
                if person not in role_new.people:
                    role_new.people.append(person)

        db.session.commit()


class EventDate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))
    event = db.relationship('Event')
    on_date = db.Column(db.Date)
    on_rota = db.relationship('Rota', backref='event_date_ref', lazy='dynamic')
    focus = db.Column(db.Text)
    notes = db.Column(db.Text)
    url = db.Column(db.Text)

    def __init__(self, on_date, event_id):
        self.on_date = on_date
        self.event_id = event_id

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event.id,
            'event': self.event.name,
            'on_date': self.on_date.strftime('%Y-%m-%dT%H:%M:%S'),
            'focus': self.focus,
            'notes': self.notes,
            'url': self.url,
        }

    def __repr__(self):
        return '<Event Date %r>' % self.on_date

    def people_for_roles(self):
        """
        Get the scheduled people for the rota in the role-sequence order,
        leaving gaps for when no one is scheduled for a role.
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
        Update the rota by updating the people for each role on this event date
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
        except Exception as e:
            db.session.rollback()
            return str(e)


role_people = db.Table(
    'role_people',
    db.Column('role_id', db.Integer, db.ForeignKey('role.id')),
    db.Column('person_id', db.Integer, db.ForeignKey('person.id'))
)


class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))
    people = db.relationship(
        'Person', secondary=role_people,
        backref=db.backref('roles_ref', lazy='joined'))
    sequence = db.Column(db.Integer, default=1)

    UniqueConstraint('event_id', 'name')

    def __init__(self, name, event_id):
        self.name = name
        self.event_id = event_id

    @validates('name')
    def check_not_empty(self, key, value):
        if not value or len(value.strip()) == 0:
            raise ValueError('The field `%s` must not be empty' % key)
        else:
            return value.strip()

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'event_id': self.event_id,
            'sequence': self.sequence,
        }

    @staticmethod
    def clone(from_role_id, name, sequence):
        """
        Copy the assigned people from one role to another.
        """
        from_role = Role.query.get(from_role_id)

        # Create a new role
        new_role = Role(name, from_role.event_id)
        new_role.sequence = sequence
        db.session.add(new_role)

        for person in from_role.people:
            if person not in new_role.people:
                new_role.people.append(person)

        db.session.commit()

    def __repr__(self):
        return '<Role %r>' % self.name


def password_encrypt(password):
    cipher_suite = Fernet(app.config['HASH_KEY'].encode('utf-8'))
    cipher_text = cipher_suite.encrypt(password.encode('utf-8'))
    return cipher_text


def password_decrypt(c):
    cipher_suite = Fernet(app.config['HASH_KEY'].encode('utf-8'))
    plain_text = cipher_suite.decrypt(c.encode('utf-8'))
    return plain_text.decode('utf-8')


class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255))
    firstname = db.Column(db.String(100))
    lastname = db.Column(db.String(100))
    person_roles = db.relationship(
        'Role', secondary=role_people,
        backref=db.backref('people_ref', lazy='joined'))
    user_role = db.Column(
        db.Enum('admin', 'standard', name='user_roles'), default='standard')
    last_login = db.Column(db.DateTime())
    active = db.Column(db.Boolean, default=True)
    away_dates = db.relationship(
        'AwayDate', backref='person_ref', lazy='dynamic')
    events_admin = db.relationship(
        'Event', secondary=event_admins,
        backref=db.backref('person_ref', lazy='joined'))
    guest = db.Column(db.Boolean, default=False)
    music_role = db.Column(db.String(30))
    password = db.Column(db.Text)

    def __init__(self, email, firstname, lastname):
        self.firstname = firstname
        self.lastname = lastname
        self.email = email

    def __repr__(self):
        return '<Person %r>' % self.name

    @validates('firstname', 'lastname')
    def check_not_empty(self, key, value):
        if not value or len(value.strip()) == 0:
            raise ValueError('The field `%s` must not be empty' % key)
        else:
            return value.strip()

    def is_on_rota(self, event_date_id, role_id):
        """
        Check to see if this person is on rota for a specific role on a
        specific date.
        """
        r = Rota.query.filter_by(
            person_id=self.id,
            event_date_id=event_date_id, role_id=role_id).first()
        if r:
            return True
        else:
            return False

    def is_away(self, event_date):
        """
        Check to see if the person has away dates booked for a date.
        """
        a = AwayDate.query.filter(
            AwayDate.person_id == self.id, AwayDate.from_date <= event_date,
            AwayDate.to_date >= event_date).first()
        if a:
            return True
        else:
            return False

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'firstname': self.firstname,
            'lastname': self.lastname,
            'email': self.email,
            'user_role': self.user_role,
            'music_role': self.music_role if self.music_role else '',
            'last_login': self.last_login.strftime(
                '%Y-%m-%dT%H:%M:%S') if self.last_login else None,
            'active': self.active,
            'guest': self.guest,
            'person_roles': [r.to_dict() for r in self.person_roles],
        }

    @property
    def name(self):
        return '%s %s' % (self.firstname, self.lastname)

    @staticmethod
    def update_last_login(user_id):
        FastQuery.person_update_last_login(user_id)

    @staticmethod
    def user_by_email(email):
        """
        Get the user by the Email address.
        """
        user = Person.query.filter_by(email=email).first()
        return user

    @staticmethod
    def user_check(email, password):
        """
        Get the user by the Email and Password.
        """
        user = Person.query.filter_by(email=email).first()

        if user:
            p = password_decrypt(user.password)
            if p == password:
                return user
        return


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

    def to_dict(self):
        return {
            'id': self.id,
            'role': self.role.to_dict(),
            'event_date': self.event_date.to_dict(),
            'person_id': self.person_id,
            'person_name': self.person.name,
            'is_away': self.person.is_away(self.event_date.on_date),
            'active': self.person.active,
        }

    def __repr__(self):
        return '<Rota %s as %s on %s>' % (self.person_id, self.role_id,
                                          self.event_date_id)


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
            raise ValueError(
                "The 'from date' must not be less than the 'to date'")

    def to_dict(self):
        return {
            'id': self.id,
            'person_id': self.person_id,
            'from_date': self.from_date.strftime(
                '%Y-%m-%dT%H:%M:%S') if self.from_date else None,
            'to_date': self.to_date.strftime(
                '%Y-%m-%dT%H:%M:%S') if self.to_date else None,
        }

    def __repr__(self):
        return '<AwayDate %s to %s for %s>' % (
            self.from_date, self.to_date, self.person_id)
