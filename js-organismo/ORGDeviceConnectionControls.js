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
    const serverUrl = $('#device-url');
    var deviceURL = serverUrl.val();
    if (deviceURL == "") {
        deviceURL = "localhost";
    }

    // Create the controller for the selected protocol.
    const driverName = ORG.UI.dropdownDriver.text().split(' ');
    if (driverName[0] == "Organismo") {
        if (! (ORG.deviceController instanceof ORGDeviceController)) {
            ORG.deviceController = new ORGDeviceController(deviceURL, 5567, new ORGOrganismoWSDelegate());
        }
    } else if (driverName[0] == "iDeviceControlProxy") {
        if (! (ORG.deviceController instanceof ORGiMobileDeviceController)) {
            ORG.deviceController = new ORGiMobileDeviceController(deviceURL, 8000, new ORGiControlProxyWSDelegate());
        }
    } else if (driverName[0] == "WDA") {
        if (! (ORG.deviceController instanceof ORGDeviceWDAController)) {
            ORG.deviceController = new ORGDeviceWDAController(deviceURL, 8100);
        }
    }

    // Connect ot disconnect.
    if (ORG.deviceController.isConnected) {
        ORG.deviceController.closeSession(); // It's not like disconnecting the device. On Disconnection the device disappears. Closing session the Device stays.
        ORG.dispatcher.dispatch({
            actionType: 'device-disconnect'
        });
    } else {
        ORG.deviceController.openSession();  // Connect
    }
});
