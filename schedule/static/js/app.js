function showMessage(msg) {
    var message = $('#d-message');
    message.text(message);
    message.attr('class', 'ui-state-error ui-corner-all');
    message.show().fadeOut(2000);
}

function showDialog() {
    $('#d-message').hide();
    $( "#dialog-form" ).dialog( "open" );        
}

// Event Screen
function event_date_edit(ev, event_id, date_id) {
    ev.preventDefault();

    $('#progressbar').show();
    // Get the editable line snippet for this event date
    var request = $.ajax({
      type: 'GET',
      url: '/events/' + event_id + '/dates/' + date_id +'/edit',
      //data: JSON.stringify(postdata),
      //contentType:"application/json",
      //dataType: "json",
      success: function(data) {
        if (data) {
            $('#progressbar').hide();
            $('#ed'+date_id).hide();
            $('#ed'+date_id).after(data);
            $('#save'+date_id).button();
        } else {
            $('#progressbar').hide();
            if (response.message) {
                message.text( response.message );
            } else {
                message.text('Error editing the event date.');
            }
            message.fadeIn();
        }
      },
      error: function(e) {
          message.text(e);
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
    $( "#progressbar" ).show();
    
    // Get the details of the updated fields from the form
    var data = $('#form'+eventdate_id).serialize();
    
    // Update the database by posting the form data
    var request = $.ajax({
      type: 'POST',
      url: '/events/' + event_id + '/dates/' + eventdate_id +'/edit',
      data: data,
      success: function(data) {
        if (data.response=='Success') {
            document.location.href = '/events/' + event_id;
            $( "#progressbar" ).hide();
        } else {
            $( "#progressbar" ).hide();
            showMessage(data.message);
        }
      }
    });

}
