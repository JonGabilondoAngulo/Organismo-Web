/**
 * Created by jongabilondo on 26/02/2017.
 */

class ORGiMobileDeviceController extends ORGWebSocketDeviceController {

    get type() {
        return "iDeviceProxy";
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

    sendLocationUpdate( lat, lng) {
        this.webSocket.send( "{ \"cmd\" : \"idevicelocation\" , \"args\" : \"-- " + lat + " " + lng + "\"}");
    }

}