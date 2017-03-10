
// Settings UI Controls
var checkButtonShowFloor = $('#show-floor');
var checkButtonShowDevice = $('#show-device');
var checkButtonShowTextures = $('#show-textures');
var checkButtonShowInteractive = $('#show-interactive');
var checkButtonShowNonInteractive = $('#show-non-interactive');
var checkButtonShowPrivate = $('#show-private');
var checkButtonShowTooltips = $('#show-tooltips');
var checkButtonLiveScreen = $('#live-screen');
var checkButtonShowHiddenViews = $('#show-hidden-views');
var checkButtonShowNormalWindow = $('#show-normal-window');
var checkButtonShowKeyboardWindow = $('#show-keyboard-window');
var checkButtonShowAlertWindow = $('#show-alert-window');
var buttonExpand = $('#expand-button');
var buttonResetCamera = $('#reset-camera-button');


checkButtonShowDevice.change(function (e) {
    if ($(this).is(':checked') == true) {
        ORG.scene.showDevice3DModel();
    } else {
        ORG.scene.hideDevice3DModel();
    }
});

checkButtonShowTextures.change(function (e) {
    ORG.scene.setShowTextures($(this).is(':checked'));
});

checkButtonShowInteractive.change(function (e) {
    ORG.scene.setShowInteractive($(this).is(':checked'));
});

checkButtonShowNonInteractive.change(function (e) {
    ORG.scene.setShowNonInteractive($(this).is(':checked'));
});

checkButtonShowPrivate.change(function (e) {
    ORG.scene.setShowPrivate($(this).is(':checked'));
});

checkButtonShowTooltips.change(function (e) {
    ORG.scene.setShowTooltips($(this).is(':checked'));
});

checkButtonShowHiddenViews.change(function (e) {
    ORG.scene.setShowHiddenViews($(this).is(':checked'));
});

checkButtonLiveScreen.change(function (e) {
    ORG.scene.setLiveScreen($(this).is(':checked'));
});
checkButtonShowNormalWindow.change(function (e) {
    ORG.scene.setShowNormalWindow($(this).is(':checked'));
});
checkButtonShowKeyboardWindow.change(function (e) {
    ORG.scene.setShowKeyboardWindow($(this).is(':checked'));
});
checkButtonShowAlertWindow.change(function (e) {
    ORG.scene.setShowAlertWindow($(this).is(':checked'));
});

buttonResetCamera.click(function (e) {
    ORG.scene.resetCameraPosition();
});

buttonExpand.click(function (e) {

    if ( !ORG.deviceController.isConnected) {
        return;
    }
    if (ORG.scene.UIExpanded()) {
        buttonExpand.text("Expand");
    } else {
        buttonExpand.text("Collapse");
    }
    ORG.scene.expandCollapse();
});

checkButtonShowFloor.change(function (e) {
    if ($(this).is(':checked') == true) {
        ORG.scene.showFloor();
    } else {
        ORG.scene.hideFloor();
    }
});



