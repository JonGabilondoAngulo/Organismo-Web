/**
 * Created by jongabilondo on 26/02/2017.
 */

/***
 * Class to communicate with the WebDriverAgent running on the device.
 */
class ORGDeviceWDAController extends ORGDeviceBaseController {

    constructor(ip, port) {
        super(ip,port);
        this.xhr = new XMLHttpRequest();
        this._sessionInfo = null;
    }

    get type() {
        return "WDA";
    }

    get isConnected() {
        return (this._sessionInfo != null);
    }

    get RESTPrefix() {
        return "http://" + this.IPandPort + "/";
    }

    get RESTPrefixWithSession() {
        return this.RESTPrefix + "session/" + this._sessionInfo.sessionId + "/";
    }

    openSession() {
        return new Promise((resolve, reject) => {
            var endpointURL = this.RESTPrefix + "session";
            this.xhr.open("POST", endpointURL, true);
            this.xhr.onload = () => {
                if (this.xhr.status == 200) {
                    const response = JSON.parse(this.xhr.responseText);
                    if (response.status == 0) {
                        this._sessionInfo = JSON.parse(this.xhr.responseText);
                        resolve(this._sessionInfo);
                    } else {
                        reject(this.xhr.responseText);
                    }
                } else {
                    reject(this.xhr.statusText);
                }
            }
            this.xhr.onerror = () => {
                reject(this.xhr.statusText);
            }
            this.xhr.onreadystatechange = () => {
                // Solution to get connection errors. Pitty there is no proper way to something so basic.
                if (this.xhr.readyState == 4 && this.xhr.status == 0) {
                    reject(new ORGError(ORGERR.ERR_CONNECTION_REFUSED, "Error opening session."));
                }
            }
            this.xhr.send(JSON.stringify({desiredCapabilities:{bundleId:'com.apple.mobilephone'}}));
        });
    }

    closeSession() {
        // UI updates
        ORG.dispatcher.dispatch({
            actionType: 'wda-session-closed'
        });

        /* THIS IS NOT WORKING
         const _this = this;
         var endpointURL = this.RESTPrefix + "/";
         this.xhr.open("DELETE", endpointURL, true);
         this.xhr.onreadystatechange = function() {
         if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
         _this._sessionInfo = null;
         }
         }
         this.xhr.send();*/
    }

    getDeviceInformation() {
        return new Promise((resolve, reject) => {

            // Get orientation
            this.getDeviceOrientation().then(
                (result) => {
                    const orientaton = result;

                    // Get device screen size.
                    this.requestWindowSize().then(
                        (result) => {
                            const screenSizePortrait = ORGDevice.screenSizeInPortrait(result);
                            var device = this._deviceInfoFromWindowSize(screenSizePortrait);
                            device.orientation = orientaton;
                            resolve(device);
                        },
                        (err) => {
                            reject(err);
                        }
                    ). catch(
                        (err) => {
                            reject(err);
                        }
                    )
                },
                (err) => {
                    reject(err);
                }
            ).catch(
                (err) => {
                    reject(err);
                }
            )
        });
    }

    getAppInformation() {
        return new Promise((resolve, reject) => {
            resolve(new ORGTestApp( {name: "", version: "", bundleIdentifier: ""} ));
        });
    }

    getDeviceOrientation() {
        return new Promise((resolve, reject) => {
            var endpointURL = this.RESTPrefixWithSession + "orientation";
            this.xhr.open("GET", endpointURL, true);
            this.xhr.onload = () => {
                var response = JSON.parse(this.xhr.responseText);
                if (response.status == 0) {
                    var orientation = ORGDevice.ORIENTATION_PORTRAIT;
                    switch (response.value) {
                        case "PORTRAIT": break;
                        case "LANDSCAPE": orientation = ORGDevice.ORIENTATION_LANDSCAPE_LEFT; break;
                        case "UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT": orientation = ORGDevice.ORIENTATION_LANDSCAPE_RIGHT; break;
                        case "UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN": orientation = ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN; break;
                    }
                    resolve(orientation);
                } else {
                    reject(response.value);
                }
            }
            this.xhr.onerror = () => reject(this.xhr.statusText);
            this.xhr.onreadystatechange = () => {
                // Solution to get connection errors. Pitty there is no proper way to something so important.
                if (this.xhr.readyState == 4 && this.xhr.status == 0) {
                    reject(new ORGError(ORGERR.ERR_CONNECTION_REFUSED, "Error requesting orientation."));
                }
            }
            this.xhr.send();
        });
    }

