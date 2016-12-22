/**
 * Created by jongabilondo on 20/09/2016.
 */

var connectButton = $('#connect-button');
var deviceNameLabel = $('#device-name-label');
var deviceSystemVersionLabel = $('#device-system-version-label');
var deviceModelLabel = $('#device-model-label');
var testAppNameLabel = $('#testapp-name-label');
var testAppVersionLabel = $('#testapp-version-label');
var testAppBundleIdLabel = $('#testapp-bundleid-label');

connectButton.click(function(e) {
    var serverUrl = $('#device-url');

    if (ORG.deviceConnection.isConnected()) {

        // Disconnect
        ORG.deviceConnection.close();

        // ORGWebSocketDelegate is not getting called onClose, at least within a reasonable time. Let's update the UI here.
        ORG.scene.handleDeviceDisconnection();
        connectButton.text("Connect");
        buttonExpand.text("Expand");
        deviceNameLabel.text('');
        deviceSystemVersionLabel.text('');
        deviceModelLabel.text('');
        testAppBundleIdLabel.text('');
        testAppNameLabel.text('');
        testAppVersionLabel.text('');

    } else {
        
        // Connect
        var deviceURL = serverUrl.val();
        if (deviceURL == "") {
            deviceURL = "localhost";
        }
        ORG.deviceConnection.open(deviceURL);
    }
});
