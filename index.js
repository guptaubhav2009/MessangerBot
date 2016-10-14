var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
//var utf8 = require('utf8');
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var app = express();
var requestify = require('requestify');
var stringAPI = require('string');

var conversation = new ConversationV1({
  username: 'f6230e0a-cc43-474f-a0e3-eac5325e7aec',
  password: 'leYCyWnWXdlR',
  version_date: '2016-07-01'
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is MsgBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
			//console.log("In post webhook " + event.message.text);
			postWatsonRequest(event.sender.id, event.message.text);
           // sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
        }
    }
    res.sendStatus(200);
});

function postWatsonRequest(id, message){
	conversation.message({
			input: { text: message },
			workspace_id: 'e1c9c10b-5b65-4866-a20d-317fca1b59e6'
			}, function(err, response) {
						if (err) {
							console.error(err);
						} else {
							//console.log("Watson request completed " +JSON.stringify(response, null, 2)); //
							var responseMessage = JSON.parse(JSON.stringify(response, null, 2)).output.text;
							responseMessage = ""+responseMessage;
							//console.log("FinalMessage " +responseMessage);
							//console.log("id in watson requwst "+ id);
							if (stringAPI.contains('eating')){
								
								var GEOENHANCE_API_CALL = 'https://api.pitneybowes.com/location-intelligence/geoenhance/v1/poi/bylocation?latitude=61.3346877&longitude=16.3980532&category=1002%2C1013%2C1078&maxCandidates=10&searchRadius=10560&searchRadiusUnit=feet&searchDataset=PBData&searchPriority=N';
								requestify.get(GEOENHANCE_API_CALL).then(function(response) {
								// Get the response body (JSON parsed - JSON response or jQuery object in case of XML response)
								console.log(response.getBody());

								
});
							}else if (str.contains('911')){
								
							}else{
								sendMessage(id, {text: responseMessage});
							}
							
						}
				});
}

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};