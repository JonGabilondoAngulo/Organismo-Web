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
ORG.UI.dropdownDriver = $('#selected'); // the button that holds the text

$(".dropdown-menu a").click(function(){

    $(this).parents(".btn-group").children(":first").text($(this).text());
    $(this).parents(".btn-group").children(":first").val($(this).data("value"));
});

ORG.UI.connectButton.click(function(e) {
    var serverUrl = $('#device-url');

    var deviceURL = serverUrl.val();
    if (deviceURL == "") {
        deviceURL = "localhost";
    }

    if (ORG.deviceController == null) {

        var driverName = ORG.UI.dropdownDriver.text();
        if (driverName == "Organismo") {
            ORG.deviceController = new ORGDeviceController(deviceURL, 5567);
        } else if (driverName == "iDeviceControlProxy") {
            ORG.deviceController = new ORGiMobileDeviceController(deviceURL, 8000);
        }
    }

    if (ORG.deviceController.isConnected) {
        ORG.deviceController.closeSession(); // Disconnect

        // ORGWebSocketDelegate is not getting called onClose, at least within a reasonable time. Let's update the UI here.
        ORG.scene.handleDeviceDisconnection();

        ORG.dispatcher.dispatch({
            actionType: 'device-disconnect'
        });

    } else {
        ORG.deviceController.openSession();  // Connect
    }
});
