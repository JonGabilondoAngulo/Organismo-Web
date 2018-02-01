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
        var endpointURL = this.RESTPrefix  + "session";
        this.xhr.open("POST", endpointURL, true);
        this.xhr.onload = () => {

            // request could have gone bad
            if (this.xhr.status != 200) {
                bootbox.alert({
                    title: "Error requesting session from WDA.",
                    message: this.xhr.statusText
                });
                return;
            }

            // Request was correct, process response
            this._sessionInfo = JSON.parse(this.xhr.responseText);

            // UI updates
            ORG.dispatcher.dispatch({
                actionType: 'wda-session-open'
            });

            bootbox.dialog({ message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Getting device information...</div>' }); // Progress alert

            // 'Guess' the device by the size of the window.
            this.requestWindowSize().then(
                (result) => {
                    ORG.device = this._deviceInfoFromWindowSize(result);
                    ORG.testApp = new ORGTestApp( {name: "unknown", version: "unknown", bundleIdentifier: "unknown"} ); // we don't know anything about the app

                    ORG.dispatcher.dispatch({ // UI updates
                        actionType: 'device-info-update',
                        device: ORG.device
                    });

                    // Get the device's 3D model
                    if (ORG.scene.flagShowDevice3DModel) {
                        ORG.scene.showDevice3DModel().then(
                            (result) => {
                                this._createDeviceScreenWithSnapshot(ORG.device);
                            }
                        );
                    } else {
                        this._createDeviceScreenWithSnapshot(ORG.device);
                    }
                },
                (err) => {
                    var safeErrorText = null;
                    console.debug(err);
                    bootbox.hideAll();

                    if (err instanceof DOMException) {
                        safeErrorText = err.name + ". " + err.message;
                    } else {
                        safeErrorText = (err.length < 2000 ?err :err.substring(0, 2000));
                    }
                    bootbox.alert({
                        title: "Error getting UI tree.",
                        message: safeErrorText
                    })
                })
        };
        this.xhr.onerror = () => {
            ORG.dispatcher.dispatch({
                actionType: 'wda-session-open-error',
                error: this.xhr.statusText
            });
        };
        this.xhr.send();
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

    refreshUITree() {
        bootbox.dialog({ message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Getting device information...</div>' });

        // Get element tree
        this.requestElementTree().then(
            (result) => {
                ORG.dispatcher.dispatch({
                    actionType: 'ui-json-tree-update',
                    tree: result.children,
                    treeType: ORGUIJSONTreeManager.TREE_TYPE_WDA
                });

                // Get Screenshot.
                this.requestScreenshot().then(
                    (result) => {
                        const base64Img = result;
                        if (base64Img) {
                            var img = new Image();
                            img.src = "data:image/jpg;base64," + base64Img;

                            // UI updates
                            ORG.dispatcher.dispatch({
                                actionType: 'screenshot-update',
                                image: img
                            });
                        }
                        bootbox.hideAll();

                    },
                    (err) => {
                        const safeErrorText = (err.length < 2000 ?err :err.substring(0, 2000));
                        console.debug(err);
                        bootbox.hideAll();
                        bootbox.alert({
                            title: "Error getting Screenshot.",
                            message: safeErrorText
                        })
                    })

            },
            (err) => {
                console.debug(err);
                bootbox.hideAll();
                const safeErrorText = (err.length < 2000 ?((err.length==0) ?"Unknown error" :err) :err.substring(0, 2000));
                bootbox.alert({
                    title: "Error getting UI tree.",
                    message: safeErrorText
                })
            })
    }

    requestScreenshot() {

        return new Promise((resolve, reject) => {
            var endpointURL = this.RESTPrefix + "screenshot";
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
            this.xhr.send();
        });
    }

    requestElementTree() {

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
                    reject(response.value);
                }
            }
            this.xhr.onerror = () => {
                reject(this.xhr.statusText);
            }
            this.xhr.onabort = () => {
                reject(this.xhr.statusText);
            }
            this.xhr.send();
        });
    }

    requestDeviceInfo() {
        //const _this = this;
        //
        //// Not implemented in default WDA. "/deviceInfo"
        //return new Promise((resolve, reject) => {
        //    var endpointURL = _this.RESTPrefix + "deviceInfo";
        //    _this.xhr.open("GET", endpointURL, true);
        //    _this.xhr.onload = () => {
        //        var response = JSON.parse(_this.xhr.responseText);
        //        if (response.status == 0) {
        //            resolve(response.value);
        //        } else {
        //            reject(response.value);
        //        }
        //    }
        //    _this.xhr.onerror = () => reject(_this.xhr.statusText);
        //    _this.xhr.send();
        //});
    }

    requestAppInfo() {
        //const _this = this;
        //
        //// Not implemented in default WDA. "/appInfo"
        //return new Promise((resolve, reject) => {
        //    var endpointURL = _this.RESTPrefix + "appInfo";
        //    _this.xhr.open("GET", endpointURL, true);
        //    _this.xhr.onload = () => {
        //        var response = JSON.parse(_this.xhr.responseText);
        //        if (response.status == 0) {
        //            resolve(response.value);
        //        } else {
        //            reject(response.value);
        //        }
        //    }
        //    _this.xhr.onerror = () => reject(_this.xhr.statusText);
        //    _this.xhr.send();
        //});
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

    _createDeviceScreenWithSnapshot(device) {
        ORG.scene.createDeviceScreen(device.displaySize.width, device.displaySize.height, 0);
        ORG.scene.positionDeviceAndScreenInRealWorld(); // 1.5 m in Y
        ORG.scene.devicePositionHasChanged();

        // Get screenshot.
        this.requestScreenshot().then(
            (result) => {
                const base64Img = result;
                if (base64Img) {
                    var img = new Image();
                    img.src = "data:image/jpg;base64," + base64Img;

                    // Be safe and do not use it in THREE until is loaded.
                    img.onload = () => {
                        ORG.dispatcher.dispatch({
                            actionType: 'screenshot-update',
                            image: img
                        });
                    }
                }
                bootbox.hideAll();

            },
            (err) => {
                console.debug(err);
                bootbox.hideAll();
                bootbox.alert({
                    title: "Error getting screenshot.",
                    message: err
                })
            })
    }

}