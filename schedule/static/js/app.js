var dateFormat = 'yyyy-mm-dd';

function showMessage(msg, message) {
    if (!message) {
        message = $('#d-message');
    }
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
    $('#event-dates-spinner').show();

    var postdata = {
        range: range
    };

    var request = $.ajax({
      type: 'POST',
      url: '/events/' + eventId + '/dates',
      data: postdata,
      success: function(data) {
        $('#event-dates').html(data);
        $('#event-dates-spinner').hide();
      },
      error: function(e) {
          console.log(e);
          $('#event-dates-spinner').hide();
      }
    });
}

// Person Screen

function personRota(ev, personId, range) {
    if (!range) {
        range = $('#person-rota-select').val()
    }
    ev.preventDefault();
    $('#person-rota-spinner').show();

    var postdata = {
        range: range
    };

    var request = $.ajax({
      type: 'POST',
      url: '/people/' + personId + '/rota',
      data: postdata,
      success: function(data) {
        $('#person-rota').html(data);
        $('#person-rota-spinner').hide();
      },
      error: function(e) {
          console.log(e);
          $('#person-rota-spinner').hide();
      }
    });
}

function personAway(ev, personId, range) {
    if (!range) {
        range = $('#person-away-select').val()
    }
    ev.preventDefault();
    $('#person-away-spinner').show();

    var postdata = {
        range: range
    };

    var request = $.ajax({
      type: 'POST',
      url: '/people/' + personId + '/away',
      data: postdata,
      success: function(data) {
        $('#person-away').html(data);
        $('#person-away-spinner').hide();
      },
      error: function(e) {
          console.log(e);
          $('#person-away-spinner').hide();
      }
    });
}

function personAwayDate(personId) {
    var formData = $('#person-away-form').serialize();
    var method = 'POST';

    if ($('#d-away_id').val()) {
        method = 'PUT';
    }

    var request = $.ajax({
      type: method,
      url: '/people/' + personId + '/away/update',
      data: formData,
      success: function(data) {
        if (data.response == 'Success') {
            $('#person-away').html(data);
            $('#dialog-form').modal('hide');
            // Refresh the panels
            personAway(event, personId, null);
            personRota(event, personId, null);
        } else {
            showMessage(data.message);
        }
      },
      error: function(a, b, c) {
          showMessage(c);
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
    $('#d-from_date').datepicker('update', fromDate);
    $('#d-to_date').val(toDate);
    $('#d-to_date').datepicker('update', toDate);
    $('#d-away_id').val(awayId);

    // Show the dialog
    $('#dialog-form').modal('show');
}

function removePersonAway(ev, awayId, personId, from_date, to_date) {
    ev.preventDefault();

    bootbox.confirm("Confirm deletion of away dates: " + from_date + ' - ' + to_date, function(result) {
       if (result) {
            var request = $.ajax({
              type: 'DELETE',
              url: '/people/' + personId + '/away/update',
              data: {away_id: awayId}
            })
            .done(function(data) {
                if (data.response == 'Success') {
                    // Refresh the panels
                    personAway(event, personId, null);
                    personRota(event, personId, null);
                } else {
                    showMessage(data.message);
                }
            })
            .fail(function(a, b, c) {;
                  bootbox.alert(a.responseText);
            });
       }
    });
}

// People Screen

function personAdd(ev) {
    ev.preventDefault();

    // Get the details of the new person
    var data = {
        firstname: $("#usrnewfirst").val(),
        lastname: $("#usrnewlast").val(),
        email: $("#usrnewemail").val(),
        user_role: $("#usrnewrole").val(),
    };

    var request = $.ajax({
      type: 'POST',
      url: '/people/update',
      data: data
    }).done( function(data) {
        if (data.response == 'Success') {
            window.location.href = '/people';
        } else {
            // Display the error
            showMessage(data.message);
        }
    }).fail( function(a, b, c) {
        showMessage(a.status + ': ' + a.statusText);
    });
}

// Event Administration

function eventRoles(ev, eventId) {
    ev.preventDefault();
    $('#roles-spinner').show();

    var request = $.ajax({
      type: 'POST',
      url: '/admin/event/' + eventId + '/roles',
      data: {},
      success: function(data) {
        $('#roles').html(data);
        $('#roles-spinner').hide();
      },
      error: function(e) {
          console.log(e);
          $('#roles-spinner').hide();
      }
    });
}

function eventRole(ev, eventId) {
    ev.preventDefault();
    var method = 'POST'
    var roleId = $('#d-role_id').val();

    // Get the details of the new person
    var data = {
        name: $("#d-name").val(),
        sequence: $("#d-sequence").val()
    };

    if (roleId) {
        data.role_id = roleId;
        method = 'PUT';
    }

     var request = $.ajax({
      type: method,
      url: '/admin/event/' + eventId + '/roles/update',
      data: data
    }).done( function(data) {
        if (data.response == 'Success') {
            $('#dialog-form').modal('hide');
            eventRoles(ev, eventId);
        } else {
            // Display the error
            showMessage(data.message);
        }
    }).fail( function(a, b, c) {
        showMessage(a.status + ': ' + a.statusText);
    });
}

function showRoleDialog(ev, roleId, eventId) {
    ev.preventDefault();

    // Set defaults for a new role
    clearMessage();
    var name = '';
    var sequence = 1;

    // Populate the form
    $('#d-role_id').val(roleId);

    if (roleId) {
        // Editing existing role, so get the values
        name = $('#name'+roleId).text();
        sequence = $('#sequence'+roleId).text();
    }

    $('#d-name').val(name);
    $('#d-sequence').val(sequence);

    // Show the dialog
    $('#dialog-form').modal('show');
}

function rolePeople(ev, eventId, roleId) {
    ev.preventDefault();

    var request = $.ajax({
      type: 'GET',
      url: '/admin/event/' + eventId + '/roles/' + roleId + '/people',
      data: {}
    }).done( function(data) {
        $('#role-people-form').html(data);
        $('#role-people h4').text('Select people for ' + $('#name' + roleId).text());
        $('#role-people').modal('show');
    }).fail( function(a, b, c) {
        showMessage(a.status + ': ' + a.statusText);
    });
}

function rolePersonSelect(ev) {
    ev.preventDefault();
    $('#unselected option:selected').each( function(index) {
        $(this).remove().appendTo('#selected');
    });
}

function rolePersonDeselect(ev) {
    ev.preventDefault();
    $('#selected option:selected').each( function(index) {
        $(this).remove().appendTo('#unselected');
    });
}

function rolePeopleSave(ev, eventId) {
    ev.preventDefault();

    var roleId = $('#select-role_id').val();

    // Get the personId's from the selected list
    var selected = [];
    $('#selected option').each(function() {
        selected.push($(this).val());
    });

    var postdata = {
        role_id: roleId,
        selected: selected
    };

    var request = $.ajax({
      type: 'POST',
      url: '/admin/event/' + eventId + '/roles/' + roleId + '/people',
      data: JSON.stringify(postdata),
      contentType:"application/json",
      dataType: "json",
    }).done( function(data) {
        if (data.response == 'Success') {
            $('#role-people').modal('hide');
            eventRoles(ev, eventId);
        } else {
            // Display the error
            showMessage(data.message, $('#r-message'));
        }
    }).fail( function(a, b, c) {
        showMessage(a.status + ': ' + a.statusText, $('#r-message'));
    });

}