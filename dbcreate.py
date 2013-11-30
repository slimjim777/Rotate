from schedule.model.event import Event
from schedule.model.role import Role
from schedule.model.person import Person
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

p1 = Person('John', 'Smith')
p2 = Person('Janet', 'Jones')
p3 = Person('James', 'Doe')
p4 = Person('Jane', 'Johnson')
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



