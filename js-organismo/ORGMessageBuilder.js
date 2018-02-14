/**
 * Created by jongabilondo on 01/07/2016.
 */

/**
 * ORGMessageBuilder. Utilities class to create JSON requests to Organismo driver.
 */
class ORGMessageBuilder {

    static deviceInfo() {
        var msg = {
            type: ORG.Request.Request,
            data: {
                request: ORG.Request.DeviceInfo
            }
        };
        return JSON.stringify(msg);
    }

    static systemInfo() {
        var msg = {
            type: ORG.Request.Request,
            data: {
                request: ORG.Request.SystemInfo
            }
        };
        return JSON.stringify(msg);
    }

    static appInfo() {
        var msg = {
            type: ORG.Request.Request,
            data: {
                request: ORG.Request.AppInfo
            }
        };
        return JSON.stringify(msg);
    }

    static takeScreenshot() {
        var msg = {
            type: ORG.Request.Request,
            data: {
                request: ORG.Request.Screenshot
            }
        };
        return JSON.stringify(msg);
    }

    static elementTree(parameters) {
        var msg = {
            type: ORG.Request.Request,
            data: {
                request: ORG.Request.ElementTree,
                parameters: parameters
            }
        };
        return JSON.stringify(msg);
    }

    static gesture(gesture, parameters) {
        var msg = {
            type: ORG.Request.Request,
            data: {
                request: gesture,
                parameters:parameters
            }
        };
        return JSON.stringify(msg);
    }

    static locationUpdate(location, elevation) {
        var msg = {
            type: ORG.Request.Update,
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

    static attitudeUpdate(quaternion) {
        var msg = {
            type: ORG.Request.Update,
            data: {
            }
        };
        if (quaternion) {
            msg.data.deviceAttitude = { qx:quaternion.x, qy:quaternion.z, qz:quaternion.y, qw:quaternion.w };
        }
        return JSON.stringify(msg);
    }

    static classHierarchy(className) {
        var msg = {
            type: ORG.Request.Request,
            data: {
                request: ORG.Request.ClassHierarchy,
                parameters:{className: className}
            }
        };
        return JSON.stringify(msg);
    }
}