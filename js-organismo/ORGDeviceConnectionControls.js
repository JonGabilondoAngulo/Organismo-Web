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

$('.dropdown-menu a').click(function(){
    $('#selected').text($(this).text());
});

connectButton.click(function(e) {
    var serverUrl = $('#device-url');

    var deviceURL = serverUrl.val();
    if (deviceURL == "") {
        deviceURL = "localhost";
    }

    if (ORG.deviceController == null) {
        //ORG.deviceController = new ORGDeviceWDAController(deviceURL, 8100);
        ORG.deviceController = new ORGDeviceController(deviceURL, 5567);
    }

    if (ORG.deviceController.isConnected) {
        ORG.deviceController.closeSession(); // Disconnect

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
        ORG.deviceController.openSession();  // Connect
    }
});
