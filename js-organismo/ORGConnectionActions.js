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
            switch (ORG.deviceController.type) {
                case "ORG": {
                    this.connectWithController(ORG.deviceController);
                } break;
                case "WDA": {
                    this.connectWithController(ORG.deviceController);
                } break;
            }
        }
    }

    static disconnect() {
        ORG.deviceController.closeSession(); // It's not equivalent to disconnecting the device. On Disconnection the device disappears. Closing session the Device stays.
        ORG.dispatcher.dispatch({
            actionType: 'device-disconnect'
        });
    }

    static async connectWithController(controller) {
        try {
            bootbox.dialog({ closeButton: false, message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Connecting to device ...</div>' }); // Progress alert
            // 1. Open session
            var session = await controller.openSession();
            ORG.dispatcher.dispatch({
                actionType: 'wda-session-open'
            });

            bootbox.hideAll();
            bootbox.dialog({ closeButton: false, message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Getting device information...</div>' }); // Progress alert

            // 2. Get device info
            ORG.device = await controller.getDeviceInformation();
            ORG.dispatcher.dispatch({
                actionType: 'device-info-update',
                device: ORG.device
            })

            // 3. Get App info
            ORG.testApp = await controller.getAppInformation();
            ORG.dispatcher.dispatch({
                actionType: 'app-info-update',
                app: ORG.testApp
            });

            // 4. Get screenshot
            var screenshot = await controller.getScreenshot();

            // 5. Get device 3D model
            var model = await ORG3DDeviceModelLoader.loadDevice3DModel(ORG.device, this, kORGDevicePositionY);//this.getDeviceModel();

            // 6. Add device with screenshot to scene
            this.addDeviceToScene(model, screenshot);
            ORG.dispatcher.dispatch({
                actionType: 'screenshot-update',
                image: screenshot
            });

            bootbox.hideAll();

        } catch(err) {
            bootbox.hideAll();
            this._handleError(err);
        }
    }

    static async refreshUITree() {
        bootbox.dialog({ message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i>&nbsp;Getting device information...</div>' });

        try {
            var controller = ORG.deviceController;
            var orientation = await controller.getDeviceOrientation();
            var tree = await controller.getElementTree();
            var screenshot = await controller.getScreenshot();

            ORG.dispatcher.dispatch({
                actionType: 'ui-json-tree-update',
                tree: tree.children,
                treeType: ORGUIJSONTreeManager.TREE_TYPE_WDA
            });
            if (orientation != ORG.device.orientation) {
                ORG.dispatcher.dispatch({
                    actionType: 'device-orientation-changed',
                    orientation: orientation
                });
            }
            ORG.dispatcher.dispatch({
                actionType: 'screenshot-update',
                image: screenshot
            });
            bootbox.hideAll();
        } catch(err) {
            bootbox.hideAll();
            this._handleError(err);
        }
    }

    static async pressHome() {
        try {
            await ORG.deviceController.sendPressHome();
        } catch(err) {
            this._handleError(err);
        }
    }
    static async lockDevice() {
        try {
            await ORG.deviceController.sendLock();
        } catch(err) {
            this._handleError(err);
        }
    }
    static async unlockDevice() {
        try {
            await ORG.deviceController.sendUnlock();
        } catch(err) {
            this._handleError(err);
        }
    }
    static async refreshScreen() {
        try {
            let screenshot = await ORG.deviceController.getScreenshot();
            if (screenshot) {
                ORG.dispatcher.dispatch({
                    actionType: 'screenshot-update',
                    image: screenshot
                });
            }
        } catch(err) {
            this._handleError(err);
        }
    }

    static async tapOnXpath(xpath) {
        try {
            let result = await ORG.deviceController.elementUsing("xpath", xpath);
            if (typeof result === 'object' && result["ELEMENT"] !== undefined) {
                await ORG.deviceController.tapElementWithId(result["ELEMENT"]);
            }
        } catch(err) {
            this._handleError(err);
        }
    }

    static async longPressOnXpath(xpath) {
        try {
            let result = await ORG.deviceController.elementUsing("xpath", xpath);
            if (typeof result === 'object' && result["ELEMENT"] !== undefined) {
                await ORG.deviceController.longPressElementWithId(result["ELEMENT"]);
            }
        } catch(err) {
            this._handleError(err);
        }
    }

    static async swipeOnXpath(xpath, direction) {
        try {
            let result = await ORG.deviceController.elementUsing("xpath", xpath);
            if (typeof result === 'object' && result["ELEMENT"] !== undefined) {
                await ORG.deviceController.swipeElementWithId(result["ELEMENT"], direction);
            }
        } catch(err) {
            this._handleError(err);
        }
    }

    static addDeviceToScene(model, screenshot) {
        if (model) {
            ORG.scene.addDevice3DModel(model);
            ORG.scene.setDeviceOrientation2(ORG.device.orientation);
        }
        ORG.scene.createDeviceScreen(ORG.device.displaySize.width, ORG.device.displaySize.height, 0);
        ORG.scene.positionDeviceAndScreenInRealWorld(); // 1.5 m in Y
        ORG.scene.devicePositionHasChanged();
        ORG.scene.setDeviceOrientation2(ORG.device.orientation);
    }

    static getElementClassHierarchy(element) {
        ORG.deviceController.sendRequest(ORGMessageBuilder.classHierarchy(element.className));
    }

    static _handleError(err) {
        if (err instanceof ORGError) {
            switch (err.id) {
                case ORGERR.ERR_CONNECTION_REFUSED: {
                    ORG.dispatcher.dispatch({
                        actionType: 'wda-session-open-error',
                        error: err.message
                    })
                } break;
                case ORGERR.ERR_WS_CONNECTION_REFUSED: {
                    ORG.dispatcher.dispatch({
                        actionType: 'ws-session-open-error',
                        error: err.message
                    })
                } break;
                default: {
                    bootbox.alert({
                        title: "Error",
                        message: err.message
                    });
                }
            }
        } else if (err instanceof DOMException) {
            bootbox.alert({
                title: err.name,
                message: err.message
            });
        } else if (typeof err === "string") {
            const safeErrorText = (err.length < 2000 ? ((err.length == 0) ? "Unknown error" : err) : err.substring(0, 2000));
            bootbox.alert({
                title: "Error",
                message: safeErrorText
            });
        } else if (typeof err === "object") {
            bootbox.alert({
                title: "Error",
                message: JSON.stringify(err, null, 2)
            });
        } else {
            bootbox.alert({
                title: "Error",
                message: "Unknown error."
            });
        }
    }
}