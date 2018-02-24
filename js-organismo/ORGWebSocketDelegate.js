/**
 * Delegate class for the WebSocket to the Device.
 * Implements the callbacks for all the events on the WebSocket.
 * @constructor
 */
class ORGWebSocketDelegate {

	constructor() {
		this.connected = false;
	}

	/**
	 * Callback for the websocket opening.
	 * @param ws
	 */
	onOpen(ws) {
		console.log('Delegate onOpen');
		this.connected = true;
		// UI updates
        ORG.dispatcher.dispatch({
            actionType: 'websocket-open'
        });
    };

	/**
	 * Callback for the closing of the websocket.
	 * @param ws
	 */
	onClose(event, ws) {
		console.log('Delegate onClose.');
		//ORG.scene.handleDeviceDisconnection();

		// UI updates
        ORG.dispatcher.dispatch({
            actionType: 'websocket-closed',
            code: event.code,
            reason: event.reason,
            deviceController: ORG.deviceController.constructor.name
        });
        ORG.dispatcher.dispatch({
            actionType: 'device-disconnect',
			code: event.code,
			reason: event.reason,
			deviceController: ORG.deviceController.constructor.name
        });
		/*
        switch(e.code) {
            case 1000:
                reason = 'Normal closure';
                break;
            case 1001:
                reason = 'An endpoint is going away';
                break;
            case 1002:
                reason = 'An endpoint is terminating the connection due to a protocol error.';
                break;
            case 1003:
                reason = 'An endpoint is terminating the connection because it has received a type of data it cannot accept';
                break;
            case 1004:
                reason = 'Reserved. The specific meaning might be defined in the future.';
                break;
            case 1005:
                reason = 'No status code was actually present';
                break;
            case 1006:
                reason = 'The connection was closed abnormally';
                break;
            case 1007:
                reason = 'The endpoint is terminating the connection because a message was received that contained inconsistent data';
                break;
            case 1008:
                reason = 'The endpoint is terminating the connection because it received a message that violates its policy';
                break;
            case 1009:
                reason = 'The endpoint is terminating the connection because a data frame was received that is too large';
                break;
            case 1010:
                reason = 'The client is terminating the connection because it expected the server to negotiate one or more extension, but the server didn\'t.';
                break;
            case 1011:
                reason = 'The server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.';
                break;
            case 1012:
                reason = 'The server is terminating the connection because it is restarting';
                break;
            case 1013:
                reason = 'The server is terminating the connection due to a temporary condition';
                break;
            case 1015:
                reason = 'The connection was closed due to a failure to perform a TLS handshake';
                break;
        }*/
	};

	/**
	 * Callback for when the websocket has received a message from the Device.
	 * Here the message is processed.
	 * @param event
	 * @param ws
	 */
	onMessage(event, ws) {

		let messageJSON = JSON.parse(event.data);
		if (messageJSON) {
			//console.log("onMessage. parse OK");
		} else {
			console.log("onMessage. parse NOT OK");
			return;
		}
		if (messageJSON) {
			if (messageJSON.type === "response") {
				this._processResponse(messageJSON);
			} else if (messageJSON.type === "notification") {
				this._processNotification(messageJSON.body);
			} else if (messageJSON.command === "CoreMotionFeed") {
				this._processMotionFeedMessage(messageJSON.content);
			}
		}
	};

	/**
	 * Callback for when an error has been occurred in the websocket.
	 * @param event
	 * @param ws
	 */
	onError(event, ws) {
		console.log('WS Error: ' + event.data);
	}

	// Private

	/**
	 * Method to process a message of type "response" that arrived from the Device.
	 * @param messageJSON
	 */
	_processResponse(messageJSON) {
		switch (messageJSON.request) {
			case ORG.Request.DeviceInfo: {
                this._processResponseDeviceInfo(messageJSON.data);
            } break;
			case ORG.Request.AppInfo: {
                this._processResponseAppInfo(messageJSON);
            } break;
			case ORG.Request.Screenshot: {
                this._processReportScreenshot(messageJSON);
            } break;
			case ORG.Request.ElementTree: {
                this._processReportElementTree(messageJSON);
            }break;
			case ORG.Request.SystemInfo: {
                this._processReportSystemInfo(messageJSON);
            } break;
            case ORG.Request.ClassHierarchy: {
                this._processResponseClassHierarchy(messageJSON);
            } break;
			default: {
				console.debug('Unknown response from Device.');
			}
		}
		/*if ( messageJSON.request == ORG.Request.DeviceInfo) {
			this._processResponseDeviceInfo(messageJSON.data);
		} else if ( messageJSON.request == ORG.Request.AppInfo) {
            this._processResponseAppInfo(messageJSON);
		} else if ( messageJSON.request == ORG.Request.Screenshot) {
            this._processReportScreenshot( messageJSON);
        } else if ( messageJSON.request == ORG.Request.ElementTree) {
            this._processReportElementTree(messageJSON);
        } else if ( messageJSON.request == ORG.Request.SystemInfo) {
            this._processReportSystemInfo(messageJSON);
		}*/
	}

