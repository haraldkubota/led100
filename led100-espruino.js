// Run this on the Espruino
// Harald Kubota 2016-11

/*
// Set up WiFi if needed

var wifi = require("Wifi");

wifi.connect("SID", {password:"PASSWORD"}, function(err){
  console.log("connected? err=", err, "info=", wifi.getIP());
});
// wifi.stopAP();
wifi.save();

*/

var esp8266 = require("ESP8266");
E.setClock(160);

// Debug output
console.log(esp8266.getState());

// WS2812 is connected to D4
pinMode(D4, "output");

// The 10x10 LED array with 3 bytes for color for GRB
var leds=new Uint8Array(300);

// Colorize the complete 10x10 matrix with one color

function colorize(r, g, b) {
  // GRB
  for (var i=0; i<100; ++i) {
    leds[i*3]=g;
    leds[i*3+1]=r;
    leds[i*3+2]=b;
  }
}

// colorize(10, 10, 30);
// esp8266.neopixelWrite(NodeMCU.D4, leds);

// Set one pixel (x,y) with a color (r, g, b)

function setPixel(x, y, r, g, b) {
  var a;
  a=3*(x+y*10);
  leds[a]=g;
  leds[a+1]=r;
  leds[a+2]=b;
}


// Websocket stuff

// The WS server is on blue.lan:9080

var host = "blue.lan";
var WebSocket = require("ws");

// To connect or re-connect, copy&paste from here until the bottom


var powerUsage=0;

function powerCalculate() {
  var n=0;
  for (var i=0; i<300; ++i) {
    n=n+leds[i]/256*0.002;
  }
  powerUsage=n;
}

setInterval(powerCalculate,1000);

var ws = new WebSocket(host,{
  path: '/',
  port: 9080, // default is 80
  protocol : "echo-protocol", // websocket protocol name (default is none)
  protocolVersion: 13, // websocket protocol version, default is 13
  origin: 'Espruino',
  keepAlive: 60
});

ws.on('open', function() {
  console.log("Connected to server");
});

ws.on('message', function(msg) {
  console.log("MSG: " + msg);
  switch(msg) {
    case 'R': colorize(40, 10, 10); break;
    case 'G': colorize(10, 40, 10); break;
    case 'B': colorize(10, 10, 40); break;
    case 'W': colorize(40, 40, 40); break;
    case '0': colorize(0, 0, 0); break;
    default:
    // Assumptions:
    // All command are of the type:
    // X[n,]n
    // with
    // X being the command (e..g. "P"="pixel"), and
    // "n" being decimal numbers separated via commas
    var param;
    try {
      param=msg.slice(1).split(',').map(function(x) { return parseInt(x, 10);});
    } catch (e) {
      console.log(e);
    }
    // Px,y,r,g,b
    if (msg[0] == "P") {
      setPixel(param[0], param[1], param[2], param[3], param[4]);
    }
  }
  esp8266.neopixelWrite(NodeMCU.D4, leds);
  ws.send(JSON.stringify({ channel: "web", msg: ""+powerUsage }));
});


// Join a channel

ws.join = function (channel) {
    this.send(JSON.stringify({ join : channel }));
};

// Join the "led" channel as this is a display

ws.join("led");

