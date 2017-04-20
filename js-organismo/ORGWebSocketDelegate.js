/**
 * Delegate class for the WebSocket to the Device.
 * It receives the callbacks for all the events on the WebSocket.
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
		ORG.deviceController.requestDeviceInfo();
		ORG.deviceController.requestAppInfo();
		// UI updates
        ORG.UI.connectButton.text("Disconnect");
    };

	/**
	 * Callback for the closing of the websocket.
	 * @param ws
	 */
	onClose(ws) {
		console.log('Delegate onClose.');
		ORG.scene.handleDeviceDisconnection();

		// UI
        ORG.UI.connectButton.text("Connect");
        ORG.UI.buttonExpand.text("Expand");
        ORG.UI.deviceNameLabel.text('');
        ORG.UI.deviceSystemVersionLabel.text('');
	};

	/**
	 * Callback for when the websocket has received a message from the Device.
	 * Here the message is processed.
	 * @param event
	 * @param ws
	 */
	onMessage(event, ws) {

		var messageJSON = JSON.parse(event.data);
		if (messageJSON) {
			//console.log("onMessage. parse OK");
		} else {
			console.log("onMessage. parse NOT OK");
		}
		if (messageJSON) {
			if (messageJSON.type == "response") {
				this._processResponse(messageJSON);
			} else if (messageJSON.type == "notification") {
				this._processNotification(messageJSON.body);
			} else if (messageJSON.command == "CoreMotionFeed") {
				var motionMessage = messageJSON.content;
				this._processMotionFeedMessage(motionMessage);
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
		if ( messageJSON.request == ORG.Request.DeviceInfo) {
			this._processResponseDeviceInfo(messageJSON);
		} else if ( messageJSON.request == ORG.Request.AppInfo) {
            this._processResponseAppInfo(messageJSON);
		} else if ( messageJSON.request == ORG.Request.Screenshot) {
            this._processReportScreenshot( messageJSON);
		} else if ( messageJSON.request == ORG.Request.ElementTree) {
            this._processReportElementTree(messageJSON);
		}
	}

	/**
	 * Method to process a message of type "notification" tath arrived from the Device.
	 * @param messageBody
	 */
	_processNotification(messageBody) {
		if ( messageBody.notification == "orientation-change") {
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
	_processResponseDeviceInfo(messageJSON) {

		// The connection to the device its on place. We got information about the device.
		ORG.device = new ORGDevice( messageJSON.data );

		ORG.scene.createDeviceScreen( messageJSON.data.screenSize.width, messageJSON.data.screenSize.height, 0);
		ORG.scene.createRaycasterForDeviceScreen();

		if ( ORG.scene.mustShowDevice3DModel() ) {
			ORG.scene.showDevice3DModel();
		}

		// make sure the floor is at the right height
		ORG.scene.positionFloorUnderDevice();

		// ask for the first screenshot
		ORG.deviceController.requestScreenshot();

		// UI
        ORG.UI.deviceNameLabel.text( ORG.device.name);
        ORG.UI.deviceSystemVersionLabel.text( ORG.device.systemVersion);
        ORG.UI.deviceModelLabel.text( ORG.device.productName);
    }

	/**
	 * Method to process a response with app info coming from the Device.
	 * @param messageJSON
	 */
	_processResponseAppInfo(messageJSON) {

		ORG.testApp = new ORGTestApp( messageJSON.data );

        ORG.UI.testAppNameLabel.text( ORG.testApp.name );
        ORG.UI.testAppVersionLabel.text( ORG.testApp.version );
        ORG.UI.testAppBundleIdLabel.text( ORG.testApp.bundleIdentifier );
	}

	/**
	 * Method to process a message response with screenshot inforamtion.
	 * @param messageJSON
	 */
	_processReportScreenshot( messageJSON) {
		var base64Img = messageJSON.data.screenshot;
		if (base64Img) {
			var img = new Image();
			img.src = "data:image/jpg;base64," + base64Img;
			ORG.scene.setScreenshotImage(img);

			// Ask for next screenshot
			if (ORG.scene.continuousScreenshot() && !ORG.scene.isExpanded()) {
				ORG.deviceController.requestScreenshot();
			}
		}
	}

	/**
	 * Method to process a message reponse with information of the UI Element Tree.
	 * @param reportData
	 */
	_processReportElementTree(reportData) {
		var jsonTree = reportData.data;
		if (!!jsonTree) {
			ORG.treeEditor.set( jsonTree );
			ORG.scene.updateUITreeModel( jsonTree );
		}
	}
}