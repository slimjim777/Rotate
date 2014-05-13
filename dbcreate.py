from schedule.model.event import Event
from schedule.model.event import Role
from schedule.model.event import Person
from schedule.model.event import EventDate
from schedule.model.event import Rota
from schedule import db


db.create_all()


e = Event('Sunday Morning - Bedworth')
db.session.add(e)
db.session.commit()

r1 = Role('Leader',e.id)
r2 = Role('Worship Leader',e.id)
r3 = Role('Steward',e.id)
r4 = Role('Visuals',e.id)
r5 = Role('Sound',e.id)
db.session.add(r1)
db.session.add(r2)
db.session.add(r3)
db.session.add(r4)
db.session.add(r5)
db.session.commit()

p1 = Person('john.smith@gmail.com', 'John', 'Smith')
p2 = Person('janet.jones@gmail.com', 'Janet', 'Jones')
p3 = Person('james.doe@gmail.com', 'James', 'Doe')
p4 = Person('jane.johnson', 'Jane', 'Johnson')
p1.user_role = 'standard'
p2.user_role = 'standard'
p3.user_role = 'standard'
p4.user_role = 'standard'
db.session.add(p1)
db.session.add(p2)
db.session.add(p3)
db.session.add(p4)
db.session.commit()

ed1 = EventDate('2013-12-01', e.id)
ed2 = EventDate('2013-12-01', e.id)
db.session.add(ed1)
db.session.add(ed2)
db.session.commit()

t1 = Rota(ed1.id, r1.id, p1.id)
t2 = Rota(ed1.id, r2.id, p2.id)
t3 = Rota(ed1.id, r4.id, p3.id)
t4 = Rota(ed1.id, r5.id, p4.id)
db.session.add(t1)
db.session.add(t2)
db.session.add(t3)
db.session.add(t4)
db.session.commit()



