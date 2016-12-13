
// Settings UI Controls
var checkButtonShowFloor = $('#show-floor');
var checkButtonShowDevice = $('#show-device');
var checkButtonWireframe = $('#show-wireframe');
var checkButtonShowPrivate = $('#show-private');
var checkButtonShowTooltips = $('#show-tooltips');
var checkButtonLiveScreen = $('#live-screen');
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

checkButtonWireframe.change(function(e) {
    orgScene.setWireframeMode($(this).is(':checked'));
});

checkButtonShowPrivate.change(function(e) {
    orgScene.setShowPrivate($(this).is(':checked'));
});

checkButtonShowTooltips.change(function(e) {
    orgScene.setShowTooltips($(this).is(':checked'));
});

checkButtonLiveScreen.change(function(e) {
    orgScene.setLiveScreen($(this).is(':checked'));
});

checkButtonWireframe.change(function(e) {
    orgScene.setWireframeMode(checkButtonWireframe.is(':checked'));
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