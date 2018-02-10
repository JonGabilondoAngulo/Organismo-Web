/**
 * Created by jongabilondo on 05/02/2018.
 */

class ORGConnectionActions {

    static connect() {
        const serverUrl = $('#device-url');
        var deviceURL = serverUrl.val();
        if (deviceURL == "") {
            deviceURL = "localhost";
        }

        // Create the controller for the selected protocol.
        const driverName = ORG.UI.dropdownDriver.text().split(' ');
        if (driverName[0] == "Organismo") {
            if (! (ORG.deviceController instanceof ORGDeviceController)) {
                ORG.deviceController = new ORGDeviceController(deviceURL, 5567, new ORGOrganismoWSDelegate());
            }
        } else if (driverName[0] == "iDeviceControlProxy") {
            if (! (ORG.deviceController instanceof ORGiMobileDeviceController)) {
                ORG.deviceController = new ORGiMobileDeviceController(deviceURL, 8000, new ORGiControlProxyWSDelegate());
            }
        } else if (driverName[0] == "WDA") {
            if (! (ORG.deviceController instanceof ORGDeviceWDAController)) {
                ORG.deviceController = new ORGDeviceWDAController(deviceURL, 8100);
            }
        }

        // Connect / disconnect.
        if (ORG.deviceController.isConnected) {
            this.disconnect();
        } else {
            this.connectWithController(ORG.deviceController);
        }
    }

    static disconnect() {
        ORG.deviceController.closeSession(); // It's not equivalent to disconnecting the device. On Disconnection the device disappears. Closing session the Device stays.
        ORG.dispatcher.dispatch({
            actionType: 'device-disconnect'
        });
    }

    static connectWithController(controller) {
        var screenshot;
        this.openSession(controller)
            .then(this.getDeviceInformation)
            .then(this.getScreenshot)
            .then(
                (result) => {
                    screenshot = result;

                    this.getDeviceModel()
                        .then((result) => {
                            this.addDeviceToScene(screenshot);
                        }, (err) => {
                            this.handleError(err);
                        })
                        .catch((err) => {
                            bootbox.hideAll();
                            this.handleError(err);
                        })
                        .finally(() => {
                            bootbox.hideAll();
                        })

                }, (err) => {
                    bootbox.hideAll();
                    this.handleError(err);
                })
            .catch((err) => {
                bootbox.hideAll();
                this.handleError(err);
            })
    }

    static refreshUITree() {
        bootbox.dialog({ message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i>&nbsp;Getting device information...</div>' });

        // Get orientation
        ORG.deviceController.requestDeviceOrientation().then(
            (result) => {
                const orientaton = result; // update UI bellow once we get the screenshot

                // Get element tree
                ORG.deviceController.requestElementTree().then(
                    (result) => {
                        ORG.dispatcher.dispatch({
                            actionType: 'ui-json-tree-update',
                            tree: result.children,
                            treeType: ORGUIJSONTreeManager.TREE_TYPE_WDA
                        });

                        // Get Screenshot.
                        ORG.deviceController.requestScreenshot().then(
                            (result) => {
                                const img = result;
                                if (orientaton != ORG.device.orientation) {
                                    ORG.dispatcher.dispatch({
                                        actionType: 'device-orientation-changed',
                                        orientation: orientaton
                                    });
                                }
                                ORG.dispatcher.dispatch({
                                    actionType: 'screenshot-update',
                                    image: img
                                });
                                bootbox.hideAll();
                            }
                        ).catch((err) => {
                            bootbox.hideAll();
                            this.handleError(err);
                        })
                    }
                ).catch((err) => {
                    bootbox.hideAll();
                    this.handleError(err);
                })
            }
        ).catch((err) => {
                bootbox.hideAll();
                this.handleError(err);
        })
    }

    static openSession(controller) {
        return new Promise( (resolve, reject) => {
            controller.openSession().then(
                (result) => {
                    ORG.dispatcher.dispatch({
                        actionType: 'wda-session-open'
                    });

                    bootbox.dialog({ message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Getting device information...</div>' }); // Progress alert

                    resolve();
                }, (err) => {
                    reject(err);
                }
            ).catch( (err) => {
                reject(err);
            })
        })
    }

    static getDeviceInformation() {
        return new Promise( (resolve, reject) => {
            ORG.deviceController.getDeviceInformation().then(
                (result) => {
                    ORG.device = result;
                    ORG.testApp = new ORGTestApp( {name: "unknown", version: "unknown", bundleIdentifier: "unknown"} ); // we don't know anything about the app

                    ORG.dispatcher.dispatch({
                        actionType: 'device-info-update',
                        device: ORG.device
                    })
                    resolve();
                }, (err) => {
                    reject(err);
                }
            ).catch( (err) => {
                reject(err);
            })
        })
    }

    static getScreenshot() {
        return new Promise( (resolve, reject) => {
            ORG.deviceController.requestScreenshot().then(
                (result) => {
                    resolve(result);
                }, (err) => {
                    reject(err);
                }
            ).catch( (err) => {
                reject(err);
            })
        })
    }

    static getDeviceModel() {
        return new Promise( (resolve, reject) => {
            ORG.scene.showDevice3DModel().then(
                (result) => {
                    resolve();
                }, (err) => {
                    reject(err);
                }
            ).catch( (err) => {
                reject(err);
            })
        })
    }

    static addDeviceToScene(screenshot) {
        //return new Promise( (resolve, reject) => {
            // Now create the screen and show the snapshot
            ORG.scene.createDeviceScreen(ORG.device.displaySize.width, ORG.device.displaySize.height, 0);
            ORG.scene.positionDeviceAndScreenInRealWorld(); // 1.5 m in Y
            ORG.scene.devicePositionHasChanged();
            ORG.scene.setDeviceOrientation2(ORG.device.orientation);

            ORG.dispatcher.dispatch({
                actionType: 'screenshot-update',
                image: screenshot
            });
            //resolve();
          //})
    }

    static handleError(err) {
        if (err instanceof ORGError) {
            if (err.id == ORGERR.ERR_CONNECTION_REFUSED) {
                ORG.dispatcher.dispatch({
                    actionType: 'wda-session-open-error',
                    error: err.message
                })
            }
        } else if (typeof err === "string") {
            const safeErrorText = (err.length < 2000 ?((err.length==0) ?"Unknown error" :err) :err.substring(0, 2000));
            bootbox.alert({
                title: "Error",
                message: safeErrorText
            });
        }
    }
}