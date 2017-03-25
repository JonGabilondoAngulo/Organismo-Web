/**
 * Delegate class for the WebSocket to the Device.
 * It receives the callbacks for all the events on the WebSocket.
 * @constructor
 */
function ORGWebSocketDelegate() {

	/**
	 * Callback for the websocket opening.
	 * @param ws
	 */
	this.onOpen = function(ws) {
		console.log('Delegate onOpen');
		connected = true;
		connectButton.text("Disconnect");

		ORG.deviceController.requestDeviceInfo();
		ORG.deviceController.requestAppInfo();
	};

	/**
	 * Callback for the closing of the websocket.
	 * @param ws
	 */
	this.onClose = function(ws) {
		console.log('Delegate onClose.');
		connectButton.text("Connect");
		ORG.scene.handleDeviceDisconnection();
		buttonExpand.text("Expand");
		deviceNameLabel.text('');
		deviceSystemVersionLabel.text('');
	};

	/**
	 * Callback for when the websocket has received a message from the Device.
	 * Here the message is processed.
	 * @param event
	 * @param ws
	 */
	this.onMessage = function(event, ws) {

		var messageJSON = JSON.parse(event.data);
		if (messageJSON) {
			//console.log("onMessage. parse OK");
		} else {
			console.log("onMessage. parse NOT OK");
		}
		if (messageJSON) {
			if (messageJSON.type == "response") {
				processResponse(messageJSON);
			} else if (messageJSON.type == "notification") {
				processNotification(messageJSON.body);
			} else if (messageJSON.command == "CoreMotionFeed") {
				var motionMessage = messageJSON.content;
				processMotionFeedMessage(motionMessage);
			}
		}
	};

	/**
	 * Callback for when an error has been occurred in the websocket.
	 * @param event
	 * @param ws
	 */
	this.onError = function(event, ws) {
		console.log('WS Error: ' + event.data);
	}

	// Private

	/**
	 * Method to process a message of type "response" that arrived from the Device.
	 * @param messageJSON
	 */
	function processResponse(messageJSON) {
		if ( messageJSON.request == ORGRequest_deviceInfo) {
			processResponseDeviceInfo(messageJSON);
		} else if ( messageJSON.request == ORGRequest_AppInfo) {
			processResponseAppInfo(messageJSON);
		} else if ( messageJSON.request == ORGRequest_screenshot) {
			processReportScreenshot( messageJSON);
		} else if ( messageJSON.request == ORGRequest_elementTree) {
			processReportElementTree(messageJSON);
		}
	}

	/**
	 * Method to process a message of type "notification" tath arrived from the Device.
	 * @param messageBody
	 */
	function processNotification(messageBody) {
		if ( messageBody.notification == "orientation-change") {
			processNotificationOrientationChanged(messageBody.parameters);
		}
	}

	/**
	 * Method to process the a device orientation change notification message coming from the Device.
	 * @param notificationParameters
	 */
	function processNotificationOrientationChanged(notificationParameters) {
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
	function processResponseDeviceInfo(messageJSON) {

		// The connection to the device its on place. We got information about the device.
		ORG.device = new ORGDevice( messageJSON.data );
		deviceNameLabel.text( ORG.device.name);
		deviceSystemVersionLabel.text( ORG.device.systemVersion);
		deviceModelLabel.text( ORG.device.productName);

		ORG.scene.createDeviceScreen( messageJSON.data.screenSize.width, messageJSON.data.screenSize.height, 0);
		ORG.scene.createRaycasterForDeviceScreen();

		if ( ORG.scene.mustShowDevice3DModel() ) {
			ORG.scene.showDevice3DModel();
		}

		// make sure the floor is at the right height
		ORG.scene.positionFloorUnderDevice();

		// ask for the first screenshot
		ORG.deviceController.requestScreenshot();
	}

	/**
	 * Method to process a response with app info coming from the Device.
	 * @param messageJSON
	 */
	function processResponseAppInfo(messageJSON) {

		ORG.testApp = new ORGTestApp( messageJSON.data );

		testAppNameLabel.text( ORG.testApp.name );
		testAppVersionLabel.text( ORG.testApp.version );
		testAppBundleIdLabel.text( ORG.testApp.bundleIdentifier );
	}

	/**
	 * Method to process a message response with screenshot inforamtion.
	 * @param messageJSON
	 */
	function processReportScreenshot( messageJSON) {
		var base64Img = messageJSON.data.screenshot;
		if (base64Img) {
			var img = new Image();
			img.src = "data:image/jpg;base64," + base64Img;
			ORG.scene.setScreenshotImage(img);

			// Ask for next screenshot
			if (ORG.scene.continuousScreenshot() && !ORG.scene.UIExpanded()) {
				//ORG.deviceConnection.requestScreenshot();
				ORG.deviceController.requestScreenshot();
			}
		}
	}

	/**
	 * Method to process a message reponse with information of the UI Element Tree.
	 * @param reportData
	 */
	function processReportElementTree(reportData) {
		var jsonTree = reportData.data;
		if (!!jsonTree) {
			ORG.treeEditor.set( jsonTree );
			ORG.scene.updateUITreeModel( jsonTree );
		}
	}
}
