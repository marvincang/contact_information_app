$(function() {
  var client = ZAFClient.init();

  client.invoke('resize', {
    width: '40vw', height: '30vh'
  });

  client.on('app.registered', init);

  function init(){
    var params = parseParams(window.location.hash);

    var pc = client.instance(params.parent_guid);

    pc.get('ticket').then(
      function(ticket_data){
        var user_id = ticket_data.ticket.requester.id;
        requestUserInfo(client, user_id);
      })
  };

  function parseParams(param_string){
    var param_sub = param_string.replace('#','').split('&');
    var kv = param_sub[0].split('=');
    var param_obj = {}
    param_obj[kv[0]] = kv[1];
    return param_obj;
  };
});

function requestUserInfo(client, id) {
  var settings = {
    url: '/api/v2/users/' + id + '.json',
    type:'GET',
    dataType: 'json',
  };

  var settings_id = {
    url: '/api/v2/users/' + id + '/identities.json',
    type:'GET',
    dataType: 'json',
  };

  client.request(settings).then(
    function(data) {
      client.request(settings_id).then(
        function(data_id) {
          showCompleteInfo(data, data_id);
        },
        function(response) {
          showError(response);
        }
      )
    },
    function(response) {
      showError(response);
    }
  );
}

function showCompleteInfo(data, data_id) {
  var fbURL = '';
  for (var i = 0; i < data_id.count; i++) {
    if (data_id.identities[i].type == "facebook") {
      fbURL += 'https://facebook.com/' + data_id.identities[i].value;
    }
  }

  var twURLs = [];
  for (var i = 0; i < data_id.count; i++) {
    if (data_id.identities[i].type == "twitter") {
      var twURL = 'https://twitter.com/' + data_id.identities[i].value;
      twURLs.push(twURL);
    }
  }

  var requester_data = {
    'name': data.user.name,
    'email': data.user.email,
    'numtelp': data.user.phone,
    'address': data.user.user_fields.address,
    'fburl': fbURL,
    'twiturl': twURLs,
  };

  Handlebars.registerHelper('link', function(urls) {
    var result = '';
    for (var i = 0; i < urls.length; i++) {
      result += '<a href="' + urls[i] + '" target="_blank">' + urls[i] + '</a> <br>';
    }
    return new Handlebars.SafeString(result);
  });

  var source = $("#requester-template").html();
  var template = Handlebars.compile(source);
  var html = template(requester_data)
  $("#contentmodal").html(html);

  var fb = document.getElementById('fburl');
  fb.href = fbURL;
}

function showError() {
  var error_data = {
    'status': 404,
    'statusText': 'Not found'
  };
  var source = $("#error-template").html();
  var template = Handlebars.compile(source);
  var html = template(error_data);
  $("#contentmodal").html(html);
}
