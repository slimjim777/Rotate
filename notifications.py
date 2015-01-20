#!/usr/bin/env python
from schedule.model.helper import notify_days_ahead

# Send out notifications for people on rota in 5 days time
notify_days_ahead(5, 'This')


# Send out notifications for people on rota in 10 days time
notify_days_ahead(10, 'Next')
