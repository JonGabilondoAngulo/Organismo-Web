/**
 * Created by jongabilondo on 01/07/2016.
 */

function ORGMessageBuilder() {

    this.deviceInfo = function () {
        var msg = {
            type: "request",
            data: {
                request: ORGRequest_deviceInfo
            }
        };
        return JSON.stringify(msg);
    }

    this.appInfo = function () {
        var msg = {
            type: "request",
            data: {
                request: ORGRequest_AppInfo
            }
        };
        return JSON.stringify(msg);
    }

    this.takeScreenshot = function () {
        var msg = {
            type: "request",
            data: {
                request: ORGRequest_screenshot
            }
        };
        return JSON.stringify(msg);
    }

    this.elementTree = function () {
        var msg = {
            type: "request",
            data: {
                request: ORGRequest_elementTree
            }
        };
        return JSON.stringify(msg);
    }

    this.gesture = function(gesture, parameters) {
        var msg = {
            type: "request",
            data: {
                request: "tap",
                parameters:parameters
            }
        };
        return JSON.stringify(msg);
    }
}

var orgMessageBuilder = new ORGMessageBuilder();
