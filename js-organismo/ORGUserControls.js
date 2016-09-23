/**
 * Created by jongabilondo on 20/09/2016.
 */


var connectButton = $('#connect-button');
var serverUrl = $('#device-url');

connectButton.click(function(e) {
    if (orgDeviceConnection.isConnected()) {
        orgDeviceConnection.close();
    } else {
        var deviceURL = serverUrl.val();
        if (deviceURL == "") {
            deviceURL = "localhost";
        }
        orgDeviceConnection.open(deviceURL);
    }
});
