/**
 * Created by jongabilondo on 7/11/15.
 */

function sendSimulatorMotionUpdate(msgDict) {

    //alert("3");
    var msg = JSON.stringify(msgDict);
    if (ws) {
        ws.send(msg);
    }
}

function startMotionFeed()
{
    //alert("in startMotionFeed 1");
    var msgDict = {"command":"StartCoreMotionFeed",
        "content":{
            "device":{"id":"3d4a718687e8c31059a050db665374a429a91a50"},
            "application":{"uuid":"","name":"anyname","version":"1.0"},
            "requestId":0,
            "sessionId":"fcd65b6f-4768-4037-9bfb-5593c45b869d",
            "job":{"id":"30dce845-ba59-4798-883f-2128bdef6358"}
        }};
    //alert("in startMotionFeed 2");

    var msg = JSON.stringify(msgDict);
    //alert("in startMotionFeed 3");
    if (ws) {
        //alert("yes ws");
        ws.send(msg);
    } else {
        alert("no ws");
    }
}

function stopMotionFeed()
{
    //alert("in stopMotionFeed");
    var msgDict = {"command":"StopCoreMotionFeed",
        "content":{
            "device":{"id":"3d4a718687e8c31059a050db665374a429a91a50"},
            "application":{"uuid":"","name":"anyname","version":"1.0"},
            "requestId":0,
            "sessionId":"fcd65b6f-4768-4037-9bfb-5593c45b869d",
            "job":{"id":"30dce845-ba59-4798-883f-2128bdef6358"}
        }};
    var msg = JSON.stringify(msgDict);
    ws.send(msg);

    //iPhone5Object.rotation.set(0,0,0);
    //iPhone5Object.updateMatrix();
    //screenPlane.rotation.set(0,0,0);
    //screenPlane.updateMatrix();
    iPhone5Object.setRotationFromQuaternion(new THREE.Quaternion(0,0,0,0));
    screenPlane.setRotationFromQuaternion(new THREE.Quaternion(0,0,0,0));
}

function processMotionFeedMessage(motionMessage)
{
    //alert(JSON.stringify(motionMessage));
    var attitude = motionMessage.attitude;
    if (attitude) {
        //alert(JSON.stringify(attitude));
        //alert("got attitude", JSON.stringify(motionMessage));
        var quaternion = attitude.q;
        //alert(JSON.stringify(quaternion));
        deviceAttitudeChanged(quaternion);
    }
}

function deviceAttitudeChanged(quaternionJSON) {

    //alert(JSON.stringify(quaternionJSON));
    var quaternion = new THREE.Quaternion(quaternionJSON.x, quaternionJSON.y, quaternionJSON.z, quaternionJSON.w);

    if (quaternion) {
        //alert("attitude quaternion");
        //iPhone5Object.quaternion = quaternion;
        iPhone5Object.setRotationFromQuaternion(quaternion);
        screenPlane.setRotationFromQuaternion(quaternion);
    }
}