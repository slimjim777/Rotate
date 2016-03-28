from flask import request
from flask import jsonify
from flask import flash
from schedule import app
from schedule.model.event import Event
from schedule.authorize import login_required


@app.route("/events/<int:event_id>/dates/create", methods=['POST'])
@login_required
def event_dates(event_id):
    """
    Create the events for an event.
    """
    frequency = request.json.get('frequency', 'irregular')
    repeats_every = int(request.json.get('repeats_every', 1))
    repeats_on = [
        request.json.get('day_mon'), request.json.get('day_tue'),
        request.json.get('day_wed'),
        request.json.get('day_thu'), request.json.get('day_fri'),
        request.json.get('day_sat'),
        request.json.get('day_sun')
    ]
    from_date = request.json.get('from_date', None)
    to_date = request.json.get('to_date', None)
    if not from_date and not to_date:
        return jsonify(
            {'response': 'Failed',
             'message': "Both 'From Date' and 'To Date' must be entered"})

    # Get the event
    event = Event.query.get(event_id)
    if not event:
        return jsonify(
            {'response': 'Failed',
             'message': "Could not find the event with ID '%s'" % event_id})

    # Create the dates for the event
    result, qty = event.create_dates(
        event_id, frequency, repeats_every, repeats_on, from_date, to_date)
    if result:
        flash("%s event dates created for event '%s'" % (qty, event.name))

    return jsonify({'response': 'Success'})
