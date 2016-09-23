
// Settings UI Controls
var checkButtonShowFloor = $('#show-floor');
var checkButtonWireframe = $('#show-wireframe');
var checkButtonShowPrivate = $('#show-private');
var checkButtonShowTooltips = $('#show-tooltips');
var checkButtonLiveScreen = $('#live-screen');

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