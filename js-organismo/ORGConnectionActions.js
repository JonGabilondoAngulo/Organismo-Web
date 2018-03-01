/**
 * Created by jongabilondo on 05/02/2018.
 */

class ORGConnectionActions {

    static connect() {
        const serverUrl = $('#device-url');
        let deviceURL = serverUrl.val();
        if (deviceURL === "") {
            deviceURL = "localhost";
        }

        // Create the controller for the selected protocol.
        const driverName = ORG.UI.dropdownDriver.text().split(' ');
        if (driverName[0] === "Organismo") {
            if (! (ORG.deviceController instanceof ORGDeviceController)) {
                ORG.deviceController = new ORGDeviceController(deviceURL, 5567, new ORGOrganismoWSDelegate());
            }
        } else if (driverName[0] === "iDeviceControlProxy") {
            if (! (ORG.deviceController instanceof ORGiMobileDeviceController)) {
                ORG.deviceController = new ORGiMobileDeviceController(deviceURL, 8000, new ORGiControlProxyWSDelegate());
            }
        } else if (driverName[0] === "WDA") {
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
            bootbox.dialog({ closeButton: false, message: '<div class="text-center"><h4><i class="fa fa-spin fa-spinner"></i> Connecting to device ...</h4></div>' }); // Progress alert
            // 1. Open session
            let session = await controller.openSession();
            ORG.dispatcher.dispatch({
                actionType: 'wda-session-open'
            });

            bootbox.hideAll();
            bootbox.dialog({ closeButton: false, message: '<div class="text-center"><h4><i class="fa fa-spin fa-spinner"></i> Getting device information...</h4></div>' }); // Progress alert

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
            let screenshot = await controller.getScreenshot();

            // 5. Get device 3D model
            let model = await ORG3DDeviceModelLoader.loadDevice3DModel(ORG.device, ORG.scene, kORGDevicePositionY);

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
        bootbox.dialog({ message: '<div class="text-center"><h4><i class="fa fa-spin fa-spinner"></i>&nbsp;Getting device information...</h4></div>' });

        try {
            let controller = ORG.deviceController;
            let orientation = await controller.getDeviceOrientation();
            let tree = await controller.getElementTree();
            let screenshot = await controller.getScreenshot();

            ORG.dispatcher.dispatch({
                actionType: 'ui-json-tree-update',
                tree: tree.children,
                treeType: ORGUIJSONTreeManager.TREE_TYPE_WDA
            });
            if (orientation !== ORG.device.orientation) {
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

    static async playGesture(gesture, xpath) {
        try {
            let result = await ORG.deviceController.elementUsing("xpath", xpath);
            if (typeof result === 'object' && result["ELEMENT"] !== undefined) {
                let elementID = result["ELEMENT"];
                switch (gesture) {
                    case ORGActions.TAP: await ORG.deviceController.tapElementWithId(elementID); break;
                    case ORGActions.LONG_PRESS: await ORG.deviceController.longPressElementWithId(elementID); break;
                    case ORGActions.SWIPE_LEFT: await ORG.deviceController.swipeElementWithId(elementID, "left"); break;
                    case ORGActions.SWIPE_RIGHT: await ORG.deviceController.swipeElementWithId(elementID, "right"); break;
                    case ORGActions.SWIPE_UP: await ORG.deviceController.swipeElementWithId(elementID, "up"); break;
                    case ORGActions.SWIPE_DOWN: await ORG.deviceController.swipeElementWithId(elementID, "down"); break;
                }
            }
        } catch(err) {
            this._handleError(err);
        }
    }

    static async showDevice3DModel() {
        try {
            let model = await ORG3DDeviceModelLoader.loadDevice3DModel(ORG.device, ORG.scene, kORGDevicePositionY);
            if (model) {
                ORG.scene.addDevice3DModel(model);
                ORG.scene.setDeviceOrientation2(ORG.device.orientation);
            }
        } catch(err) {
            this._handleError(err);
        }
    }

    static async setOrientation(orientation) {
        try {
            let result = await ORG.deviceController.setOrientation(orientation);
            ORG.device.orientation = orientation;
            const screenshot = await ORG.deviceController.getScreenshot();
            ORG.scene.setDeviceOrientation2(orientation);
            ORG.dispatcher.dispatch({
                actionType: 'screenshot-update',
                image: screenshot
            });
        } catch(err) {
            this._handleError(err);
        }
    }

    static hideDevice3DModel() {
        ORG.scene.hideDevice3DModel();
    }

    static addDeviceToScene(model, screenshot) {
        if (model) {
            ORG.scene.addDevice3DModel(model);
            ORG.scene.setDeviceOrientation2(ORG.device.orientation);
        }
        ORG.scene.createDeviceScreen(ORG.device.displaySize.width, ORG.device.displaySize.height, 0);
        ORG.scene.createRaycasterForDeviceScreen();
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
            const safeErrorText = (err.length < 2000 ? ((err.length === 0) ? "Unknown error" : err) : err.substring(0, 2000));
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