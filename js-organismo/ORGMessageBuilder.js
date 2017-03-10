/**
 * Created by jongabilondo on 01/07/2016.
 */

/**
 * ORGMessageBuilder. Utilities class to create JSON requests to Organismo driver.
 */
class ORGMessageBuilder {

    static deviceInfo() {
        var msg = {
            type: "request",
            data: {
                request: ORGRequest_deviceInfo
            }
        };
        return JSON.stringify(msg);
    }

    static appInfo() {
        var msg = {
            type: "request",
            data: {
                request: ORGRequest_AppInfo
            }
        };
        return JSON.stringify(msg);
    }

    static takeScreenshot() {
        var msg = {
            type: "request",
            data: {
                request: ORGRequest_screenshot
            }
        };
        return JSON.stringify(msg);
    }

    static elementTree(parameters) {
        var msg = {
            type: "request",
            data: {
                request: ORGRequest_elementTree,
                parameters: parameters
            }
        };
        return JSON.stringify(msg);
    }

    static gesture(gesture, parameters) {
        var msg = {
            type: "request",
            data: {
                request: gesture,
                parameters:parameters
            }
        };
        return JSON.stringify(msg);
    }
}