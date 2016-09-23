//

var ws = null;

new function() {
	var connected = false;

	var serverUrl;
	var connectionStatus;
	//var sendMessage;

	var getScreenshotButton;
	var getScreenshotButtonOOA;
    var openAppButton;
	var getTreeButton;
	var getTreeButtonOOA;
	var connectButton;
	var disconnectButton; 
	//var sendButton;

	//var jsonEditorContainer = document.getElementById('jsoneditor');//$('#jsoneditor');
	//var options = { mode: 'view', modes: ['code', 'form', 'text', 'tree', 'view'], error: function (err) { alert(err.toString()); }};
	//var jsonEditor = new JSONEditor(jsonEditorContainer, options, {"hello":"there"});

	var open = function() {
		var url = "ws://" + serverUrl.val() + ":12345/ws";
		ws = new WebSocket(url);
		ws.onopen = onOpen;
		ws.onclose = onClose;
		ws.onmessage = onMessage;
		ws.onerror = onError;

		//connectionStatus.text('OPENING ...');
		serverUrl.attr('disabled', 'disabled');
		connectButton.hide();
		disconnectButton.show();
	}
	
	var close = function() {
		if (ws) {
			console.log('CLOSING ...');
			ws.close();
		} else {
            console.log('CLOSE requested but there is no ws.')
        }
		connected = false;
		//connectionStatus.text('CLOSED');

		serverUrl.removeAttr('disabled');
		connectButton.show();
		disconnectButton.hide();
		//sendMessage.attr('disabled', 'disabled');
		//sendButton.attr('disabled', 'disabled');
	}
	
	var clearLog = function() {
		$('#messages').html('');
	}
	
	var onOpen = function() {
		console.log('OPENED: ' + serverUrl.val());
		connected = true;
		//connectionStatus.text('OPENED');
		//sendMessage.removeAttr('disabled');
		//sendButton.removeAttr('disabled');
	};
	
	var onClose = function() {
		console.log('CLOSED: ' + serverUrl.val());
		ws = null;
	};
	
	var onMessage = function(event) {
		var data = event.data;

        jsonData = JSON.parse(data);
        if (jsonData) {
            console.log("onMessage. parse OK");
        } else {
            console.log("onMessage. parse NOT OK");
        }
        if (jsonData) {
			if (jsonData["command"]=="report") {
				if (eval("jsonData.content.action")=="TakeScreenshot") {
					var base64Img = eval("jsonData.content.result.screenshot");
					if (base64Img) {
						var img = new Image();
						img.src = "data:image/jpg;base64," + base64Img;
						updateScreenshot(img);

						if (showVideo) {
							requestScreenshot();
						}
					}
				} else if (eval("jsonData.content.action")=="getElementTree") {
					var jsonTree = eval("jsonData.content.result");
					if (jsonTree) {
						//jsonEditor.set(jsonTree);
						updateTreeModel(jsonTree );
					}
				} else if (eval("jsonData.content.command")=="getElementTreeOOA") {
					var appiumResponse = eval("jsonData.content.result");
					if (appiumResponse.value) {
						updateTreeModelUIA(appiumResponse.value );
					}
				} else if (eval("jsonData.content.command")=="appiumCommand") {
					if (eval("jsonData.content.requestId")==88) {
						var appiumResponse = eval("jsonData.content.result");
						updateScreenshotOOA( appiumResponse["value"] );

					} else if (eval("jsonData.content.requestId")==89) {
						var appiumResultStr = eval("jsonData.content.result");
						var appiumResult = JSON.parse(appiumResultStr);
						updateTreeModelUIA( appiumResult["value"] );
					}

				}
			} else if (jsonData.command=="CoreMotionFeed") {
				//alert(JSON.stringify(jsonData));
				var motionMessage = jsonData.content;
				processMotionFeedMessage(motionMessage);

			}
        }
	};
	
	var onError = function(event) {
		alert(event.data);
	}
	
	var addMessage = function(data, type) {
		var msg = $('<pre>').text(data);
		if (type === 'SENT') {
			msg.addClass('sent');
		}
		var messages = $('#messages');
		messages.append(msg);
		
		var msgBox = messages.get(0);
		while (msgBox.childNodes.length > 1000) {
			msgBox.removeChild(msgBox.firstChild);
		}
		msgBox.scrollTop = msgBox.scrollHeight;
	}

	WebSocketClient = {
		init: function() {
			serverUrl = $('#serverUrl');
			//connectionStatus = $('#connectionStatus');
			//sendMessage = $('#sendMessage');

			getScreenshotButton = $('#getScreenshotButton');
			getScreenshotButtonOOA = $('#getScreenshotButtonOOA');
			getTreeButton = $('#getTreeButton');
			getTreeButtonOOA = $('#getTreeButtonOOA');
            openAppButton = $('#openAppButton');
            connectButton = $('#connectButton');
			disconnectButton = $('#disconnectButton');
            //if (disconnectButton) { console.log('found disconnectButton')};
			//sendButton = $('#sendButton');
			
			connectButton.click(function(e) {
                console.log('connect button clicked');
				close();
				open();
			});
		
			disconnectButton.click(function(e) {
                console.log('disconnect button clicked');
				close();
			});
			
//			sendButton.click(function(e) {
//				var msg = $('#sendMessage').val();
//				addMessage(msg, 'SENT');
//				ws.send(msg);
//			});

            openAppButton.click(function(e) {
                var msgDict = {"command":"launchApplication",
                "content":{
                    "device":{"id":"3d4a718687e8c31059a050db665374a429a91a50"},
                    "application":{"uuid":$('#appsSelector').val(),"name":"anyname","version":"1.0"},
                    "requestId":0,
                    "sessionId":"fcd65b6f-4768-4037-9bfb-5593c45b869d",
                    "job":{"id":"30dce845-ba59-4798-883f-2128bdef6358"}
                }};
                var msg = JSON.stringify(msgDict);//$.toJSON(msgDict);
                //addMessage(msg, 'SENT');
                ws.send(msg);
            });

            getTreeButton.click(function(e) {
                var msgDict = {"command":"query",
                    "content":{
                        "action":{"name":"getElementTree"},
                        "device":{"id":"3d4a718687e8c31059a050db665374a429a91a50"},
                        "application":{"uuid":$('#appsSelector').val(),"name":"UICatalog","version":"1.0"},
                        "requestId":0,
                        "sessionId":"fcd65b6f-4768-4037-9bfb-5593c45b869d",
                        "job":{"id":"30dce845-ba59-4798-883f-2128bdef6358"}
                    }};
                var msg = JSON.stringify(msgDict);//$.toJSON(msgDict);
                //addMessage(msg, 'SENT');
                ws.send(msg);

				removeScreenshotFromScreen();
            });

			getTreeButtonOOA.click(function(e) {
				var msgDict = {
					"command":"appiumCommand",
					"content":{
						"command":"au.mainApp().getTreeForXML()",
						"device":{"id":"3d4a718687e8c31059a050db665374a429a91a50"},
						"requestId":89
					}};
				var msg = JSON.stringify(msgDict);
				ws.send(msg);

				removeScreenshotFromScreen();
			});


			getScreenshotButton.click(function(e) {
				requestScreenshot();
             });

			getScreenshotButtonOOA.click(function(e) {
				requestScreenshotOOA();
			});

//			var isCtrl;
//			sendMessage.keyup(function (e) {
//				if(e.which == 17) isCtrl=false;
//			}).keydown(function (e) {
//				if(e.which == 17) isCtrl=true;
//				if(e.which == 13 && isCtrl == true) {
//					sendButton.click();
//					return false;
//				}
//			});
		}
	};
}

$(function() {
	WebSocketClient.init();
});