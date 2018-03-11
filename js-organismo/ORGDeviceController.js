/**
 * Created by jongabilondo on 26/02/2017.
 */

/**
 * Class to perform the communication with an external device using the Organismo protocol.
 * It performs the Organismo commands on a mobile device.
 * It uses websockets (ORGWebSocket).
 */
class ORGDeviceController extends ORGWebSocketDeviceController {

    constructor(ip, port, delegate) {
        super(ip, port, delegate);
        this._webSocket = null;
        this._secondWebSocket = null;
    }

    get type() {
        return "ORG";
    }

    get hasContinuousUpdate() {
        return true;
    }

    openSession() {
        return new Promise( async (resolve, reject) => {
            try {
                this._webSocket = await this._openMainSocket();
                this._secondWebSocket = await this._openSecondSocket();
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    }

   /* requestDeviceInfo() {
        this.webSocket.send(ORGMessageBuilder.deviceInfo())
    }

    requestAppInfo() {
        this.webSocket.send(ORGMessageBuilder.appInfo())
    }*/

    requestScreenshot() {
        this._secondWebSocket.send(ORGMessageBuilder.takeScreenshot())
    }

    //requestElementTree(parameters) {
    //    this.sendRequest(ORGMessageBuilder.elementTree(parameters))
    //}

    requestSystemInfo() {
        this.sendRequest(ORGMessageBuilder.systemInfo( ))
    }

    sendLocationUpdate(lat, lng) {
        this.sendRequest(ORGMessageBuilder.locationUpdate( new google.maps.LatLng(lat, lng), null))
    }

    /*async refreshUITree() {

        bootbox.dialog({ message: '<div class="text-center"><h5><i class="fa fa-spin fa-spinner"></i>&nbsp;Getting device information...</h5></div>' });

        const requestFlags = { "status-bar": true, "keyboard": true, "alert": true, "normal": true }
        try {
            let elementTree = await this.getElementTree(requestFlags);
            ORG.UIJSONTreeManager.update(elementTree, ORGUIJSONTreeManager.TREE_TYPE_ORGANISMO);
            if (ORG.scene.expanding || ORG.scene.isExpanded) {
                ORG.scene.updateUITreeModel(elementTree);
            }
            bootbox.hideAll();
        } catch (err) {
            console.debug("Error getting ui tree.");
            bootbox.hideAll();
        }
    }*/

    getDeviceOrientation() {
        return new Promise(async (resolve, reject) => {
            resolve(ORG.device.orientation);
        })
    }

    getDeviceInformation() {
        return new Promise( async (resolve, reject) => {
            try {
                let response = await this._webSocket.sendAsync(ORGMessageBuilder.deviceInfo());
                const device = new ORGDevice(this._convertDeviceInfo(response.data));
                resolve(device);
            } catch (err) {
                reject(err)
            }
        })
    }

    getAppInformation() {
        return new Promise( async (resolve, reject) => {
            try {
                let response = await this._webSocket.sendAsync(ORGMessageBuilder.appInfo());
                const appInfo = new ORGTestApp(response.data);
                resolve(appInfo);
            } catch (err) {
                reject(err)
            }
        })
    }

    getScreenshot() {
        return new Promise( async (resolve, reject) => {
            try {
                let response = await this._webSocket.sendAsync(ORGMessageBuilder.takeScreenshot());
                let base64Img = response.data.screenshot;
                if (base64Img) {
                    let img = new Image();
                    img.src = "data:image/jpg;base64," + base64Img;
                    img.onload = () => {
                        resolve(img);
                    }
                } else {
                    reject("Missing image in screenshot.");
                }
            } catch (err) {
                reject(err)
            }
        })
    }

    getElementTree(parameters) {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await this._webSocket.sendAsync(ORGMessageBuilder.elementTree(parameters))
                resolve(response)
            } catch (err) {
                reject(err)
            }
        })
    }

    _openMainSocket() {
        return new Promise( async (resolve, reject) => {
            try {
                this._webSocket = new ORGWebSocket();
                const url = "ws://" + this.IPandPort + "/main";
                let openResult = await this._webSocket.open(url);
                if (!!openResult) {
                    resolve(this._webSocket)
                } else {
                    reject()
                }
            } catch (err) {
                reject(err)
            }
        })
    }

    _openSecondSocket() {
        return new Promise( async (resolve, reject) => {
            try {
                this._secondWebSocket = new ORGWebSocket();
                const url = "ws://" + this.IPandPort + "/second";
                let openResult = await this._secondWebSocket.open(url, this.webSocketDelegate); // Process messages in delegate. Do not use async calls with "await". Not used in a REST async style.
                if (!!openResult) {
                    resolve(this._secondWebSocket)
                } else {
                    reject()
                }
            } catch (err) {
                reject(err)
            }
        })
    }

    _convertDeviceInfo(data) {
        let deviceInfo = {}
        deviceInfo.name = data.name;
        deviceInfo.model = data.model;
        deviceInfo.systemVersion = data.systemVersion;
        deviceInfo.productName = data.productName;
        deviceInfo.screenSize = data.screenSize;
        deviceInfo.orientation = this._convertOrientation(data.orientation);
        return deviceInfo;
    }

    _convertOrientation(iOSOrientation) {
        let orientation
        switch(iOSOrientation) {
            case "UIDeviceOrientationPortrait": orientation = ORGDevice.ORIENTATION_PORTRAIT; break;
            case "UIDeviceOrientationPortraitUpsideDown": orientation = ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN; break;
            case "UIDeviceOrientationLandscapeRight": orientation = ORGDevice.ORIENTATION_LANDSCAPE_RIGHT; break;
            case "UIDeviceOrientationLandscapeLeft": orientation = ORGDevice.ORIENTATION_LANDSCAPE_LEFT; break;
            case "UIDeviceOrientationFaceUp": orientation = ORGDevice.ORIENTATION_FACE_UP; break;
            case "UIDeviceOrientationFaceDown": orientation = ORGDevice.ORIENTATION_FACE_DOWN; break;
        }
        return orientation;
    }
}