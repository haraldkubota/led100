// A WebSocket server for my LED display
// Clients connect to it
// The LED display connects to it
// Both client and display join a channel so multiple displays can be used concurrently
// Simplifies multiple client connections and simplifies
// the network connectivity on the ESP8266

// Harald Kubota <harald.kubota@gmail.com> 2016-11-12
// Not sure this works with multiple displays and web clients

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 9080
    }),

    targetChannels = [];

wss.on('connection', function connection(ws) {

    targetChannels.push({ws:ws, channel:"all"});

    console.log("Client Joined, default channel");

    ws.on('message', function(message) {
        console.log("Received: "+message);
        try {
        	message = JSON.parse(message);
        } catch (e) {
        	console.log("Error parsing "+message);
        }
        if (message.join) {
        	console.log("Server got: Join to "+message.join);
            for (let i=0; i<targetChannels.length; ++i) {
            	if (targetChannels[i].ws === ws)
        			targetChannels[i].channel = message.join;
        	}
        }
        if (message.channel && message.msg) {
        	console.log("Server got: To channel " + message.channel
                + " sending " + message.msg);
            sendToChannel(message.channel, message.msg);
        }
    });

    ws.on('error', function(e) {
        console.log(e);
    })


    ws.on('close', function() {
        console.log('Connection closed')
    })
});

function sendToChannel(channel, message) {
	for (let i=0; i<targetChannels.length; ++i) {
		if (channel == "all" || targetChannels[i].channel == channel) {
			//console.log("ws=", targetChannels[i].ws);
			console.log("Sending \""+message+"\" to channel "+targetChannels[i].channel);
			targetChannels[i].ws.send(message);
		}
	}
}

function broadcast(message) {
    wss.clients.forEach(function each(client) {
        if (client.channel.indexOf(message.channel) > -1 || message.channel == 'all') {
            client.send(message.msg);
        }
    });
}
