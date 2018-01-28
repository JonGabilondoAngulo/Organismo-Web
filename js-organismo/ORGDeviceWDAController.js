/**
 * Created by jongabilondo on 26/02/2017.
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
        return "http://" + this.IPandPort;
    }

    openSession() {
        const _this = this;
        var endpointURL = this.RESTPrefix  + "/session";
        this.xhr.open("POST", endpointURL, true);
        this.xhr.onload = () => {
            this._sessionInfo = JSON.parse(this.xhr.responseText);

            // UI updates
            ORG.dispatcher.dispatch({
                actionType: 'wda-session-open'
            });

            bootbox.dialog({ message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Getting device information...</div>' });

            // Get element tree, we will get the App information from it.
            _this.requestElementTree().then(function(result) {
                ORG.device = _this._deviceInfoFromTree(result);
                ORG.testApp = new ORGTestApp( {name: "unknown", version: "unknown", bundleIdentifier: "unknown"} );
                // UI updates
                ORG.dispatcher.dispatch({
                    actionType: 'device-info-update',
                    device: ORG.device
                });
                ORG.dispatcher.dispatch({
                    actionType: 'ui-json-tree-update',
                    tree: result.children,
                    treeType: ORGUIJSONTreeManager.TREE_TYPE_WDA

                });
                /* we don't know anything about the app ...
                ORG.dispatcher.dispatch({
                    actionType: 'app-info-update',
                    app: ORG.testApp
                });*/

            }, function(err) {
                console.log(err);
            }).finally( function() {

                // Get Screenshot. Even if the get Device/App info failed.
                _this.requestScreenshot().then(function(result) {
                    var base64Img = result;
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

                }, function(err) {
                    console.log(err);
                    bootbox.hideAll();
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
        const _this = this;

        bootbox.dialog({ message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Getting device information...</div>' });

        // Get element tree
        this.requestElementTree().then(function(result) {
            ORG.dispatcher.dispatch({
                actionType: 'ui-json-tree-update',
                tree: result.children,
                treeType: ORGUIJSONTreeManager.TREE_TYPE_WDA
            });

        }, function(err) {
            console.log(err);
        }).finally( function() {
            // Get Screenshot.
            _this.requestScreenshot().then(function(result) {
                var base64Img = result;
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

            }, function(err) {
                console.log(err);
                bootbox.hideAll();
            })
        })
    }

    requestScreenshot() {
        const _this = this;

        return new Promise((resolve, reject) => {
            var endpointURL = _this.RESTPrefix + "/screenshot";
            _this.xhr.open("GET", endpointURL, true);
            _this.xhr.onload = () => {
                var response = JSON.parse(_this.xhr.responseText);
                if (response.status == 0) {
                    resolve(response.value);
                } else {
                    reject(response.value);
                }
            }
            _this.xhr.onerror = () => reject(_this.xhr.statusText);
            _this.xhr.send();
        });
    }

    requestElementTree() {
        const _this = this;

        return new Promise((resolve, reject) => {
            var endpointURL = _this.RESTPrefix + "/source?format=json";
            _this.xhr.open("GET", endpointURL, true);
            _this.xhr.onload = () => {
                var response = JSON.parse(_this.xhr.responseText);
                if (response.status == 0) {
                    resolve(response.value);
                } else {
                    reject(response.value);
                }
            }
            _this.xhr.onerror = () => reject(_this.xhr.statusText);
            _this.xhr.send();
        });
    }

    requestDeviceInfo() {
        const _this = this;

        // Not implemented in default WDA. "/deviceInfo"
        return new Promise((resolve, reject) => {
            var endpointURL = _this.RESTPrefix + "/deviceInfo";
            _this.xhr.open("GET", endpointURL, true);
            _this.xhr.onload = () => {
                var response = JSON.parse(_this.xhr.responseText);
                if (response.status == 0) {
                    resolve(response.value);
                } else {
                    reject(response.value);
                }
            }
            _this.xhr.onerror = () => reject(_this.xhr.statusText);
            _this.xhr.send();
        });
    }

    requestAppInfo() {
        const _this = this;

        // Not implemented in default WDA. "/appInfo"
        return new Promise((resolve, reject) => {
            var endpointURL = _this.RESTPrefix + "/appInfo";
            _this.xhr.open("GET", endpointURL, true);
            _this.xhr.onload = () => {
                var response = JSON.parse(_this.xhr.responseText);
                if (response.status == 0) {
                    resolve(response.value);
                } else {
                    reject(response.value);
                }
            }
            _this.xhr.onerror = () => reject(_this.xhr.statusText);
            _this.xhr.send();
        });
    }

    _deviceInfoFromTree(tree) {
        // Root of tree contains Application info (very poor info)
        const screenPoints = {width: tree.rect.width, height: tree.rect.height};
        const deviceProductName = ORGDeviceMetrics.deviceWithScreenPoints(screenPoints);
        return new ORGDevice( {name:'unknown', systemVersion: "unknown", productName: deviceProductName, screenSize: screenPoints} );
    }
}