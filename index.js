var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
//var utf8 = require('utf8');
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var app = express();
var requestify = require('requestify');
var stringAPI = require('string');
var globalSenderID = "";
var watsonContext = "context:{}";

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
    
        var event = events[0];
        if (event.message && event.message.text) {
			if (""===globalSenderID){
				//console.log("Assigning Sender ID " );
				globalSenderID = event.sender.id;
			}
			console.log("Sender ID " + event.sender.id);
			if (globalSenderID === event.sender.id){
				console.log("In post webhook " + event.message.text);
				
				postWatsonRequest(event.sender.id, event.message.text);
				//sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
			}
			
        }
    
    res.sendStatus(200);
});

function postWatsonRequest(id, message){
	conversation.message({
			input: { text: message },
			workspace_id: 'e1c9c10b-5b65-4866-a20d-317fca1b59e6',
			context: {text : watsonContext}
			}, function(err, response) {
						if (err) {
							console.error(err);
						} else {
							
							//console.log("Watson request completed " +JSON.stringify(response, null, 2)); //
							watsonContext = JSON.parse(JSON.stringify(response, null, 2)).context;
							console.log("Watson context " +watsonContext); //
							var responseMessage = JSON.parse(JSON.stringify(response, null, 2)).output.text;
							var api = watsonContext.api;
							var filter = watsonContext.filter;
							var address = watsonContext.address;
							var topic = watsonContext.topic;
							responseMessage = ""+responseMessage;
							api = ""+api;
							filter = ""+filter;
							address = ""+address;
							topic = ""+topic;
							
							console.log("topic==== " +topic);
							console.log("responseMessage==== " +responseMessage);
							console.log("filter==== " +filter);
							console.log("address==== " +address);
							console.log("api==== " +api);
							//console.log("FinalMessage " +responseMessage);
							//console.log("id in watson requwst "+ id);
							if (stringAPI(responseMessage).contains('geoEnhance')){
								//sendMessage(id, {text: responseMessage});
								console.log("Posting LIAPI Geoenhance request");
								console.log("Address ====" +address );
								//var GE = GEOAPIS_V1.geoEnhance('AKiFgTg8MG7AQaYPi7wu8PFzc9Rv'); MQpdwBU6XzwnCADuGab2PfnIhSXC
								//GE.getPOI({latitude:42.5309, longitude:-73.6572, category:1023,
								//searchRadius:10560, maxCandidates:10}, 'geoApisCallback');
								var GEOENHANCE_API_CALL = 'https://api.pitneybowes.com/location-intelligence/geoenhance/v1/poi/bylocation?latitude=36.107348&longitude=-115.178772&category=1002%2C1013%2C1078&maxCandidates=5&searchRadius=10560&searchRadiusUnit=feet&searchDataset=PBData&searchPriority=N';
								requestify.request(GEOENHANCE_API_CALL,{
									method: 'GET',
									headers: {
												'Authorization': 'Bearer yEeW2jPTm4OR0hbBfVkvRv2UKD0s'
											 }
								}).then(function(response) {
									//console.log("Got response Geoenhance request");
									// Get the response body (JSON parsed - JSON response or jQuery object in case of XML response)
									
									var liapiResponse = JSON.parse(JSON.stringify(response.getBody(), null, 2));
									var pois = "Here is the list of interested items found!" + "\n";
									var i, location, j, poi;
									//console.log("liapiResponse.location.length " + liapiResponse.location.length);
									for (i = 0; i < liapiResponse.location.length; i++)
									{
									  poi = liapiResponse.location[i].poi;
									 // console.log("poi name " + poi.name);
									  pois = pois + poi.name + "\n";
									}
									//console.log("pois "+": " + pois);
									sendMessage(id,  {text : pois});
								});
							}else if (stringAPI(responseMessage).contains('geo911')){
								//sendMessage(id, {text: responseMessage});
								console.log("Making Geo 911 API call");
								console.log("Address ====" +address );
								var GEOENHANCE_API_CALL = 'https://api.pitneybowes.com/location-intelligence/geo911/v1/psap/bylocation?latitude=36.107348&longitude=-115.178772';
								requestify.request(GEOENHANCE_API_CALL,{
									method: 'GET',
									headers: {
												'Authorization': 'Bearer yEeW2jPTm4OR0hbBfVkvRv2UKD0s'
											 }
								}).then(function(response) {
									//console.log("Got response Geoenhance request");
									// Get the response body (JSON parsed - JSON response or jQuery object in case of XML response)
									// Added comment
									
									var liapiResponse = JSON.parse(JSON.stringify(response.getBody(), null, 2));
									var contact = "Here is the contact detail!" + "\n";
									contact = contact + "Name! " + liapiResponse.contactPerson.title + " " + liapiResponse.contactPerson.prefix + " " + liapiResponse.contactPerson.firstName +
											  " " + liapiResponse.contactPerson.lastName + "\n";
									contact = contact + "Phone number! " + liapiResponse.phone;
									
									//console.log("contact details "+": " + contact);
									sendMessage(id,  {text :contact});
								});
							} else if (stringAPI(responseMessage).contains('geolife')){
								//sendMessage(id, {text: responseMessage});
								console.log("Making Geo life API call");
								
								filter = filter+"Theme";
								console.log("filter === "+filter );
								
								console.log("Address ====" +address );
								var GEOENHANCE_API_CALL = 'https://api.pitneybowes.com/location-intelligence/geo911/v1/psap/bylocation?latitude=36.107348&longitude=-115.178772';
								requestify.request(GEOENHANCE_API_CALL,{
									method: 'GET',
									headers: {
												'Authorization': 'Bearer yEeW2jPTm4OR0hbBfVkvRv2UKD0s'
											 }
								}).then(function(response) {
									//console.log("Got response Geoenhance request");
									// Get the response body (JSON parsed - JSON response or jQuery object in case of XML response)
									// Added comment
									
									var liapiResponse = JSON.parse(JSON.stringify(response.getBody(), null, 2));
									var contact = "Here is the contact detail!" + "\n";
									contact = contact + "Name! " + liapiResponse.contactPerson.title + " " + liapiResponse.contactPerson.prefix + " " + liapiResponse.contactPerson.firstName +
											  " " + liapiResponse.contactPerson.lastName + "\n";
									contact = contact + "Phone number! " + liapiResponse.phone;
									
									//console.log("contact details "+": " + contact);
									sendMessage(id,  {text : contact});
								});
							}
							else{
								sendMessage(id, {text : responseMessage});
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