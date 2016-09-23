function requestScreenshot(orgWS) {

    var msgDict = {
        "command": "query",
        "content": {
            "action": {"name": "takeScreenshot"},
            "device": {"id": "3d4a718687e8c31059a050db665374a429a91a50"},
            "application": {"uuid": $('#appsSelector').val(), "name": "UICatalog", "version": "1.0"},
            "requestId": 0,
            "sessionId": "fcd65b6f-4768-4037-9bfb-5593c45b869d",
            "job": {"id": "30dce845-ba59-4798-883f-2128bdef6358"}
        }
    };
    var msg = JSON.stringify(msgDict);
    orgWS.send(msg);
}

function requestScreenshotOOA(orgWS) {

    var msgDict = {
        "command": "appiumCommand",
        "content": {
            "command": "au.capture('screenshot53b537a4-2792-493a-b7a3-8dfddfefe34d')",
            "device": {"id": "3d4a718687e8c31059a050db665374a429a91a50"},
            "requestId": 88
        }
    };
    var msg = JSON.stringify(msgDict);
    orgWS.send(msg);
}