    getScreenshot() {
        return new Promise((resolve, reject) => {
            var endpointURL = this.RESTPrefix + "screenshot";
            this.xhr.open("GET", endpointURL, true);
            this.xhr.onload = () => {
                var response = JSON.parse(this.xhr.responseText);
                if (response.status == 0) {
                    const base64Img = response.value;
                    if (base64Img && Object.keys(base64Img).length) {
                        var img = new Image();
                        img.src = "data:image/jpg;base64," + base64Img;
                        img.onload = () => {
                            resolve(img);
                        }
                    } else {
                        reject(new ORGError(ORGERR.ERR_GENERAL, "Could not get screenshot."));
                    }
                } else {
                    reject(response.value);
                }
            }
            this.xhr.onerror = () => reject(this.xhr.statusText);
            this.xhr.onreadystatechange = () => {
                // Solution to get connection errors. Pitty there is no proper way to something so important.
                if (this.xhr.readyState == 4 && this.xhr.status == 0) {
                    reject(new ORGError(ORGERR.ERR_CONNECTION_REFUSED, "Error requesting orientation."));
                }
            }
            this.xhr.send();
        });
    }

    getElementTree() {
        return new Promise((resolve, reject) => {
            var endpointURL = this.RESTPrefix + "source?format=json";
            this.xhr.open("GET", endpointURL, true);
            this.xhr.onload = () => {
                var response = JSON.parse(this.xhr.responseText);
                if (response.status == 0) {
                    resolve(response.value);
                } else {
                    reject(response.value);
                }
            }
            this.xhr.onerror = () => reject(this.xhr.statusText);
            this.xhr.onreadystatechange = () => {
                // Solution to get connection errors. Pitty there is no proper way to something so important.
                if (this.xhr.readyState == 4 && this.xhr.status == 0) {
                    reject(new ORGError(ORGERR.ERR_CONNECTION_REFUSED, "Error requesting orientation."));
                }
            }
            this.xhr.send();
        });
    }

    requestWindowSize() {
        return new Promise((resolve, reject) => {
            var endpointURL = this.RESTPrefixWithSession + "window/size";
            this.xhr.open("GET", endpointURL, true);
            this.xhr.onload = () => {
                var response = JSON.parse(this.xhr.responseText);
                if (response.status == 0) {
                    resolve(response.value);
                } else {
                    reject(response.status);
                }
            }
            this.xhr.onerror = () => {
                reject(this.xhr.statusText);
            }
            this.xhr.onabort = () => {
                reject(this.xhr.statusText);
            }
            this.xhr.onreadystatechange = () => {
                // Solution to get connection errors. Pitty there is no proper way to something so important.
                if (this.xhr.readyState == 4 && this.xhr.status == 0) {
                    reject(new ORGError(ORGERR.ERR_CONNECTION_REFUSED, "Error requesting orientation."));
                }
            }
            this.xhr.send();
        });
    }

    _deviceInfoFromTree(tree) {
        // Root of tree contains Application info (very poor info)
        const screenPoints = {width: tree.rect.width, height: tree.rect.height};
        const deviceProductName = ORGDeviceMetrics.deviceWithScreenPoints(screenPoints);
        return new ORGDevice( {name:'', systemVersion: "", productName: deviceProductName, screenSize: screenPoints} );
    }

    _deviceInfoFromWindowSize(size) {
        const screenPoints = size;
        const deviceProductName = ORGDeviceMetrics.deviceWithScreenPoints(screenPoints);
        return new ORGDevice( {name:'', systemVersion: "", productName: deviceProductName, screenSize: screenPoints} );
    }
}