/**
 * Created by jongabilondo on 26/02/2017.
 */

class ORGWebSocketDeviceController extends ORGDeviceBaseController {

    constructor(ip, port) {
        super(ip,port);
        this.session = null;
        this.webSocket = new ORGWebSocket();
        this.webSocketDelegate = new ORGiControlProxyWSDelegate();
    }

    get isConnected() {
        return this.webSocket.isConnected();
    }

    openSession() {
        this.webSocket.open(this.IPandPort, this.webSocketDelegate);
    }

    closeSession() {
        this.webSocket.close();
    }


    sendRequest(request) {
        this.webSocket.send( request);
    }

    sendMessage(message) {
        this.webSocket.send( message);
    }
}