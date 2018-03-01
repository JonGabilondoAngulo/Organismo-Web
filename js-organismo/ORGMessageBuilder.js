/**
 * Created by jongabilondo on 01/07/2016.
 */

/**
 * ORGMessageBuilder. Utilities class to create JSON requests to Organismo driver.
 */
class ORGMessageBuilder {

    static deviceInfo() {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.DeviceInfo
            }
        };
        return JSON.stringify(msg);
    }

    static systemInfo() {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.SystemInfo
            }
        };
        return JSON.stringify(msg);
    }

    static appInfo() {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.AppInfo
            }
        };
        return JSON.stringify(msg);
    }

    static takeScreenshot() {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.Screenshot
            }
        };
        return JSON.stringify(msg);
    }

    static elementTree(parameters) {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.ElementTree,
                parameters: parameters
            }
        };
        return JSON.stringify(msg);
    }

    static gesture(gesture, parameters) {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: gesture,
                parameters:parameters
            }
        };
        return JSON.stringify(msg);
    }

    static locationUpdate(location, elevation) {
        let msg = {
            type: ORGRequest.Update,
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
        let msg = {
            type: ORGRequest.Update,
            data: {
            }
        };
        if (quaternion) {
            msg.data.deviceAttitude = { qx:quaternion.x, qy:quaternion.z, qz:quaternion.y, qw:quaternion.w };
        }
        return JSON.stringify(msg);
    }

    static classHierarchy(className) {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.ClassHierarchy,
                parameters:{className: className}
            }
        };
        return JSON.stringify(msg);
    }
}