/**
 * Created by jongabilondo on 26/02/2017.
 */

/**
 * Base class to communicate with mobile devices via web sockets.
 */
class ORGWebSocketDeviceController extends ORGDeviceBaseController {

    /**
     * Constructor
     * @param ip
     * @param port
     * @param webSocket delegate
     */
    constructor(ip, port, delegate) {
        super(ip,port);
        this.session = null;
        this.webSocketDelegate = delegate;
        this._webSocket = null;// ORGWebSocket();
    }

    get isConnected() {
        return this._webSocket.isConnected
    }

    get hasContinuousUpdate() {
        return false;
    }

    closeSession() {
        this._webSocket.close();
    }

    sendRequest(request) {
        this._webSocket.send(request);
    }

    sendMessage(message) {
        this._webSocket.send(message);
    }
}