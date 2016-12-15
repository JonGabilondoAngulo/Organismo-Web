
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
var buttonExpand = $('#expand-button');
var buttonResetCamera = $('#reset-camera-button');

checkButtonShowFloor.change(function(e) {
    if ($(this).is(':checked') == true) {
        orgScene.showFloor();
    }else{
        orgScene.hideFloor();
    }
});

checkButtonShowDevice.change(function(e) {
    if ($(this).is(':checked') == true) {
        orgScene.showDevice3DModel();
    }else{
        orgScene.hideDevice3DModel();
    }
});

checkButtonShowTextures.change(function(e) {
    orgScene.setShowTextures($(this).is(':checked'));
});

checkButtonShowInteractive.change(function(e) {
    orgScene.setShowInteractive($(this).is(':checked'));
});

checkButtonShowNonInteractive.change(function(e) {
    orgScene.setShowNonInteractive($(this).is(':checked'));
});

checkButtonShowPrivate.change(function(e) {
    orgScene.setShowPrivate($(this).is(':checked'));
});

checkButtonShowTooltips.change(function(e) {
    orgScene.setShowTooltips($(this).is(':checked'));
});

checkButtonShowHiddenViews.change(function(e) {
    orgScene.setShowHiddenViews($(this).is(':checked'));
});

checkButtonLiveScreen.change(function(e) {
    orgScene.setLiveScreen($(this).is(':checked'));
});

buttonResetCamera.click(function(e) {
    orgScene.resetCameraPosition();
});

buttonExpand.click(function(e) {

    if (orgDeviceConnection.isConnected() == false) {
        return;
    }
    if (orgScene.UIExpanded()) {
        buttonExpand.text("Expand");
    } else {
        buttonExpand.text("Collapse");
    }
    orgScene.expandCollapse();
});