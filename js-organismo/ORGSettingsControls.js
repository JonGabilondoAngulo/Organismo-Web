
// Settings UI Controls

ORG.UI.checkButtonShowFloor = $('#show-floor');
ORG.UI.checkButtonShowDevice = $('#show-device');
ORG.UI.checkButtonShowLocation = $('#show-location');
ORG.UI.checkButtonShowTextures = $('#show-textures');
ORG.UI.checkButtonShowInteractive = $('#show-interactive');
ORG.UI.checkButtonShowNonInteractive = $('#show-non-interactive');
ORG.UI.checkButtonShowPrivate = $('#show-private');
ORG.UI.checkButtonShowTooltips = $('#show-tooltips');
ORG.UI.checkButtonLiveScreen = $('#live-screen');
ORG.UI.checkButtonShowHiddenViews = $('#show-hidden-views');
ORG.UI.checkButtonShowNormalWindow = $('#show-normal-window');
ORG.UI.checkButtonShowKeyboardWindow = $('#show-keyboard-window');
ORG.UI.checkButtonShowAlertWindow = $('#show-alert-window');
ORG.UI.buttonExpand = $('#expand-button');
ORG.UI.buttonResetCamera = $('#reset-camera-button');
ORG.UI.buttonRotateDevice = $('#rotate-device-button');
ORG.UI.buttonItineraryStart = $('#itinerary-run');
ORG.UI.buttonItineraryStop = $('#itinerary-stop');
ORG.UI.buttonItineraryPause = $('#itinerary-pause');
ORG.UI.buttonItineraryResume = $('#itinerary-resume');
ORG.UI.startPoint = $('#start-point');
ORG.UI.endPoint = $('#end-point');

// Map
ORG.UI.buttonResetItinerary = $('#reset-itinerary');


ORG.UI.checkButtonShowDevice.change(function (e) {
    if ($(this).is(':checked') == true) {
        ORG.scene.showDevice3DModel();
    } else {
        ORG.scene.hideDevice3DModel();
    }
});

ORG.UI.checkButtonShowFloor.change(function (e) {
    if ($(this).is(':checked') == true) {
        ORG.scene.createFloor();
    } else {
        ORG.scene.removeFloor();
    }
});

ORG.UI.checkButtonShowLocation.change(function (e) {
    if ($(this).is(':checked') == true) {
        ORG.scene.enableShowLocation();
    } else {
        ORG.scene.disableShowLocation();
    }
});

ORG.UI.checkButtonShowTextures.change(function (e) {
    ORG.scene.setShowTextures($(this).is(':checked'));
});

ORG.UI.checkButtonShowInteractive.change(function (e) {
    ORG.scene.setShowInteractive($(this).is(':checked'));
});

ORG.UI.checkButtonShowNonInteractive.change(function (e) {
    ORG.scene.setShowNonInteractive($(this).is(':checked'));
});

ORG.UI.checkButtonShowPrivate.change(function (e) {
    ORG.scene.setShowPrivate($(this).is(':checked'));
});

ORG.UI.checkButtonShowTooltips.change(function (e) {
    ORG.scene.showTooltips($(this).is(':checked'));
});

ORG.UI.checkButtonShowHiddenViews.change(function (e) {
    ORG.scene.setShowHiddenViews($(this).is(':checked'));
});

ORG.UI.checkButtonLiveScreen.change(function (e) {
    ORG.scene.setLiveScreen($(this).is(':checked'));
});

ORG.UI.checkButtonShowNormalWindow.change(function (e) {
    ORG.scene.setShowNormalWindow($(this).is(':checked'));
});
ORG.UI.checkButtonShowKeyboardWindow.change(function (e) {
    ORG.scene.setShowKeyboardWindow($(this).is(':checked'));
});
ORG.UI.checkButtonShowAlertWindow.change(function (e) {
    ORG.scene.setShowAlertWindow($(this).is(':checked'));
});

ORG.UI.buttonResetCamera.click(function (e) {
    ORG.scene.resetCameraPosition();
});

ORG.UI.buttonRotateDevice.click(function (e) {
    ORG.scene.rotateDevice();
});

ORG.UI.buttonExpand.click(function (e) {

    if ( !ORG.deviceController.isConnected) {
        return;
    }
    if (ORG.scene.isExpanded) {
        ORG.UI.buttonExpand.text("Expand");
        ORG.scene.collapse();
    } else {
        ORG.UI.buttonExpand.text("Collapse");
        ORG.scene.expand();
    }
});

ORG.UI.buttonResetItinerary.click(function (e) {
    ORG.map.resetItinerary();
});
ORG.UI.buttonItineraryStart.click(function (e) {
    ORG.map.run();
});
ORG.UI.buttonItineraryStop.click(function (e) {
    ORG.map.stop();
});
ORG.UI.buttonItineraryPause.click(function (e) {
    ORG.map.pause();
});
ORG.UI.buttonItineraryResume.click(function (e) {
    ORG.map.resume();
});