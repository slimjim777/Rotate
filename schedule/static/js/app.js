var dateFormat = 'yyyy-mm-dd';

function showMessage(msg) {
    var message = $('#d-message');
    message.text(msg);
    message.attr('class', 'alert alert-danger');
    message.fadeIn(1000);
}

function clearMessage() {
    var message = $('#d-message');
    message.text('');
    message.toggleClass('alert', false);
    message.toggleClass('alert-danger', false);
}

// Event Screen
function event_date_edit(ev, event_id, date_id) {
    ev.preventDefault();

    var message = $('#message');
    message.hide();

    // Get the editable line snippet for this event date
    var request = $.ajax({
      type: 'GET',
      url: '/events/' + event_id + '/dates/' + date_id +'/edit',
      success: function(data) {
        if (data) {
            $('#ed'+date_id).hide();
            $('#ed'+date_id).after(data);
            $('#save'+date_id).button();
        } else {
            if (response.message) {
                message.text( response.message );
            } else {
                message.text('Error editing the event date.');
            }
            message.fadeIn(1000).delay(3000).fadeOut(1000);
        }
      },
      error: function(e) {
          message.text(e.responseText);
          message.fadeIn(1000).delay(3000).fadeOut(1000);
      }
    });
}

// Cancel the editing of the current event date
function event_date_edit_cancel(ev, eventdate_id) {
    ev.preventDefault();
    // Remove the editable row and show the read-only row
    $('#ededit' + eventdate_id).remove();
    $('#ed' + eventdate_id).fadeIn(1000);
}

// Save the updated event date
function event_date_edit_save(ev, event_id, eventdate_id) {
    ev.preventDefault();
    
    // Get the details of the updated fields from the form
    var data = {};
    $('#ededit' + eventdate_id + ' select.roles option:selected').each(function (index) {
        data[$(this).parent().attr('id')] = $(this).val();
    });

    // Update the database by posting the form data
    var request = $.ajax({
      type: 'POST',
      url: '/events/' + event_id + '/dates/' + eventdate_id +'/edit',
      data: data,
      success: function(data) {
        if (data.response=='Success') {
            eventDates(ev, event_id);
        } else {
            showMessage(data.message);
        }
      },
      error: function(e) {
        showMessage(e.responseText);
      }
    });
}

// Create a new event date
function event_date_create(eventid) {
    var eventid = $('#d-event_id').val();

    var postdata = {
        frequency: $('#d-frequency').val(),
        repeats_every: $('#d-repeats_every').val(),
        day_mon: $('#d-day_mon').is(':checked'),
        day_tue: $('#d-day_tue').is(':checked'),
        day_wed: $('#d-day_wed').is(':checked'),
        day_thu: $('#d-day_thu').is(':checked'),
        day_fri: $('#d-day_fri').is(':checked'),
        day_sat: $('#d-day_sat').is(':checked'),
        day_sun: $('#d-day_sun').is(':checked'),
        from_date: $('#d-from_date').val(),
        to_date: $('#d-to_date').val()
    };

    // Create the event dates
    var request = $.ajax({
      type: 'POST',
      url: '/events/' + eventid +'/dates/create',
      data: JSON.stringify(postdata),
      contentType:"application/json",
      dataType: "json",
      success: function(data) {
        if (data.response) {
            document.location.href = '/events/' + eventid;
        } else {
            if (response.message) {
                message.text( response.message );
            } else {
                message.text('Error creating event dates.');
            }
            message.fadeIn();
        }
      },
      error: function(e) {
          message.text(e);
      }
    });

}

function eventDates(ev, eventId) {
    var range = $('#event-dates-select').val()
    ev.preventDefault();

    var postdata = {
        range: range
    };

    var request = $.ajax({
      type: 'POST',
      url: '/events/' + eventId + '/dates',
      data: postdata,
      success: function(data) {
        $('#event-dates').html(data);
      },
      error: function(e) {
          console.log(e);
      }
    });
}

// Person Screen

function personRota(ev, personId, range) {
    if (!range) {
        range = $('#person-rota-select').val()
    }
    ev.preventDefault();

    var postdata = {
        range: range
    };

    var request = $.ajax({
      type: 'POST',
      url: '/people/' + personId + '/rota',
      data: postdata,
      success: function(data) {
        $('#person-rota').html(data);
      },
      error: function(e) {
          console.log(e);
      }
    });
}

function personAway(ev, personId, range) {
    if (!range) {
        range = $('#person-away-select').val()
    }
    ev.preventDefault();

    var postdata = {
        range: range
    };

    var request = $.ajax({
      type: 'POST',
      url: '/people/' + personId + '/away',
      data: postdata,
      success: function(data) {
        $('#person-away').html(data);
      },
      error: function(e) {
          console.log(e);
      }
    });
}

function personAwayDate(personId) {
    var formData = $('#person-away-form').serialize();

    var request = $.ajax({
      type: 'POST',
      url: '/people/' + personId + '/away/update',
      data: formData,
      success: function(data) {
        if (data.response == 'Success') {
            $('#person-away').html(data);
            $('#dialog-form').modal('hide');
            personAway(event, personId, null);
        } else {
            showMessage(data.message);
        }
      },
      error: function(e) {
          showMessage(e.responseText);
      }
    });
}

function showPersonAwayDialog(ev, awayId, personId) {
    ev.preventDefault();
    clearMessage();

    var fromDate = '';
    var toDate = '';

    // Populate the form
    $('#d-person_id').val(personId);
    if (awayId) {
        // Edit existing away date
        fromDate = $('#from_date'+awayId).text();
        toDate = $('#to_date'+awayId).text();
    }
    $('#d-from_date').val(fromDate);
    $('#d-to_date').val(toDate);

    // Show the dialog
    $('#dialog-form').modal('show');
}
