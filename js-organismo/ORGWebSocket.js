/**
 * Class wrapper for a JS WebSocket to communicate with a Device.
 * It implements the methods for creation, open, close, sending and receiving.
 * It accepts a Delegate class that will be called on the following events: onOpen, onCLose, onMessage, onError.
 * @constructor
 */
class ORGWebSocket {

	constructor() {
        this._ws = null;
        this._serverURL = null;
        this._delegate = null;
	}

	/**
	 * Opens a WebSocket to server given a URL and accepts a Delegate.
	 * @param inServerURL
	 * @param inDelegate. An object that can implement the callback methods: onOpen, onCLose, onMessage, onError
	 */
	open(inServerURL, inDelegate) {
		let _this = this;
		this._serverURL = inServerURL;
        this._delegate = inDelegate;

		let url = "ws://" + this._serverURL + "/main";
        this._ws = new WebSocket(url);
        this._ws.onopen = function () { _this.onOpen();} ;
        this._ws.onclose = function () { _this.onClose(event);};
        this._ws.onmessage = function (event) { _this.onMessage(event);};
        this._ws.onerror = function (event) { _this.onError(event);};
	};

	/**
	 * Close the WebSocket.
	 */
	close() {
		if (this._ws) {
            this._ws.close();
		} else {
			console.log('CLOSE requested but there is no ws.')
		}
	}

	/**
	 * Sends data through the websocket.
	 * @param payload. A string with the data to transfer.
	 */
	send(payload) {
		if (this._ws) {
            this._ws.send(payload);
		}
	}

	/**
	 * A function that returns of the websocket is connected to the server.
	 * @returns {boolean}
	 */
	isConnected() {
		return !!this._ws;
	}

	/**
	 * A function that returns the URL of the server.
	 * @returns {*}
	 */
	getServerURL() {
		return this._serverURL;
	}

	// Callbacks

	/**
	 * JS WebSocket callback when the socket has opened.
	 * It will call the Delegate "onOpen".
	 */
    onOpen() {
		console.log('OPENED: ' + this._serverURL);
		if (!!this._delegate.onOpen) {
            this._delegate.onOpen(this);
		}
	};

	/**
	 * JS WebSocket callback when the socket has closed.
	 * It will call the Delegate "onClose".
	 */
	onClose(event) {
		console.log('CLOSED: ' + this._serverURL);
        this._ws = null;
		if (!!this._delegate.onClose) {
            this._delegate.onClose(event, this);
		}
	};

	/**
	 * JS WebSocket callback when the socket has received a message.
	 * It will call the Delegate "onMessage".
	 */
	onMessage(event) {
		if (!!this._delegate.onMessage) {
            this._delegate.onMessage(event, this);
		}
	};

	/**
	 * JS WebSocket callback when the socket has detected an error.
	 * It will call the Delegate "onError".
	 */
	onError(event) {
		console.log('WS Error: ' + JSON.stringify(event));
		if (!!this._delegate.onError) {
            this._delegate.onError(event, this);
		}
	}
}
