/**
 * Class wrapper for a JS WebSocket to communicate with a Device.
 * It implements the methods for creation, open, close, sending and receiving.
 * It accepts a Delegate class that will be called on the following events: onOpen, onCLose, onMessage, onError.
 * @constructor
 */
function ORGWebSocket() {

	var ws = null;
	var serverURL = null;
	var delegate = null;

	/**
	 * Opens a WebSocket to server given a URL and accepts a Delegate.
	 * @param inServerURL
	 * @param inDelegate. An object that can implement the callback methods: onOpen, onCLose, onMessage, onError
	 */
	this.open = function (inServerURL, inDelegate) {
		serverURL = inServerURL;
		delegate = inDelegate;

		var url = "ws://" + serverURL + "/main";
		ws = new WebSocket(url);
		ws.onopen = onOpen;
		ws.onclose = onClose;
		ws.onmessage = onMessage;
		ws.onerror = onError;
	};

	/**
	 * Close the WebSocket.
	 */
	this.close = function() {
		if (ws) {
			ws.close();
		} else {
			console.log('CLOSE requested but there is no ws.')
		}
	}

	/**
	 * Sends data through the websocket.
	 * @param payload. A string with the data to transfer.
	 */
	this.send = function(payload) {
		if (ws) {
			ws.send(payload);
		}
	}

	/**
	 * A function that returns of the websocket is connected to the server.
	 * @returns {boolean}
	 */
	this.isConnected = function() {
		return !!ws;
	}

	/**
	 * A function that returns the URL of the server.
	 * @returns {*}
	 */
	this.getServerURL = function() {
		return serverURL;
	}

	// Callbacks

	/**
	 * JS WebSocket callback when the socket has opened.
	 * It will call the Delegate "onOpen".
	 */
	var onOpen = function() {
		console.log('OPENED: ' + serverURL);
		if (!!delegate.onOpen) {
			delegate.onOpen(this);
		}
	};

	/**
	 * JS WebSocket callback when the socket has closed.
	 * It will call the Delegate "onClose".
	 */
	var onClose = function() {
		console.log('CLOSED: ' + serverURL);
		ws = null;
		if (!!delegate.onClose) {
			delegate.onClose(this);
		}
	};

	/**
	 * JS WebSocket callback when the socket has received a message.
	 * It will call the Delegate "onMessage".
	 */
	var onMessage = function(event) {
		if (!!delegate.onMessage) {
			delegate.onMessage(event, this);
		}
	};

	/**
	 * JS WebSocket callback when the socket has detected an error.
	 * It will call the Delegate "onError".
	 */
	var onError = function(event) {
		console.log('WS Error: ' + event.data);
		if (!!delegate.onError) {
			delegate.onError(event, this);
		}
	}
}
