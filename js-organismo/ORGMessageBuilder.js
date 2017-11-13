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
                request: ORG.Request.DeviceInfo
            }
        };
        return JSON.stringify(msg);
    }

    static systemInfo() {
        var msg = {
            type: "request",
            data: {
                request: ORG.Request.SystemInfo
            }
        };
        return JSON.stringify(msg);
    }

    static appInfo() {
        var msg = {
            type: "request",
            data: {
                request: ORG.Request.AppInfo
            }
        };
        return JSON.stringify(msg);
    }

    static takeScreenshot() {
        var msg = {
            type: "request",
            data: {
                request: ORG.Request.Screenshot
            }
        };
        return JSON.stringify(msg);
    }

    static elementTree(parameters) {
        var msg = {
            type: "request",
            data: {
                request: ORG.Request.ElementTree,
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

    static locationUpdate( location, elevation) {
        var msg = {
            type: "update",
            data: {
            }
        };
        if (location) {
            msg.data.location = { lat: location.lat(), lng : location.lng() };
        }
        if (elevation) {
            msg.data.altimeter = { altitude: elevation, pressure: 1000.0 }; // 100 kilopascal is 1 bar
        }
        return JSON.stringify(msg);
    }

    static attitudeUpdate( quaternion) {
        var msg = {
            type: "update",
            data: {
            }
        };
        if (quaternion) {
            msg.data.deviceAttitude = { qx:quaternion.x, qy:quaternion.z, qz:quaternion.y, qw:quaternion.w };
        }
        return JSON.stringify(msg);
    }
}