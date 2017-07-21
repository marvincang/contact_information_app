$(function() {
  var client = ZAFClient.init();

  client.invoke('resize', {
      width: '100%',
      height: '120px'
  });

  client.get('ticket.requester.id').then(function(data) {
  	var user_id = data['ticket.requester.id'];
  	requestUserInfo(client, user_id);
  });

  enableButton(client);
});

function requestUserInfo(client, id) {
  var settings = {
    url: '/api/v2/users/' + id + '.json',
    type:'GET',
    dataType: 'json',
  };

  client.request(settings).then(
    function(data) {
    	showInfo(data);
    },
    function(response) {
    	showError(response);
    }
  );
}

function showInfo(data) {
	var requester_data = {
		'name': data.user.name,
		'email': data.user.email,
    'numtelp': data.user.phone,
  };
  var source = $("#requester-template").html();
  var template = Handlebars.compile(source);
  var html = template(requester_data);
  $("#content").html(html);
}

function showError() {
  var error_data = {
    'status': 404,
    'statusText': 'Not found'
  };
  var source = $("#error-template").html();
  var template = Handlebars.compile(source);
  var html = template(error_data);
  $("#content").html(html);

  var button = document.getElementById('detailsBtn');
  button.style.display = "none";
}

function enableButton(client) {
  var button = document.getElementById('detailsBtn');

	// When the user clicks the button, open the modal
	button.onclick = function() {
    client.context().then(create_modal);

    function create_modal(context){
      var parent_guid = context.instanceGuid;
      var options = {
        location: "modal",
        url: "assets/modal.html#parent_guid=" + parent_guid
      }
      client.invoke('instances.create', options)
    };
	};
}
