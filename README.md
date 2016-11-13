# led100

Controlling a 10x10 LED display with Espruino and JavaScript

## What Is This About?

The goal here was to connect a web interface to a microcontroller.
The microcontroller in this case is an ESP8266 running the fabulous Espruino firmware.
It's connecting to a 100 LED strip of WS2812 LEDs (10x10 layout) on its Pin 4.
On the other side, it connectes to my home WLAN.
Next is a WebSocket server via a small NodeJS program.
The web browser gets a HTML page which uses a bit of jQuery and some JavaScript which does the WebSocket connection.

The browser as well as the ESP8266 connect via WebSockets and the WebSocket server
in the middle relays messages agound via a slightyl modified chat system: everyone joins
a channel and from then on they can communicate.


## Running It

0. Set up the ESP8266 with Espruino and connect to your WLAN
1. `node start` to start the WS server
2. Start up the Espruino Web IDE, and load `led100-espruino.js`. Transmit to the ESP8266. It should connect to the WS server and you'll see a corresponding message on the WS server's console:

```
Received: {"join":"led"}
Server got: Join to led
```

3. Load the web browser file `led100-web.html` It should connect immediately. Default channel is "led" which is the same as the channel on the Espruino side.
4. Click on "Red", "Green" or "Blue" will colorize the LEDs into a light pastel color of your choise. Hovering your mouse over the 10x10 grid will highlight the corresponding LED white.

Note that the colors chosen are quite dim. if I use 100% power it's way too bright to watch for an extended time.



## Caveats

This is a proof of concept. It's also my first practical use of jQuery and modifying the DOM.
And I think it shows.

Before you put this on the Internet: There's no authentication and no encryption.
The ESP8266 is memory constraint and using TLS is a serious strain for it.

If you kill the WS server, the clients won't reconnect automatically. The web browser can reload to reconnect,
but the ESP8266 has to manually copy&paste anything related to the WebSocket.

The web page is minimal and can be significantly improved:
 * with a color picker for foreground and background
 * with a re-connect button
 * with feedback from the ESP8266 to show it's alive (like a ping response)

The microcontroller should be able to do more by itself, 
e.g. color transitioning over time, or display scrollable text.
