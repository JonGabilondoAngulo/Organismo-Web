
// Settings UI Controls

ORG.UI.checkButtonShowFloor = $('#show-floor');
ORG.UI.checkButtonShowDevice = $('#show-device');
ORG.UI.checkButtonShowLocation = $('#show-location');
ORG.UI.checkButtonShowSystemInfo = $('#show-system-info');
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
ORG.UI.buttonTranslateDevice = $('#translate-device-button');
ORG.UI.buttonItineraryStart = $('#itinerary-run');
ORG.UI.buttonItineraryStop = $('#itinerary-stop');
ORG.UI.buttonItineraryPause = $('#itinerary-pause');
ORG.UI.buttonItineraryResume = $('#itinerary-resume');
ORG.UI.buttonSendLocation = $('#button-send-location');
ORG.UI.buttonAddBeacon = $('#button-add-beacon');
ORG.UI.startPoint = $('#start-point');
ORG.UI.endPoint = $('#end-point');
ORG.UI.dropdownTravelMode = $('#travel-mode-dropdown');
ORG.UI.sliderTreeLayersDistance = $('#ex1');
ORG.UI.sliderTreeLayersRange = $('#ex2');
ORG.UI.refreshUITree = $('#ui-tree-refresh');

// UI Tree
ORG.UI.refreshUITree.click(function (e) {
    if (ORG.deviceController.type == "WDA") {
        ORGConnectionActions.refreshUITree();
    } else {
        ORG.deviceController.refreshUITree();
    }
});

// Sliders
ORG.UI.sliderTreeLayersDistance.bootstrapSlider();
ORG.UI.sliderTreeLayersRange.bootstrapSlider();

ORG.UI.sliderTreeLayersDistance.on("slide", function(slideEvt) {
    ORG.dispatcher.dispatch({
        actionType: 'uitree-layer-spacing-change',
        value: slideEvt.value
    });
});

ORG.UI.sliderTreeLayersRange.on("slide", function(slideEvt) {
    ORG.dispatcher.dispatch({
        actionType: 'uitree-layer-range-change',
        value: slideEvt.value
    });
});

// Map
ORG.UI.buttonResetItinerary = $('#reset-itinerary');


ORG.UI.checkButtonShowDevice.change(function (e) {
    ORG.scene.flagShowDevice3DModel = $(this).is(':checked');
    if (ORG.scene.flagShowDevice3DModel) {
        ORG.scene.showDevice3DModel();
    } else {
        ORG.scene.hideDevice3DModel();
    }
});

ORG.UI.checkButtonShowSystemInfo.change(function (e) {
    if ($(this).is(':checked') == true) {
        ORG.systemInfoManager.start();
    } else {
        ORG.systemInfoManager.stop();
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
    ORG.scene.flagShowScreenshots = $(this).is(':checked');
});

ORG.UI.checkButtonShowInteractive.change(function (e) {
    ORG.scene.flagShowInteractiveViews = $(this).is(':checked');
});

ORG.UI.checkButtonShowNonInteractive.change(function (e) {
    ORG.scene.flagShowNonInteractiveViews = $(this).is(':checked');
});

ORG.UI.checkButtonShowPrivate.change(function (e) {
    ORG.scene.flagShowPrivateClasses = $(this).is(':checked');
});

ORG.UI.checkButtonShowTooltips.change(function (e) {
    ORG.scene.showTooltips($(this).is(':checked'));
});

ORG.UI.checkButtonShowHiddenViews.change(function (e) {
    ORG.scene.flagShowHiddenViews = $(this).is(':checked');
});

ORG.UI.checkButtonLiveScreen.change(function (e) {
    ORG.scene.setLiveScreen($(this).is(':checked'));
});

ORG.UI.checkButtonShowNormalWindow.change(function (e) {
    ORG.scene.setShowNormalWindow($(this).is(':checked'));
});
ORG.UI.checkButtonShowKeyboardWindow.change(function (e) {
    ORG.scene.flagShowKeyboardWindow = $(this).is(':checked');
});
ORG.UI.checkButtonShowAlertWindow.change(function (e) {
    ORG.scene.setShowAlertWindow($(this).is(':checked'));
});

ORG.UI.buttonResetCamera.click(function (e) {
    ORG.scene.resetCameraPosition();
});

ORG.UI.buttonRotateDevice.click(function (e) {
    ORG.scene.showHideDeviceTransformControls("rotate");
});

ORG.UI.buttonTranslateDevice.click(function (e) {
    ORG.scene.showHideDeviceTransformControls("translate");
});

ORG.UI.buttonAddBeacon.click(function (e) {
    ORG.scene.addBeacon();
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

ORG.UI.buttonSendLocation.click(function(e) {
    ORG.map.sendStartLocationToDevice();
});