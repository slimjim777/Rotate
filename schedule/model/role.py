from schedule import db

role_people = db.Table('role_people',
    db.Column('role_id', db.Integer, db.ForeignKey('role.id')),
    db.Column('person_id', db.Integer, db.ForeignKey('person.id'))
)

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))
    role_people = db.relationship('Person', secondary=role_people, backref=db.backref('roles', lazy='dynamic'))
    sequence = db.Column(db.Integer, default=1)

    def __init__(self, name, event_id):
        self.name = name
        self.event_id = event_id

    def __repr__(self):
        return '<Role %r>' % self.name
        
