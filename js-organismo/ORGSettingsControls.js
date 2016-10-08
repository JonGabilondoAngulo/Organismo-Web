
// Settings UI Controls
var checkButtonShowFloor = $('#show-floor');
var checkButtonWireframe = $('#show-wireframe');
var checkButtonShowPrivate = $('#show-private');
var checkButtonShowTooltips = $('#show-tooltips');
var checkButtonLiveScreen = $('#live-screen');
var buttonExpand = $('#expand-button');

checkButtonShowFloor.change(function(e) {
    if ($(this).is(':checked') == true) {
        orgScene.showFloor();
    }else{
        orgScene.hideFloor();
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