	/**
	 * Method to process a message of type "notification" tath arrived from the Device.
	 * @param messageBody
	 */
	_processNotification(messageBody) {
		if ( messageBody.notification === "orientation-change") {
            this._processNotificationOrientationChanged(messageBody.parameters);
		}
	}

	/**
	 * Method to process the a device orientation change notification message coming from the Device.
	 * @param notificationParameters
	 */
	_processNotificationOrientationChanged(notificationParameters) {
		if (notificationParameters) {
			var newSize = notificationParameters.screenSize;
			var newOrientation = notificationParameters.orientation;
			if (newSize && newOrientation) {
				ORG.scene.setDeviceOrientation(newOrientation, newSize.width, newSize.height);
			}
		}
	}

	/**
	 * Method to process a response with device info coming from the Device.
	 * @param messageJSON
	 */
	_processResponseDeviceInfo(deviceInfo) {

		// The connection to the device its on place. We got information about the device.
		ORG.device = new ORGDevice( deviceInfo );

		// UI
        ORG.dispatcher.dispatch({
            actionType: 'device-info-update',
            device: ORG.device
        });

        if (ORG.scene.flagShowDevice3DModel) {
            ORG.scene.showDevice3DModel().then(
                (result) => {
                    this._createDeviceScreenWithSnapshot(ORG.device);
                }
            );
        } else {
            this._createDeviceScreenWithSnapshot(ORG.device);
		}
        //ORG.scene.createDeviceScreen( ORG.device.displaySize.width, ORG.device.displaySize.height, 0);
        //ORG.scene.devicePositionHasChanged();
        //ORG.scene.createRaycasterForDeviceScreen();
        //
        //// ask for the first screenshot
        //ORG.deviceController.requestScreenshot();
    }

	/**
	 * Method to process a response with app info coming from the Device.
	 * @param messageJSON
	 */
	_processResponseAppInfo(messageJSON) {
		ORG.testApp = new ORGTestApp( messageJSON.data );

        // UI updates
        ORG.dispatcher.dispatch({
            actionType: 'app-info-update',
            app: ORG.testApp
        });

        //ORG.UI.testAppNameLabel.text( ORG.testApp.name );
        //ORG.UI.testAppVersionLabel.text( ORG.testApp.version );
        //ORG.UI.testAppBundleIdLabel.text( ORG.testApp.bundleIdentifier );
	}

    /***
     * Method to process a response with class hierarchy info coming from the Device.
     * @param messageJSON
     * @private
     */
	_processResponseClassHierarchy(messageJSON) {
        ORG.UIJSONTreeManager.showClassHierarchy(messageJSON.data);
    }

	/**
	 * Method to process a message response with screenshot information.
	 * @param messageJSON
	 */
	_processReportScreenshot( messageJSON) {
		let base64Img = messageJSON.data.screenshot;
		if (base64Img) {
			var img = new Image();
			img.src = "data:image/jpg;base64," + base64Img;

            // UI updates
            ORG.dispatcher.dispatch({
                actionType: 'screenshot-update',
                image: img
            });

			// Ask for next screenshot
			if (ORG.scene.flagContinuousScreenshot && !ORG.scene.isExpanded && ORG.deviceController && ORG.deviceController.isConnected) {
				ORG.deviceController.requestScreenshot();
			}
		}
	}

	/**
	 * Method to process a message response with information of the UI Element Tree.
	 * @param reportData
	 */
	_processReportElementTree(reportData) {
		var jsonTree = reportData.data;
		if (!!jsonTree) {
            ORG.UIJSONTreeManager.update(jsonTree, ORGUIJSONTreeManager.TREE_TYPE_ORGANISMO);
            if (ORG.scene.expanding || ORG.scene.isExpanded) {
                ORG.scene.updateUITreeModel(jsonTree);
			}
            bootbox.hideAll();
        }
	}

    /**
     * Method to process a message response with the system information of the iDevice.
     * @param reportData
     */
    _processReportSystemInfo( reportData ) {
        var systemInfoData = reportData.data;
        if ( !!systemInfoData ) {
			if (ORG.systemInfoManager) {
				ORG.systemInfoManager.dataUpdate( systemInfoData );
            }
        }
    }


    _createDeviceScreenWithSnapshot(device) {
        ORG.scene.createDeviceScreen(device.displaySize.width, device.displaySize.height, 0);
        ORG.scene.positionDeviceAndScreenInRealWorld(); // 1.5 m in Y
        ORG.scene.devicePositionHasChanged();
        ORG.deviceController.requestScreenshot(); // ask for the first screenshot
    }

}