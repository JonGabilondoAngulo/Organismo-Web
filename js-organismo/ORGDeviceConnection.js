/**
 * Created by jongabilondo on 01/07/2016.
 */

/**
 * It provides a high level wrapper to the ORGWebSocket connection to the mobile device.
 * It provides high level functions to send messages to the device.
 * The incoming messages are are handled by the ORGWebSocketDelegate that is assigned to the webSocket.
 * @constructor
 */
function ORGDeviceConnection() {

    var orgWebSocket = new ORGWebSocket();
    var orgWebSocketDelegate = new ORGWebSocketDelegate();

    this.open = function( deviceServerURL) {
        orgWebSocket.open(deviceServerURL, orgWebSocketDelegate);
    }

    this.close = function() {
        orgWebSocket.close();
    }

    this.isConnected = function() {
        return orgWebSocket.isConnected();
    }

    this.requestDeviceInfo = function() {
        orgWebSocket.send(orgMessageBuilder.deviceInfo());
    }

    this.requestScreenshot = function() {
        orgWebSocket.send( orgMessageBuilder.takeScreenshot());
    }

    this.requestElementTree = function() {
        orgWebSocket.send( orgMessageBuilder.elementTree());
    }

    this.sendRequest = function(request) {
        orgWebSocket.send( request);
    }
}

var orgDeviceConnection = new ORGDeviceConnection();
