/**
 * Created by jongabilondo on 20/09/2016.
 */


var connectButton = $('#connect-button');

connectButton.click(function(e) {
    var serverUrl = $('#device-url');
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
