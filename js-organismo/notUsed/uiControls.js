
// UI Controls
var radioWireframeSolid = $('#wireframe_solid');
var radiosMotion = $('#motion_send_receive');
var checkShowFloor = $('#show_floor');
var checkShowDevice = $('#show_device');
var checkTrackMotionDevice = $('#motion_track');
var checkShowVideo = $('#show_video');
var checkInspect = $('#inspect');
var checkShowHidden = $('#show_hidden');
var checkShowHiddenOnly = $('#show_hidden_only');
var checkShowOutOfScreen = $('#show_out_of_screen');
var connectButton = $('#connect-button');
var serverUrl = $('#device-url');

connectButton.click(function(e) {
    if (orgDeviceConnection.isConnected()) {
        orgDeviceConnection.close();
    } else {
        var url = serverUrl.val();
        if (url == "") {
            url = "localhost";
        }
        orgDeviceConnection.open(serverUrl.val());
    }
});

//checkShowOutOfScreen.change(function(e) {
//    if ($(this).is(':checked') == true) {
//        gShowOutOfScreen = true;
//        //requestScreenshot();
//    }else{
//        gShowOutOfScreen = false;
//    }
//});
//
//checkShowVideo.change(function(e) {
//    if ($(this).is(':checked') == true) {
//        showVideo = true;
//        requestScreenshot();
//    }else{
//        showVideo = false;
//    }
//});

checkInspect.change(function(e) {
    if ($(this).is(':checked') == true) {

        var msgDict = {"command":"query",
            "content":{
                "action":{"name":"getElementTree"},
                "device":{"id":"3d4a718687e8c31059a050db665374a429a91a50"},
                "application":{"uuid":$('#appsSelector').val(),"name":"UICatalog","version":"1.0"},
                "requestId":0,
                "sessionId":"fcd65b6f-4768-4037-9bfb-5593c45b869d",
                "job":{"id":"30dce845-ba59-4798-883f-2128bdef6358"}
            }};
        var msg = JSON.stringify(msgDict);//$.toJSON(msgDict);
        //addMessage(msg, 'SENT');
        ws.send(msg);

    }else{
        removeTreeModel(treeData);
    }
});

//checkShowFloor.change(function(e) {
//
//    if ($(this).is(':checked') == true) {
//        createFloor(scene);
//    }else{
//        deleteFloor(scene);
//    }
//});

checkShowDevice.change(function(e) {

    if ($(this).is(':checked') == true) {
        showDevice(scene);
    }else{
        hideDevice(scene);
    }
});

checkTrackMotionDevice.change(function(e) {

    if ($(this).is(':checked') == true) {
        motionActive = true;
        if (motionMode=="receive") {
            startMotionFeed();
        }
    }else{
        motionActive = false;
        stopMotionFeed();
    }
});

radiosMotion.change(function(e) {
    var checkedValue = radiosMotion.find('input[name=motion_radios]:checked').val();
    if (checkedValue=="motion_send") {
        motionMode = "send";
        if (motionActive) {
            stopMotionFeed();
        }
    } else if (checkedValue=="motion_receive") {
        motionMode = "receive";
        if (motionActive) {
            startMotionFeed();
        }
    }
});

radioWireframeSolid.change(function(e) {

    var checkedValue = radioWireframeSolid.find('input[name=radios]:checked').val();
    if (checkedValue=="W") {
        changeOpacity(treeData, 0.0);
    } else {
        changeOpacity(treeData, 1.0);
    }
});

checkShowHidden.change(function(e) {

    flagShowHidden = ($(this).is(':checked'));
    console.log("Flag SHow Hidden : ", flagShowHidden);

    modelChangeShowHidden(treeData,flagShowHidden);
});

checkShowHiddenOnly.change(function(e) {

    flagShowHiddenOnly = ($(this).is(':checked'));
    console.log("Flag SHow Hidden Only : ", flagShowHiddenOnly);

    modelChangeShowHiddenOnly(treeData,flagShowHidden,flagShowHiddenOnly);
});