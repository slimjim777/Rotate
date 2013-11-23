from schedule import db

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    roles = db.relationship('Role', backref='event', lazy='dynamic')

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<Event %r>' % self.name
        