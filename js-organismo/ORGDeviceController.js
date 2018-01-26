/**
 * Created by jongabilondo on 26/02/2017.
 */

/**
 * Class to perform the communication with an external device using the Organismo protocol.
 * It performs the Organismo commands on a mobile device.
 * It uses websockets (ORGWebSocket).
 */
class ORGDeviceController extends ORGWebSocketDeviceController {

    //constructor(ip, port, delegate) {
    //    super(ip,port, delegate);
    //    //this.webSocketDelegate = new ORGOrganismoWSDelegate();
    //}

    get type() {
        return "ORG";
    }

    requestDeviceInfo() {
        this.webSocket.send(ORGMessageBuilder.deviceInfo());
    }

    requestAppInfo() {
        this.webSocket.send(ORGMessageBuilder.appInfo());
    }

    requestScreenshot() {
        this.webSocket.send(ORGMessageBuilder.takeScreenshot());
    }

    requestElementTree(parameters) {
        this.webSocket.send(ORGMessageBuilder.elementTree(parameters));
    }

    sendLocationUpdate(lat, lng) {
        this.webSocket.send(ORGMessageBuilder.locationUpdate( new google.maps.LatLng(lat, lng), null));
    }

    refreshUITree() {
        this.requestElementTree({
            "status-bar": true,
            "keyboard": true,
            "alert": true,
            "normal": true
        });
    }
}