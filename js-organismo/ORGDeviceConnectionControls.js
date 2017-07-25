/**
 * Created by jongabilondo on 20/09/2016.
 */

ORG.UI.connectButton = $('#connect-button');
//ORG.UI.connectDriversMenu = $('#connect-drivers-menu');
ORG.UI.deviceNameLabel = $('#device-name-label');
ORG.UI.deviceSystemVersionLabel = $('#device-system-version-label');
ORG.UI.deviceModelLabel = $('#device-model-label');
ORG.UI.testAppNameLabel = $('#testapp-name-label');
ORG.UI.testAppVersionLabel = $('#testapp-version-label');
ORG.UI.testAppBundleIdLabel = $('#testapp-bundleid-label');

$('.dropdown-menu a').click(function(){
    var driverName = $(this).text();
    $('#selected').text(driverName);
});

ORG.UI.connectButton.click(function(e) {
    var serverUrl = $('#device-url');

    var deviceURL = serverUrl.val();
    if (deviceURL == "") {
        deviceURL = "localhost";
    }

    if (ORG.deviceController == null) {

        var driverName = $('#selected').text();
        if (driverName == "Organismo") {
            ORG.deviceController = new ORGDeviceController(deviceURL, 5567);
        } else if (driverName == "iDeviceProxy") {
            ORG.deviceController = new ORGiMobileDeviceController(deviceURL, 8000);
        }
    }

    if (ORG.deviceController.isConnected) {
        ORG.deviceController.closeSession(); // Disconnect

        // ORGWebSocketDelegate is not getting called onClose, at least within a reasonable time. Let's update the UI here.
        ORG.scene.handleDeviceDisconnection();
        ORG.UI.connectButton.text("Connect");
        ORG.UI.buttonExpand.text("Expand");
        ORG.UI.deviceNameLabel.text('');
        ORG.UI.deviceSystemVersionLabel.text('');
        ORG.UI.deviceModelLabel.text('');
        ORG.UI.testAppBundleIdLabel.text('');
        ORG.UI.testAppNameLabel.text('');
        ORG.UI.testAppVersionLabel.text('');

    } else {
        ORG.deviceController.openSession();  // Connect
    }
});
