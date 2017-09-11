/**
 * Created by jongabilondo on 26/02/2017.
 */

/**
 * Class to perform the communication with an external device.
 * It uses websockets (ORGWebSocket).
 */
class ORGDeviceController extends ORGDeviceBaseController {

    constructor(ip, port) {
        super(ip,port);
        this.session = null;
        this.webSocket = new ORGWebSocket();
        this.webSocketDelegate = new ORGOrganismoWSDelegate();
    }

    get type() {
        return "ORG";
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

    requestDeviceInfo() {
        this.webSocket.send(ORGMessageBuilder.deviceInfo());
    }

    requestAppInfo() {
        this.webSocket.send(ORGMessageBuilder.appInfo());
    }

    requestScreenshot() {
        this.webSocket.send( ORGMessageBuilder.takeScreenshot());
    }

    requestElementTree( parameters ) {
        this.webSocket.send( ORGMessageBuilder.elementTree( parameters));
    }

    sendRequest(request) {
        this.webSocket.send( request);
    }

    sendMessage(message) {
        this.webSocket.send( message);
    }
}