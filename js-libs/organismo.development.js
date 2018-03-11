/**
 * Created by jongabilondo on 14/08/2017.
 */

var ORG = ORG || {};
ORG.UI = {};
/**
 * Created by jongabilondo on 14/02/2018.
 */

const ORGRequest = {
    Request : "request",
    Update : "update",
    AppInfo : "app-info",
    DeviceInfo : "device-info",
    SystemInfo : "system-info",
    Screenshot : "screenshot",
    ElementTree : "element-tree",
    ClassHierarchy : "class-hierarchy"
};


const ORGActions = {
    PRESS_HOME: "press-jome",
    LOCK_DEVICE: "lock-device",
    UNLOCK_DEVICE: "unlock-device",
    REFRESH_SCREEN: "refresh-screen",
    SET_ORIENTATION: "set-orientation",

    TAP: "tap",
    LONG_PRESS: "long-press",
    SWIPE: "swipe",
    SWIPE_LEFT: "swipe-left",
    SWIPE_RIGHT: "swipe-right",
    SWIPE_UP: "swipe-up",
    SWIPE_DOWN: "swipe-down",

    LOOK_AT: "look-at",
    LOOK_FRONT_AT: "look-front-at",

    RESET_CAMERA_POSITION: "reset-camera-position",
    RESET_DEVICE_POSITION: "reset-device-position",
    SCREEN_CLOSEUP: "device-screen-closeup",
    SHOW_CLASS_HIERARCHY: "show-class-hierarchy"
}
/**
 * Created by jongabilondo on 24/01/2018.
 */


ORG.DeviceMetrics = {
    iPhone5 : {
        Body : {H : "123.8 mm", W: "58.6 mm", D: "7.6 mm"},
        Display: {Diagonal:"100 mm", Ratio:"1.7777777" /* 16/9 */},
        Points: { X:320 , Y:568},
        Scale: 2,
        ProductName: "iPhone 5"
    },
    iPhone6 : {
        Body : {H : "138.1 mm", W: "67.0 mm", D: "6.9 mm"},
        Display: {Diagonal:"120 mm", Ratio:"1.7777777" /* 16/9 */},
        Points: { X:375 , Y:667},
        Scale: 2,
        ProductName: "iPhone 6"
    },
    iPhone6Plus : {
        Body : {H : "158.1 mm", W: "77.8 mm", D: "7.1 mm"},
        Display: {Diagonal:"140 mm", Ratio:"1.7777777" /* 16/9 */},
        Points: { X:414, Y:736},
        Scale: 3,
        ProductName: "iPhone 6+"
    },
    iPhoneX : {
        Body : {H : "143.6 mm", W: "70.9 mm", D: "7.7 mm"},
        Display: {Diagonal:"150 mm", Ratio:"2.1111111" /* 19/9 */},
        Points: { X:375, Y:812},
        Scale: 3,
        ProductName: "iPhone X"
    }
};

class ORGDeviceMetrics {

    /***
     * Finds the device in ORG.DeviceMetrics that matches the screen points passed in argument.
     * @param size in screen points
     * @returns {ProductName String}
     */
    static deviceWithScreenPoints(size) {
        for (let key in ORG.DeviceMetrics) {
            if (ORG.DeviceMetrics[key].Points.X == size.width && ORG.DeviceMetrics[key].Points.Y == size.height) {
                return ORG.DeviceMetrics[key].ProductName;
            }
        }
        return "unknown";
    }
}

/**
 * Created by jongabilondo on 09/02/2018.
 */


const ORGERR = {
    ERR_GENERAL: 100,
    ERR_CONNECTION_REFUSED: 1000,
    ERR_WS_CONNECTION_REFUSED: 1001
}

class ORGError extends Error {

    constructor(id, message) {
        super(message);
        this.name = "ORG Error";
        this.id = id;
    }

    static generalError(message) {
        return new ORGError(ORGERR.ERR_GENERAL, message);
    }

}
/**
 * Class wrapper for a JS WebSocket to communicate with a Device.
 * It implements the methods for creation, open, close, sending and receiving.
 * It accepts a Delegate class that will be called on the following events: onOpen, onCLose, onMessage, onError.
 * @constructor
 */
class ORGWebSocket {

	constructor() {
        this._ws = null;
        this._serverURL = null;
        this._delegate = null;
	}

	get ws() {
		return this._ws;
	}

    get serverURL() {
        return this._serverURL;
    }

    get isConnected() {
        return !!this._ws && (this._ws.readyState !== this._ws.CLOSED);
    }

	/**
	 * Opens a WebSocket to a server given the URL and accepts a Delegate.
	 * @param inServerURL
	 * @param inDelegate. An object that implements the callback methods: onOpen, onClose, onMessage, onError
	 */
	open(inServerURL, inDelegate) {
		return new Promise( (resolve, reject) => {
			const _this = this;
            this._serverURL = inServerURL;
            this._delegate = inDelegate;

            const url = inServerURL;
            this._ws = new WebSocket(url);
            this._ws.onopen = function(event) {
                resolve(event)
            }
            this._ws.onclose = function(event) {
				reject(event)
            }
            this._ws.onmessage = function(event) {
				resolve(event)
            }
            this._ws.onerror = function(event)  {
                _this._ws = null;
                reject(new ORGError(ORGERR.ERR_WS_CONNECTION_REFUSED, "Error opening session."));
            }
		})
	}

	/**
	 * Close the WebSocket.
	 */
	close() {
		if (this._ws) {
            this._ws.close();
		} else {
			console.debug('CLOSE requested but there is no ws.')
		}
	}

    /***
	 * Sets the delegate that processes the web sockets callbacks.
	 * Usually to se a non linear async messaging model, where a "send" is not made with "await".
     * @param delegate
     */
	processMessagesWithDelegate(delegate) {
        this._delegate = delegate;

        let _this = this;
        this._ws.onopen = function(event) {
            _this._onOpen(event)
        }
        this._ws.onclose = function(event) {
            _this._onClose(event)
        }
        this._ws.onmessage = function(event) {
            _this._onMessage(event)
        }
        this._ws.onerror = function(event)  {
            _this._onError(event)
        }
    }

	/**
	 * Sends data through the websocket.
	 * @param payload. A string with the data to transfer.
	 */
	send(payload) {
		if (this._ws) {
            this._ws.send(payload);
		}
	}

	sendAsync(payload) {
		return new Promise( (resolve, reject) => {
            this._ws.onclose = (event) => {
            	this.onClose(event)
                reject(event)
            }
            this._ws.onmessage = (event) => {
                let messageJSON = JSON.parse(event.data);
                if (messageJSON) {
            		resolve(messageJSON)
				} else {
                    reject(messageJSON)
				}
            }
            this._ws.onerror = (event) => {
                reject(event)
            }
            if (this._ws) {
                this._ws.send(payload);
            }
		})
	}

	// Callbacks

	/**
	 * JS WebSocket callback when the socket has opened.
	 * It will call the Delegate "onOpen".
	 */
    _onOpen() {
		console.debug('OPENED: ' + this._serverURL);
		if (this._delegate && !!this._delegate.onOpen) {
            this._delegate.onOpen(this);
		}
	}

	/**
	 * JS WebSocket callback when the socket has closed.
	 * It will call the Delegate "onClose".
	 */
	_onClose(event) {
		console.debug('CLOSED: ' + this._serverURL);
        this._ws = null;
		if (this._delegate && !!this._delegate.onClose) {
            this._delegate.onClose(event, this);
		}
	}

	/**
	 * JS WebSocket callback when the socket has received a message.
	 * It will call the Delegate "onMessage".
	 */
	_onMessage(event) {
		if (this._delegate && !!this._delegate.onMessage) {
            this._delegate.onMessage(event, this);
		}
	}

	/**
	 * JS WebSocket callback when the socket has detected an error.
	 * It will call the Delegate "onError".
	 */
	_onError(event) {
		console.debug('WS Error: ' + JSON.stringify(event));
		if (this._delegate && !!this._delegate.onError) {
            this._delegate.onError(event, this);
		}
	}
}

/**
 * Created by jongabilondo on 23/09/2017.
 */

/**
 * Class to hold all the information and elements that compose a scene, devices, beacons, geo information ..
 * Does not contain any 3D information, it's not connected to any THREE js.
 */
class ORGScenario {

    constructor() {
        this._beacons = [];
    }

    addBeacon(beacon) {
        this._beacons.push(beacon);
    }

    removeBeacon(beacon) {
        for (let i=0; i<this._beacons.length; i++) {
            if (this._beacons[i] == beacon) {
                this._beacons.splice( i, 1);
                break;
            }
        }
    }

    removeAllBeacons() {
        this._beacons = [];
    }

    beaconsAtPoint(point) {
        var beacons = [];
        for (let i=0; i<this._beacons.length; i++) {
            if (this._beacons[i].intersectsPoint(point)) {
                beacons.push(this._beacons[i]);
            }
        }
        return beacons;
    }

    devicePointUpdate(point) {
        const beacons = this.beaconsAtPoint(point);
        for (let i=0; i<beacons.length; i++) {
            // broadcast to Mobile Device that is inside a beacon range
            console.log("inside beacon");
        }
    }
}
/**
 * Created by jongabilondo on 02/07/2016.
 */


const ORGTreeVisualizationMask = {
    ShowNormalWindow : 0x1,
    ShowAlertWindow : 0x2,
    ShowKeyboardWindow : 0x4,
    ShowStatusWindow : 0x8,
    ShowScreenshots : 0x10,
    ShowPrivate : 0x20,
    ShowPublic : 0x40,
    ShowHiddenViews : 0x80,
    ShowHiddenViewsOnly : 0x100,
    ShowInteractiveViews : 0x0200,
    ShowNonInteractiveViews : 0x0400,
    ShowOutOfScreen : 0x0800
};

const kORGMinimalPlaneDistance = 0.001; // m
const kORGMaxPlaneDistance = 0.02; // m
const kORGExtrudeDuration = 500.0; // ms

/**
 * This class builds and manages the expanded 3D UI model. Given a JSON UI model it creates an expanded model of THREE objects.
 * @constructor
 */
class ORG3DUITreeModel {

    constructor(visualizationFlag) {
        this._treeData = null; // json of ui elements tree as arrived from device
        this._THREEElementTreeGroup = null; // threejs group with all the ui elements.
        this._THREEScene = null;
        this._collapseTweenCount = 0; // collapse animation counter
        this._visualizationFlags = visualizationFlag;
        this._planeDistance = kORGMinimalPlaneDistance;
        this._layerCount = 0;
        this._nodeHighlighter = new ORG3DUIElementHighlight();
    }

    get treeGroup() {
        return this._THREEElementTreeGroup;
    }

    get isExpanded() {
        return this.treeGroup !== null;
    }

    set visualizationFlags( flags ) {
        this._visualizationFlags = flags;
    }

    get layerCount() {
        return this._layerCount;
    }
    get _flagShowKeyboard() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowKeyboardWindow);
    }
    get _flagShowPrivate() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowPrivate);
    }
    get _flagShowHiddenViews() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowHiddenViews);
    }
    get _flagShowHiddenViewsOnly() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowHiddenViewsOnly);
    }
    get _flagShowOutOfScreen() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowOutOfScreen);
    }
    get _flagShowInteractiveViews() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowInteractiveViews);
    }
    get _flagShowNonInteractiveViews() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowNonInteractiveViews);
    }
    get _flagShowScreenshots() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowScreenshots);
    }

    createUITreeModel( treeTopLevelNodes, threeScene, screenSize, displaySize, displayScale, displayPosition ) {
        this._layerCount = 0;
        this._collapseTweenCount = 0;
        this._treeData = treeTopLevelNodes;
        this._THREEScene = threeScene;

        this._createUITreeModel( this._treeData, this._THREEScene, screenSize, displaySize, displayScale, displayPosition );
    }

    updateUITreeModel( treeTopLevelNodes, threeScene, screenSize, displaySize, displayScale, displayPosition ) {
        if ( this._treeData ) {
            this.removeUITreeModel( threeScene ); // remove existing first
        }
        this.createUITreeModel( treeTopLevelNodes, threeScene, screenSize, displaySize, displayScale, displayPosition );
    }

    collapseWithCompletion( completion ) {
        for (let i=0; i < this._treeData.length; i++) {
            const treeNode = this._treeData[i];
            this._collapseNodeAnimatedWithCompletion(treeNode, completion)
        }
    }

    removeUITreeModel( threeScene ) {
        if (this._THREEElementTreeGroup) {
            threeScene.remove(this._THREEElementTreeGroup);
            this._THREEElementTreeGroup = null;
        }
    }

    hideTextures( hide ) {
        if (this._THREEElementTreeGroup) {
            this._THREEElementTreeGroup.traverse(function (child) {
                if (child.type === "Mesh") {
                    if (hide) {
                        child.material.map = null;
                        child.material.color = new THREE.Color(0x000000);
                        //child.material.opacity = 1.0;
                        //child.material.transparent = false;
                    } else {
                        child.material.map = child.ORGData.threeScreenshotTexture;
                        child.material.color = new THREE.Color(0xffffff);
                        //child.material.opacity = 0;
                    }
                    child.material.needsUpdate = true;
                    //child.material.visible = !hide;
                }
            });
        }
    }

    hideNonInteractiveViews( hide ) {
        if (this._THREEElementTreeGroup) {
            this._THREEElementTreeGroup.traverse(function (child) {
                if (child.type === "Group") {
                    if (hide) {
                        const nodeData = child.userData;
                        if (nodeData) {
                            if (!_nodeIsInteractive(nodeData)) {
                                _hideNodeGroup(child, true);
                            }
                        }
                    } else {
                        _hideNodeGroup(child, false);
                    }
                }
            });
        }
    }

    showConnections( show , threeScene) {
        if ( this._THREEElementTreeGroup ) {
            this._THREEElementTreeGroup.traverse(function (child) {
                if ( child.type === "Group" ) {
                    const nodeData = child.userData;
                    if ( _nodeIsInteractive(nodeData) ) {
                        const mesh = child.children[0];
                        if (mesh) {
                            const arrowHelper = new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), mesh.position, 400, 0x0000ff, 50, 25 );
                            const cone = arrowHelper.cone;
                            threeScene.add( arrowHelper );
                        }
                    }
                }
            });
        }
    }

    setExpandedTreeLayersDistance( distanceUnits ) {
        this._planeDistance = kORGMinimalPlaneDistance + (distanceUnits/100.0 * kORGMaxPlaneDistance); // new plane distance

        if (this._THREEElementTreeGroup) {
            const allElements = this._THREEElementTreeGroup.children;
            let firstPosition = 0;
            for (let i in allElements) {
                let currentElementGroup = allElements[i];
                if (i === 0) {
                    firstPosition = currentElementGroup.position;
                    continue;
                }

                if ( currentElementGroup.type === "Group" ) {
                    const layerNum = (currentElementGroup.userData.originalWorldZPosition - firstPosition.z) / kORGMinimalPlaneDistance; // layer of the element
                    currentElementGroup.position.z = firstPosition.z + (layerNum * this._planeDistance);
                } else {
                    // all should be groups !
                }
            }
        }
    }

    setExpandedTreeLayersVisibleRange( maxVisibleLayer ) {
        // Traverse all Tree elements and set their visibility
        // Every element is a Group with 2 children, a Mesh and a BoxHelper.
        if (this._THREEElementTreeGroup) {
            const allElements = this._THREEElementTreeGroup.children;
            for ( let currentElementGroup of allElements ) {
                if (currentElementGroup.type === "Group") {
                    const nodeData = currentElementGroup.userData;
                    if (!!nodeData) {
                        currentElementGroup.visible = (nodeData.expandedTreeLayer < maxVisibleLayer);
                    }
                }
            }
        }
    }

    /***
     * Highlight the given node, unhighlight previous.
     * @param elementNode - A JSON description of the UI node. It is not a THREE object. The tree has some THREE node that represents the passed element node.
     */
    highlightUIElement(elementNode) {
        if (!this._THREEElementTreeGroup) {
            return;
        }
        if (elementNode) {
            const allElements = this._THREEElementTreeGroup.children;
            for ( let currentElementGroup of allElements ) {
                if ( currentElementGroup.type === "Group" ) {
                    const nodeData = currentElementGroup.userData;
                    if ( !!nodeData && !!nodeData.pointer && (nodeData.pointer === elementNode.pointer)) {
                        this._nodeHighlighter.mouseOverElement(currentElementGroup);
                        break;
                    }
                }
            }
        } else {
            this._nodeHighlighter.mouseOverElement(null);
        }
    }

    // PRIVATE

    /***
     * Creates a 3D representation of a UI tree.
     * @param treeRootNodes - The top level nodes. Usually the Windows.
     * @param threeScene - The THREE scene to add the tree to.
     * @param screenSize - Screen size in pixels.
     * @param displaySize - Display real world size (m)
     * @param displayScale -  Scale to convert screen pixels to world coordinates.
     * @param displayPosition - Position of the display in real world. (m)
     * @private
     */
    _createUITreeModel( treeRootNodes, threeScene, screenSize, displaySize, displayScale, displayPosition ) {
        this.removeUITreeModel( threeScene ); // remove existing first

        this._THREEElementTreeGroup = new THREE.Group();
        threeScene.add( this._THREEElementTreeGroup );

        let nextZPos = 0;
        if ( !!treeRootNodes ) {
            let treeNode;
            for ( let i = 0; i < treeRootNodes.length; i++ ) {
                treeNode = treeRootNodes[i];

                // Some full branches might be ignored
                if ( !this._mustCreateTreeBranch( treeNode ) ) {
                    console.log("ignoring tree branch.");
                    continue;
                }

                // create the element and its subelements (full branch)
                if ( this._mustCreateTreeObject( treeNode )) {
                    nextZPos = this._createTreeNode3DModel( treeNode, null, screenSize, displaySize, displayScale, displayPosition, nextZPos, nextZPos);
                }
            }
        }

        ORG.dispatcher.dispatch({
            actionType: 'uitree-expanded',
            ui_tree: this
        });
    }

    /***
     * Creates a 3D representation of a UI tree.
     * @param treeRootNodes - The top level nodes. Usually the Windows.
     * @param screenSize - Screen size in pixels.
     * @param displaySize - Display real world size (m)
     * @param displayScale -  Scale to convert screen pixels to world coordinates.
     * @param displayPosition - Position of the display in real world. (m)
     * @param startingZPos - The Z pos for the first node.
     * @private
     */
    //_createTree3DModel( treeRootNodes, screenSize, displaySize, displayScale, displayPosition, startingZPos ) {
    //    let nextZPos = startingZPos;
    //    if ( !!treeRootNodes ) {
    //        let treeNode;
    //        for ( let i = 0; i < treeRootNodes.length; i++ ) {
    //            treeNode = treeRootNodes[i];
    //
    //            // Some full branches might be ignored
    //            if ( !this._mustCreateTreeBranch( treeNode ) ) {
    //                console.log("ignoring tree branch.");
    //                continue;
    //            }
    //
    //            // create the element
    //            if ( this._mustCreateTreeObject( treeNode )) {
    //                nextZPos = this._createTreeNode3DModel( treeNode, null, screenSize, displaySize, displayScale, displayPosition, nextZPos, nextZPos);
    //            }
    //        }
    //    }
    //}

    /***
     * Create the 3D tree starting from a given tree node. Recursive.
     * @param treeNode -  The root node.
     * @param treeNodeParent - The last parent node taht was created in 3D. Not necessarily the parent in the UI tree, some nodes are not represented.
     * @param screenSize - Screen size in pixels.
     * @param displaySize - Display real world size (m)
     * @param displayScale -  Scale to convert screen pixels to world coordinates.
     * @param displayPosition - Position of the display in real world. (m)
     * @param zStartingPos - Z position of the node.
     * @param highestZPosition - THe highest Z so far.
     * @returns {highestZPosition}
     * @private
     */
    _createTreeNode3DModel( treeNode, treeNodeParent, screenSize, displaySize, displayScale, displayPosition, zStartingPos, highestZPosition ) {
        var lastCreatedParentNode = treeNodeParent;
        var newElemZPosition = zStartingPos;

        if ( typeof( treeNode ) !== "object" ) {
            console.log("what is this ? Tree node that is not an object ?");
            return highestZPosition;
        }

        if ( this._mustCreateTreeObject( treeNode )) {
            let screenshotTexture = null;
            let elementBase64Image = treeNode.screenshot;
            if ( elementBase64Image ) {
                let img = new Image();
                img.src = "data:image/png;base64," + elementBase64Image;
                screenshotTexture = new THREE.Texture(img);
                screenshotTexture.minFilter = THREE.NearestFilter;
                screenshotTexture.needsUpdate = true;
            }

            const elementWorldBounds = this._elementWorldBounds( treeNode, screenSize, displaySize, displayScale, displayPosition, true ); // calculate bounds of the ui element in real world (x,y), at 0,0.
            newElemZPosition = this._calculateElementZPosition( treeNode, treeNodeParent, elementWorldBounds, zStartingPos, displayPosition );

            let elementGroup = this._createUIElementObject( treeNode, elementWorldBounds, screenshotTexture, newElemZPosition);
            if ( elementGroup ) {
                this._THREEElementTreeGroup.add( elementGroup );
                treeNode.threeObj = elementGroup;
                elementGroup.userData = treeNode;

                if ( this._mustHideTreeObject( treeNode )) {
                    elementGroup.visible = false;
                } else {
                    // Now we will animate the element to its final position.
                    // The final zPosition is in treeNode, not in the mesh object which is at 0.
                    const finalMeshPosition = {x: elementGroup.position.x, y: elementGroup.position.y, z: newElemZPosition};
                    const tween = new TWEEN.Tween( elementGroup.position)
                        .to(finalMeshPosition, kORGExtrudeDuration)
                        .start();
                }
            }

            if ( newElemZPosition > highestZPosition ) {
                highestZPosition = newElemZPosition;
            }
            lastCreatedParentNode = treeNode; // this is the parent of the subviews to be created bellow
        }

        // create subelements
        if ( !!treeNode.subviews ) {
            for (let i = 0; i < treeNode.subviews.length; i++) {
                highestZPosition = this._createTreeNode3DModel( treeNode.subviews[i], lastCreatedParentNode, screenSize, displaySize, displayScale, displayPosition, newElemZPosition, highestZPosition);
            }
        }
        return highestZPosition;
    }

    /**
     * Convert the pixel 2D coordinates of an element to world coordinates.
     * @param uiElement
     * @param screenSize - in pixels
     * @param displaySize - real world
     * @param displayScale
     * @param displayPosition - real world
     * @returns {defs.THREE.Box2|*|Box2}
     * @private
     */
    _elementWorldBounds( uiElement, screenSize, displaySize, displayScale, displayPosition, translateToDevice ) {

        // device coordinates are 0,0 for top-left corner !

        var elementBox2 = new THREE.Box2(
            new THREE.Vector2( uiElement.bounds.left * displayScale.x, (screenSize.height - uiElement.bounds.bottom) * displayScale.y),
            new THREE.Vector2( uiElement.bounds.right * displayScale.x, (screenSize.height - uiElement.bounds.top) * displayScale.y));
        elementBox2.translate( new THREE.Vector2( - ( displaySize.width / 2.0 ), - ( displaySize.height / 2.0 )));

        if (translateToDevice) {
            elementBox2.translate( new THREE.Vector2( displayPosition.x , displayPosition.y ));
        }
        return elementBox2;
    }

    /**
     * Creates and returns THREE.Group for an UI element with a plane plus a box helper for highlight. It assigns a texture.
     * @param uiElementDescription
     * @param elementWorldBoundsBox2
     * @param THREEScreenshotTexture
     * @param zPosition - z axis position for the 3d object
     * @returns THREE.Group
     * @private
     */
    _createUIElementObject( uiElementDescription, elementWorldBoundsBox2, THREEScreenshotTexture, zPosition ) {
        var THREEMaterial, THREEMesh, THREEGeometry, THREEUIElementGroup;

        if ( !uiElementDescription.bounds ) {
            //console.log("Object has no boundsInScreen !", uiObjectDescription, JSON.stringify(uiObjectDescription));
            return null;
        }

        // create obj at Z = 0. We will animate it to its real position later.

        const center2D = elementWorldBoundsBox2.getCenter();
        const center3D = new THREE.Vector3( center2D.x, center2D.y, 0.0);

        THREEGeometry = new THREE.PlaneBufferGeometry( elementWorldBoundsBox2.getSize().x, elementWorldBoundsBox2.getSize().y, 1, 1 );
        uiElementDescription.originalWorldZPosition = zPosition; // keep it here for later use
        uiElementDescription.expandedTreeLayer = zPosition / this._planeDistance; // keep it here for later use
        if (uiElementDescription.expandedTreeLayer > this._layerCount) {
            this._layerCount = uiElementDescription.expandedTreeLayer;
        }

        if ( this._flagShowScreenshots && THREEScreenshotTexture ) {
            THREEMaterial = new THREE.MeshBasicMaterial( {map: THREEScreenshotTexture, transparent: false, side: THREE.DoubleSide});
        } else {
            THREEMaterial = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide, transparent:false });
        }
        THREEMesh = new THREE.Mesh( THREEGeometry, THREEMaterial );
        THREEMesh.position.copy( center3D );

        THREEMesh.ORGData = { threeScreenshotTexture : THREEScreenshotTexture }; // keep a reference to make the show/hide of textures

        // Create a group with the plane a boxhelper for highlights. First add the BoxHelper and then the plane, otherwise RayCaster will not give us proper collisions on the plane !!
        THREEUIElementGroup = new THREE.Group();
        THREEUIElementGroup.add( new THREE.BoxHelper( THREEMesh, 0xffffff) );
        THREEUIElementGroup.add( THREEMesh );

        return THREEUIElementGroup;
    }

    /**
     * Calculates the Z position for a given UI tree element. This element has nbot been created yet, does not have a THREE object yet.
     * @param uiTreeElement - The element to calculate the Z for.
     * @param uiTreeStartElement - The element from which to start to calculate the Z. In the first iteration would be the parent.
     * @param uiElementWorldBox2 - Box2 of the element in world coordinates (m).
     * @param currentZPosition - Current zPosition in the tree traversal.
     * @param displayPosition - The translation of the display in the 3D scene, usually it's above the floor.
     * @returns {zPosition}
     * @private
     */
    _calculateElementZPosition( uiTreeElement, uiTreeStartElement, uiElementWorldBox2, currentZPosition, displayPosition ) {
        if ( !uiTreeElement || !uiTreeStartElement ) {
            return currentZPosition;
        }

        if ( uiTreeElement === uiTreeStartElement ) {
            return currentZPosition; // we have arrived to the element itself, no more to search
        }

        let zPosition = currentZPosition;
        const threeObj = uiTreeStartElement.threeObj; // THREE obj of the ui element

        if ( threeObj ) {
            // This element has been visualized in 3D, because it has threeObj.
            // we have to check if the new element must be in front of this one.

            const objMesh = threeObj.children[0];
            objMesh.geometry.computeBoundingBox();
            var runningElementWorldBox3 = objMesh.geometry.boundingBox; // box at 0,0,0 !
            runningElementWorldBox3.translate( objMesh.position );
            var runningElementWorldBox2 = new THREE.Box2(
                new THREE.Vector2( runningElementWorldBox3.min.x, runningElementWorldBox3.min.y),
                new THREE.Vector2( runningElementWorldBox3.max.x, runningElementWorldBox3.max.y));

            //if ( uiElementWorldBox2.intersectsBox( runningElementWorldBox2 ) ) {
            if ( this._boxesIntersect( uiElementWorldBox2, runningElementWorldBox2 ) ) {
                const meshZPos = uiTreeStartElement.originalWorldZPosition; // The real position is in the treenode.originalWorldZPosition, not in the threejs mesh, there they are all at z=0 waiting to be animated.
                if ( meshZPos >= zPosition ) {
                    zPosition = meshZPos + this._planeDistance;
                }
            }
        }

        // Run subviews
        const subElements = uiTreeStartElement.subviews;
        if ( subElements ) {
            for ( let i = 0; i < subElements.length; i++ ) {
                if ( uiTreeElement === subElements[i] ) {
                    break; // we have arrived to the element itself, no more to search
                }
                zPosition = this._calculateElementZPosition( uiTreeElement, subElements[i], uiElementWorldBox2, zPosition, displayPosition); // calculate against next level in tree
            }
        }
        return zPosition;
    }

    _collapseNodeAnimatedWithCompletion( node, completionFunction ) {
        var threeObj = node.threeObj; // the obj is a THREE.Group
        if (threeObj) {
            const _this = this;
            const tween = new TWEEN.Tween(threeObj.position)
                .to({x: threeObj.position.x, y: threeObj.position.y, z: 0}, kORGExtrudeDuration)
                .onStart( function() {
                    _this._collapseTweenCount++;
                })
                .onComplete( function() {
                    _this._hideNodeGroup(threeObj, true);
                    node.zPosition = 0;

                    if (--_this._collapseTweenCount <= 0 ) {
                        _this._collapseTweenCount = 0;

                        if (_this._THREEElementTreeGroup) {
                            _this._THREEScene.remove(_this._THREEElementTreeGroup);
                            _this._THREEElementTreeGroup = null;
                        }

                        if (completionFunction) {
                            completionFunction();
                        }
                    }
                })
                .start();
        }

        if ( !!node.subviews) {
            const subNodes = node.subviews;
            for (let i = 0; i < subNodes.length; i++) {
                const treeNode = subNodes[i];
                this._collapseNodeAnimatedWithCompletion(treeNode, completionFunction);
            }
        }
    }

    _modelVisualizationChanged() {
        if (this._THREEElementTreeGroup) {
            const _this = this;
            this._THREEElementTreeGroup.traverse(function (child) {
                if (child.type === "Group") {
                    let nodeData = child.userData;
                    if (nodeData) {
                        this._hideNodeGroup(child, _this._mustHideTreeObject(nodeData));
                    }
                }
            });
        }
    }

    //function modelChangeShowHidden( treeJson, showHidden) {
    //
    //    // Show/Hide Hidden objects
    //    for (var i in treeJson) {
    //        if (typeof(treeJson[i])=="object") {
    //            if (treeJson[i].hidden) {
    //                console.log("UI Element hidden: ", treeJson[i]);
    //                var threeObj = treeJson[i].threeObj;
    //                if (threeObj) {
    //                    if (showHidden) {
    //                        threeObj.visible = true;
    //                    } else {
    //                        threeObj.visible = false;
    //                    }
    //                    threeObj.needsUpdate = true;
    //                } else {
    //                    console.log("UI Hidden Element has no THREE OBJ !!");
    //                }
    //            }
    //            modelChangeShowHidden(treeJson[i].subviews, showHidden);
    //        }
    //    }
    //}
    //
    //function modelChangeShowHiddenOnly( treeJson, showHidden, showHiddenOnly) {
    //
    //    // Show/Hide Hidden objects
    //    for (var i in treeJson) {
    //        if (!!treeJson[i]==true && typeof(treeJson[i])=="object") {
    //            var mesh = treeJson[i].threeObj;
    //            if (mesh) {
    //                if (treeJson[i].hidden) {
    //                    if (showHidden || showHiddenOnly) {
    //                        mesh.visible = true;
    //                    } else {
    //                        mesh.visible = false;
    //                    }
    //                    mesh.needsUpdate = true;
    //                } else {
    //                    // Not hidden ui obj
    //                    if (showHiddenOnly) {
    //                        mesh.visible = false;
    //                    } else {
    //                        mesh.visible = true;
    //                    }
    //                    mesh.needsUpdate = true;
    //                }
    //            }
    //            modelChangeShowHiddenOnly(treeJson[i].subviews, showHidden, showHidden);
    //        }
    //    }
    //}

    _changeOpacity( treeJson, opacity ) {
        if ( !!treeJson ) {
            for (let i = 0; i < treeJson.length; i++) {
                const treeNode = treeJson[i];
                if (!!treeNode && typeof(treeNode)==="object") {
                    var mesh = treeNode.threeObj;
                    if (mesh) {
                        //console.log("FOUND OBJECT:",mesh, i);

                        if (treeNode.class == "UITextEffectsWindow") {
                            continue;
                        } else if (treeNode.private === true) {
                            continue;
                        } else {
                            mesh.material.opacity = opacity;
                            mesh.needsUpdate = true;
                        }
                    } else {
                        //console.log("OBJECT nas no three obj !!!!!!!!", treeJson[i], JSON.stringify(treeJson[i]));
                    }
                    this._changeOpacity(treeJson[i].subviews, opacity);
                }
            }
        }
    }

    _mustDrawTreeObjectAsCube( treeJson, inParentTreeObj ) {
        // if parent has texture and the object is smaller than parent
        if (inParentTreeObj &&
            (treeJson.bounds.left > inParentTreeObj.bounds.left ||
            treeJson.bounds.top > inParentTreeObj.bounds.top ||
            treeJson.bounds.right < inParentTreeObj.bounds.right ||
            treeJson.bounds.bottom < inParentTreeObj.bounds.bottom )) {
            return true;
        }
        return false;
        //return (treeJson.nativeClass != "UIWindow" &&
        //treeJson.nativeClass != "UILayoutContainerView" &&
        //treeJson.nativeClass != "UITransitionView");
    }


    /**
     * Returns true if the given UI element must be hidden, not displayed in Expanded UI.
     * @param nodeData The UI element info as sent by the device.
     * @returns {boolean}
     */
    _mustHideTreeObject( nodeData ) {
        var mustBeHidden = false;
        if (nodeData.hidden && !this._flagShowHiddenViews) {
            mustBeHidden = true;
        } else if (nodeData.hidden===false && this.flagShowHiddenViewsOnly) {
            mustBeHidden = true;
        } else if (this._nodeIsInteractive(nodeData)) {
            mustBeHidden = !this._flagShowInteractiveViews;
        } else {
            mustBeHidden = !this._flagShowNonInteractiveViews;
        }
        return mustBeHidden;
    }

    _mustCreateTreeBranch( nodeData ) {
        return !(this._isKeyboardWindow(nodeData) && !this._flagShowKeyboard);
    }


    /**
     * Returns true if the ui element must be created as a 3D object.
     * This is different than '_mustHideTreeObject'. An object can be created but might be set hidden.
     * e.g the visualization flags may require not to visualize the non interactive views, but they still have to be created and shown ans invisible.
     * @param nodeData
     */
    _mustCreateTreeObject ( nodeData ) {
        if (!this._flagShowPrivate) {
            if (nodeData.private && nodeData.private === true) {
                return false;
            }
        }
        if (!this._flagShowOutOfScreen) {
            if (this._treeObjectIsOutOfScreen(nodeData, deviceScreenSize)) {
                return false;
            }
        }
        if (this._isStatusBarWindow(nodeData)) {
            return false;
        }
        if (this._isNoSizeElement(nodeData)) {
            return false;
        }
        return true;
    }

    _removeScreenshotFromScreen() {
        screenPlane.material.color = 0x000000;
        //screenPlane.material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
    }

    _rectsIntersect( a, b ) {
        return (a.left < b.right && b.left < a.right && a.top > b.bottom && b.top > a.bottom);
    }

    _boxesIntersect( a, b ) {
        const precision = 0.0001;
        //return (a.min.x < b.max.x && b.min.x < a.max.x && a.max.y > b.min.y && b.max.y > a.min.y);
        return ( ((b.max.x - a.min.x) > precision) &&  ((a.max.x - b.min.x) > precision) && ((a.max.y - b.min.y) > precision ) && ((b.max.y - a.min.y) > precision));
    }

    _treeObjectIsOutOfScreen( treeJson, deviceScreenSize ) {
        return ( treeJson.bounds.top > deviceScreenSize.height );
    }

    _nodeIsInteractive( treeNode ) {
        if (treeNode.gestures) {
            return true;
        }
        if (treeNode.controlEvents) {
            return true;
        }
        if (treeNode.class === "UITextField" && treeNode.userInteractionEnabled) {
            return true;
        }
        if (treeNode.class === "MKMapView" && treeNode.userInteractionEnabled) {
            return true;
        }
        if (treeNode.class === "_MKUserTrackingButton" && treeNode.userInteractionEnabled) {
            return true;
        }
    }

    _hideNodeGroup( threeNodeGroup, hide ) {
        let mesh = threeNodeGroup.children[0]; // the first is the mesh, second is the BoxHelper
        if (mesh) {
            mesh.visible = !hide;
        }
        let boxHelper = threeNodeGroup.children[1];
        if (boxHelper) {
            boxHelper.visible = !hide;
        }
    }

    _isStatusBarWindow( inUIElement ) {
        if (inUIElement.nativeClass === "UIAWindow") {
            const child = inUIElement.subviews[0];
            if (child.nativeClass === "UIAStatusBar") {
                return true;
            }
        }
        return false;
    }

    _isKeyboardWindow( nodeData ) {
        return (nodeData.class === "UITextEffectsWindow");
    }

    _isNoSizeElement(element) {
        return (element.bounds.right - element.bounds.left === 0) || (element.bounds.bottom - element.bounds.top === 0);
    }

}
/**
 * Created by jongabilondo on 01/08/2016.
 */


/**
 * Creates a mouse listener on a dom element.
 * Any object that wants to receive mouse events can add itself to this object as a delegate.
 * @param domElement where the mouse will be tracked
 * @constructor
 */
class ORGMouseListener {

    constructor( domElement ) {
        this._domElement = domElement;
        this._listeners = [];
        this._enabled = false;
    }

    /**
     * Activates the mouse events listening and informs the delegates.
     */
    enable(  ) {

        var _this = this;

        if (this._enabled) {
            return; // make sure we do binds only once
        }

        $(this._domElement).bind("mousedown", function (event) {
            for (let i=0; i<_this._listeners.length; i++) {
                if (_this._listeners[i].onMouseDown) {
                    _this._listeners[i].onMouseDown( event );
                }
            }
        });

        $(this._domElement).bind("mouseup", function (event) {
            for (let i=0; i<_this._listeners.length; i++) {
                if (_this._listeners[i].onMouseUp) {
                    _this._listeners[i].onMouseUp( event );
                }
            }
        });

        $(this._domElement).bind("mousemove", function (event) {
            for (let i=0; i<_this._listeners.length; i++) {
                if (_this._listeners[i].onMouseMove) {
                    _this._listeners[i].onMouseMove( event );
                }
            }
        });

        $(this._domElement).bind("contextmenu",function(event){
            event.preventDefault();
            for (let i=0; i<_this._listeners.length; i++) {
                if (_this._listeners[i].onContextMenu) {
                    _this._listeners[i].onContextMenu( event );
                }
            }
        });

        this._enabled = true;
    }

    /**
     * Stops listening to mouse events.
     */
    disable() {
        $(this._domElement).unbind();
    }

    /**
     * Add a delegate to the list of objects to be notified of mouse events.
     * The delegate must implement onMouseDown, onMouseUp, onMouseMove
     * @param delegate
     */
    addDelegate( delegate ) {
        this._listeners.push( delegate );
    }

    /**
     * Remove the delegate from the list.
     * @param delegate
     */
    removeDelegate( delegate ) {
        for (let i=0; i<this._listeners.length; i++) {
            if ( this._listeners[i] == delegate) {
                this._listeners.splice( i, 0);
            }
        }
    }

}
/**
 * Created by jongabilondo on 01/08/2016.
 */

/**
 * A helper class to highlight the edges of the 3d UI elements when the UI is expanded.
 * When attached to a Raycaster as a delegate it will start to receive the "mouseOverElement" call and it will produce the highlight visual effect.
 * It implements the ORGRayscaster delegate method "mouseOverElement".
 * It is based in the usage of the THREE.BoxHelper object that is grouped with the 3D UI object.
 */
class ORG3DUIElementHighlight {

    constructor() {
        this._hilitedObj = null;
    }

    /**
     * Implementation of the Raycaster method to receive the UI element the mouse in on.
     * This method will manage the show and hide the highlights of the 3d objects.
     * @param THREEElement
     */
    mouseOverElement( THREEElement ) {
        if ( !!THREEElement ) {
            // Mouse is over some UI element

            let mustHilite = false;
            if ( !this._hilitedObj) {
                mustHilite = true;
            } else if ( this._hilitedObj.id !== THREEElement.id ) {
                this._highlightUIElement( this._hilitedObj, false);
                mustHilite = true;
            }

            if ( mustHilite ) {
                this._highlightUIElement( THREEElement, true);
            }

        } else  {
            // Mouse is NOT over any UI element
            if (this._hilitedObj) {
                this._highlightUIElement( this._hilitedObj, false);
            }
        }
    }


    /**
     * Private function to highlight a 3D object.
     * The highlight is performed using the THREE.BoxHelper which is the sibling of the 3D UI object. To access the BoxHelper we need to go the parent (which is a Group) and descend.
     * @param THREEElement
     * @param hilite
     */
    _highlightUIElement( THREEElement, hilite) {
        if ( !!THREEElement ) {
            let boxHelper = null;
            if (THREEElement.type === "Group") {
                boxHelper = THREEElement.children[0];
            } else if ( THREEElement.geometry.type === "PlaneBufferGeometry" || THREEElement.geometry.type === "BoxGeometry" ) {
                const parent = THREEElement.parent; // parent must be a group, holds edgesHelper and the uiobject plane
                if ( parent ) {
                    boxHelper = parent.children[0];
                }
            }
            if ( boxHelper instanceof THREE.BoxHelper ) {
                boxHelper.material.color.set( (hilite ?0xff0000 :0xffffff) );
                boxHelper.material.linewidth = (hilite ?10 :1);
                boxHelper.material.needsUpdate = true;
                this._hilitedObj = (hilite ?THREEElement :null); // keep the hilited obj
            }
        }
    }
}
/**
 * Created by jongabilondo on 27/07/2016.
 */

class ORGTooltip {

    constructor( canvasDomElement ) {
        this._threeCanvasDomElement = canvasDomElement;
        this._hilitedObj = null;
        this._tooltipOpen = false;

        $(this._threeCanvasDomElement).uitooltip({
            items: $(this._threeCanvasDomElement),
            content: "Roll over element",
            track: true,
            open: function( event, ui ) {
                console.log( ui );
            },
            create: function( event, ui ) {
                console.log( ui );
            }
        });
        //$( this._threeCanvasDomElement ).uitooltip( "open" );
        //$( this._threeCanvasDomElement ).uitooltip( "disable" );
        this._tooltipOpen = true;
    }

    destroy() {
        if (this._threeCanvasDomElement) {
            $( this._threeCanvasDomElement ).uitooltip( "destroy" );
        }
    }

    // DELEGATE METHOD Gets called when hilite must change
    mouseOverElement( threeElement ) {
        if ( !!threeElement ) {
            // Mouse is over some UI element

            // if (this._tooltipOpen) {
            //     $( this._threeCanvasDomElement ).uitooltip( "enable" );
            // }

            var mustShowTip = false;
            if ( !this._hilitedObj) {
                mustShowTip = true;
            } else if ( this._hilitedObj.id != threeElement.id ) {
                mustShowTip = true;
            }

            if ( mustShowTip ) {
                console.log(threeElement.parent.userData.class);
                this._show( threeElement.parent.userData );
            }

            //updatePosition();
        } else  {
            //this._hide(); // Mouse is NOT over any UI element
            if (this._tooltipOpen) {
               //$( this._threeCanvasDomElement ).uitooltip( "disable" );
               $( this._threeCanvasDomElement ).uitooltip( "option", "content", "<span class='ui-tooltip-value'>Roll over element</span>" );
            }
        }
    }

    // PRIVATE

    _show( elementInfo ) {
        if (this._tooltipOpen) {
            $( this._threeCanvasDomElement ).uitooltip( "option", "content", this._createTooltipContent(elementInfo) );
            $( this._threeCanvasDomElement ).uitooltip( "enable" );
            //$( this._threeCanvasDomElement ).uitooltip( "option", "track", true );
            // $( this._threeCanvasDomElement ).uitooltip( "option", "position", { using: function(pos,b) {
            //     console.log(pos);
            //     console.log(b);
            //     pos.left = 300;
            //     pos.top = 300;
            //     $(this).css(pos);
            // } } );
        } else {
            // $(this._threeCanvasDomElement).uitooltip({
            //     items: $(this._threeCanvasDomElement),
            //     content: this._createTooltipContent(elementInfo),
            //     track: true,
            //     open: function( event, ui ) {
            //         console.log( ui );
            //     },
            //     create: function( event, ui ) {
            //         console.log( ui );
            //     }
            // });
            //$( _threeCanvasDomElement ).uitooltip( "option", "content", createTooltipContent(elementInfo) );
            //$( this._threeCanvasDomElement ).uitooltip( "open" );
            //this._tooltipOpen = true;
        }
    }

    _hide() {
        if ( this._tooltipOpen) {
            //$( _threeCanvasDomElement ).uitooltip( "close" );
            //$( _threeCanvasDomElement ).uitooltip( "option", "content", null );
            $( this._threeCanvasDomElement ).uitooltip( "destroy" );
            this._tooltipOpen = false;
        }
    }

    _createTooltipContent( elementInfo) {

        if (!elementInfo) {
            return "";
        }

        var content = "<div>" + elementInfo.class;
        for (let key in elementInfo){
            if ( key == "screenshot" || key == "class" || key == "subviews" || key == "threeObj" || key == "originalWorldZPosition" || key == "zPosition") {
                continue;
            }

            if ( key == "accessibility") {
                content += this._serializeDictionary( elementInfo[key] );
                continue;
            }

            if ( key == "bounds" ) {
                content += "<br><span class='ui-tooltip-key'>bounds: </span>" + "<span class='ui-tooltip-value'>" + this._serializeBounds( elementInfo[key] ) + "</span>";
                continue;
            }

            if ( key == "gestures") {
                content += "<br><span class='ui-tooltip-key'>gestures: </span>" + "<span class='ui-tooltip-value'>" + this._serializeGestures( elementInfo[key] ) + "</span>";
                continue;
            }

            if ( key == "segues") {
                content += "<br><span class='ui-tooltip-key'>segues: </span>" + "<span class='ui-tooltip-value'>" + this._serializeSegues( elementInfo[key] ) + "</span>";
                continue;
            }

            if ( key == "controlEvents") {
                content += "<br><span class='ui-tooltip-key'>controlEvents: </span>" + "<span class='ui-tooltip-value'>" + this._serializeStrings( elementInfo[key] ) + "</span>";
                continue;
            }

            if ( key == "targets") {
                content += "<br><span class='ui-tooltip-key'>targets: </span>" + "<span class='ui-tooltip-value'>" + this._serializeStrings( elementInfo[key] ) + "</span>";
                continue;
            }


            content += "<br><span class='ui-tooltip-key'>" + key + ": </span>" + "<span class='ui-tooltip-value'>" + elementInfo[key] + "</span>";
        }
        return content += "</div>";
    }

    _serializeDictionary( dictionary ) {
        var content = "";
        for (let key in dictionary){
            content += "<br><span class='ui-tooltip-key'>" + key + ": </span>" + "<span class='ui-tooltip-value'>" + dictionary[key] + "</span>";
        }
        return content;
    }

    _serializeBounds( dictionary ) {
        var content = "x:" + dictionary.left + " y:" + dictionary.top.toString() + " w:" + (dictionary.right-dictionary.left).toString() + " h:" + (dictionary.bottom-dictionary.top).toString();
        return content;
    }

    _serializeGestures( gestures ) {
        var content = "";
        for ( var i=0; i<gestures.length; i++ ) {
            content += this._serializeGesture( gestures[i] );
        }
        return content;
    }

    _serializeGesture( gesture ) {
        var content = "";
        for (var key in gesture) {
            if ( content.length) {
                content += ", ";
            }
            content += key + ":" + gesture[key];
        }
        return "[" + content + "]";
    }

    _serializeSegues( segues ) {
        var content = "";
        for ( let i=0; i<segues.length; i++ ) {
            content += this._serializeSegue( segues[i] );
        }
        return content;
    }

    _serializeSegue( segue ) {
        var content = "";
        for (let key in segue) {
            if ( content.length) {
                content += ", ";
            }
            content += key + ":" + segue[key];
        }
        return "[" + content + "]";
    }

    _serializeStrings( strings ) {
        var content = "";
        for ( var i=0; i<strings.length; i++ ) {
            content += (content.length ?", " :"") + strings[i];
        }
        return content;
    }

}
/**
 * Created by jongabilondo on 02/07/2016.
 */

const ORGSceneVisualizationMask = {
    ShowFloor : 0x1,
    ShowDevice : 0x2,
    ShowTooltips : 0x4,
    ShowLocation : 0x8,
    ContinuousUpdate : 0x10
}
const kORGCameraTWEENDuration = 2000.0; // ms
const kORGFloorPositionY = 0.0; // m
const kORGDevicePositionY = 1.5; // m
const kORGCameraPositionZ = 0.2; // m

/**
 * The class that holds the THREE.Scene with the GLRenderer.
 * It provides all the methods to handle the operations on the Scene.
 *
 * @param domContainer The dom element where to create the 3D scene.
 * @param screenSize An initial size for the 3D scene. It will be updated to the real size of the container once the scene has been created.
 * @constructor
 */
class ORG3DScene {

    constructor( domContainer, screenSize) {

        this._sceneFloor = null; // a ORG3DSceneFloor
        this._deviceScreen = null; // a ORG3DDeviceScreen
        this._uiTreeModelRaycaster = null; // a ORG3DUITreeRaycaster
        this._sceneRaycaster = null; // a ORG3DSceneRaycaster
        this._screenRaycaster = null; // a ORG3DUITreeRaycaster
        this._mouseListener = null; // a ORGMouseListener
        this._device3DModel = null; // a ORG3DDeviceModel
        this._tooltiper = null; // a ORGTooltip
        this._transformControl = null; // ORG3DDeviceTransformControl
        this._beaconTransformControl = null; // ORG3DBeaconTransformControl
        this._THREEScene = null;
        this._THREECamera = null;
        this._THREERenderer = null;
        this._THREEOrbitControls = null;
        this._THREEDeviceAndScreenGroup = null; // Holds the screen and the device model
        this._keyboardState = null;
        this._threeClock = null;
        //this._deviceScreenSize = null;
        this._uiExpanded = false;
        this._canvasDomElement = null; // the table cell where the renderer will be created, it contains _rendererDOMElement
        this._rendererDOMElement = null; // threejs scene is displayed in this DOM element
        this._contextMenuManager = null;
        this._locationMarker = null;
        this._lastLocationName = "?";
        this._sceneVisualFlags = ORGSceneVisualizationMask.ShowFloor |
            ORGSceneVisualizationMask.ShowDevice |
            ORGSceneVisualizationMask.ShowLocation |
            ORGSceneVisualizationMask.ContinuousUpdate;
        this._treeVisualizationFlags = ORGTreeVisualizationMask.ShowNormalWindow |
            ORGTreeVisualizationMask.ShowAlertWindow |
            ORGTreeVisualizationMask.ShowKeyboardWindow |
            ORGTreeVisualizationMask.ShowOutOfScreen |
            ORGTreeVisualizationMask.ShowInteractiveViews |
            ORGTreeVisualizationMask.ShowNonInteractiveViews |
            ORGTreeVisualizationMask.ShowPrivate |
            ORGTreeVisualizationMask.ShowScreenshots;

        this._uiTreeModel = new ORG3DUITreeModel( this._treeVisualizationFlags);
        this.expanding = false;
        this._initialize(domContainer, this.flagShowFloor);
    }

    //------------------------------------------------------------------------------------------------------------------
    // GET/SET
    //------------------------------------------------------------------------------------------------------------------
    get sceneSize() {
        return this._THREERenderer.getSize();
    }

    get THREEScene() {
        return this._THREEScene;
    }

    get THREERenderer() {
        return this._THREERenderer;
    }

    get deviceScreen() {
        return this._deviceScreen;
    }

    get device3DModel() {
        return this._device3DModel;
    }

    get deviceScreenBoundingBox() {
        return this._deviceScreen.boundingBox;
    }

    get THREECamera() {
        return this._THREECamera;
    }

    get THREEDeviceAndScreenGroup() {
        return this._THREEDeviceAndScreenGroup;
    }

    get rendererDOMElement() {
        return this._rendererDOMElement;
    }

    get isExpanded() {
        return this._uiExpanded;
    }

    set isExpanded(expanded) {
        this._uiExpanded = expanded;
    }

    get expanding() {
        return this._expanding;
    }

    set expanding(expanding) {
        this._expanding = expanding;
    }

    get contextMenuManager() {
        return this._contextMenuManager;
    }
    /**
     * Scene flags
     */
    get flagContinuousScreenshot() {
        return this._sceneVisualFlags & ORGSceneVisualizationMask.ContinuousUpdate;
    }

    set flagContinuousScreenshot(flag) {
        if (flag) {
            this._sceneVisualFlags |= ORGSceneVisualizationMask.ContinuousUpdate;
        } else {
            this._sceneVisualFlags &= ~ORGSceneVisualizationMask.ContinuousUpdate;
        }
    }

    get flagShowTooltips() {
        return this._sceneVisualFlags & ORGSceneVisualizationMask.ShowTooltips;
    }

    set flagShowTooltips( show) {
        if (show) {
            this._sceneVisualFlags |= ORGSceneVisualizationMask.ShowTooltips;
        } else {
            this._sceneVisualFlags &= ~ORGSceneVisualizationMask.ShowTooltips;
        }
    }

    get flagShowDevice3DModel() {
        return this._sceneVisualFlags & ORGSceneVisualizationMask.ShowDevice;
    }

    set flagShowDevice3DModel(show) {
        if (show) {
            this._sceneVisualFlags |= ORGSceneVisualizationMask.ShowDevice;
        } else {
            this._sceneVisualFlags &= ~ORGSceneVisualizationMask.ShowDevice;
        }    }

    get flagShowFloor() {
        return this._sceneVisualFlags & ORGSceneVisualizationMask.ShowFloor;
    }

    set flagShowFloor(show ) {
        if (show) {
            this._sceneVisualFlags |= ORGSceneVisualizationMask.ShowFloor;
        } else {
            this._sceneVisualFlags &= ~ORGSceneVisualizationMask.ShowFloor;
        }
    }

    get flagShowLocation() {
        return this._sceneVisualFlags & ORGSceneVisualizationMask.ShowLocation;
    }

    set flagShowLocation(show ) {
        if (show) {
            this._sceneVisualFlags |= ORGSceneVisualizationMask.ShowLocation;
        } else {
            this._sceneVisualFlags &= ~ORGSceneVisualizationMask.ShowLocation;
        }
    }

    /**
     * Tree flags
     */
    get flagShowPrivateClasses() {
        return ( this._treeVisualizationFlags & ORGTreeVisualizationMask.ShowPrivate);
    }

    set flagShowPrivateClasses( flag ) {
        if (flag) {
            this._treeVisualizationFlags |= ORGTreeVisualizationMask.ShowPrivate;
        } else {
            this._treeVisualizationFlags &= ~ORGTreeVisualizationMask.ShowPrivate;
        }
    }

    set flagShowKeyboardWindow( flag ) {
        if (flag) {
            this._treeVisualizationFlags |= ORGTreeVisualizationMask.ShowKeyboardWindow;
        } else {
            this._treeVisualizationFlags &= ~ORGTreeVisualizationMask.ShowKeyboardWindow;
        }
    }

    set flagShowHiddenViews( flag) {
        if (flag) {
            this._treeVisualizationFlags |= ORGTreeVisualizationMask.ShowHiddenViews;
        } else {
            this._treeVisualizationFlags &= ~ORGTreeVisualizationMask.ShowHiddenViews;
        }
    }

    set flagShowNonInteractiveViews( flag) {
        if (flag) {
            this._treeVisualizationFlags |= ORGTreeVisualizationMask.ShowNonInteractiveViews;
        } else {
            this._treeVisualizationFlags &= ~ORGTreeVisualizationMask.ShowNonInteractiveViews;
        }
    }

    set flagShowInteractiveViews( flag) {
        if (flag) {
            this._treeVisualizationFlags |= ORGTreeVisualizationMask.ShowInteractiveViews;
        } else {
            this._treeVisualizationFlags &= ~ORGTreeVisualizationMask.ShowInteractiveViews;
        }
    }

    set flagShowScreenshots( flag) {
        if (flag) {
            this._treeVisualizationFlags |= ORGTreeVisualizationMask.ShowScreenshots;
        } else {
            this._treeVisualizationFlags &= ~ORGTreeVisualizationMask.ShowScreenshots;
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // PUBLIC
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Remove the Device from the scene. After device disconnection all models and data of device must be removed.
     */
    handleDeviceDisconnection() {
        this.removeDeviceScreen();
        this.removeUITreeModel();
        this.hideDevice3DModel();
        this._removeDeviceAndScreenGroup();
    }

    /**
     * Sets the Image that will be used to create the texture to set it to the device screen.
     * It sets the image in a variable to be used in the next render cycle.
     * @param image.
     */
    setScreenshotImage(image) {
        if (this._deviceScreen) {
            this._deviceScreen.nextScreenshotImage = image;
        }
    };

    updateUITreeModel( treeJson ) {

        // First destroy the raycaster for the screen
        this.removeRaycasterForDeviceScreen();
        this.hideDeviceScreen( );

        if ( this.flagShowTooltips) {
            this.disableTooltips();
        }

        this.destroyRaycasterFor3DTreeModel(); // Destroy Raycaster for the 3D UI Model object

        // Create the 3D UI model
        this.isExpanded = true;
        this.expanding = false;
        this._uiTreeModel.visualizationFlags = this._treeVisualizationFlags; // update the flags
        this._uiTreeModel.updateUITreeModel( treeJson, this._THREEScene, ORG.device.screenSize, ORG.device.displaySize, ORG.device.displayScale, this._THREEDeviceAndScreenGroup.position);

        this.createRaycasterFor3DTreeModel(); // Create Raycaster for the 3D UI Model object

        if ( this.flagShowTooltips) {
            this.enableTooltips();
        }
    };

    removeUITreeModel( ) {
        this._uiTreeModel.removeUITreeModel( this._THREEScene);
    }

    //--
    //  DEVICE SCREEN METHODS
    //--
    createDeviceScreen(width, height, zPosition) {
        this._addDeviceAndScreenGroup();
        this._deviceScreen = new ORG3DDeviceScreen(width, height, 0/*kORGDevicePositionY*/, zPosition, this._THREEScene);
        this._THREEDeviceAndScreenGroup.add( this._deviceScreen.screenPlane );
    }

    removeDeviceScreen() {
        if ( this._deviceScreen) {
            this.removeRaycasterForDeviceScreen();
            this._THREEDeviceAndScreenGroup.remove(this._deviceScreen.screenPlane);
            this._deviceScreen.destroy();
            this._deviceScreen = null;
        }
    }

    setDeviceScreenSize(width, height) {
        if ( this._deviceScreen) {
            this.removeDeviceScreen();
            this.createDeviceScreen(width, height, 0);
            this.devicePositionHasChanged();
            this.createRaycasterForDeviceScreen();
        }
    }

    hideDeviceScreen() {
        if ( this._deviceScreen) {
            this._deviceScreen.hide();
        }
    }

    showDeviceScreen() {
        if ( this._deviceScreen) {
            this._deviceScreen.show();
        }
    }

    positionDeviceAndScreenInRealWorld() {
        this._THREEDeviceAndScreenGroup.translateY(kORGDevicePositionY); // translate to default Y
    }

    //--
    //  DEVICE 3D MODEL METHODS
    //--

    addDevice3DModel(device3DModel) {
        this._addDeviceAndScreenGroup();
        this._device3DModel = device3DModel;
        this._THREEDeviceAndScreenGroup.add(this._device3DModel.THREEObject);
        this.devicePositionHasChanged();
    }

/*    showDevice3DModel() {
        return new Promise((resolve, reject) => {
            this.hideDevice3DModel();

            if (!this.flagShowDevice3DModel) {
                reject();
            }

            ORG3DDeviceModelLoader.loadDevice3DModel(ORG.device, this, kORGDevicePositionY).then(
                (result) => {
                    resolve(result);
                },
                (error) => {
                    reject(error);
                })
        })
    }*/

    hideDevice3DModel() {
        if ( !!this._device3DModel ) {
            this._THREEDeviceAndScreenGroup.remove(this._device3DModel.THREEObject);
            this._device3DModel.destroy();
            this._device3DModel = null;
        }
        this.devicePositionHasChanged();
    }

    setDeviceOrientation(orientation, width, height) {
        if ( this._uiExpanded && this._uiTreeModel) {
            this._uiTreeModel.removeUITreeModel( this._THREEScene);
            this._uiExpanded = false;
            ORG.UI.buttonExpand.text("Expand");
        }

        if ( this._deviceScreen) {
            this.removeDeviceScreen();
            this.createDeviceScreen(width, height, 0);
            this.createRaycasterForDeviceScreen();
        }
        if ( this._device3DModel) {
            this._device3DModel.setOrientation(orientation);
        }
        this.devicePositionHasChanged();
    }

    setDeviceOrientation2(orientation) {
        if (!this._THREEDeviceAndScreenGroup) {
            return;
        }

        // Recreate the screen with new size
        if (this._deviceScreen) {
            const newScreenSize = ORG.device.displaySizeWithOrientation;
            if (this._deviceScreen.screenSize.width != newScreenSize.width) {
                this.removeDeviceScreen();
                this.createDeviceScreen(newScreenSize.width, newScreenSize.height, 0);
                this.createRaycasterForDeviceScreen();
            }
        }

        // Rotate the device
        this._device3DModel.setOrientation2(orientation);
    }


    createRaycasterFor3DTreeModel() {
        this._uiTreeModelRaycaster = new ORG3DUITreeRaycaster( this._rendererDOMElement, this._THREECamera, this._uiTreeModel.treeGroup);
        this._uiTreeModelRaycaster.addDelegate( new ORG3DUIElementHighlight()); // attach a hiliter
        this._uiTreeModelRaycaster.addDelegate( this._contextMenuManager); // attach a context menu manager, needs to know what three obj is the mouse on

        // Activate mouse listener to feed the raycaster
        if (this._mouseListener) {
            this._mouseListener.addDelegate( this._uiTreeModelRaycaster); // send the mouse events to the Raycaster
            this._mouseListener.enable();
        }
    }

    destroyRaycasterFor3DTreeModel() {
        if ( this._uiTreeModelRaycaster ) {
            if (this._tooltiper) {
                this._uiTreeModelRaycaster.removeDelegate( this._tooltiper); // Detach tooltiper from the raycaster
            }
            if (this._mouseListener) {
                this._mouseListener.removeDelegate( this._uiTreeModelRaycaster); // send the mouse events to the Raycaster
            }
            this._uiTreeModelRaycaster = null;
        }
    }

    createRaycasterForScene() {
        this._sceneRaycaster = new ORG3DSceneRaycaster( this._rendererDOMElement, this._THREECamera, this._THREEScene);

        // Activate mouse listener
        this._mouseListener.addDelegate( this._sceneRaycaster); // send the mouse events to the Raycaster
        this._mouseListener.enable();
    }

    createRaycasterForDeviceScreen() {
        this._screenRaycaster = new ORG3DUITreeRaycaster( this._rendererDOMElement, this._THREECamera, this._deviceScreen.screenPlane);
        this._screenRaycaster.addDelegate( this._contextMenuManager); // attach a context menu manager

        // Activate mouse listener
        this._mouseListener.addDelegate( this._screenRaycaster); // send the mouse events to the Raycaster
        this._mouseListener.enable();
    }

    removeRaycasterForDeviceScreen() {
        if ( this._screenRaycaster ) {
            this._mouseListener.removeDelegate( this._screenRaycaster);
            this._screenRaycaster = null;
        }
    }

    setLiveScreen(live) {
        this.flagContinuousScreenshot = live;
        if (this._deviceScreen && ORG.deviceController.hasContinuousUpdate) {
            if ((this._sceneVisualFlags & ORGSceneVisualizationMask.ContinuousUpdate) && !this._uiExpanded) {
                ORG.deviceController.requestScreenshot();
                //ORGConnectionActions.refreshScreen();
            }
        }
    }

    showTooltips(show) {
        this.flagShowTooltips = show;
        if (show) {
            this.enableTooltips();
        } else {
            this.disableTooltips();
        }
    }

    enableTooltips() {
        if ( !this._tooltiper) {
            this._tooltiper = new ORGTooltip( this._rendererDOMElement);
            if (this._uiTreeModelRaycaster) {
                this._uiTreeModelRaycaster.addDelegate( this._tooltiper); // Attach it to the raycaster
            }
        }
    }

    disableTooltips() {
        if ( this._tooltiper) {
            if ( this._uiTreeModelRaycaster) {
                this._uiTreeModelRaycaster.removeDelegate( this._tooltiper); // Detach it from the raycaster
            }
            this._tooltiper.destroy( );
            this._tooltiper = null;
        }
    }

    createFloor() {
        if (!this._sceneFloor) {
            this._sceneFloor = this._createFloor( this._THREEScene);
            this.devicePositionHasChanged();
        }
    };

    removeFloor() {
        if (this._sceneFloor) {
            this._removeFloor();
        }
    };

    expand() {
        if (!this._uiExpanded) {
            bootbox.dialog({ message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i>Expanding UI elements...</div>' }); // Progress alert

            ORG.deviceController.requestElementTree({
                "status-bar": true,
                "keyboard": true,
                "alert": true,
                "normal": true
            });
            this.expanding = true;
        }
    }

    collapseAndExpandAnimated() {
        const _this = this;
        this.collapse( () => {
            _this.expand();
        } )
    }

    collapse(completionCallback ) {
        if (this.isExpanded) {
            // we dont need the mouse listener and the raycaster anymore
            //this._mouseListener.disable();

            this.disableTooltips();

            const _this = this;
            const requestScreenshot = this.flagContinuousScreenshot;

            this._uiTreeModel.collapseWithCompletion( () => {
                if (_this._deviceScreen) {
                    _this._deviceScreen.show();
                }
                if (requestScreenshot) {
                    ORG.deviceController.requestScreenshot(); // keep updating screenshot
                    //ORGConnectionActions.refreshScreen();
                }
                _this.createRaycasterForDeviceScreen();
                _this._uiExpanded = false;

                if (completionCallback) {
                    completionCallback();
                }
            });
        }
    }

    showHideDeviceTransformControls(mode) {
        if (this._transformControl) {
            this._transformControl.destroy();
            this._transformControl = null;
        } else {
            this._transformControl = new ORG3DDeviceTransformControl(this, mode);
        }
    }

    showHideBeaconTransformControls( THREEBeacon) {
        if (this._beaconTransformControl) {
            this._beaconTransformControl.destroy();
            this._beaconTransformControl = null;
        } else {
            this._beaconTransformControl = new ORG3DBeaconTransformControl(this, "translate", THREEBeacon);
        }
    }

    addBeacon() {
        const range = 50;
        var newBeacon = new ORGBeacon("name", range, {x:0,y:0,z:0});
        var new3DBeacon = new ORG3DBeacon(newBeacon);
        ORG.scenario.addBeacon(newBeacon);

        this._THREEScene.add( new3DBeacon.model );
        new3DBeacon.animateCore();
    }

    /**
     * Locate the camera at default position and looking a t 0,0,0.
     */
    resetCameraPosition() {
        // Avoid flickering by stopping screen updates
        const liveScreen = this.flagContinuousScreenshot;
        if (liveScreen) {
            this.setLiveScreen(false);
        }

        const _this = this;
        new TWEEN.Tween( this._THREECamera.position ).to( {
            x: 0,
            y: kORGDevicePositionY,
            z: kORGCameraPositionZ}, kORGCameraTWEENDuration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete( () => {
                if (liveScreen) {
                    _this.setLiveScreen(true);
                }
            }).start();

        // TWEEN camera lookAt. But we can't do it setting camera.lookAt ! Due to collision with OrbitControls !
        // We must use the OrbitControl.target instead.
        new TWEEN.Tween( _this._THREEOrbitControls.target ).to( {
            x: 0,
            y: kORGDevicePositionY,
            z: 0}, kORGCameraTWEENDuration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    /**
     * Function to reset the rotation of the Device.
     */
    resetDevicePosition() {
        if (this._THREEDeviceAndScreenGroup) {
            this._THREEDeviceAndScreenGroup.rotation.set( 0, 0, 0 );
            this._THREEDeviceAndScreenGroup.position.set( 0, kORGDevicePositionY, 0);
        }
    }


    /***
     * Move the camera to the position that the device screen will fit on the scene.
     */
    deviceScreenCloseup() {
        if (!this._deviceScreen) {
            return;
        }

        const maxDim = Math.max(this._deviceScreen.screenSize.width, this._deviceScreen.screenSize.height);
        const fov = this._THREECamera.fov * (Math.PI / 180);
        const distance = Math.abs(maxDim/2 / Math.tan(fov / 2)) * 1.01;

        // Avoid flickering by stopping screen updates
        const liveScreen = this.flagContinuousScreenshot;
        if ( liveScreen) {
            this.setLiveScreen(false);
        }

        const _this = this;
        new TWEEN.Tween(this._THREECamera.position).to( {
            x: 0,
            y: kORGDevicePositionY,
            z: distance}, kORGCameraTWEENDuration)
            .easing(TWEEN.Easing.Quintic.InOut)
            .onComplete( () => {
                if (liveScreen) {
                    _this.setLiveScreen(true);
                }
            }).start();
    }

    /**
     * Set the camera looking at the given THREE object.
     * @param threeObject
     */
    lookAtObject( threeObject ) {
        // We can't do it setting camera.lookAt ! Due to collision with OrbitControls !
        // We must use the OrbitControl.target instead.
        new TWEEN.Tween( this._THREEOrbitControls.target ).to( {
            x: threeObject.position.x,
            y: threeObject.position.y,
            z: threeObject.position.z}, kORGCameraTWEENDuration)
            .easing( TWEEN.Easing.Quadratic.InOut)
            .start();

    }

    lookFrontAtObject( threeObject ) {
        // We can't do it setting camera.lookAt ! Due to collision with OrbitControls !
        // We must use the OrbitControl.target instead.

        new TWEEN.Tween( this._THREECamera.position ).to( {
            x: threeObject.position.x,
            y: threeObject.position.y,
            z: 900}, kORGCameraTWEENDuration)
            .easing( TWEEN.Easing.Quadratic.InOut)
            .start();

        new TWEEN.Tween( this._THREEOrbitControls.target ).to( {
            x: threeObject.position.x,
            y: threeObject.position.y,
            z: threeObject.position.z}, kORGCameraTWEENDuration)
            .easing( TWEEN.Easing.Quadratic.InOut)
            .start();

    }

    enableShowLocation() {
        this.flagShowLocation = true;

        if (!this._locationMarker) {
            const floorPosition = this._calculateFloorPosition();
            this._locationMarker = new ORG3DLocationMarker( floorPosition, this._lastLocationName, this._THREEScene);
        }
    }

    disableShowLocation() {
        this.flagShowLocation = false;
        if (this._locationMarker) {
            this._locationMarker.destructor();
            this._locationMarker = null;
        }
    }

    setShowNormalWindow(flag) {
    }

    setShowAlertWindow(flag) {
    }

    devicePositionHasChanged() {
        const bBox = this._deviceBoundingBox();
        //this._adjustFloorPosition(bBox);
        this._adjustLocationMarkerPosition(bBox);
    }

    resize(newSize) {
        this._THREERenderer.setSize( newSize.width, this._THREERenderer.getSize().height);
        this._THREECamera.aspect	= newSize.width / this._THREERenderer.getSize().height;
        this._THREECamera.updateProjectionMatrix();
    }

    setExpandedTreeLayersDistance( distanceUnits ) {
        if ( this._uiTreeModel ) {
            this._uiTreeModel.setExpandedTreeLayersDistance( distanceUnits );
        }
    }

    setExpandedTreeLayersVisibleRange( maxVisibleLayer ) {
        if ( this._uiTreeModel ) {
            this._uiTreeModel.setExpandedTreeLayersVisibleRange( maxVisibleLayer );
        }
    }

    /***
     * Call the 3D tree or the Sreen to highlight the given UI elment
     * @param element ORG3DUIElement, can be WDA, Org ...
     */
    highlightUIElement(element) {
        if (this._uiTreeModel.isExpanded) {
            this._uiTreeModel.highlightUIElement(element.elementJSON);
        } else if (this._deviceScreen) {
            this._deviceScreen.highlightUIElement(element);
        }
    }


    //------------------------------------------------------------------------------------------------------------------
    //  DELEGATES
    //------------------------------------------------------------------------------------------------------------------

    locationUpdate( location, locationName, elevation) {

        if (locationName) {
            this._lastLocationName = locationName;
        } else {
            this._lastLocationName = location.lat() + "  " + location.lng();
        }

        if (this.flagShowLocation) {
            if (!this._locationMarker) {
                const floorPosition = this._calculateFloorPosition();
                this._locationMarker = new ORG3DLocationMarker( floorPosition, this._lastLocationName, this._THREEScene);
            } else {
                this._locationMarker.updateDescriptor(this._lastLocationName);
            }
        }
     }


    //------------------------------------------------------------------------------------------------------------------
    // PRIVATE
    //------------------------------------------------------------------------------------------------------------------

    _initialize(domContainer, showFloor) {

        this._canvasDomElement = domContainer;
        const rendererCanvasWidth = this._canvasDomElement.clientWidth;
        const rendererCanvasHeight = this._canvasDomElement.clientHeight;

        this._THREEScene = new THREE.Scene();
        //this._THREEScene.add( this._THREEDeviceAndScreenGroup );

        this._THREECamera = new THREE.PerspectiveCamera(65, (rendererCanvasWidth / rendererCanvasHeight), 0.001, 10000);
        this._THREERenderer = new THREE.WebGLRenderer({antialias: true /*, alpha:true (if transparency wanted)*/});
        this._THREERenderer.domElement.style.position = 'absolute';
        this._THREERenderer.domElement.style.top = 0;
        //_THREERenderer.domElement.style.zIndex = 0;
        //_THREERenderer.setClearColor(0x000000);

        this._THREERenderer.setSize( rendererCanvasWidth, rendererCanvasHeight);
        this._canvasDomElement.appendChild( this._THREERenderer.domElement);
        this._rendererDOMElement = this._THREERenderer.domElement; // the DOM element for the renderer

        this._THREEOrbitControls = new THREE.OrbitControls( this._THREECamera, this._THREERenderer.domElement);//this._canvasDomElement);
        this._keyboardState = new KeyboardState();

        if (showFloor) {
            this._sceneFloor = this._createFloor(this._THREEScene);
        }

        this._createLights();

        this._THREECamera.position.set( 0, kORGDevicePositionY, kORGCameraPositionZ);
        this._THREEOrbitControls.target.set( 0, kORGDevicePositionY, 0 );
        //this._THREECamera.lookAt( new THREE.Vector3( 0, kORGDevicePositionY, 0 )); // not working, must use this._THREEOrbitControls.target

        this._threeClock = new THREE.Clock();

        // Create the rightMouse click manager
        this._contextMenuManager = new ORGContextMenuManager(this, '#threejs-canvas');

        // Create a mouse event listener and associate delegates
        this._mouseListener = new ORGMouseListener( this._rendererDOMElement);
        this._mouseListener.addDelegate( this._contextMenuManager);
        this._mouseListener.enable();

        this._render();
        //ORG.WindowResize( this._THREERenderer, this._THREECamera, this._canvasDomElement);

        this.createRaycasterForScene();
    }

    _calculateFloorPosition() {
        if (this._sceneFloor) {
            return this._sceneFloor.position;
        } else {
            return new THREE.Vector3(0, kORGFloorPositionY, 0);
        }
    }

    _createFloor( threeScene ) {
        const floorSize = 1000;
        const tileSize = 100;
        return new ORG3DSceneFloor(floorSize, tileSize, true, threeScene, kORGFloorPositionY);
    }

    _removeFloor() {
        if (this._sceneFloor) {
            this._sceneFloor.remove();
        }
        this._sceneFloor = null;
    }

    _createLights() {
        let light;

        light = new THREE.SpotLight(0xaaaaaa);
        light.position.set(500,-500,500);
        this._THREEScene.add(light);

        light = new THREE.SpotLight(0xaaaaaa);
        light.position.set(500,500,500);
        this._THREEScene.add(light);

        light = new THREE.SpotLight(0xaaaaaa);
        light.position.set(-500,-500,-500);
        this._THREEScene.add(light);

        light = new THREE.SpotLight(0xaaaaaa);
        light.position.set(-500,500,-500);
        this._THREEScene.add(light);

        //light = new THREE.DirectionalLight( 0xaaaaaa, 0.5  );
        //light.position.copy(  new THREE.Vector3(0.0, 1.0, -1.0));
        //this._THREEScene.add( light );
        //
        //light = new THREE.DirectionalLight( 0xaaaaaa, 0.5  );
        //light.position.copy(  new THREE.Vector3(1.0, 1.0, 1.0));
        //this._THREEScene.add( light );

        //light = new THREE.HemisphereLight(   );
        //this._THREEScene.add( light );
        //
        //light = new THREE.AmbientLight( 0xffffff, 0.9);
        //this._THREEScene.add(light);
    }

    _deviceBoundingBox() {
        let bBox = null;
        if ((this._sceneVisualFlags & ORGSceneVisualizationMask.ShowDevice) && this._device3DModel) {
            bBox = this._device3DModel.getBoundingBox();
        }
        if (!bBox && this._deviceScreen) {
            bBox = this._deviceScreen.boundingBox;
        }
        return bBox;
    }

    _adjustLocationMarkerPosition(deviceBoundingBox) {
        //if ( deviceBoundingBox && this._locationMarker) {
        //    this._locationMarker.setPositionY(deviceBoundingBox.min.y - 50);
        //}
    }

    _addDeviceAndScreenGroup() {
        if (!this._THREEDeviceAndScreenGroup) {
            this._THREEDeviceAndScreenGroup = new THREE.Group();
            this._THREEScene.add(this._THREEDeviceAndScreenGroup);
        }
    }

    _removeDeviceAndScreenGroup() {
        if (this._THREEDeviceAndScreenGroup) {
            this._THREEScene.remove(this._THREEDeviceAndScreenGroup);
            this._THREEDeviceAndScreenGroup = null;
        }
    }

    _render() {

        const _this = this;

        requestAnimationFrame( () => {
            _this._THREERenderer.render( _this._THREEScene, _this._THREECamera);
            _this._THREEOrbitControls.update();
            _this._updateScene();
            TWEEN.update();
            _this._render();
        });
    }

    _updateScene()
    {
        if (this._deviceScreen) {
            this._deviceScreen.renderUpdate();
        }

        if (this._transformControl) {
            this._transformControl.update(); // important to update the controls size while changing POV
        }
        if (this._beaconTransformControl) {
            this._beaconTransformControl.update(); // important to update the controls size while changing POV
        }
        if ( ORG.systemInfoManager ) {
            ORG.systemInfoManager.update();
        }
/*
        _keyboardState.update();

        // Expand/Collapse UI
        if ( _keyboardState.down("E") ) {
            ORG.scene.expandCollapse();
        }
        else if ( _keyboardState.down("F") ) {
            checkButtonShowFloor.click();
            ORG.scene.setShowFloor(checkButtonShowFloor.is(':checked'));
        }
        else if ( _keyboardState.down("P") ) {
            checkButtonShowPrivate.click();
            ORG.scene.setShowPrivate(checkButtonShowPrivate.is(':checked'));
        }
        else if ( _keyboardState.down("L") ) {
            checkButtonLiveScreen.click();
            ORG.scene.setLiveScreen(checkButtonLiveScreen.is(':checked'));
         }
        else if ( _keyboardState.down("T") ) {
            checkButtonShowTooltips.click();
            ORG.scene.setShowTooltips(checkButtonShowTooltips.is(':checked'));
         }
*/
        // rotate left/right/up/down

        //if ( keyboard.down("left") ) {
        //    //iPhone5Object.translateX( -50 );
        //    threeScreenPlane.translateX( -50 );
        //}
        //if ( keyboard.down("right") ) {
        //    //iPhone5Object.translateX(  50 );
        //    threeScreenPlane.translateX( 50 );
        //}
        //if ( keyboard.pressed("up") ) {
        //    //iPhone5Object.translateZ( -50 );
        //    threeScreenPlane.translateZ( -50 );
        //}
        //if ( keyboard.pressed("down") ) {
        //    //iPhone5Object.translateZ(  50 );
        //    threeScreenPlane.translateZ( 50 );
        //}

        //var rotation_matrix = new THREE.Matrix4().identity();
        /*
        if ( _keyboardState.pressed("A") ) {
            //iPhone5Object.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
            if (!!threeScreenPlane) {
                threeScreenPlane.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
            }
            deviceMotionChanged = true;
        }
        if ( keyboard.pressed("D") ) {
            //iPhone5Object.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
            threeScreenPlane.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
            deviceMotionChanged = true;
        }
        if ( keyboard.pressed("R") ) {
            //iPhone5Object.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
            threeScreenPlane.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
            deviceMotionChanged = true;
        }
        if ( keyboard.pressed("F") ) {
            //iPhone5Object.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
            threeScreenPlane.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
            deviceMotionChanged = true;
        }
        if ( keyboard.pressed("Q") ) {
            //iPhone5Object.rotateOnAxis( new THREE.Vector3(0,0,1), rotateAngle);
            threeScreenPlane.rotateOnAxis( new THREE.Vector3(0,0,1), rotateAngle);
            deviceMotionChanged = true;
        }
        if ( keyboard.pressed("W") ) {
            //iPhone5Object.rotateOnAxis( new THREE.Vector3(0,0,1), -rotateAngle);
            threeScreenPlane.rotateOnAxis( new THREE.Vector3(0,0,1), -rotateAngle);
            deviceMotionChanged = true;
        }
        if ( keyboard.pressed("Z") ) {
            //iPhone5Object.position.set(0,0,0);
            //iPhone5Object.rotation.set(0,0,0);
            threeScreenPlane.position.set(0,0,0);
            threeScreenPlane.rotation.set(0,0,0);
            deviceMotionChanged = true;
        }*/

        //if (motionActive==true && deviceMotionChanged==true) {
        //    //alert("1");
        //    if (motionMode == "send") {
        //        //alert("2");
        //        // send motion data to device
        //        var rotation = iPhone5Object.rotation;
        //        var quaternion = iPhone5Object.quaternion;
        //
        //        var message = {
        //            "command" : "SimulatorMotionUpdate",
        //            "content" : {"q" : { "x" : quaternion.x, "y":quaternion.z, "z":quaternion.y, "w":quaternion.w}}
        //        };
        //
        //        sendSimulatorMotionUpdate(message);
        //    }
        //}

        //var timeOffset = uniforms.time.value + attributes.customOffset.value[ v ];
        //particleGeometry.vertices[v] = position(timeOffset);
        //iPhone5Object.setPosition( position(timeOffset));
    }

    /**
     * When the rotation tranformation control has changed we get a call here.
     * This function will pair the device 3d model to the rotation of the screen.
     * THis function will broadcast the new device attitude to the connected device.
     * @private
     */
    /*_transformControlChanged() {
        if (this._transformControl) {
            const screenObject = this._transformControl.object;
            if (screenObject) {
                if (this._device3DModel) {

                    if (this._transformControl.getMode() == "rotate") {
                        // sync 3d device model to screen. translate to 0, rotate, translate.

                        // Translate device to 0
                        var b = new THREE.Box3().setFromObject(this._device3DModel.THREEObject);
                        var position = b.getCenter();
                        this._device3DModel.THREEObject.applyMatrix(new THREE.Matrix4().makeTranslation( -position.x, -position.y, -position.z ) );

                        // reset rotation of device
                        var deviceMatrix = new THREE.Matrix4();
                        deviceMatrix.makeRotationFromQuaternion(this._device3DModel.THREEObject.quaternion);
                        var deviceInverseMatrix = new THREE.Matrix4();
                        deviceInverseMatrix.getInverse(deviceMatrix);
                        this._device3DModel.THREEObject.applyMatrix(deviceInverseMatrix);

                        // rotate device
                        var screenMatrix = new THREE.Matrix4();
                        screenMatrix.makeRotationFromQuaternion(screenObject.quaternion);
                        this._device3DModel.THREEObject.applyMatrix(screenMatrix);

                        // translate device back to original pos
                        this._device3DModel.THREEObject.applyMatrix(new THREE.Matrix4().makeTranslation( position.x, position.y, position.z ) );

                        // Broadscast Attitude
                        if (ORG.deviceController) {
                            const msg = ORGMessageBuilder.attitudeUpdate(screenObject.quaternion);
                            ORG.deviceController.sendMessage(msg);
                        }

                    } else if (this._transformControl.getMode() == "translate") {
                        // handle beacons intersection
                        ORG.scenario.devicePointUpdate(screenObject.position);
                    }


                }
            }
        }
    }*/
}
/**
 * Created by jongabilondo on 01/07/2016.
 */

/**
 * ORGMessageBuilder. Utilities class to create JSON requests to Organismo driver.
 */
class ORGMessageBuilder {

    static deviceInfo() {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.DeviceInfo
            }
        };
        return JSON.stringify(msg);
    }

    static systemInfo() {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.SystemInfo
            }
        };
        return JSON.stringify(msg);
    }

    static appInfo() {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.AppInfo
            }
        };
        return JSON.stringify(msg);
    }

    static takeScreenshot() {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.Screenshot
            }
        };
        return JSON.stringify(msg);
    }

    static elementTree(parameters) {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.ElementTree,
                parameters: parameters
            }
        };
        return JSON.stringify(msg);
    }

    static gesture(gesture, parameters) {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: gesture,
                parameters:parameters
            }
        };
        return JSON.stringify(msg);
    }

    static locationUpdate(location, elevation) {
        let msg = {
            type: ORGRequest.Update,
            data: {
            }
        };
        if (location) {
            msg.data.location = { lat: location.lat(), lng : location.lng() };
        }
        if (elevation) {
            msg.data.altimeter = { altitude: elevation, pressure: 1000.0 }; // 100 kilopascal is 1 bar
        }
        return JSON.stringify(msg);
    }

    static attitudeUpdate(quaternion) {
        let msg = {
            type: ORGRequest.Update,
            data: {
            }
        };
        if (quaternion) {
            msg.data.deviceAttitude = { qx:quaternion.x, qy:quaternion.z, qz:quaternion.y, qw:quaternion.w };
        }
        return JSON.stringify(msg);
    }

    static classHierarchy(className) {
        const msg = {
            type: ORGRequest.Request,
            data: {
                request: ORGRequest.ClassHierarchy,
                parameters:{className: className}
            }
        };
        return JSON.stringify(msg);
    }
}
/**
 * Created by jongabilondo on 15/09/2016.
 */


/**
 * Class to create context menus in the 3D scene.
 * It implements the delegate call for ORGMouseListener in order to get the right mouse click.
 * It implements the delegate call for ORG3DRaycaster which informs what is the selected three obj.
 * @param domElement
 * @constructor
 */
class ORGContextMenuManager {

    /**
     *
     * @param scene The ORG scene.
     * @param contextElement the element where the context menu shows up.
     */
    constructor(scene, contextElement) {
        this._selectedThreeObject = null; // the three obj where the mouse is on.
        this._intersectionPoint = null;
        this._scene = scene; // We will need to get information from some objects in the scene
        this._contextElement = contextElement;

        /**
         * Instantiate the context menu
         */
        $.contextMenu({
            selector: this._contextElement,
            trigger: 'none',
            build: ($trigger, e) => {
                if (this._selectedThreeObject) {
                    return {
                        items: this._menuItemsForScreen()
                    }
                } else {
                    return {
                        items: this._menuItemsForOutOfScreen()
                    }
                }
            },
            callback: (key, options) => {
                this._processMenuSelection(key, this._selectedThreeObject, this._scene);
            }
        });
    }


    /**
     * ORGMouseListener calls this method on right click
     * @param event
     */
    onContextMenu(event) {
        if (!ORG.deviceController || ORG.deviceController.isConnected === false) {
            return;
        }
        $(this._contextElement).contextMenu({x:event.clientX, y:event.clientY});
    }

    /**
     * ORG3DRaycaster calls this method to inform of the three obj the mouse is hoovering on.
     * @param threeElement
     */
    mouseOverElement(threeElement, point) {
        this._selectedThreeObject = threeElement;
        this._intersectionPoint = point;
    }


    /**
     * The user has selected a menu option. This function will respond to the selection.
     * @param menuOptionKey The string that represents the selected menu option.
     * @param threeObj The 3D object where the click happened.
     * @param scene The ORG scene.
     */
    _processMenuSelection(menuOptionKey, threeObj, scene) {

        if (!threeObj) {
            this._processMenuSelectionOnVoid(menuOptionKey, scene); // in screen raycaster we get no three obj
            return;
        }

        // Calculate the App coordinates where the mouse was clicked.

        const screenBbox = scene.deviceScreenBoundingBox;
        const appX = this._intersectionPoint.x - screenBbox.min.x;
        const appY = screenBbox.max.y - this._intersectionPoint.y;

        const parameters = {location:{x:appX, y:appY}};

        switch (menuOptionKey) {
            case ORGActions.PRESS_HOME : {
                ORGConnectionActions.pressHome();
            } break;
            case ORGActions.LOCK_DEVICE : {
                ORGConnectionActions.lockDevice();
            } break;
            case ORGActions.UNLOCK_DEVICE : {
                ORGConnectionActions.unlockDevice();
            } break;
            case ORGActions.REFRESH_SCREEN : {
                ORGConnectionActions.refreshScreen();
            } break;
            case ORGDevice.ORIENTATION_PORTRAIT:
            case ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN:
            case ORGDevice.ORIENTATION_LANDSCAPE_LEFT:
            case ORGDevice.ORIENTATION_LANDSCAPE_RIGHT: {
                ORGConnectionActions.setOrientation(menuOptionKey);
            } break;
            case ORGActions.TAP : {
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case ORGActions.LONG_PRESS : {
                parameters.duration = 0.5;
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case ORGActions.SWIPE_LEFT : {
                parameters.direction = "left";
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case ORGActions.SWIPE_RIGHT : {
                parameters.direction = "right";
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case ORGActions.SWIPE_UP : {
                parameters.direction = "up";
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case ORGActions.SWIPE_DOWN : {
                parameters.direction = "down";
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case ORGActions.LOOK_AT : {
                scene.lookAtObject( threeObj );
            } break;
            case ORGActions.LOOK_FRONT_AT : {
                scene.lookFrontAtObject( threeObj );
            } break;
        }
    }

    /**
     * This function will respond to the selected option of the menu in the scene open area.
     * @param menuOptionKey
     * @param scene
     * @private
     */
    _processMenuSelectionOnVoid(menuOptionKey, scene) {

        switch (menuOptionKey) {
            case ORGActions.RESET_CAMERA_POSITION : {
                scene.resetCameraPosition();
            } break;
            case ORGActions.RESET_DEVICE_POSITION : {
                scene.resetDevicePosition();
            } break;
            case ORGActions.SCREEN_CLOSEUP : {
                scene.deviceScreenCloseup();
            } break;
        }
    }

    _menuItemsForScreen() {
        let controller = ORG.deviceController;
        var items = {};
        if (controller.type === 'ORG') {
            items[ORGActions.TAP] = {name: "Tap"};
            items[ORGActions.LONG_PRESS] = {name: "Long Press"};
            items[ORGActions.SWIPE] = {
                name: "Swipe",
                items: {
                    [ORG.Device.SWIPE_LEFT]: {name: "Left"},
                    [ORG.Device.SWIPE_RIGHT]: {name: "Right"},
                    [ORG.Device.SWIPE_UP]: {name: "Up"},
                    [ORG.Device.SWIPE_DOWN]: {name: "Down"},
                }
            }
        }

        if (controller.type === 'WDA') {
            if (Object.keys(items).length) {
                items["separator-press"] = { "type": "cm_separator" };
            }
            items[ORGActions.PRESS_HOME] = {name: "Press Home"};
            items[ORGActions.LOCK_DEVICE] = {name: "Lock"};
            items[ORGActions.UNLOCK_DEVICE] = {name: "Unlock"};
            items[ORGActions.SET_ORIENTATION] = {
                name: "Set Orientation",
                items: {
                    [ORGDevice.ORIENTATION_PORTRAIT]: {name: "Portrait"},
                    [ORGDevice.ORIENTATION_LANDSCAPE_LEFT]: {name: "Landscape Left"},
                    [ORGDevice.ORIENTATION_LANDSCAPE_RIGHT]: {name: "Landscape Right"},
                    [ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN]: {name: "Upside Down"}
                }
            }
        }

        if (controller.type === 'ORG') {
            if (Object.keys(items).length) {
                items["separator-look"] = { "type": "cm_separator" };
            }
            items[ORGActions.LOOK_AT] = {name: "Look at"};
            items[ORGActions.LOOK_FRONT_AT] = {name: "Look Front at"};
        }

        if (controller.type === 'WDA') {
            if (Object.keys(items).length) {
                items["separator-refresh"] = { "type": "cm_separator" };
            }
            items[ORGActions.REFRESH_SCREEN] = {name: "Refresh Screen"};
        }

        return items;
    }

    _menuItemsForOutOfScreen() {
        return {
            [ORGActions.RESET_CAMERA_POSITION]: {name: "Reset Camera Position"},
            [ORGActions.RESET_DEVICE_POSITION]: {name: "Reset Device Position"},
            [ORGActions.SCREEN_CLOSEUP]: {name: "Device Screen Closeup"}
        }
    }
}
/**
 * Created by jongabilondo on 13/02/2018.
 */

/***
 * Class to wrapp the functionality of the UITree context menu
 */
class ORGUITreeContextMenuManager {

    /**
     *
     * @param contextElement the element where the context menu shows up.
     */
    constructor(contextElement) {
        this._node = null; // the tree component node
        this._contextElement = contextElement;

        // Instantiate the context menu
        $.contextMenu({
            selector: this._contextElement,
            trigger: 'none',
            build: ($trigger, e) => {
                return {items: this._menuItemsForNode()}
            },
            callback: (key, options) => {
                this._processMenuSelection(key);
            }
        })
    }


    /**
     * Shows the context menu at the point of event.
     * @param event
     */
    onContextMenu(event, node) {
        if (!ORG.deviceController || ORG.deviceController.isConnected === false) {
            return;
        }
        this._node = node;
        $(this._contextElement).contextMenu({x:node.clientX, y:node.clientY});
    }

    /**
     * The user has selected a menu option. This function will respond to the selection.
     * @param menuOptionKey The string that represents the selected menu option.
     */
    _processMenuSelection(menuOptionKey) {

        switch (menuOptionKey) {
            case ORGActions.TAP:
            case ORGActions.LONG_PRESS:
            case ORGActions.SWIPE_LEFT:
            case ORGActions.SWIPE_RIGHT:
            case ORGActions.SWIPE_UP:
            case ORGActions.SWIPE_DOWN:
            {
                ORGConnectionActions.playGesture(menuOptionKey, this._getElementXPath(this._node));
            } break;
            case ORGActions.LOOK_AT : {
                alert('Not implemented.');
            } break;
            case ORGActions.LOOK_FRONT_AT: {
                alert('Not implemented.');
            } break;
            case ORGActions.SHOW_CLASS_HIERARCHY: {
                if (this._node && (typeof this._node.representedNode.class !== undefined)) {
                    ORG.deviceController.sendRequest(ORGMessageBuilder.classHierarchy(this._node.representedNode.class));
                }
            } break;
        }
    }

    _menuItemsForNode() {
        let controller = ORG.deviceController;
        var items = {};

        if (controller.type === "WDA") {
            items[ORGActions.TAP] = {name: "Tap"};
            items[ORGActions.LONG_PRESS] = {name: "Long Press"};
            items[ORGActions.SWIPE] = {
                name: "Swipe",
                items: {
                    [ORGActions.SWIPE_LEFT]: {name: "Left"},
                    [ORGActions.SWIPE_RIGHT]: {name: "Right"},
                    [ORGActions.SWIPE_UP]: {name: "Up"},
                    [ORGActions.SWIPE_DOWN]: {name: "Down"},
                }
            }
        }

        if (controller.type === "ORG") {
            items[ORGActions.SHOW_CLASS_HIERARCHY] = {name: "Class Hierarchy"}
            items["separator-look"] = { "type": "cm_separator" };
            items[ORGActions.LOOK_AT] = {name: "Look at"}
            items[ORGActions.LOOK_FRONT_AT] = {name: "Look Front at"}
        }

        return items;
    }

    _getElementXPath(node) {
        if (!node) {
            return '//XCUIElementTypeApplication[1]'
        }
        let parent = ORG.UIJSONTreeManager.nodeParent(node)
        let idx = 0;
        if (parent) {
            for (let child of parent.nodes) {
                if (child.representedNode.type === node.representedNode.type) {
                    idx++;
                }
                if (child.nodeId === node.nodeId) {
                    break;
                }
            }
        } else {
            idx = 1;
        }

        return this._getElementXPath(parent) +
            '/' +
            'XCUIElementType' + node.representedNode.type + '[' + idx + ']'
    }

}
/**
 * Created by jongabilondo on 04/10/2016.
 */

/**
 * This was a tryout to display a google map in the floor of the 3D scene.
 * The combination of CSS3DRenderer with a WebGLRenderer is not fully integrated.
 * They both work separately, WebGLRenderer has to be marked as transparent to be able to see the CSS3DRenderer scene.
 * The original attempt was to set the map as a texture into the floor mesh, but it's not possible to get the map image from an 'offscreen' buffer.
 * A google map can't be displayed on a canvas in order to create a texture from it. Therefore the tryout here is to use the CSS3DRenderer which can
 * display a iframe, in which the map has been created.
 * There is a good thing about CSS3DRenderer and an iFrame, it's possible to create a google map in a 3D scene and even to control it, zoom, pan.
 * But it is not useful for Organismo. It needs a better integration into a WebGLRenderer renderer.
 * There is some interesting code in https://www.npmjs.com/package/iframe2image which it might create an image from an iframe (?). Could it generate an
 * image from the google map and use it as a texture into the WebGLRenderer ?.
 * @param floorMesh
 * @param rendererGL
 * @param camera
 * @param canvasDomElement
 * @constructor
 */
function ORGFloorMap(floorMesh, rendererGL, camera, canvasDomElement) {

    var _threeCamera = camera;
    var _cssScene = null;

    _cssScene = new THREE.Scene();

    // create the iframe to contain webpage
    var element	= document.createElement('iframe')
    element.src	= "simple-map.html";
    var elementWidth = 2000; // pixels
    var aspectRatio = 1.0;//planeHeight / planeWidth;
    var elementHeight = elementWidth * aspectRatio;
    element.style.width  = elementWidth + "px";
    element.style.height = elementHeight + "px";

    // create a CSS3DObject to display element
    var cssObject = new THREE.CSS3DObject( element );
    // synchronize cssObject position/rotation with planeMesh position/rotation
    cssObject.position.x = floorMesh.position.x;
    cssObject.position.y = floorMesh.position.y;
    cssObject.position.z = floorMesh.position.z;
    cssObject.rotation.x = -Math.PI / 2;
    cssObject.rotation.y = floorMesh.rotation.y;
    cssObject.rotation.z = floorMesh.rotation.z;
    // resize cssObject to same size as floorMesh
    cssObject.scale.x = 2;//= (1 + percentBorder) * (elementWidth / 2000);
    cssObject.scale.y = 2;//= (1 + percentBorder) * (elementWidth / 2000);
    _cssScene.add(cssObject);

    // create a renderer for CSS
    var rendererCSS	= new THREE.CSS3DRenderer();
    rendererCSS.setSize( rendererGL.getSize().width, rendererGL.getSize().height);
    rendererCSS.domElement.style.position = 'absolute';
    rendererCSS.domElement.style.top = 0;
    rendererCSS.domElement.style.margin = 0;
    rendererCSS.domElement.style.padding = 0;
    rendererCSS.domElement.style.zIndex = 0;

    canvasDomElement.appendChild(rendererCSS.domElement);
    rendererCSS.domElement.appendChild(rendererGL.domElement);
    //renderer.domElement.appendChild(rendererCSS.domElement);

    // when window resizes, also resize this renderer
    THREEx.WindowResize(rendererCSS, _threeCamera, canvasDomElement);

    //renderer.domElement.style.position = 'absolute';
    //renderer.domElement.style.top      = 0;
    // make sure original renderer appears on top of CSS renderer
    //renderer.domElement.style.zIndex   = 1;
    //rendererCSS.domElement.appendChild( renderer.domElement );

    this.render = function() {
        rendererCSS.render(_cssScene, _threeCamera);
    }

}

/**
 * Created by jongabilondo on 21/05/2017.
 */

/**
 * Base class for the Objects that are capable of generating location data. Like a Map.
 * It provides a Broadcasting capabilities to inform listeners of location updates.
 */
class ORGLocationProvider {

    constructor() {
        this._listeners = [];
    }

    addListener(delegate ) {
        this._listeners.push( delegate );
    }

    removeListeners(delegate ) {
        for (let i=0; i<this._listeners.length; i++) {
            if ( this._listeners[i] == delegate) {
                this._listeners.splice( i, 1);
                break;
            }
        }
    }

    removeListerners() {
        this._listeners = [];
    }

    _broadcastLocation(location, address, elevation) {
        for (let i=0; i<this._listeners.length; i++) {
            if (this._listeners[i].locationUpdate) {
                this._listeners[i].locationUpdate( location, address, elevation );
            }
        }
    }
}
/**
 * Created by jongabilondo on 10/12/2016.
 */


/**
 * Class to visualize and operate a Google Map.
 * It is a Location provider. Holds a list of location listeners that will get notified the location.
 */
class ORGMap extends ORGLocationProvider {

    constructor() {
        super();

        this._map = this._createMap(document.getElementById('map'), true);
        this._elevationService = new google.maps.ElevationService();
        this._geocoder = new google.maps.Geocoder();
        this._directionsService = new google.maps.DirectionsService();
        this._directionsDisplay = this._createDirectionsRenderer(this._map);
        this._directions = null;
        this._elevations = null;
        this._itineraryRunner = null;
        this._startLocationMarker = null;
        this._itineraryLocationMarker = null;
        this._startLocation = null;
        this._endLocation = null;

        this._initSearchBoxAutocomplete();
        this._initAutocompleteStartLocation();
        this._initAutocompleteEndLocation();

        // Load the Visualization API and the piechart package.
        //var _this = this;
        //google.load("visualization", "1.0", {packages: ["columnchart"], "callback" : function() {_this._googlePackagesLoaded}});

        this._chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    }

    //------------------------------------------------------------------------------------------------------------------
    // GET/SET
    //------------------------------------------------------------------------------------------------------------------

    get isCreated() {
        return !!this._map;
    }

    get travelMode() {
        return ORG.UI.dropdownTravelMode.val();
    }

    //------------------------------------------------------------------------------------------------------------------
    // PUBLIC
    //------------------------------------------------------------------------------------------------------------------

    run() {
        if (this._directions) {
            let itinerary = new ORGItinerary(this._directions.routes[0], this._elevations, this._startLocation, this._endLocation);
            this._itineraryRunner = new ORGItineraryRunner(itinerary);
            this._itineraryRunner.addListener(ORG.locationManager); // The locationManager will receive location updates
            this._itineraryRunner.start();
        }
    }

    pause() {
        if (this._itineraryRunner) {
            this._itineraryRunner.pause();
        }
    }

    resume() {
        if (this._itineraryRunner) {
            this._itineraryRunner.resume();
        }
    }

    stop() {
        if (this._itineraryRunner) {
            this._itineraryRunner.stop();
        }
    }

    updateItineraryLocation(lat, lng) {

        if (!this._itineraryLocationMarker) {
            this._itineraryLocationMarker = new google.maps.Marker({
                map: this._map,
                icon: "img/map_loc_20.png",
                anchorPoint: new google.maps.Point(10, 10)
            });
        }
        if (lat && lng) {
            const loc = new google.maps.LatLng(lat, lng);
            this._itineraryLocationMarker.setOptions({"position":loc, "anchorPoint":new google.maps.Point(10, 10)});
            this._map.setCenter(loc);
            //this._itineraryLocationMarker.setPosition(new google.maps.LatLng(lat, lng));

        } else {
            this._itineraryLocationMarker.setMap(null);
            this._itineraryLocationMarker = null;
        }
    }

    /**
     * Reset the itinerary. Remove the markers of start end points. Clean all structures and UI related to the itenerary.
     */
    resetItinerary() {
        if (this._startLocationMarker) {
            this._startLocationMarker.setMap(null);
            this._startLocationMarker = null;
        }

        this._directionsDisplay.setMap(null);
        this._directionsDisplay = null;
        this._directionsDisplay = this._createDirectionsRenderer(this._map);

        this._startLocation = null;
        this._endLocation = null;

        try {
            this._chart.clearChart(); // not working !
        } catch (e) {
            // TO DO, such a simple thing
        }

        ORG.dispatcher.dispatch({
            actionType: 'reset-itinerary'
        });
    }

    sendStartLocationToDevice() {
        if (this._startLocation) {
            this._broadcastLocation(this._startLocation, null, null);
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // PRIVATE
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Create a Google map on the given DOM element and set the curret location provided by the browser.
     * @param DOM element placeholder
     * @param onCurrentLocation
     * @returns {google.maps.Map}
     * @private
     */
    _createMap(onElement, onCurrentLocation) {
        let map = new google.maps.Map(onElement, {
            //center: {lat: -33.8688, lng: 151.2195},
            zoom: 13,
            mapTypeId: 'roadmap'
        });

        if (onCurrentLocation) {
            const _this = this;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    map.setCenter(pos);
                }, function () {
                    _this_.handleLocationError(true, map.getCenter());
                });
            } else {
                // Browser doesn't support Geolocation
                _this._handleLocationError(false, map.getCenter());
            }
        }

        return map;
    }

    _createDirectionsRenderer(map) {

        const _this = this;

        let directionsDisplay = new google.maps.DirectionsRenderer({
            'map': map,
            'preserveViewport': true,
            'draggable': true
        });

        google.maps.event.addListener(directionsDisplay, 'directions_changed',
            function () {

                // get new itinerary data
                _this._updateItineraryValues(directionsDisplay.getDirections());
                //const distance = _this._calculateDistance(directionsDisplay.getDirections());
                //const duration = _this._calculateDuration(directionsDisplay.getDirections());
                //
                //ORG.dispatcher.dispatch({
                //    actionType: 'itinerary-changed',
                //    distance: distance,
                //    duration: duration
                //});

                // get new elevations
                _this._elevationService.getElevationAlongPath({
                    path: directionsDisplay.getDirections().routes[0].overview_path,
                    samples: 256
                }, function (results) {
                    _this._plotElevation(results)
                });
            });
        return directionsDisplay;
    }


    _initSearchBoxAutocomplete() {
        // Create the search box and link it to the UI element.
        const input = document.getElementById('pac-input');
        const searchBox = new google.maps.places.SearchBox(input);
        this._map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        const _this = this;
        // Bias the SearchBox results towards current map's viewport.
        this._map.addListener('bounds_changed', function () {
            searchBox.setBounds(_this._map.getBounds());
        });

        this._map.addListener('rightclick', function (event) {
            _this._onRightClick(event, _this);
        });

        this._map.addListener('click', function (event) {
            _this._onClick(event);
        });


        //var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function () {
            const places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            //_this._removeMarker();

            // For each place, get the icon, name and location.
            const bounds = new google.maps.LatLngBounds();
            places.forEach(function (place) {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                //const icon = {
                //    url: place.icon,
                //    size: new google.maps.Size(71, 71),
                //    origin: new google.maps.Point(0, 0),
                //    anchor: new google.maps.Point(17, 34),
                //    scaledSize: new google.maps.Size(25, 25)
                //};
                //
                //// Create a marker for each place.
                //markers.push(new google.maps.Marker({
                //    map: _this._map,
                //    icon: icon,
                //    title: place.name,
                //    position: place.geometry.location
                //}));
                //_this._createMarker(place.geometry.location);

                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport); // Only geocodes have viewport.
                } else {
                    bounds.extend(place.geometry.location);
                }


            });
            _this._map.fitBounds(bounds);
        });
    }

    _initAutocompleteStartLocation() {
        const _this = this;
        const options = null;
        let autocomplete = new google.maps.places.Autocomplete(document.getElementById('start-point'), options);

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            _this._autompleteSelectedStartPoint(autocomplete, _this._map);
        });
    }

    _initAutocompleteEndLocation() {
        const _this = this;
        const options = null;
        let autocomplete = new google.maps.places.Autocomplete(document.getElementById('end-point'), options);

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            _this._autompleteSelectedEndPoint(autocomplete, _this._map);
        });

    }

    _autompleteSelectedStartPoint(autocomplete, map) {
        let place = autocomplete.getPlace();
        const location = place.geometry.location;
        map.panTo(location);
        this._setStartLocationWithAddress(location, place.formatted_address);
    }


    _autompleteSelectedEndPoint(autocomplete, map) {
        let place = autocomplete.getPlace();
        const location = place.geometry.location;
        this._setEndLocationWithAddress(location, place.formatted_address);
    }

    _onClick(event) {
        if (this._startLocation == null) {
            this._setStartLocation(event.latLng);
        } else {
            this._setEndLocation(event.latLng);
        }
    }

    _onRightClick(event, ORGMap) {

    }

    _setStartLocation(location) {
        const _this = this;
        this._getLocationAddress(location, function (address) {
            _this._setStartLocationWithAddress(location, address);
        });
    }

    _setStartLocationWithAddress(location, address) {
        this._startLocation = location;
        this._startLocationMarker = this._createMarker(location, "A");
        const _this = this;
        google.maps.event.addListener(this._startLocationMarker, 'dragend', function () {
            _this._startLocation = _this._startLocationMarker.getPosition();
            //_this._getLocationInfoAndBroadcast(_this._startLocation);

            _this._getLocationAddress( _this._startLocation, function(address) {
                _this._broadcastLocation(_this._startLocation, address, null);
                ORG.dispatcher.dispatch({
                    actionType: 'start-location-update',
                    lat: _this._startLocation.lat(),
                    lng: _this._startLocation.lng(),
                    elevation: null,
                    address: address
                });
            });
        });
        this._getLocationInfoAndBroadcast(location);


        if (this._endLocation) {
            this._removeMarker(); // Remove A, it's going to be created by the DirectionsRenderer
            this._calcRoute();
        }

        ORG.dispatcher.dispatch({
            actionType: 'start-location-update',
            lat: location.lat(),
            lng: location.lng(),
            elevation: null,
            address: address
        });
    }

    _setEndLocation(location) {
        const _this = this;
        this._getLocationAddress(location, function (address) {
            _this._setEndLocationWithAddress(location, address);
        });
    }

    _setEndLocationWithAddress(location, address) {
        this._endLocation = location;

        if (this._startLocation) {
            this._removeMarker(); // Remove A, it's going to be created by the DirectionsRenderer
            this._calcRoute();
        }

        ORG.dispatcher.dispatch({
            actionType: 'end-location-update',
            lat: location.lat(),
            lng: location.lng(),
            elevation: null,
            address: address
        });
    }

    _createMarker(location, label) {
        let marker = new google.maps.Marker({
            position: location,
            map: this._map,
            animation: google.maps.Animation.DROP,
            draggable: true,
            label: label
        });
        return marker;

    }

    _removeMarker() {
        if (this._startLocationMarker) {
            this._startLocationMarker.setMap(null);
            this._startLocationMarker = null;
        }
    }

    _getLocationAddress(location, completion) {
        const _this = this;
        this._geocodePosition(location, function (location, address, elevation) {
            if (completion) {
                completion(address);
            }
        });
    }

    _getLocationInfoAndBroadcast(location) {
        const _this = this;
        this._geocodePosition(location, function (location, address, elevation) {
            _this._broadcastLocation(location, address, elevation);
        });
    }

    _geocodePosition(location, onCompletion) {
        const _this = this;

        this._geocoder.geocode({
            latLng: location
        }, function (responses) {
            if (responses && responses.length > 0) {
                _this._elevationPosition(location, responses[0].formatted_address, onCompletion);
            } else {
                _this._elevationPosition(location, null, onCompletion);
            }
        });
    }

    _elevationPosition(location, address, onCompletion) {
        const _this = this;

        this._elevationService.getElevationForLocations({
            'locations': [location]
        }, function (results, status) {

            if (status === 'OK') {
                if (results[0] && onCompletion) {
                    onCompletion(location, address, results[0].elevation);
                }
            }
        });
    }

    _calcRoute() {
        const request = {
            origin: this._startLocation,
            destination: this._endLocation,
            travelMode: this.travelMode//google.maps.DirectionsTravelMode.DRIVING
        };

        let _this = this;
        this._directionsService.route(request, function (response, status) {

            if (status == google.maps.DirectionsStatus.OK) {
                const SAMPLES = 256;
                _this._directions = response;
                _this._directionsDisplay.setDirections(response);
                _this._elevationService.getElevationAlongPath({
                        path: response.routes[0].overview_path,
                        samples: SAMPLES
                    }, function (results) {
                        _this._elevations = results;
                        _this._plotElevation(results)
                    }
                );
            }
        });
    }

    // Takes an array of ElevationResult objects, draws the path on the map
    // and plots the elevation profile on a GViz ColumnChart
    _plotElevation(results) {
        const elevations = results;

        let path = [];
        for (let i = 0; i < results.length; i++) {
            path.push(elevations[i].location);
            //console.log("elevation:",i,"value:",elevations[i]);
            //console.log(elevations[i].location);
        }

        //if (this._polyline) {
        //    this._polyline.setMap(null);
        //}
        //
        //this._polyline = new google.maps.Polyline({
        //    path: path,
        //    strokeColor: "#000000",
        //    map: this.map});

        let data = new google.visualization.DataTable();
        data.addColumn('string', 'Sample');
        data.addColumn('number', 'Elevation');
        for (let i = 0; i < results.length; i++) {
            data.addRow(['', elevations[i].elevation]);
        }

        document.getElementById('chart_div').style.display = 'block';
        this._chart.draw(data, {
            //width: 200,
            height: 160,
            legend: 'none',
            titleY: 'Elevation (m)',
            focusBorderColor: '#00ff00'
        });
    }

    _removeElevationChart() {
        document.getElementById('chart_div').style.display = 'none';
    }


    _handleLocationError(browserHasGeolocation, pos) {
        let infoWindow = new google.maps.InfoWindow;
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }

    _calculateDistance(directions) {
        let distance = 0;
        const nlegs = directions.routes[0].legs.length;
        for (let i = 0; i < nlegs; i++) {
            distance += directions.routes[0].legs[i].distance.value;
        }
        return distance;
    }

    _calculateDuration(directions) {
        let duration = 0;
        const nlegs = directions.routes[0].legs.length;
        for (let i = 0; i < nlegs; i++) {
            duration += directions.routes[0].legs[i].duration.value;
        }
        return duration;
    }

    _updateItineraryValues(directions) {
        const nlegs = directions.routes[0].legs.length;

        this._startLocation = directions.routes[0].legs[0].start_location;
        this._endLocation = directions.routes[0].legs[nlegs-1].end_location;
        const startAddress = directions.routes[0].legs[0].start_address;
        const endAddress = directions.routes[0].legs[nlegs-1].end_address;

        const distance = this._calculateDistance(directions);
        const duration = this._calculateDuration(directions);

        ORG.dispatcher.dispatch({
            actionType: 'itinerary-changed',
            distance: distance,
            duration: duration,
            start_address: startAddress,
            end_address: endAddress,
            start_location: this._startLocation,
            end_location: this._endLocation,
        });
    }
}
/**
 * Created by jongabilondo on 11/12/2016.
 */


/**
 * Class that represents a connected device. Holds device's basic information.
 */
class ORGDevice {

    constructor( deviceInfo ) {
        this.name = deviceInfo.name;
        this.model = deviceInfo.model;
        this.systemVersion = deviceInfo.systemVersion;
        this.productName = deviceInfo.productName;
        this.screenSize = deviceInfo.screenSize;
        this._orientation = deviceInfo.orientation;
        this._bodySize = this._bodySizeOfModel();
        this._displaySize = this._displaySizeOfModel();
    }

    static screenSizeInPortrait(size) {
        if (size.width > size.height) {
            return {width: size.height, height: size.width};
        } else {
            return size;
        }
    }

    set orientation(orientation) {
        this._orientation = orientation;
    }
    get orientation() {
        return this._orientation;
    }
    get isLikeiPhone5() {
        return this.productName.startsWith('iPhone 5');
    }
    get isLikeiPhone6() {
        return this.productName == 'iPhone 6' || this.productName == 'iPhone 7' || this.productName == 'iPhone 8';
    }
    get isLikeiPhone6Plus() {
        return this.productName == 'iPhone 6+' || this.productName == 'iPhone 7+' || this.productName == 'iPhone 8+';
    }
    get isLikeiPhoneX() {
        return this.productName == 'iPhone X';
    }

    /**
     * Get device physical size. Gets the values from ORG.DeviceMetrics global.
     * @returns {{width: *, height: *}} in meters.
     */
    get bodySize() {
        return Object.assign({}, this._bodySize);
    }

    /***
     * Returns the size considering the orientation. If landascape, it will swap the portrait mode width and height.
     * @returns {size}
     */
    get screenSizeWithOrientation() {
        var screenSize = Object.assign({}, this.screenSize);
        switch (this._orientation) {
            case ORGDevice.ORIENTATION_LANDSCAPE_LEFT:
            case ORGDevice.ORIENTATION_LANDSCAPE_RIGHT: {
                screenSize = { width: screenSize.height, height: screenSize.width};
            } break;
        }
        return screenSize;
    }

    /***
     * Return the rotation in Z axis for the current orientation.
     * @returns {number}
     */
    get orientationRotation() {
        var rotation = 0;
        switch (this._orientation) {
            case ORGDevice.ORIENTATION_PORTRAIT: {
            } break;
            case ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN: {
                rotation = THREE.Math.degToRad(180);
            } break;
            case ORGDevice.ORIENTATION_LANDSCAPE_RIGHT: {
                rotation = THREE.Math.degToRad(-90);
            } break;
            case ORGDevice.ORIENTATION_LANDSCAPE_LEFT:
                rotation = THREE.Math.degToRad(90);
            break;
        }
        return rotation;
    }


    /**
     * Get displays' physical size. Gets the values from ORG.DeviceMetrics global.
     * @returns {{width, height}|*} in meters.
     */
    get displaySize() {
        return Object.assign({}, this._displaySize);
    }

    /***
     * Returns the size considering the orientation. If landascape, it will swap the portrait mode width and height.
     * @returns {size}
     */
    get displaySizeWithOrientation() {
        var displaySize = Object.assign({}, this._displaySize);
        switch (this._orientation) {
            case ORGDevice.ORIENTATION_LANDSCAPE_LEFT:
            case ORGDevice.ORIENTATION_LANDSCAPE_RIGHT: {
                displaySize = { width: displaySize.height, height: displaySize.width};
            } break;
        }
        return displaySize;
    }

    /**
     * Scale from screen points to real device units. Considers orientation.
     * @returns {{x: number, y: number}}
     */
    get displayScale() {
        const displaySize = this.displaySizeWithOrientation;
        const screenSize = this.screenSizeWithOrientation;
        return {x:displaySize.width/screenSize.width, y:displaySize.height/screenSize.height};
    }

    // PRIVATE

    _bodySizeOfModel() {
        var body = null;
        if (this.isLikeiPhone5) {
            body = ORG.DeviceMetrics.iPhone5.Body;
        } else if (this.isLikeiPhone6) {
            body = ORG.DeviceMetrics.iPhone6.Body;
        } else if (this.isLikeiPhone6Plus) {
            body = ORG.DeviceMetrics.iPhone6Plus.Body;
        } else if (this.isLikeiPhoneX) {
            body = ORG.DeviceMetrics.iPhoneX.Body;
        } else {
            body = ORG.DeviceMetrics.iPhone6.Body;
        }
        return {"width": math.unit( body.W ).toNumber('m'), "height": math.unit( body.H ).toNumber('m')};
    }

    _displaySizeOfModel() {
        var display = null;
        if (this.isLikeiPhone5) {
            display = ORG.DeviceMetrics.iPhone5.Display;
        } else if (this.isLikeiPhone6) {
            display = ORG.DeviceMetrics.iPhone6.Display;
        } else if (this.isLikeiPhone6Plus) {
            display = ORG.DeviceMetrics.iPhone6Plus.Display;
        } else if (this.isLikeiPhoneX) {
            display = ORG.DeviceMetrics.iPhoneX.Display;
        } else {
            display = ORG.DeviceMetrics.iPhone6.Display;
        }
        return this._calculateDisplaySize( math.unit( display.Diagonal).toNumber('m'), display.Ratio );
    }

    _calculateDisplaySize( diagonal, ratio ) {
        const w = Math.sqrt( Math.pow( diagonal, 2) / (1.0 +  Math.pow( ratio, 2)));
        const h = w * ratio;
        return { width:w, height:h };
    }
}

ORGDevice.ORIENTATION_PORTRAIT = "portrait";
ORGDevice.ORIENTATION_LANDSCAPE_LEFT = "landscape-left";
ORGDevice.ORIENTATION_LANDSCAPE_RIGHT = "landscape-right";
ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN = "upside-down";
ORGDevice.ORIENTATION_FACE_UP = "face-up";
ORGDevice.ORIENTATION_FACE_DOWN = "face-down";

/**
 * Created by jongabilondo on 22/09/2017.
 */

/**
 * Represents a beacon.
 */
class ORGBeacon {

    /**
     * Constructor
     * @param name - Name for the beacon
     * @param range - Range in meters
     * @param location - X,Y,Z in meters.
     */
    constructor(name, range, location) {
        this._name = name;
        this._range = range;
        this._minor = 0;
        this._major = 0;
        this._location = location;
        this._geoLocation = null;
    }

    get name() { return this._name;};
    get range() { return this._range;};
    get location() { return this._location;};
    get minor() { return this._minor;};
    get major() { return this._major;};

    set location(loc) { this._location = loc;};

    intersectsPoint(point) {
        const dist = this._dist(point.x, point.y, point.z, this._location.x, this._location.y, this._location.z);
        return (dist < this._range);
    }

    // PRIVATE

    _dist(x0,y0,z0,x1,y1,z1){
        const deltaX = x1 - x0;
        const deltaY = y1 - y0;
        const deltaZ = z1 - z0;

        return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    }

}
/**
 * Created by jongabilondo on 24/09/2017.
 */


/**
 * Class to wrap the functionality of THREE.TransformControls on a beacon.
 */
class ORG3DBeaconTransformControl {

    /**
     * Constructor
     * @param scene - the ORG3DScene
     * @param mode - should be "translate"
     * @param THREEBeacon - the THREE obj that represents the beacon to enable THREE.TransformControls onto.
     */
    constructor(scene, mode, THREEBeacon) {
        const _this = this;
        this._scene = scene;
        this._THREEScene = scene.THREEScene;

        this._THREETransformControl = new THREE.TransformControls( scene.THREECamera, scene.rendererDOMElement);
        this._THREETransformControl.setMode( mode );
        this._THREETransformControl.addEventListener( 'change', function() {
            _this._transformControlChanged();
        } );

        // add it all to the scene
        this._THREETransformControl.attach( THREEBeacon );
        this._THREEScene.add( this._THREETransformControl );
    }

    /**
     * Call this method to destroy the transform control.
     */
    destroy() {
        if (this._THREETransformControl) {
            this._THREETransformControl.detach();
            this._THREETransformControl = null;
            this._THREEScene.remove( this._THREETransformControl );
        }
    }

    /**
     * Updates the proportions of the transform control according to camera position.
     * To be called from render loop.
     */
    update() {
        this._THREETransformControl.update();
    }

    // PRIVATE

    /**
     * When the transformation control has changed we get a call here.
     * Beacons can only be translated.
     * @private
     */
    _transformControlChanged() {
        if (this._THREETransformControl) {
            const THREETransformedObject = this._THREETransformControl.object;
            if (THREETransformedObject) {
                if (this._THREETransformControl.getMode() == "translate") {
                    // handle beacons intersection
                    //ORG.scenario.devicePointUpdate(THREETransformedObject.position);
                }
            }
        }
    }
}
/**
 * Created by jongabilondo on 24/09/2017.
 */


/**
 * Class to wrap the functionality of THREE.TransformControls on the 3D device.
 */
class ORG3DDeviceTransformControl {

    /**
     * Constructor
     * @param scene - The ORG3DScene
     * @param mode - "translate" | "rotate"
     */
    constructor(scene, mode) {
        const _this = this;
        this._scene = scene;
        this._THREEScene = scene.THREEScene;

        this._THREETransformControl = new THREE.TransformControls( scene.THREECamera, scene.rendererDOMElement);
        this._THREETransformControl.setMode( mode );
        this._THREETransformControl.setSpace( 'local' );
        this._THREETransformControl.addEventListener( 'change', function() {
            _this._transformControlChanged();
        } );

        // add it all to the scene
        this._THREETransformControl.attach( this._scene.THREEDeviceAndScreenGroup );
        this._THREEScene.add( this._THREETransformControl );
    }

    /**
     * Call this method to destroy the transform control.
     */
    destroy() {

        //var screenPosition = this._scene.deviceScreen.screenPlane.position;
        //var devicePosition = this._scene.device3DModel.THREEObject.position;
        //var quaternion = this._scene.deviceScreen.screenPlane.quaternion;

        if (this._THREETransformControl) {
            this._THREETransformControl.detach();
            this._THREETransformControl = null;
            this._THREEScene.remove(this._THREETransformControl);
        }
    }

    /**
     * Updates the proportions of the transform control according to camera position.
     * To be called from render loop.
     */
    update() {
        this._THREETransformControl.update();
    }

    // PRIVATE

    /**
     * When the transformation control has changed we get a call here.
     * In case of rotation this function will broadcast the new device attitude to the connected device.
     * @private
     */
    _transformControlChanged() {
        if (this._THREETransformControl) {
            const THREETransformedObject = this._THREETransformControl.object;
            if (THREETransformedObject) {
                    if (this._THREETransformControl.getMode() == "rotate") {

                        // Broadcast Attitude
                        if (ORG.deviceController) {
                            const msg = ORGMessageBuilder.attitudeUpdate(THREETransformedObject.quaternion);
                            ORG.deviceController.sendMessage(msg);
                        }

                    } else if (this._THREETransformControl.getMode() == "translate") {
                        // handle beacons intersection
                        ORG.scenario.devicePointUpdate(THREETransformedObject.position);
                    }
            }
        }
    }
}
/**
 * Created by jongabilondo on 13/12/2016.
 */


function ORGTestApp( appInfo ) {

    this.version = null;
    this.bundleIdentifier = null;
    this.name = null;

    if ( appInfo ) {
        this.name = appInfo.name;
        this.version = appInfo.version;
        this.bundleIdentifier = appInfo.bundleIdentifier;
    }
}

ORG.testApp = null;

/**
 * Created by jongabilondo on 26/02/2017.
 */

/**
 * Base class to communicate with mobile devices via web sockets/REST.
 * Provides the base virtual functions for subclasses to implement.
 * It's not a class to be used directly, but to inherit from it.
 */
class ORGDeviceBaseController {

    constructor(ip, port) {
        this._ip = ip;
        this._port = port;
    }
    get type() {
        _throwError();
    }
    get isConnected() {
        _throwError();
    }
    get IPandPort() {
        return this._ip + ":" + this._port;
    }
    get hasContinuousUpdate() {
        return false;
    }

    openSession() {
        this._throwError();
    }
    closeSession() {
        this._throwError();
    }
    screenshot() {
        this._throwError();
    }
    elementTree() {
        this._throwError();
    }
    refreshUITree() {
        this._throwError();
    }
    _throwError() {
        throw new Error("Executing base class method. Subclass must implement this method.");
    }
}
/**
 * Created by jongabilondo on 26/02/2017.
 */

/**
 * Base class to communicate with mobile devices via web sockets.
 */
class ORGWebSocketDeviceController extends ORGDeviceBaseController {

    /**
     * Constructor
     * @param ip
     * @param port
     * @param webSocket delegate
     */
    constructor(ip, port, delegate) {
        super(ip,port);
        this.session = null;
        this.webSocketDelegate = delegate;
        this._webSocket = null;// ORGWebSocket();
    }

    get isConnected() {
        return this._webSocket.isConnected
    }

    get hasContinuousUpdate() {
        return false;
    }

    closeSession() {
        this._webSocket.close();
    }

    sendRequest(request) {
        this._webSocket.send(request);
    }

    sendMessage(message) {
        this._webSocket.send(message);
    }
}
/**
 * Created by jongabilondo on 26/02/2017.
 */

/**
 * Class to perform the communication with an external device using the Organismo protocol.
 * It performs the Organismo commands on a mobile device.
 * It uses websockets (ORGWebSocket).
 */
class ORGDeviceController extends ORGWebSocketDeviceController {

    constructor(ip, port, delegate) {
        super(ip, port, delegate);
        this._webSocket = new ORGWebSocket();
        this._secondWebSocket = new ORGWebSocket();
    }

    get type() {
        return "ORG";
    }
    get hasContinuousUpdate() {
        return true;
    }

    openSession() {
        return new Promise( async (resolve, reject) => {
            try {
                this._webSocket = await this._openMainSocket();
                this._secondWebSocket = await this._openSecondSocket();
                this._secondWebSocket.processMessagesWithDelegate(this.webSocketDelegate); // To work in a full duplex way.
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    }

   /* requestDeviceInfo() {
        this.webSocket.send(ORGMessageBuilder.deviceInfo())
    }

    requestAppInfo() {
        this.webSocket.send(ORGMessageBuilder.appInfo())
    }*/

    requestScreenshot() {
        this._secondWebSocket.send(ORGMessageBuilder.takeScreenshot())
    }

    //requestElementTree(parameters) {
    //    this.sendRequest(ORGMessageBuilder.elementTree(parameters))
    //}

    requestSystemInfo() {
        this.sendRequest(ORGMessageBuilder.systemInfo( ))
    }

    sendLocationUpdate(lat, lng) {
        this.sendRequest(ORGMessageBuilder.locationUpdate( new google.maps.LatLng(lat, lng), null))
    }

    /*async refreshUITree() {

        bootbox.dialog({ message: '<div class="text-center"><h5><i class="fa fa-spin fa-spinner"></i>&nbsp;Getting device information...</h5></div>' });

        const requestFlags = { "status-bar": true, "keyboard": true, "alert": true, "normal": true }
        try {
            let elementTree = await this.getElementTree(requestFlags);
            ORG.UIJSONTreeManager.update(elementTree, ORGUIJSONTreeManager.TREE_TYPE_ORGANISMO);
            if (ORG.scene.expanding || ORG.scene.isExpanded) {
                ORG.scene.updateUITreeModel(elementTree);
            }
            bootbox.hideAll();
        } catch (err) {
            console.debug("Error getting ui tree.");
            bootbox.hideAll();
        }
    }*/

    getDeviceOrientation() {
        return new Promise(async (resolve, reject) => {
            resolve(ORG.device.orientation);
        })
    }

    getDeviceInformation() {
        return new Promise( async (resolve, reject) => {
            try {
                let response = await this._webSocket.sendAsync(ORGMessageBuilder.deviceInfo());
                const device = new ORGDevice(this._convertDeviceInfo(response.data));
                resolve(device);
            } catch (err) {
                reject(err)
            }
        })
    }

    getAppInformation() {
        return new Promise( async (resolve, reject) => {
            try {
                let response = await this._webSocket.sendAsync(ORGMessageBuilder.appInfo());
                const appInfo = new ORGTestApp(response.data);
                resolve(appInfo);
            } catch (err) {
                reject(err)
            }
        })
    }

    getScreenshot() {
        return new Promise( async (resolve, reject) => {
            try {
                let response = await this._webSocket.sendAsync(ORGMessageBuilder.takeScreenshot());
                let base64Img = response.data.screenshot;
                if (base64Img) {
                    let img = new Image();
                    img.src = "data:image/jpg;base64," + base64Img;
                    img.onload = () => {
                        resolve(img);
                    }
                } else {
                    reject("Missing image in screenshot.");
                }
            } catch (err) {
                reject(err)
            }
        })
    }

    getElementTree(parameters) {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await this._webSocket.sendAsync(ORGMessageBuilder.elementTree(parameters))
                resolve(response)
            } catch (err) {
                reject(err)
            }
        })
    }

    _openMainSocket() {
        return new Promise( async (resolve, reject) => {
            try {
                this._webSocket = new ORGWebSocket();
                const url = "ws://" + this.IPandPort + "/main";
                let openResult = await this._webSocket.open(url);
                if (!!openResult) {
                    resolve(this._webSocket)
                } else {
                    reject()
                }
            } catch (err) {
                reject(err)
            }
        })
    }

    _openSecondSocket() {
        return new Promise( async (resolve, reject) => {
            try {
                this._secondWebSocket = new ORGWebSocket();
                const url = "ws://" + this.IPandPort + "/second";
                let openResult = await this._secondWebSocket.open(url, this.webSocketDelegate);
                if (!!openResult) {
                    resolve(this._secondWebSocket)
                } else {
                    reject()
                }
            } catch (err) {
                reject(err)
            }
        })
    }

    _convertDeviceInfo(data) {
        let deviceInfo = {}
        deviceInfo.name = data.name;
        deviceInfo.model = data.model;
        deviceInfo.systemVersion = data.systemVersion;
        deviceInfo.productName = data.productName;
        deviceInfo.screenSize = data.screenSize;
        deviceInfo.orientation = this._convertOrientation(data.orientation);
        return deviceInfo;
    }

    _convertOrientation(iOSOrientation) {
        let orientation
        switch(iOSOrientation) {
            case "UIDeviceOrientationPortrait": orientation = ORGDevice.ORIENTATION_PORTRAIT; break;
            case "UIDeviceOrientationPortraitUpsideDown": orientation = ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN; break;
            case "UIDeviceOrientationLandscapeRight": orientation = ORGDevice.ORIENTATION_LANDSCAPE_RIGHT; break;
            case "UIDeviceOrientationLandscapeLeft": orientation = ORGDevice.ORIENTATION_LANDSCAPE_LEFT; break;
            case "UIDeviceOrientationFaceUp": orientation = ORGDevice.ORIENTATION_FACE_UP; break;
            case "UIDeviceOrientationFaceDown": orientation = ORGDevice.ORIENTATION_FACE_DOWN; break;
        }
        return orientation;
    }
}
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
        return (this._sessionInfo !== null);
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
                if (this.xhr.status === 200) {
                    const response = JSON.parse(this.xhr.responseText);
                    if (response.status === 0) {
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
                if (this.xhr.readyState === 4 && this.xhr.status === 0) {
                    reject(new ORGError(ORGERR.ERR_CONNECTION_REFUSED, "Error opening session."));
                }
            }
            this.xhr.send(JSON.stringify({desiredCapabilities:{bundleId:'com.apple.mobilephone'}}));
        })
    }

    closeSession() {
        ORG.dispatcher.dispatch({
            actionType: 'wda-session-closed'
        });

       /* DOESNT WORK !
       const endpointURL = this.RESTPrefix + "";
        this.xhr.open("DELETE", endpointURL, true);
        this.xhr.onreadystatechange = () => {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                this._sessionInfo = null;
            }
        }
        this.xhr.send();*/
    }

    /*async refreshUITree() {
        bootbox.dialog({ message: '<div class="text-center"><h5><i class="fa fa-spin fa-spinner"></i>&nbsp;Getting device information...</h5></div>' });

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
    }*/

    getDeviceInformation() {
        return new Promise((resolve, reject) => {

            // Get orientation
            this.getDeviceOrientation().then(
                (result) => {
                    const orientaton = result;

                    // Get device screen size.
                    this.getWindowSize().then(
                        (result) => {
                            const screenSizePortrait = ORGDevice.screenSizeInPortrait(result);
                            let device = this._deviceInfoFromWindowSize(screenSizePortrait);
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
        })
    }

    getAppInformation() {
        return new Promise((resolve, reject) => {
            resolve(new ORGTestApp( {name: "", version: "", bundleIdentifier: ""} ));
        });
    }

    getDeviceOrientation() {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this._sendCommand(this.RESTPrefixWithSession + "orientation", "GET");
                let orientation = ORGDevice.ORIENTATION_PORTRAIT;
                switch (result) {
                    case "PORTRAIT": break;
                    case "LANDSCAPE": orientation = ORGDevice.ORIENTATION_LANDSCAPE_LEFT; break;
                    case "UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT": orientation = ORGDevice.ORIENTATION_LANDSCAPE_RIGHT; break;
                    case "UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN": orientation = ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN; break;
                }
                resolve(orientation);
            } catch (err) {
                reject(err);
            }
        })
    }

    getScreenshot() {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this._sendCommand(this.RESTPrefix + "screenshot", "GET");
                const base64Img = result;
                if (base64Img && Object.keys(base64Img).length) {
                    let img = new Image();
                    img.src = "data:image/jpg;base64," + base64Img;
                    img.onload = () => {
                        resolve(img);
                    }
                } else {
                    reject(new ORGError(ORGERR.ERR_GENERAL, "Could not get screenshot."));
                }
            } catch (err) {
                reject(err);
            }
        })
    }

    getElementTree() {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this._sendCommand(this.RESTPrefix + "source?format=json", "GET");
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    }

    getWindowSize() {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this._sendCommand(this.RESTPrefixWithSession + "window/size", "GET");
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    }

    sendPressHome() {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this._sendCommand(this.RESTPrefix + "wda/homescreen", "POST");
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    }

    sendLock() {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this._sendCommand(this.RESTPrefix + "wda/lock", "POST");
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    }

    sendUnlock() {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this._sendCommand(this.RESTPrefix + "wda/unlock", "POST");
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    }

    elementUsing(using, value) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this._sendCommand(this.RESTPrefixWithSession + "element", "POST", JSON.stringify({using: using, value: value}));
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    }

    tapElementWithId(elementId) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this._sendCommand(this.RESTPrefixWithSession + "element/" + elementId + "/click", "POST");
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    }

    longPressElementWithId(elementId) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this._sendCommand(this.RESTPrefixWithSession + "wda/element/" + elementId + "/touchAndHold", "POST", JSON.stringify({duration: 1.0}));
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    }

    swipeElementWithId(elementId, direction) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this._sendCommand(this.RESTPrefixWithSession + "wda/element/" + elementId + "/swipe", "POST", JSON.stringify({direction: direction}));
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    }

    setOrientation(orientation) {
        return new Promise(async (resolve, reject) => {
            try {
                let wdaOrientation = "PORTRAIT";
                switch (orientation) {
                    case ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN: {wdaOrientation = "UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN"} break;
                    case ORGDevice.ORIENTATION_LANDSCAPE_LEFT: {wdaOrientation = "LANDSCAPE"} break;
                    case ORGDevice.ORIENTATION_LANDSCAPE_RIGHT: {wdaOrientation = "UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT"} break;
                }
                let result = await this._sendCommand(this.RESTPrefixWithSession + "orientation" , "POST", JSON.stringify({orientation: wdaOrientation}));
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    }

    getSystemInfo() {
        // not implemented
    }

    sendLocationUpdate(lat, lng) {
        // not implemented
    }
    _sendCommand(command, method, parameters) {
        return new Promise((resolve, reject) => {
            this.xhr.open(method, command, true);
            this.xhr.onload = () => {
                let response = JSON.parse(this.xhr.responseText);
                if (response.status === 0) {
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
            this.xhr.onreadystatechange = () => {
                // Solution to get connection errors. Pitty there is no proper way to something so important.
                if (this.xhr.readyState === 4 && this.xhr.status === 0) {
                    reject(new ORGError(ORGERR.ERR_CONNECTION_REFUSED, "Error requesting orientation."));
                }
            }
            this.xhr.send(!!parameters ?parameters :null);
        })
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
/**
 * Created by jongabilondo on 26/02/2017.
 */

/**
 * Class to communicate with mobile devices using idevicecontrolproxy server.
 */
class ORGiMobileDeviceController extends ORGWebSocketDeviceController {

    //constructor(ip, port, delegate) {
    //    super(ip,port,delegate);
    //    //this.webSocketDelegate = new ORGiControlProxyWSDelegate();
    //}

    get type() {
        return "iDeviceControlProxy";
    }

    requestDeviceInfo() {
        this.webSocket.send( "{ \"cmd\" : \"ideviceinfo\" }");
    }

    requestAppInfo() {
    }

    requestScreenshot() {
        this.webSocket.send( "{ \"cmd\" : \"idevicescreenshot\" }");
    }

    requestElementTree( parameters ) {
    }

    sendLocationUpdate( lat, lng) {
        this.webSocket.send( "{ \"cmd\" : \"idevicelocation\" , \"args\" : \"-- " + lat + " " + lng + "\"}");
    }

}
/**
 * Created by jongabilondo on 22/03/2017.
 */


const kORGFloorLabelFontSize = 20;
const kORGArrowOffset = 10;
const kORGArrowToTextOffset = 5;
const kORGFloorLabelHeight = 5;

/**
 * Class to represent the floor the THREE scene model.
 */
class ORG3DSceneFloor {

    constructor( size, step, showAxis, THREEScene, defaultYPos) {

        this._THREEScene = THREEScene;
        this._yPos = defaultYPos;

        if ( showAxis ) {
            this._THREEAxis = new THREE.AxisHelper(10);
            this._THREEAxis.position.set(-size/2, this._yPos,-size/2);
            this._THREEScene.add(this._THREEAxis);
        }

        this._THREEFloor = new THREE.GridHelper(size, step, new THREE.Color(0x666666), new THREE.Color(0x666666));
        this._THREEFloor.position.set( 0, this._yPos, 0 );
        this._THREEScene.add(this._THREEFloor);

        this._createXArrow(size);
        this._createXLabel(size);
    }

    get position() {
        return this._THREEFloor.position;
    }

    remove() {
        if (this._THREEFloor) {
            this._THREEScene.remove(this._THREEFloor);
            this._THREEFloor = null;
        }

        if (this._THREEAxis) {
            this._THREEScene.remove(this._THREEAxis);
            this._THREEAxis = null;
        }
    }

    setPosition( x, y, z) {
        if (this._THREEFloor) {
            this._THREEFloor.position.setY(y);
        }
        if (this._THREEAxis) {
            this._THREEAxis.position.setY(y);
        }
    }

    // PRIVATE

    _createXArrow( floorSize ) {
        const zOffset = kORGArrowOffset;
        const origin = new THREE.Vector3( -floorSize/2, 0, floorSize/2 + zOffset);
        const length = floorSize;
        const color = 0xffff00;
        var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), origin, length, color, length*0.03 );
        arrowHelper.position.setY(this._yPos);
        this._THREEScene.add( arrowHelper );
    }

    _createXLabel( floorSize ) {

        const addressGeom = new THREE.TextGeometry( floorSize.toString() + " m", {
            font: ORG.font_helvetiker_regular,
            size: kORGFloorLabelFontSize,
            height: kORGFloorLabelHeight,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: kORGFloorLabelHeight / 5.0,
            bevelSize: kORGFloorLabelHeight / 5.0,
            bevelSegments: 5
        });

        const material = new THREE.MeshPhongMaterial({color: 0xeeeeee});
        var textMesh = new THREE.Mesh(addressGeom, material);
        textMesh.position.set( 0, 0, 0 );
        textMesh.rotation.set( THREE.Math.degToRad( -90 ), 0, 0 );
        textMesh.updateMatrix();
        textMesh.geometry.computeBoundingBox();
        const centerPoint = textMesh.geometry.boundingBox.getCenter();
        textMesh.position.set( -centerPoint.x, this._yPos, floorSize/2 + kORGFloorLabelFontSize + kORGArrowOffset + kORGArrowToTextOffset );

        this._THREEScene.add( textMesh );
    }
}
/**
 * Created by jongabilondo on 22/03/2017.
 */

/**
 * Utilities class to load and show THREE models of different devices.
 */
class ORG3DDeviceModelLoader {

    /**
     * Asynchronous load of a 3D model object for the corresponding device.
     * When load is finished it will call to the organismo scene to add the model to the three.js scene.
     * @param scene the ORG.scene to add the 3D model to.
     */
    static loadDevice3DModel(device, scene, yPosition) {
        return new Promise((resolve, reject) => {
            if (device.productName.startsWith('iPhone 5')) {
                this._load_iPhone_5(scene,device).then(
                    function(result) {
                        resolve(result);
                    },
                    function(error) {
                        reject(error);
                    });
            } else { //if ( device.productName.startsWith('iPhone 6')) {
                this._load_iPhone_6(scene,device).then(
                    function(result) {
                        resolve(result);
                    },
                    function(error) {
                        reject(error);
                    });
            }
        });
    }

// PRIVATE

    static _load_iPhone_5(scene, device) {
        return new Promise((resolve, reject) => {
            let mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath('3DModels/iPhone_5/');
            mtlLoader.load('iPhone_5.mtl',
                (materials) => {
                    materials.preload();

                    var objLoader = new THREE.OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.setPath( '3DModels/iPhone_5/' );
                    objLoader.load( "iPhone_5.obj",
                        (object) => {
                            // model loaded, scale and translate
                            var deviceBox =  new THREE.Box3().setFromObject(object);
                            const scale = device.bodySize.height / deviceBox.getSize().y;
                            object.scale.set( scale, scale, scale );
                            deviceBox =  new THREE.Box3().setFromObject(object);
                            object.position.set( 0, - deviceBox.getSize().y/2.0, - ((deviceBox.getSize().z/2.0) + 0.0005) ); // Place device 0.5mm behind the screen
                            var deviceModel = new ORG3DDeviceModel(scene.THREEScene, object)
                            resolve(deviceModel);
                        },
                        null, //on progress
                        (error) => {
                            reject(error);
                        }
                    );
                },
                null, // on progress
                (error) => {
                    reject(error);
                });
        });
    }

    static _load_iPhone_6(scene, device) {
        return new Promise((resolve, reject) => {
            let mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath('3DModels/iPhone_6/');
            mtlLoader.load('iPhone_6.mtl',
                (materials) => {
                    materials.preload();

                    var objLoader = new THREE.OBJLoader();
                    objLoader.setPath('3DModels/iPhone_6/');
                    objLoader.setMaterials(materials);
                    objLoader.load("iPhone_6.obj",
                        (object) => {
                            // model loaded, scale and translate
                            var deviceBox =  new THREE.Box3().setFromObject(object);
                            const scale = device.bodySize.height / deviceBox.getSize().y;
                            object.scale.set(scale, scale, scale);
                            deviceBox =  new THREE.Box3().setFromObject(object);
                            object.position.set(0, - deviceBox.getSize().y/2.0, - ((deviceBox.getSize().z/2.0) + 0.0005) ); // Place device 0.5mm behind the screen
                            var deviceModel = new ORG3DDeviceModel(scene.THREEScene, object)
                            resolve(deviceModel);
                        },
                        null, /*on progress*/
                        (error) => {
                            reject(error);
                        }
                    );
                },
                null, // on progress
                (error) => {
                    reject(error);
                })
        })
    }
}

/**
 * Created by jongabilondo on 22/03/2017.
 */


/**
 * Class to keep the THREE model of the device and to wrap the actions on it.
 * It contains only the body of the device, not the display.
 */
class ORG3DDeviceModel {

    /**
     * Constructor
     * @param threeObj - A THREE.Group representing the Device.
     */
    constructor( scene, threeObj ) {
        this.threeObj = threeObj; // It is a THREE.Group. Don't have geometry to compute bbox.
        this.threeScene = scene;
    }


    /**
     * Removes the object from the 3D scene and disposes the object.
     */
    destroy() {
        this.removeFromScene();
        this.threeObj = null;
    }

    get THREEObject() {
        return this.threeObj;
    }

    removeFromScene() {
        if (this.threeScene && this.threeObj) {
            this.threeScene.remove( this.threeObj);
        }
    }

    setOrientation( orientation ) {
        if (!this.threeObj) {
            return;
        }

        let b = new THREE.Box3().setFromObject(this.threeObj);
        let position = b.getCenter();
        this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( -position.x, -position.y, -position.z ) );

        switch(orientation) {
            case "portrait" :
                var rotation = this.threeObj.rotation;
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ( -rotation.z ));
                break;
            case "landscapeLeft" :
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ( THREE.Math.degToRad( -90 ) ));
                break;
            case "landscapeRight" :
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ( THREE.Math.degToRad( 90 ) ));
                break;
        }
        this.threeObj.applyMatrix(new THREE.Matrix4().makeTranslation( position.x, position.y, -position.z ) );
    }

    setOrientation2(orientation) {
        if (!this.threeObj) {
            return;
        }

        let rotation = this.threeObj.rotation;
        this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ(-rotation.z));

        switch (orientation) {
            case ORGDevice.ORIENTATION_PORTRAIT: {
            } break;
            case ORGDevice.ORIENTATION_PORTRAIT_UPSIDE_DOWN: {
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(180)));
            } break;
            case ORGDevice.ORIENTATION_LANDSCAPE_RIGHT: {
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(-90)));
            } break;
            case ORGDevice.ORIENTATION_LANDSCAPE_LEFT:
                this.threeObj.applyMatrix(new THREE.Matrix4().makeRotationZ( THREE.Math.degToRad(90)));
                break;
        }
    }

    getBoundingBox() {
        return new THREE.Box3().setFromObject(this.threeObj);
    }

}
/**
 * Created by jongabilondo on 25/03/2017.
 */


/**
 * Class to create and handle the THREE object of the device screen.
 */
class ORG3DDeviceScreen {

    constructor(width, height, yPosition, zPosition, threeScene) {
        this._removeHighlight = false;
        this._nextHighlightPlane = null;
        this._currentHighlightPlane = null;
        this._threeScreenPlane = null;
        this._nextScreenshotImage = null;

        this._deviceScreenSize = { width:width, height:height};
        this._THREEScene = threeScene;

        var geometry = new THREE.PlaneBufferGeometry(width, height, 1, 1);
        geometry.dynamic = true;
        var material = new THREE.MeshBasicMaterial({ map : null , color: 0xffffff, side: THREE.DoubleSide});
        this._threeScreenPlane = new THREE.Mesh(geometry, material );
        this._threeScreenPlane.position.set(0 , yPosition, zPosition );
        this._threeScreenPlane.name = "screen";
        threeScene.add( this._threeScreenPlane );
        this._threeScreenPlane.geometry.computeBoundingBox ();
    }

    destroy() {
        if (!this._THREEScene) {
            return;
        }
        if (this._threeScreenPlane) {
            this._THREEScene.remove(this._threeScreenPlane);
        }
        if (this._currentHighlightPlane) {
            this._THREEScene.remove(this._currentHighlightPlane);
        }
        this._threeScreenPlane = null;
        this._nextHighlightPlane = null;
        this._currentHighlightPlane = null;
    }

    get screenPlane() {
        return this._threeScreenPlane;
    }

    get boundingBox() {
        return this._threeScreenPlane.geometry.boundingBox;
    }

    get screenSize() {
        return this._deviceScreenSize;
    }

    get screenPosition() {
        return this._threeScreenPlane.position; // The screen is created at 0,0 then applied a transformation matrix. This position is not the world position.
    }

    get screenWorldPosition() {
        //return this._threeScreenPlane.matrixWorld.getPosition();
        var position = this.screenPosition.clone();
        position.setFromMatrixPosition(this._threeScreenPlane.matrixWorld);
        return position;
    }

    set nextScreenshotImage(image) {
        this._nextScreenshotImage = image;
    }

    set rotationZ(degrees) {
        this._threeScreenPlane.rotation.set(0,0,degrees);
    }


    hide() {
        if (this._threeScreenPlane) {
            this._threeScreenPlane.visible = false;
        }
    }

    show() {
        if (this._threeScreenPlane) {
            this._threeScreenPlane.visible = true;
        }
    }

    setScreenshot(image) {
        var screenshotTexture = new THREE.Texture( image );
        screenshotTexture.minFilter = THREE.NearestFilter;
        var thisScreen = this;
        // the image should be loaded by now
        //image.onload = function () {
            screenshotTexture.needsUpdate = true;
            thisScreen._threeScreenPlane.material.map = screenshotTexture;
            thisScreen._threeScreenPlane.material.needsUpdate = true;
            thisScreen._threeScreenPlane.needsUpdate = true;
        //};
    }

    /***
     * Create a highlight plane covering the area of the given element. It will be shown in the next renderUpdate.
     * @param element3D - A ORG3DUIElement that can be WDA/Org ...
     */
    highlightUIElement(element3D) {
        if (element3D && element3D.hasSize) {
            // Calculate element bounds in device screen in 3D world
            const kZOffsetFromScreen = 0.0005;
            const elementBox2InScreen = element3D.getBoundsInDeviceScreen(ORG.device, this);
            const elementSize = elementBox2InScreen.getSize();
            const elementBox2Center = elementBox2InScreen.getCenter();
            const position = new THREE.Vector3(elementBox2Center.x, elementBox2Center.y, this.screenPosition.z + kZOffsetFromScreen);

            // Create the plane
            this._nextHighlightPlane = this._createHighlightPlane(elementSize, position);
            this._removeHighlight = false;
        } else {
            this._removeHighlight = true;
        }
    }

    /***
     * Time to update the 3D model. Called by the render loop.
     */
    renderUpdate() {

        // update screenshot
        if (this._nextScreenshotImage) {
            this.setScreenshot(this._nextScreenshotImage);
            this._nextScreenshotImage = null;
        }

        // update highlight
        if (this._removeHighlight) {
            if (this._currentHighlightPlane) {
                this._THREEScene.remove(this._currentHighlightPlane);
            }
            this._currentHighlightPlane = null;
            this._nextHighlightPlane = null;
            this._removeHighlight = false;
        }

        if (this._nextHighlightPlane) {
            if (this._currentHighlightPlane) {
                this._THREEScene.remove(this._currentHighlightPlane);
            }
            this._THREEScene.add(this._nextHighlightPlane);
            this._currentHighlightPlane = this._nextHighlightPlane
            this._nextHighlightPlane = null;
        }
    }

    /***
     * Create a THREE plane that will be used as a highlight on top of the screen.
     * @param size. Vector2
     * @param position. Vector3
     * @returns {THREE.Mesh of plane}
     * @private
     */
    _createHighlightPlane(size, position) {
        var geometry, material, highlightPlane;
        const kOpacity = 0.5;
        const kColor = 0xee82ee; // FFC0CB FFE4E1 FB6C1 FF69B4

        geometry = new THREE.PlaneBufferGeometry( size.width, size.height, 1, 1);
        material = new THREE.MeshBasicMaterial({ map : null , color: kColor, side: THREE.DoubleSide, transparent: true, opacity: kOpacity});
        highlightPlane = new THREE.Mesh( geometry, material );
        highlightPlane.position.copy( position );

        return highlightPlane;
    }

}
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
			case ORGRequest.DeviceInfo: {
                this._processResponseDeviceInfo(messageJSON.data);
            } break;
			case ORGRequest.AppInfo: {
                this._processResponseAppInfo(messageJSON);
            } break;
			case ORGRequest.Screenshot: {
                this._processReportScreenshot(messageJSON);
            } break;
			case ORGRequest.ElementTree: {
                this._processReportElementTree(messageJSON);
            }break;
			case ORGRequest.SystemInfo: {
                this._processReportSystemInfo(messageJSON);
            } break;
            case ORGRequest.ClassHierarchy: {
                this._processResponseClassHierarchy(messageJSON);
            } break;
			default: {
				console.debug('Unknown response from Device.');
			}
		}
		/*if ( messageJSON.request == ORGRequest.DeviceInfo) {
			this._processResponseDeviceInfo(messageJSON.data);
		} else if ( messageJSON.request == ORGRequest.AppInfo) {
            this._processResponseAppInfo(messageJSON);
		} else if ( messageJSON.request == ORGRequest.Screenshot) {
            this._processReportScreenshot( messageJSON);
        } else if ( messageJSON.request == ORGRequest.ElementTree) {
            this._processReportElementTree(messageJSON);
        } else if ( messageJSON.request == ORGRequest.SystemInfo) {
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
/**
 * Created by jongabilondo on 14/08/2017.
 */


class ORGiControlProxyWSDelegate extends ORGWebSocketDelegate {

    constructor() {
        super();
    }

    /**
     * Callback for the websocket opening.
     * @param ws
     */
    onOpen(ws) {
        super.onOpen(ws);
        ORG.deviceController.requestDeviceInfo();
    };


    /**
     * Callback for when the websocket has received a message from the Device.
     * Here the message is processed.
     * @param event
     * @param ws
     */
    onMessage(event, ws) {

        var resultStr = event.data.replace(/\n/g , "\\r"); // mac sends LF in responses

        var messageJSON = JSON.parse(resultStr);
        if (messageJSON) {
            //console.log("onMessage. parse OK");
        } else {
            console.log("onMessage. parse NOT OK");
            return;
        }

        if (messageJSON.status == 'success') {
            this._processResponse(messageJSON);
        } else {
            console.log("onMessage. cmd response failure. cmd:" + messageJSON.cmd);
        }
    };

    /**
     * Method to process a response to a cmd, arrived from the Device.
     * @param messageJSON
     */
    _processResponse(messageJSON) {
        switch (messageJSON.cmd) {
            case "ideviceinfo": {
                const deviceInfo = this._deviceInfoFromResponse(messageJSON.response);//{"name" : "name", "model":"model", "systemVersion" : "sv", "productName" : "iPhone 5", "screenSize" : {"height":568, "width":320}};
                this._processResponseDeviceInfo(deviceInfo); // super
            } break;
            case "idevicescreenshot" : {
                this._processReportScreenshot({"data":{"screenshot":messageJSON.response}});

            }
        }
    }

    _deviceInfoFromResponse(reponse) {

        var name;
        var version;
        var matches = /DeviceName: (.*)(\r)(.*)/.exec(reponse);
        if (matches && matches.length >= 2) {
            name = matches[1];
        }
        matches = /ProductVersion: (.*)(\r)(.*)/.exec(reponse);
        if (matches && matches.length >= 2) {
            version = matches[1];
        }

        return {"name" : name, "model":"model", "systemVersion" : version, "productName" : "iPhone 5", "screenSize" : {"height":568, "width":320}};

    }
}
/**
 * Created by jongabilondo on 15/08/2017.
 */


class ORGOrganismoWSDelegate extends ORGWebSocketDelegate {

    constructor() {
        super();
    }

    /**
     * Callback for the websocket opening.
     * @param ws
     */
    onOpen(ws) {
        super.onOpen(ws);
        ORG.deviceController.requestDeviceInfo();
        ORG.deviceController.requestAppInfo();
    };


}
/**
 * Created by jongabilondo on 6/21/15.
 */

/**
 * Class to detect the THREE object of the expanded UI tree the mouse is on.
 * It calls its delegates to inform the THREE obj the mouse is onto.
 * If the mouse is not over any obj it passes a null.
 * The Delegate must implement mouseOverElement.
 *
 * This class itself it's a delegate for ORGMouseListener.
 * It implements onMouseDown, onMouseUp, onMouseMove to receive the mouse events from ORGMouseListener.
 * @constructor
 */
class ORG3DUITreeRaycaster {

    constructor( rendererDomElement, THREECamera, THREETargetObject ) {
        this._raycaster = new THREE.Raycaster();
        this._raycaster.linePrecision = 0.0001;
        this._rcmouse = new THREE.Vector2();
        this._THREETargetObject = THREETargetObject; // The threejs object to raycast on.
        this._THREECamera = THREECamera;
        this._rendererDomElement = rendererDomElement;
        this._listeners = [];
        this._hilitedObj = null;
        this._isMouseDown = false; // It will help us to ignore the mouse moves while mouse down.
        this._enabled = true;
    }

    addDelegate( delegate ) {
        this._listeners.push( delegate );
    }

    removeDelegate( delegate ) {
        for (let i=0; i<this._listeners.length; i++) {
            if ( this._listeners[i] === delegate) {
                this._listeners.splice( i, 1);
                break;
            }
        }
    }

    // ORGMouseListener DELEGATE METHODS

    /**
     * ORGMouseListener informs of event
     * @param event
     */
    onMouseDown(event) {
        this._isMouseDown = true;
    }

    /**
     * ORGMouseListener informs of event
     * @param event
     */
    onMouseUp( event ) {
        this._isMouseDown = false;
    }

    /**
     * ORGMouseListener informs of event
     * @param event
     */
    onMouseMove( event ) {

        if ( this._isMouseDown ) {
            return;
        }
        if ( !this._THREETargetObject ) {
            return;
        }
        const canvasW = $(this._rendererDomElement).width();
        const canvasH = $(this._rendererDomElement).height();
        const canvasOffset = $(this._rendererDomElement).offset();

        // calculate mouse position in normalized device coordinates. (-1 to +1) for both components
        this._rcmouse.x = ( (event.clientX - canvasOffset.left) / canvasW ) * 2 - 1;
        this._rcmouse.y = - ( (event.clientY - canvasOffset.top) / canvasH ) * 2 + 1;

        this._raycaster.setFromCamera( this._rcmouse, this._THREECamera );
        var intersects = this._raycaster.intersectObject( this._THREETargetObject, true /*recursive*/ ); // returns always an array. The first one is the closest object.

        var elementToHilite = null;
        var intersectionPoint = null;
        if ( intersects && intersects.length ) {
            elementToHilite = intersects[0].object;
            intersectionPoint = intersects[0].point;

            // Make sure the object is the uiobj plane and not the edges helper
            if ( elementToHilite.type === "LineSegments" /*BoxHelper*/) {
                const parent = elementToHilite.parent; // parent must be a group, holds edgesHelper and the uiobject plane
                elementToHilite = null;
                if ( parent ) {
                    for ( let child of parent.children ) {
                        if ( child.type === "Mesh" ) {
                            elementToHilite = child;
                            break;
                        }
                    }
                }
            }
        }

        // Inform delegates about the intersected element, null is sent as well.
        for ( let i=0; i<this._listeners.length; i++ ) {
            if (this._listeners[i].mouseOverElement) {
                this._listeners[i].mouseOverElement( elementToHilite, intersectionPoint );
            }
        }
    }
}

/**
 * Created by jongabilondo on 6/21/15.
 */

/**
 * Class to detect the Scene THREE object the mouse is on. Not for 3D UITree, only for objects in the screen such as beacons.
 * It calls its delegates to inform the THREE obj the mouse is onto.
 * If the mouse is not over any obj it passes a null.
 * The Delegate must implement mouseOverElement.
 *
 * This class itself it's a delegate for ORGMouseListener.
 * It implements onMouseDown, onMouseUp, onMouseMove to receive the mouse events from ORGMouseListener.
 * @constructor
 */
class ORG3DSceneRaycaster {

    constructor( rendererDomElement, THREECamera, THREETargetObject ) {
        this._raycaster = new THREE.Raycaster();
        this._raycaster.linePrecision = 0.0001;
        this._rcmouse = new THREE.Vector2();
        this._THREETargetObject = THREETargetObject; // The threejs object to raycast on
        this._THREECamera = THREECamera;
        this._rendererDomElement = rendererDomElement;
        this._listeners = [];
        this._hilitedObj = null;
        this._isMouseDown = false; // It will help us to ignore the mousemoves while mousedown.
        this._enabled = true;
    }

    addDelegate( delegate ) {
        this._listeners.push( delegate );
    }

    removeDelegate( delegate ) {
        for (let i=0; i<this._listeners.length; i++) {
            if ( this._listeners[i] === delegate) {
                this._listeners.splice( i, 1);
                break;
            }
        }
    }

    // ORGMouseListener DELEGATE METHODS

    /**
     * ORGMouseListener informs of event
     * @param event
     */
    onMouseDown(event) {
        this._isMouseDown = true;
    }

    /**
     * ORGMouseListener informs of event
     * @param event
     */
    onMouseUp( event ) {
        this._isMouseDown = false;

        const canvasW = $(this._rendererDomElement).width();
        const canvasH = $(this._rendererDomElement).height();
        const canvasOffset = $(this._rendererDomElement).offset();

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        this._rcmouse.x = ( (event.clientX - canvasOffset.left) / canvasW ) * 2 - 1;
        this._rcmouse.y = - ( (event.clientY - canvasOffset.top) / canvasH ) * 2 + 1;

        this._raycaster.setFromCamera( this._rcmouse, this._THREECamera );
        var intersects = this._raycaster.intersectObject( this._THREETargetObject, true ); // returns always an array. The first one is the closest object.
        if ( intersects && intersects.length ) {
            const intersected = intersects[0];
            if ( intersected.object.type === "Mesh" ) {
                if ( (intersected.object.parent.type === "Group") && (intersected.object.parent.name === "ORG.Beacon.Group")) {
                    ORG.dispatcher.dispatch({
                        actionType: 'beacon-selected',
                        beacon : intersected.object.parent
                    });
                }
            }
        }
    }

    /**
     * ORGMouseListener informs of event
     * @param event
     */
    onMouseMove( event ) {

        var elementToTooltip = null;

        const canvasW = $(this._rendererDomElement).width();
        const canvasH = $(this._rendererDomElement).height();
        const canvasOffset = $(this._rendererDomElement).offset();

        // calculate mouse position in normalized device coordinates. (-1 to +1) for both components
        this._rcmouse.x = ( (event.clientX - canvasOffset.left) / canvasW ) * 2 - 1;
        this._rcmouse.y = - ( (event.clientY - canvasOffset.top) / canvasH ) * 2 + 1;

        this._raycaster.setFromCamera( this._rcmouse, this._THREECamera );
        var intersects = this._raycaster.intersectObject( this._THREETargetObject, true /*recursive*/ ); // returns always an array. The first one is the closest object.

        if ( intersects && intersects.length ) {
            elementToTooltip = intersects[0];
        }

        // Inform delegates about the intersected element, null is sent as well.
        for ( let i=0; i<this._listeners.length; i++ ) {
            if (this._listeners[i].mouseOverElement) {
                this._listeners[i].mouseOverElement( elementToTooltip );
            }
        }
    }
}

/**
 * Created by jongabilondo on 22/09/2017.
 */

/**
 * Class to create and manipulate a beacon in the THREE scene.
 */
class ORG3DBeacon {

    /**
     * Constructor
     * @param beacon -  A ORGBeacon
     */
    constructor(beacon) {
        this._kCoreAnimationScale = 4;
        this._kCoreAnimationTime = 1000; //ms

        this._coreMesh = null;
        this._beacon = beacon;
        this._beaconModel = this._createaModel(beacon.range);
        this._coreTWEEN = null;
    }

    /**
     *
     * @returns a THREE.Group
     */
    get model() {
        return this._beaconModel;
    }

    /**
     * Location of the Beacon in the scene in meters.
     * @returns {{x: number, y: number, z: number}}
     */
    get location() {
        return {x:0, y:0, z:0};
    }

    /**
     * Starts animating the beacon core.
     */
    animateCore() {
        this._scaleUp().start();
    }

    // PRIVATE

    /**
     * Creates a THREE.Group with the beacon THREE objects.
     * @param radius
     * @returns {*|Group}
     * @private
     */
    _createaModel(radius) {
        const wSegments = 10;
        const hSegments = 10;
        var geometry = new THREE.SphereGeometry(radius, wSegments, hSegments);
        var material = new THREE.MeshBasicMaterial({
            color: 0x7788FF,
            wireframe: true
        });
        var coverMesh = new THREE.Mesh(geometry, material);
        coverMesh.name = "ORG.Beacon.Cover.Mesh";

        var coreGeometry = new THREE.SphereGeometry(2, 16, 16);
        var coreMaterial = new THREE.MeshPhongMaterial({
            color: 0x771122
        });
        this._coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
        this._coreMesh.name = "ORG.Beacon.Core.Mesh"

        var beaconGroup = new THREE.Group();
        beaconGroup.name = "ORG.Beacon.Group";
        beaconGroup.add(this._coreMesh);
        beaconGroup.add(coverMesh);

        return beaconGroup;
    }


    /**
     * Animates the Scale up of the beacon core, it launches the scale down on completion.
     * @returns {*}
     * @private
     */
    _scaleUp () {
        const _this = this;
        return new TWEEN.Tween(this._coreMesh.scale).to ({
            x : this._kCoreAnimationScale,
            y : this._kCoreAnimationScale,
            z : this._kCoreAnimationScale
        }, this._kCoreAnimationTime).onUpdate(function () {
            //
        }).onComplete(function () {
            _this._scaleDown().start();
        });
    };

    /**
     * Animates the Scale down of the beacon core, it launches the scale up on completion.
     * @returns {*}
     * @private
     */
    _scaleDown () {
        const _this = this;
        return new TWEEN.Tween(this._coreMesh.scale).to ({
            x : 1, y : 1, z: 1
        }, this._kCoreAnimationTime).onUpdate(function () {
            //
        }).onComplete(function () {
            _this._scaleUp().start();
        });
    };

}
/**
 * Created by jongabilondo on 08/11/2017.
 */


class ORG3DBattery {

    constructor( radius, height, percent ) {
        this._THREEModel = this._createModel( radius, height, percent );
    }

    get THREEModel() {
        return this._THREEModel;
    }

    set position( position ) {
        if ( this._THREEModel ) {
            this._THREEModel.position.copy( position );
        }
    }

    // PRIVATE

    _createModel( radius, batteryHeight, percent ) {

        const kSegments = 24;
        const kGreenHeight = batteryHeight * percent;
        const kRedHeight = batteryHeight * (1 - percent);
        const kOpacity = 0.75;
        const kFontSize = 0.005;
        const kFontHeight = 0.002;
        const kCurveSegments = 16;
        const kMetalness = 0.7;

        // Group
        var group = new THREE.Group();
        group.name = "ORG.Battery.Group";

        // Bottom green
        var geometry = new THREE.CylinderGeometry( radius, radius, kGreenHeight, kSegments);
        var material = new THREE.MeshStandardMaterial({ color: 0x00FF00, transparent: true, opacity: kOpacity, metalness: kMetalness });
        var greenMesh = new THREE.Mesh( geometry, material );
        greenMesh.name = "ORG.Battery.Green.Mesh";
        group.add( greenMesh );

        // Upper red
        if ( percent < 1.0 ) {
            geometry = new THREE.CylinderGeometry( radius, radius, kRedHeight, kSegments);
            material = new THREE.MeshStandardMaterial({  color: 0xFF0000, transparent: true, opacity: kOpacity, metalness: kMetalness });
            var redMesh = new THREE.Mesh( geometry, material );
            redMesh.name = "ORG.Battery.Red.Mesh";
            redMesh.translateY( (kGreenHeight + kRedHeight) / 2.0 + 0.0001 );
            group.add( redMesh );
        }

        // Label
        var textGeometry = new THREE.TextGeometry( percent * 100 + "%", {
            font: ORG.font_helvetiker_regular,
            size: kFontSize,
            height: kFontHeight,
            curveSegments: kCurveSegments
        });
        var textMesh = new THREE.Mesh( textGeometry, new THREE.MeshStandardMaterial({color: 0xeeeeee, metalness: kMetalness }));
        const labelPosition = this._calculatePositionForLabel(  textMesh, batteryHeight, kFontSize );
        textMesh.position.copy( labelPosition );
        group.add( textMesh );

        return group;
    }

    _calculatePositionForLabel( textMesh, batteryHeight, fontSize ) {

        textMesh.geometry.computeBoundingBox();
        const bbox = textMesh.geometry.boundingBox;
        return new THREE.Vector3( -bbox.getSize().x / 2.0, batteryHeight / 2.0 + fontSize, 0);

    }
}
/**
 * Created by jongabilondo on 08/11/2017.
 */


class ORG3DPieChart {

    constructor( radius, height, sectorsDescription ) {

        this._THREEModel = this._createModel( radius, height, sectorsDescription);

    }

    get THREEModel() {

        return this._THREEModel;

    }

    set position( position ) {

        if ( this._THREEModel ) {
            this._THREEModel.position.copy( position );
        }

    }

    // PRIVATE

    _createModel( radius, height, sectorsDescription) {

        const kSegments = 24;

        // Group
        var group = new THREE.Group();
        group.name = "ORG.Chart.Group";

        // build every sector
        var startAngle = 0;
        var sectorDesc;
        var rotationAngle;
        var sectorMesh;

        for (let sectorDesc of sectorsDescription) {
            rotationAngle = sectorDesc.percent * 2 * Math.PI;
            sectorMesh = this._createSector( radius, height, kSegments, startAngle, rotationAngle, sectorDesc.color);
            sectorMesh.name = "ORG.Chart.Sector";
            sectorMesh.ORGData = { "tooltip": sectorDesc.tooltip };
            group.add( sectorMesh );
            startAngle += rotationAngle;
        }

        group.rotateX( 1.15 * Math.PI ); // some rotation for better visuals
        return group;
    }

    _createSector( radius, height, segments, startAngle, endAngle, color) {

        var geometry = new THREE.CylinderGeometry( radius, radius, height, segments, 1, false, startAngle, endAngle );
        var material = new THREE.MeshStandardMaterial({ color: color, metalness: 0.5 });
        return new THREE.Mesh( geometry, material );

    }
}
/**
 * Created by jongabilondo on 08/11/2017.
 */


class ORG3DMemoryChart extends ORG3DPieChart {

    constructor( data ) {

        const kRadius = 0.02;
        const kThickness = 0.002;
        const kMetalness = 0.7;
        const kLabelLeftOffset = 0.025;
        const kFontSize = 0.006;
        const kFontHeight = 0.002;
        const kCurveSegments = 16;
        const kLabelsGap = 0.01;

        const kTotalMemory =  parseInt( data["TotalMemory"] );
        var kFreeMemoryPercent =  parseFloat( data["FreeMemory (Formatted)"] ) / 100.0;
        const kFreeMemoryRaw =  parseFloat( data["FreeMemory (Not Formatted)"] );
        var kUsedMemoryPercent =  parseFloat( data["UsedMemory (Formatted)"] ) / 100.0;
        const kUsedMemoryRaw =  parseFloat( data["UsedMemory (Not Formatted)"] );
        var kActiveMemoryPercent =  parseFloat( data["ActiveMemory (Formatted)"] ) / 100.0;
        const kActiveMemoryRaw =  parseFloat( data["ActiveMemory (Not Formatted)"] );
        var kInactiveMemoryPercent =  parseFloat( data["InactiveMemory (Formatted)"] ) / 100.0;
        const kInactiveMemoryRaw =  parseFloat( data["InactiveMemory (Not Formatted)"] );
        var kWiredMemoryPercent =  parseFloat( data["WiredMemory (Formatted)"] ) / 100.0;
        const kWiredMemoryRaw =  parseFloat( data["WiredMemory (Not Formatted)"] );
        var kPurgableMemoryPercent =  parseFloat( data["PurgableMemory (Formatted)"] ) / 100.0;
        const kPurgableMemoryRaw =  parseFloat( data["PurgableMemory (Not Formatted)"] );

        const totalPercent = kFreeMemoryPercent + kUsedMemoryPercent + kActiveMemoryPercent + kInactiveMemoryPercent +  kWiredMemoryPercent + kPurgableMemoryPercent;
        const overshootCorrection = 1.0 / totalPercent;
        kFreeMemoryPercent *= overshootCorrection;
        kUsedMemoryPercent *= overshootCorrection;
        kActiveMemoryPercent *= overshootCorrection;
        kInactiveMemoryPercent *= overshootCorrection;
        kWiredMemoryPercent *= overshootCorrection;
        kPurgableMemoryPercent *= overshootCorrection;

        super( kRadius, kThickness, [
            {"percent": kFreeMemoryPercent, "color": 0x0099CC, "tooltip": "Free Memory \r" +  kFreeMemoryRaw / 1024 + " MB\r" + kFreeMemoryPercent + " %"},
            {"percent": kUsedMemoryPercent, "color": 0xFFDC00, "tooltip": "Free Memory \r" +  kUsedMemoryRaw / 1024 + " MB\r" + kUsedMemoryPercent + " %" },
            {"percent": kActiveMemoryPercent, "color": 0xFF9933, "tooltip": "Free Memory \r" +  kActiveMemoryRaw / 1024 + " MB\r" + kActiveMemoryPercent + " %" },
            {"percent": kInactiveMemoryPercent, "color": 0xFF3333, "tooltip": "Free Memory \r" +  kInactiveMemoryRaw / 1024 + " MB\r" + kInactiveMemoryPercent + " %" },
            {"percent": kWiredMemoryPercent, "color": 0x99CC33, "tooltip": "Free Memory \r" +  kWiredMemoryRaw / 1024 + " MB\r" + kWiredMemoryPercent + " %" },
            {"percent": kPurgableMemoryPercent, "color": 0x1767676, "tooltip": "Free Memory \r" +  kPurgableMemoryRaw / 1024 + " MB\r" + kPurgableMemoryPercent + " %" }
            ]);

        // Labels
        var textGeometry = new THREE.TextGeometry( "RAM: " + kTotalMemory + "MB", {
            font: ORG.font_helvetiker_regular,
            size: kFontSize,
            height: kFontHeight,
            curveSegments: kCurveSegments
        });
        var textMesh = new THREE.Mesh( textGeometry, new THREE.MeshStandardMaterial({color: 0xeeeeee, metalness: kMetalness}));
        textMesh.translateX( kLabelLeftOffset );
        textMesh.rotateX( 0.8 * Math.PI );
        this.THREEModel.add( textMesh );

        const percentFixed = kFreeMemoryPercent * 100;
        textGeometry = new THREE.TextGeometry( "Free: " + percentFixed.toFixed( 2 ) + "%", {
            font: ORG.font_helvetiker_regular,
            size: kFontSize,
            height: kFontHeight,
            curveSegments: kCurveSegments
        });
        textMesh = new THREE.Mesh( textGeometry, new THREE.MeshStandardMaterial({color: 0xeeeeee, metalness: kMetalness}));
        textMesh.translateX( kLabelLeftOffset );
        textMesh.rotateX( 0.8 * Math.PI );
        textMesh.translateY( -kLabelsGap );
        this.THREEModel.add( textMesh );


    }
}
/**
 * Created by jongabilondo on 08/11/2017.
 */


class ORG3DDiskChart extends ORG3DPieChart {

    constructor( data ) {

        const radius = 0.02;
        const thickness = 0.002;
        const fontSize = 0.006;
        const fontHeight = 0.002;
        const curveSegments = 16;
        const labelLeftOffset = 0.025;
        const labelsGap = 0.01;
        const freeSpacePercentString = data["FreeDiskSpace (Formatted)"]; //  format : "50%"
        const freePercent = parseFloat( freeSpacePercentString.substring( 0, freeSpacePercentString.length - 1 )) / 100.0;
        const usedPercent = 1.0 - freePercent;

        super( radius, thickness, [
            {"percent": usedPercent, "color": 0xFF0011, "tooltip": "Used " +  data.usedDiskSpaceinPercent },
            {"percent": freePercent, "color": 0x22FF11, "tooltip": "Free: " +  freeSpacePercentString +  data["FreeDiskSpace (Not Formatted)"] }
            ]);


        // Labels
        var textGeometry = new THREE.TextGeometry( "Disk: " + data["DiskSpace"], {
            font: ORG.font_helvetiker_regular,
            size: fontSize,
            height: fontHeight,
            curveSegments: curveSegments
        });
        textGeometry.computeFaceNormals();
        var textMesh = new THREE.Mesh( textGeometry, new THREE.MeshStandardMaterial({color: 0xeeeeee, metalness: 0.7}));
        textMesh.rotateX( 0.8 * Math.PI );
        textMesh.translateX( labelLeftOffset );
        this.THREEModel.add( textMesh );

        textGeometry = new THREE.TextGeometry( "Free: " + freeSpacePercentString + " " +  data["FreeDiskSpace (Not Formatted)"], {
            font: ORG.font_helvetiker_regular,
            size: fontSize,
            height: fontHeight,
            curveSegments: curveSegments
        });
        textGeometry.computeFaceNormals();
        textMesh = new THREE.Mesh( textGeometry, new THREE.MeshStandardMaterial({color: 0xeeeeee, metalness: 0.7 }));
        textMesh.rotateX( 0.8 * Math.PI );
        textMesh.translateX( labelLeftOffset );
        textMesh.translateY( -labelsGap );
        this.THREEModel.add( textMesh );
    }
}
/**
 * Created by jongabilondo on 14/11/2017.
 */

class ORG3DCPUUsageBarChart {

    constructor( barSize ) {

        this._barSize = barSize;
        this._barCount = 0;
        this._THREEGroup = new THREE.Group();

    }

    get THREEModel() {

        return this._THREEGroup;

    }

    set position( position ) {

        if ( this._THREEGroup ) {
            this._THREEGroup.position.copy( position );
        }

    }

    usageUpdate( usageData ) {

        const usagePercent = parseFloat( usageData["CPUUsage"] ) / 100;
        this._createBar( usagePercent );

    }

    _createBar( usagePercent ) {

        const kColor = 0xFFEEFF;
        const kMetalness = 0.7;
        const kBarHeight = this._barSize.y * usagePercent;
        const kBarGap = 0.0005;

        var geometry = new THREE.CubeGeometry( this._barSize.x, kBarHeight ,this._barSize.z );
        var material = new THREE.MeshStandardMaterial( {color: kColor, metalness: kMetalness} );
        var bar = new THREE.Mesh( geometry, material );
        bar.translateX( - ( (this._barCount * this._barSize.x) + ( kBarGap * (this._barCount - 1))) );
        bar.translateY( kBarHeight / 2.0 );
        this._THREEGroup.add( bar );
        this._THREEGroup.translateX( this._barSize.x + kBarGap);
        this._barCount++;

    }
}
/**
 * Created by jongabilondo on 18/05/2017.
 */

/**
 * Class to simulate a location+altitude sensor. It does not generate the data by itself, other services like Map (LocationProvider) feed this class with the location data.
 * This class is in charge of passing the location data to the connected devices.
 */
class ORGLocationManager extends ORGLocationProvider {

    constructor() {
        super();

        this._location = null;
        this._address = null;
        this._elevation = null;
    }

    get location() {
        return this._location;
    }
    get address() {
        return this._address;
    }
    get elevation() {
        return this._elevation;
    }

    /**
     * Delegate function to be called to inform the manager of his new location data.
     * It backs up the data and passes the information the connected device.
     * @param location
     * @param address
     * @param elevation
     */
    locationUpdate(location, address, elevation) {
        this._location = location;
        this._address = address;
        this._elevation = elevation;

        if (ORG.deviceController) {
            ORG.deviceController.sendLocationUpdate( location.lat(), location.lng());

            //const msg = ORGMessageBuilder.locationUpdate( location, elevation );
            //ORG.deviceController.sendMessage(msg);
        }

        this._broadcastLocation(location, address, elevation);
    }
}
/**
 * Created by jongabilondo on 20/07/2017.
 */

class ORGFluxStore extends FluxUtils.Store {

    __onDispatch(payload) {
        switch (payload.actionType) {

            case 'screenshot-update': {
                ORG.scene.setScreenshotImage(payload.image);
            } break;

            case 'beacon-selected' : {
                ORG.scene.showHideBeaconTransformControls(payload.beacon);
            } break;

            case 'device-info-update': {
                ORG.UI.deviceNameLabel.text(payload.device.name);
                ORG.UI.deviceSystemVersionLabel.text(payload.device.systemVersion);
                ORG.UI.deviceModelLabel.text(payload.device.productName);
            } break;

            case 'app-info-update': {
                ORG.UI.testAppNameLabel.text(payload.app.name );
                ORG.UI.testAppVersionLabel.text(payload.app.version );
                ORG.UI.testAppBundleIdLabel.text(payload.app.bundleIdentifier );
            } break;

            case 'device-orientation-changed': {
                if (ORG.device) {
                    ORG.device.orientation = payload.orientation;
                }
                if (ORG.scene) {
                    ORG.scene.setDeviceOrientation2(payload.orientation);
                }
            } break;

            //************************************************************
            // JSON UI TREE
            //************************************************************

            case 'ui-json-tree-update': {
                ORG.UIJSONTreeManager.update(payload.tree, payload.treeType);
            } break;
            //case 'ui-tree-refresh': {
            //    bootbox.dialog({ message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Getting UI tree information...</div>' }); // Progress alert
            //    ORG.deviceController.refreshUITree();
            //} break;
            case 'uitree-node-selected': {
                $('#ui-json-tree-node').html(payload.html);
            } break;
            case 'uitree-node-enter': {
                ORG.scene.highlightUIElement(payload.node);
            } break;
            case 'uitree-node-leave': {
                ORG.scene.highlightUIElement(null);
            } break;


            //************************************************************
            // 3D UI TREE
            //************************************************************
            case 'uitree-expanded': {
                ORG.UI.sliderTreeLayersRange.bootstrapSlider( 'setAttribute', 'min', 0);
                ORG.UI.sliderTreeLayersRange.bootstrapSlider( 'setAttribute', 'max', payload.ui_tree.layerCount);
                ORG.UI.sliderTreeLayersRange.bootstrapSlider( 'setValue', payload.ui_tree.layerCount);
            } break;
            case 'uitree-layer-range-change': {
                ORG.scene.setExpandedTreeLayersVisibleRange( payload.value );
            } break;
            case 'uitree-layer-spacing-change': {
                ORG.scene.setExpandedTreeLayersDistance( payload.value );
            } break;


            //************************************************************
            // LOCATION
            //************************************************************
            case 'itinerary-location-update': {
                ORG.map.updateItineraryLocation(payload.lat, payload.lng);
            } break;
            case 'start-location-update': {
                $('#label-lat').text(payload.lat);
                $('#label-lng').text(payload.lng);
                if (payload.elevation) {
                    $('#label-altitude').text(payload.elevation + "m");
                }
                if (payload.address) {
                    ORG.UI.startPoint.val(payload.address);
                }
            } break;
            case 'end-location-update': {
                $('#label-lat-end').text(payload.lat);
                $('#label-lng-end').text(payload.lng);
                if (payload.elevation) {
                    $('#label-altitude-end').text(payload.elevation + "m");
                }
                ORG.UI.endPoint.val(payload.address);
            } break;
            case 'reset-itinerary' : {
                $('#label-lat').text("");
                $('#label-lng').text("");
                $('#label-lat-end').text("");
                $('#label-lng-end').text("");
                $('#label-altitude').text("");
                $('#label-distance').text("");
                $('#label-duration').text("");
                ORG.UI.startPoint.val("");
                ORG.UI.endPoint.val("");
            } break;
            case 'itinerary-changed' : {
                $('#label-distance').text(payload.distance + "m");
                $('#label-duration').text(payload.duration + "s");
                ORG.UI.startPoint.val(payload.start_address);
                ORG.UI.endPoint.val(payload.end_address);
                $('#label-lat').text(payload.start_location.lat());
                $('#label-lng').text(payload.start_location.lng());
                $('#label-lat-end').text(payload.end_location.lat());
                $('#label-lng-end').text(payload.end_location.lng());
            } break;

            //************************************************************
            // DEVICE CONNECTIONS
            //************************************************************
            case 'device-disconnect': {
                ORG.scene.handleDeviceDisconnection();  // ORGWebSocketDelegate is not getting called onClose, at least within a reasonable time. Let's update the UI here.
                if ( ORG.systemInfoManager ) {
                    ORG.systemInfoManager.stop();
                }
                ORG.deviceController = null;
                ORG.device = null;
                ORG.testApp = null;

                ORG.UI.connectButton.text("Connect");
                ORG.UI.buttonExpand.text("Expand");
                ORG.UI.deviceNameLabel.text('');
                ORG.UI.deviceSystemVersionLabel.text('');
                ORG.UI.deviceModelLabel.text('');
                ORG.UI.testAppBundleIdLabel.text('');
                ORG.UI.testAppNameLabel.text('');
                ORG.UI.testAppVersionLabel.text('');
                ORG.UIJSONTreeManager.remove();
            } break;
            case 'session-open' :
            case 'websocket-open' : {
                ORG.UI.connectButton.text("Disconnect");
            } break;
            case 'wda-session-open-error' : {
                bootbox.alert({
                    title: "Could not connect to device.",
                    message: "1. Connect the device.<br/>2. The WebDriverAgent must be running on your device.<br/>3. On USB connection, a localport at 8100 must be opened (iproxy 8100 8100)."
                });
            } break;
            case 'ws-session-open-error' : {
                bootbox.alert({
                    title: "Could not connect to device.",
                    message: "1. Connect the device.<br/>2. The iOS application enabled for Organismo must be front.<br/>3. On USB connection, a localport at 5567 must be opened (iproxy 5567 5567)."
                });
            } break;
            case 'wda-session-closed' :
            case 'websocket-closed' : {
                ORG.UI.connectButton.text("Connect");
                ORG.UI.buttonExpand.text("Expand");
                ORG.UI.deviceNameLabel.text('');
                ORG.UI.deviceSystemVersionLabel.text('');

                if (payload.code == 1006) {
                    if (payload.deviceController == "ORGDeviceController") {
                        bootbox.alert({
                            title: "Could not connect to device.",
                            message: "1. Connect the device.<br/>2. The iOS application enabled for Organismo must be front.<br/>3. On USB connection, a localport at 5567 must be opened (iproxy 5567 5567)."
                        })
                    } else {
                        bootbox.alert("Error connecting to idevicecontrolproxy.\nMake sure the proxy is running.\nRead about it @ https://github.com/JonGabilondoAngulo/idevicecontrolproxy");
                    }
                }
            }
        }

    }
}
/**
 * Created by jongabilondo on 14/08/2017.
 */

ORG.SplitterResize	= function(paneSep, contentPanel, leftPane, rightPane, scene) {

    const kSplitterWidth = paneSep.offsetWidth;

    // The script below constrains the target to move horizontally between a left and a right virtual boundaries.
    // - the left limit is positioned at 10% of the screen width
    // - the right limit is positioned at 90% of the screen width
    const kLeftLimit = 10;
    const kRightLimit = 90;


    paneSep.sdrag( (el, pageX, startX, pageY, startY, fix) => {

        fix.skipX = true;

        if (pageX < window.innerWidth * kLeftLimit / 100) {
            pageX = window.innerWidth * kLeftLimit / 100;
            fix.pageX = pageX;
        }
        if (pageX > window.innerWidth * kRightLimit / 100) {
            pageX = window.innerWidth * kRightLimit / 100;
            fix.pageX = pageX;
        }

        //const xOffset = pageX-startX;

        //var cur = pageX / window.innerWidth * 100;
        //if (cur < 0) {
        //    cur = 0;
        //}
        //if (cur > window.innerWidth) {
        //    cur = window.innerWidth;
        //}

        const contentRect = contentPanel.getBoundingClientRect();
        const leftPanelWidth = pageX + kSplitterWidth/2.0;
        const rightPanelWidth = contentRect.width - leftPanelWidth - 20;
        const sceneWidth = leftPanelWidth - kSplitterWidth/2.0 - 15 - 11;
        leftPane.style.width = leftPanelWidth + 'px';
        rightPane.style.width = rightPanelWidth + 'px';

        scene.resize({width:sceneWidth, height:scene.sceneSize.height});

    }, null, 'horizontal');

}

// This helper makes it easy to handle window resize.
// It will update renderer and camera when window is resized.
//

ORG.WindowResize	= function(renderer, camera, canvas, contentPanel, leftPanel, rightPanel) {

	let callback	= function() {

		// Canvas
        const rect = canvas.getBoundingClientRect();
		const canvasTopOffset = rect.top;
		const canvasBottomOffset = 6;
		const canvasHeight = window.innerHeight - canvasTopOffset - canvasBottomOffset;
        canvas.style.height = canvasHeight  + 'px'; //otherwise the canvas is not adapting to the renderer area

		// Right Panel
        const contentRect = contentPanel.getBoundingClientRect();
        const leftPanelRect = leftPanel.getBoundingClientRect();
        const rightPanelWidth = contentRect.width - leftPanelRect.width - 20;
        rightPanel.style.width = rightPanelWidth + 'px';

        //// Renderer & Camera
        renderer.setSize( canvas.offsetWidth, canvasHeight);
        camera.aspect = canvas.offsetWidth / canvasHeight;
		camera.updateProjectionMatrix();

		// UI Tree
        document.getElementById('ui-json-tree').style.height = canvasHeight-115 + 'px';
        document.getElementById('ui-json-tree-node').style.height = canvasHeight-60 + 'px';
	}

	//callback(); // ugly to provoke resize now

	// bind the resize event
	window.addEventListener('resize', callback, false);

	// return .stop() the function to stop watching window resize
	return {
        resize	: function(){
            callback();
        }
        //stop	: function(){
        //    window.removeEventListener('resize', callback);
        //}
	};
}



ORG.contentWrapper = document.getElementById('content-wrapper');
ORG.leftSection = document.getElementById('3d-canvas-col');
ORG.canvasDomElem = document.getElementById('threejs-canvas');
ORG.rightSection = document.getElementById('right-tabs');
ORG.deviceController = null;
ORG.device = null;
ORG.testApp = null;
ORG.map = null;
ORG.scenario = new ORGScenario();
ORG.dispatcher = new Flux.Dispatcher();
ORG.fluxStore = new ORGFluxStore(ORG.dispatcher);

ORG.fontLoader = new THREE.FontLoader();
ORG.fontLoader.load( 'js-third-party/three.js/examples/fonts/helvetiker_regular.typeface.json',  ( font ) => {

    ORG.font_helvetiker_regular = font;
    ORG.scene = new ORG3DScene(ORG.canvasDomElem, {"width":320, "height":568});
    ORG.locationManager = new ORGLocationManager();
    ORG.locationManager.addListener( ORG.scene );

    // Resize splitter
    ORG.SplitterResize(document.getElementById('org-splitter'), ORG.contentWrapper, ORG.leftSection, ORG.rightSection, ORG.scene);

    google.charts.load('current', {'packages' : ['columnchart']});
    //google.charts.setOnLoadCallback(function() { sendAndDraw('') });

    // System Info manager
    ORG.systemInfoManager = new ORGSystemInfoManager(ORG.scene);

    // UI JSON Tree
    ORG.UIJSONTreeManager = new ORGUIJSONTreeManager(document.getElementById('ui-json-tree'), document.getElementById('ui-json-tree-node'));
    ORG.UIJSONTreeContextMenuManager = new ORGUITreeContextMenuManager('#ui-json-tree');

    // Install handler for Window Resize
    var resizer = ORG.WindowResize( ORG.scene.THREERenderer, ORG.scene.THREECamera, ORG.canvasDomElem, ORG.contentWrapper, ORG.leftSection, ORG.rightSection);
    resizer.resize();

} );




/**
 * Created by jongabilondo on 20/09/2016.
 */

ORG.UI.connectButton = $('#connect-button');
//ORG.UI.connectDriversMenu = $('#connect-drivers-menu');
ORG.UI.deviceNameLabel = $('#device-name-label');
ORG.UI.deviceSystemVersionLabel = $('#device-system-version-label');
ORG.UI.deviceModelLabel = $('#device-model-label');
ORG.UI.testAppNameLabel = $('#testapp-name-label');
ORG.UI.testAppVersionLabel = $('#testapp-version-label');
ORG.UI.testAppBundleIdLabel = $('#testapp-bundleid-label');
ORG.UI.dropdownDriver = $('#selected'); // the button that holds the text

$(".dropdown-menu a").click(function(){
    $(this).parents(".btn-group").children(":first").text($(this).text());
    $(this).parents(".btn-group").children(":first").val($(this).data("value"));
});

ORG.UI.connectButton.click(function() {
    ORGConnectionActions.connect();
});


// Settings UI Controls

ORG.UI.checkButtonShowFloor = $('#show-floor');
ORG.UI.checkButtonShowDevice = $('#show-device');
ORG.UI.checkButtonShowLocation = $('#show-location');
ORG.UI.checkButtonShowSystemInfo = $('#show-system-info');
ORG.UI.checkButtonShowTextures = $('#show-textures');
ORG.UI.checkButtonShowInteractive = $('#show-interactive');
ORG.UI.checkButtonShowNonInteractive = $('#show-non-interactive');
ORG.UI.checkButtonShowPrivate = $('#show-private');
ORG.UI.checkButtonShowTooltips = $('#show-tooltips');
ORG.UI.checkButtonLiveScreen = $('#live-screen');
ORG.UI.checkButtonShowHiddenViews = $('#show-hidden-views');
ORG.UI.checkButtonShowNormalWindow = $('#show-normal-window');
ORG.UI.checkButtonShowKeyboardWindow = $('#show-keyboard-window');
ORG.UI.checkButtonShowAlertWindow = $('#show-alert-window');
ORG.UI.buttonExpand = $('#expand-button');
ORG.UI.buttonResetCamera = $('#reset-camera-button');
ORG.UI.buttonRotateDevice = $('#rotate-device-button');
ORG.UI.buttonTranslateDevice = $('#translate-device-button');
ORG.UI.buttonItineraryStart = $('#itinerary-run');
ORG.UI.buttonItineraryStop = $('#itinerary-stop');
ORG.UI.buttonItineraryPause = $('#itinerary-pause');
ORG.UI.buttonItineraryResume = $('#itinerary-resume');
ORG.UI.buttonSendLocation = $('#button-send-location');
ORG.UI.buttonAddBeacon = $('#button-add-beacon');
ORG.UI.startPoint = $('#start-point');
ORG.UI.endPoint = $('#end-point');
ORG.UI.dropdownTravelMode = $('#travel-mode-dropdown');
ORG.UI.sliderTreeLayersDistance = $('#ex1');
ORG.UI.sliderTreeLayersRange = $('#ex2');
ORG.UI.refreshUITree = $('#ui-tree-refresh');

// UI Tree
ORG.UI.refreshUITree.click(function () {
    if (ORG.deviceController.type === "WDA") {
        ORGConnectionActions.refreshUITree();
    } else {
        ORG.deviceController.refreshUITree();
    }
});

// Sliders
ORG.UI.sliderTreeLayersDistance.bootstrapSlider();
ORG.UI.sliderTreeLayersRange.bootstrapSlider();

ORG.UI.sliderTreeLayersDistance.on("slide", function(slideEvt) {
    ORG.dispatcher.dispatch({
        actionType: 'uitree-layer-spacing-change',
        value: slideEvt.value
    });
});

ORG.UI.sliderTreeLayersRange.on("slide", function(slideEvt) {
    ORG.dispatcher.dispatch({
        actionType: 'uitree-layer-range-change',
        value: slideEvt.value
    });
});

// Map
ORG.UI.buttonResetItinerary = $('#reset-itinerary');


ORG.UI.checkButtonShowDevice.change(function () {
    ORG.scene.flagShowDevice3DModel = $(this).is(':checked');
    if (ORG.scene.flagShowDevice3DModel) {
        ORGConnectionActions.showDevice3DModel();
    } else {
        ORGConnectionActions.hideDevice3DModel();
    }
});

ORG.UI.checkButtonShowSystemInfo.change(function () {
    if ($(this).is(':checked') === true) {
        ORG.systemInfoManager.start();
    } else {
        ORG.systemInfoManager.stop();
    }
});

ORG.UI.checkButtonShowFloor.change(function () {
    if ($(this).is(':checked') === true) {
        ORG.scene.createFloor();
    } else {
        ORG.scene.removeFloor();
    }
});

ORG.UI.checkButtonShowLocation.change(function () {
    if ($(this).is(':checked') === true) {
        ORG.scene.enableShowLocation();
    } else {
        ORG.scene.disableShowLocation();
    }
});

ORG.UI.checkButtonShowTextures.change(function () {
    ORG.scene.flagShowScreenshots = $(this).is(':checked');
});

ORG.UI.checkButtonShowInteractive.change(function () {
    ORG.scene.flagShowInteractiveViews = $(this).is(':checked');
});

ORG.UI.checkButtonShowNonInteractive.change(function () {
    ORG.scene.flagShowNonInteractiveViews = $(this).is(':checked');
});

ORG.UI.checkButtonShowPrivate.change(function () {
    ORG.scene.flagShowPrivateClasses = $(this).is(':checked');
});

ORG.UI.checkButtonShowTooltips.change(function () {
    ORG.scene.showTooltips($(this).is(':checked'));
});

ORG.UI.checkButtonShowHiddenViews.change(function () {
    ORG.scene.flagShowHiddenViews = $(this).is(':checked');
});

ORG.UI.checkButtonLiveScreen.change(function () {
    ORG.scene.setLiveScreen($(this).is(':checked'));
});

ORG.UI.checkButtonShowNormalWindow.change(function () {
    ORG.scene.setShowNormalWindow($(this).is(':checked'));
});
ORG.UI.checkButtonShowKeyboardWindow.change(function () {
    ORG.scene.flagShowKeyboardWindow = $(this).is(':checked');
});
ORG.UI.checkButtonShowAlertWindow.change(function () {
    ORG.scene.setShowAlertWindow($(this).is(':checked'));
});

ORG.UI.buttonResetCamera.click(function () {
    ORG.scene.resetCameraPosition();
});

ORG.UI.buttonRotateDevice.click(function () {
    ORG.scene.showHideDeviceTransformControls("rotate");
});

ORG.UI.buttonTranslateDevice.click(function () {
    ORG.scene.showHideDeviceTransformControls("translate");
});

ORG.UI.buttonAddBeacon.click(function () {
    ORG.scene.addBeacon();
});

ORG.UI.buttonExpand.click(function () {
    if (!ORG.deviceController.isConnected) {
        return;
    }
    if (ORG.deviceController.type === "WDA") {
        alert("Not implemented for WDA driver.")
        return;
    }
    if (ORG.scene.isExpanded) {
        ORG.UI.buttonExpand.text("Expand");
        ORG.scene.collapse();
    } else {
        ORG.UI.buttonExpand.text("Collapse");
        ORG.scene.expand();
    }
});

ORG.UI.buttonResetItinerary.click(function () {
    ORG.map.resetItinerary();
});
ORG.UI.buttonItineraryStart.click(function () {
    ORG.map.run();
});
ORG.UI.buttonItineraryStop.click(function () {
    ORG.map.stop();
});
ORG.UI.buttonItineraryPause.click(function () {
    ORG.map.pause();
});
ORG.UI.buttonItineraryResume.click(function () {
    ORG.map.resume();
});

ORG.UI.buttonSendLocation.click(function() {
    ORG.map.sendStartLocationToDevice();
});
/**
 * Created by jongabilondo on 15/05/2017.
 */

/**
 * Wrapper class to create and handle the 3D location marker and the 3D description text in the 3D scene.
 */
class ORG3DLocationMarker {

    constructor(anchorPoint, text, threeScene) {
        this._descriptor = null;
        this._marker = null;

        this._anchorPoint = anchorPoint;
        this._THREEScene = threeScene;

        this._marker = this._createMarker(this._anchorPoint);
        this._THREEScene.add(this._marker);

        this.updateDescriptor(text);
    }

    destructor() {
        this._removeMarker();
        this._removeDescriptor();
    }

    updateDescriptor(text) {
        if (!this._THREEScene) {
            return;
        }
        this._removeDescriptor();
        this._descriptor = this._createDescriptor(text);
        this._THREEScene.add( this._descriptor );
    }

    setPositionY(y) {
        if (this._marker) {
            this._marker.position.setY(y);
        }
        this._placeDescriptor(this._descriptor);
    }


    //------------
    // PRIVATE
    //-------------

    _createMarker(anchorPoint) {
        const kRadiusTop = 0.1;
        const kRadiusBottom = kRadiusTop;
        const kHeight = kRadiusTop * 0.3;
        const kRadialSegments = 30;
        const kHeightSegments = 1;
        const kOpenEnded = false;
        const cylinderGeo = new THREE.CylinderGeometry(kRadiusTop, kRadiusBottom, kHeight, kRadialSegments, kHeightSegments, kOpenEnded);
        let material = new THREE.MeshPhongMaterial({ color: 0x0000ee });
        material.side = THREE.DoubleSide;
        //let marker = THREE.SceneUtils.createMultiMaterialObject(cylinderGeo, [meshMaterial]);
        let marker = new THREE.Mesh(cylinderGeo, material);
        marker.position.setY( anchorPoint.y);
        return marker;
    }

    _createDescriptor(address) {
        const kFontSize = 0.1;
        const kFontHeight = kFontSize * 0.2;
        const kBevelThickness = kFontSize * 0.1;
        const kBevelSize = kFontSize * 0.1;
        const addressGeom = new THREE.TextGeometry(address, {
            font: ORG.font_helvetiker_regular,
            size: kFontSize,
            height: kFontHeight,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: kBevelThickness,
            bevelSize: kBevelSize,
            bevelSegments: 5
        });

        const material = new THREE.MeshPhongMaterial({color: 0xeeeeee});
        const textMesh = new THREE.Mesh(addressGeom, material);
        this._placeDescriptor(textMesh);
        return textMesh;
    }

    _removeMarker() {
        if (this._THREEScene && this._marker) {
            this._THREEScene.remove(this._marker);
            this._marker = null;
        }
    }

    _removeDescriptor() {
        if (this._THREEScene && this._descriptor) {
            this._THREEScene.remove(this._descriptor);
            this._descriptor = null;
        }
    }

    _placeDescriptor(textMesh) {
        if (this._marker && textMesh) {
            this._marker.geometry.computeBoundingBox();
            const markerMaxZ = this._marker.geometry.boundingBox.max.z;

            textMesh.position.set( 0, 0, 0 );
            textMesh.rotation.set( THREE.Math.degToRad( -90 ), 0, 0 );
            textMesh.updateMatrix();
            textMesh.geometry.computeBoundingBox();
            const centerPoint = textMesh.geometry.boundingBox.getCenter();
            textMesh.position.set( -centerPoint.x, this._marker.position.y, markerMaxZ +  textMesh.geometry.boundingBox.getSize().y);
        }
    }
}
/**
 * Created by jongabilondo on 20/07/2017.
 */


class ORGItinerary {

    constructor(route, elevations, startLocation, endLocation) {
        this._startLocation = startLocation;
        this._endLocation = endLocation;
        //this._startLocationAddress = null;
        //this._endLocationAddress = null;
        this._duration = 0;
        this._polyline = this._calculateRoutePolyline(route);
        this._length = google.maps.geometry.spherical.computeLength(this._polyline.getPath().getArray());
        this._elevations = elevations;
        this._startDate = null;
        this._mode = null;
    }

    //------------------------------------------------------------------------------------------------------------------
    // GET/SET
    //------------------------------------------------------------------------------------------------------------------

    get startlocation() {
        return this._startLocation;
    }

    get endLocation() {
        return this._endLocation;
    }

    //get startLocationAddress() {
    //    return this._startLocationAddress;
    //}
    //
    //get endLocationAddress() {
    //    return this._endLocationAddress;
    //}

    get duration() {
        return this._duration;
    }

    get length() {
        return this._length;
    }

    get polyline() {
        return this._polyline;
    }

    get elevations() {
        return this._elevations;
    }

    //------------------------------------------------------------------------------------------------------------------
    // PRIVATE
    //------------------------------------------------------------------------------------------------------------------

    _calculateRoutePolyline(route) {

        var totalDistance = 0;
        var totalDuration = 0;
        const legs = route.legs;

        var routePoly = new google.maps.Polyline({
            path: [],
            strokeColor: '#FF0000',
            strokeWeight: 3
        });
        for (let i = 0; i < legs.length; ++i) {
            totalDistance += legs[i].distance.value;
            totalDuration += legs[i].duration.value;

            const steps = legs[i].steps;
            for (let j = 0; j < steps.length; j++) {
                let nextSegment = steps[j].path;
                for (let k = 0; k < nextSegment.length; k++) {
                    routePoly.getPath().push(nextSegment[k]);
                }
            }
        }
        return routePoly;
    }
}
/**
 * Created by jongabilondo on 23/07/2017.
 */

class ORGItineraryLocation {

    constructor(routePolyline, elevations, routeLength) {
        this._routePolyline = routePolyline;
        this._elevations = elevations;
        this._routeTotalDistance = routeLength;
        this._lastLocation = null;
        this._lastLocationTime = 0;
        this._currentLocation = null;
        this._distance = 0;
        this._speed = 0;
    }

    //------------------------------------------------------------------------------------------------------------------
    // GET/SET
    //------------------------------------------------------------------------------------------------------------------

    set distance(distance) {
        const nowTime = new Date().getTime()/1000; // seconds

        if (this._lastLocationTime > 0) {
            const timeDelta = nowTime - this._lastLocationTime;
            const distanceDelta = distance - this._distance;
            this._speed = distanceDelta/timeDelta;
        }

        this._distance = distance;
        this._lastLocation = this._currentLocation;
        this._currentLocation = this._routePolyline.GetPointAtDistance(this._distance);
        this._lastLocationTime = nowTime;
    }

    get distance() {
        return this._distance;
    }

    get location() {
        return this._currentLocation;
    }

    get course() {
        return this._bearing( this._lastLocation, this._currentLocation);
    }

    get speed() {
        return this._speed;
    }

    get elevation() {
        var elevation = 0;

        if (this._elevations) {
            var intervalDistance = this._routeTotalDistance / this._elevations.length;
            const intervalIndexLeft = Math.floor(  this._distance / intervalDistance);
            const intervalIndexRight = Math.ceil(  this._distance / intervalDistance);
            if (intervalIndexRight >= this._elevations.length) {
                elevation = this._elevations[intervalIndexLeft].elevation;
            } else {
                const elevationLeft = this._elevations[intervalIndexLeft].elevation;
                const elevationRight = this._elevations[intervalIndexRight].elevation;
                const locationLeft = this._elevations[intervalIndexLeft].location;
                const locationRight = this._elevations[intervalIndexLeft].location;
                intervalDistance = locationRight.distanceFrom(locationLeft);
                if (intervalDistance > 0) {
                    const intervalRunnedDistance = this._currentLocation.distanceFrom(locationLeft);
                    elevation = elevationLeft + ((elevationRight - elevationLeft) * (intervalRunnedDistance/intervalDistance));
                } else {
                    elevation = elevationLeft;
                }
            }
        }
        return elevation;
    }

    //------------------------------------------------------------------------------------------------------------------
    // PRIVATE
    //------------------------------------------------------------------------------------------------------------------

    _bearing(fro, to) {
        if (from == null || to == null) {
            return 0;
        }

        // to rad
        const lat1 = from.lat()* Math.PI / 180;
        const lon1 = from.lng()* Math.PI / 180;
        const lat2 = to.lat()* Math.PI / 180;
        const lon2 = to.lng()* Math.PI / 180;

        // Compute the angle.
        let angle = - Math.atan2( Math.sin( lon1 - lon2 ) * Math.cos( lat2 ), Math.cos( lat1 ) * Math.sin( lat2 ) - Math.sin( lat1 ) * Math.cos( lat2 ) * Math.cos( lon1 - lon2 ) );
        if ( angle < 0.0 )
            angle  += Math.PI * 2.0;

        //if (angle == 0) {crash;}
        //console.log("angle :" + angle);
        return angle * (180/Math.PI); // to deg.
    }
}

/**
 * Created by jongabilondo on 20/07/2017.
 */

ORG.RunnerState = {
    IDLE : "idle",
    RUNNING : "running",
    PAUSED : "paused"};

class ORGItineraryRunner extends ORGLocationProvider {

    constructor(itinerary) {
        super();

        this._itinerary = itinerary;
        this._state = ORG.RunnerState.IDLE;
        this._stepDelta = 5; // m
        this._nextStepDistance = 0;
        this._itineraryLocation = new ORGItineraryLocation(this._itinerary.polyline, this._itinerary.elevations, this._itinerary._length);
    }

    //------------------------------------------------------------------------------------------------------------------
    // PUBLIC
    //------------------------------------------------------------------------------------------------------------------

    start() {
        const distance = 0;
        const startDelay = 2*1000;
        this._nextStepDistance = 0;
        this._state = ORG.RunnerState.RUNNING;
        this._executeRunSimulationWithDelay(distance, this._stepDelta, startDelay);
    }

    stop() {
        this._state = ORG.RunnerState.IDLE;

    }

    pause() {
        this._state = ORG.RunnerState.PAUSED;

    }

    resume() {
        this._state = ORG.RunnerState.RUNNING;
        this._executeRunSimulationWithDelay(this._nextStepDistance, this._stepDelta, 50);
    }

    //------------------------------------------------------------------------------------------------------------------
    // PRIVATE
    //------------------------------------------------------------------------------------------------------------------

    _executeRunSimulationWithDelay(distance, stepDelta, delay) {
        const self = this;
        var runSimulationFunction = function() {
            self._runSimulation(distance, stepDelta);
        }
        setTimeout( runSimulationFunction, delay);
    }

    _runSimulation(distance, stepDelta) {

        if (distance > this._itinerary.length) {
            return;
        }
        if (this._state == ORG.RunnerState.IDLE) {
            return;
        }
        if (this._state == ORG.RunnerState.PAUSED) {
            return;
        }

        this._itineraryLocation.distance = distance;
        const location = this._itineraryLocation.location;
        const elevation = this._itineraryLocation.elevation;

        this._broadcastLocation(location, null, elevation); // inform whoever is interested

        // dispatch to update UI
        ORG.dispatcher.dispatch({
            actionType: 'itinerary-location-update',
            lat: location.lat(),
            lng: location.lng(),
            elevation: elevation
        });


        // continue to next step unless reached the end
        this._nextStepDistance = distance + stepDelta;
        if (this._nextStepDistance <= this._itinerary.length) {
            this._executeRunSimulationWithDelay(this._nextStepDistance, stepDelta, 100);
        }
    }


}
/**
 * Created by jongabilondo on 09/11/2017.
 */


class ORGSystemInfoManager {

    constructor( scene ) {
        this._scene = scene;
        //this._lastUpdateTime = null;
        this._enabled = false;
        //this._updateInterval = 60000; // ms
        this._waitingForResponse = false;
        this._lastsSystemInfo = null;
    }

    start() {
        if ( ORG.deviceController ) {
            this._lastsSystemInfo = null;
            this._create3DCPUUsageBarChart();
            this._enabled = true;
        }
    }

    stop() {
        if ( this._enabled ) {
            this._enabled = false;
            this._lastsSystemInfo = null;

            this._remove3DBattery();
            this._remove3DMemoryChart();
            this._remove3DDiskChart();
            this._remove3DCPUUsageBarChart();
        }
    }

    update() {

        if ( this._enabled ) {
            if ( this._lastsSystemInfo ) {
                this._updateChart( this._lastsSystemInfo );
                this._waitingForResponse = false;
                this._lastsSystemInfo = null;
            }
            if ( this._needsUpdate() ) {
                this._requestSystemInfo();
            }
        }

    }

    dataUpdate( systemInfoData ) {
        // prepare for update() to do the chart update.
        if ( this._enabled ) {
            this._lastsSystemInfo = systemInfoData;
        }
    }

    // PRIVATE

    _requestSystemInfo() {
        if ( ORG.deviceController ) {
            ORG.deviceController.requestSystemInfo();
            this._waitingForResponse = true;
        }
    }

    _updateChart( systemInfoData ) {
        this._remove3DBattery();
        this._create3DBattery( systemInfoData );
        this._remove3DMemoryChart();
        this._create3DMemoryChart( systemInfoData );
        this._remove3DDiskChart();
        this._create3DDiskChart( systemInfoData );
        this._update3DCPUUsageBarChart( systemInfoData );

    }

    _create3DBattery( batteryData ) {
        this._battery = new ORG3DBattery( 0.005, 0.03, batteryData.BatteryLevel / 100.0);
        this._battery.position = new THREE.Vector3( -0.05, 1.45, 0);
        this._scene.THREEScene.add( this._battery.THREEModel );
    }

    _remove3DBattery() {
        if ( this._battery ) {
            this._scene.THREEScene.remove( this._battery.THREEModel );
            this._battery = null;
        }
    }

    _create3DMemoryChart( memoryData ) {
        this._memoryChart = new ORG3DMemoryChart( memoryData );
        this._memoryChart.position = new THREE.Vector3( 0.065, 1.45, 0);
        this._scene.THREEScene.add( this._memoryChart.THREEModel );
    }

    _remove3DMemoryChart(  ) {
        if ( this._memoryChart ) {
            this._scene.THREEScene.remove( this._memoryChart.THREEModel );
            this._memoryChart = null;
        }
    }

    _create3DDiskChart( diskData ) {
        this._diskChart = new ORG3DDiskChart( diskData );
        this._diskChart.position = new THREE.Vector3( 0.065, 1.50, 0);
        this._scene.THREEScene.add( this._diskChart.THREEModel );
    }

    _remove3DDiskChart(  ) {
        if ( this._diskChart ) {
            this._scene.THREEScene.remove( this._diskChart.THREEModel );
            this._diskChart = null;
        }
    }

    _create3DCPUUsageBarChart( ) {
        this._cpuUsageChart = new ORG3DCPUUsageBarChart( new THREE.Vector3( 0.002, 0.03, 0.002 ) );
        this._cpuUsageChart.position = new THREE.Vector3( 0.065, 1.52, 0);
        this._scene.THREEScene.add( this._cpuUsageChart.THREEModel );
    }

    _remove3DCPUUsageBarChart(  ) {
        if ( this._cpuUsageChart ) {
            this._scene.THREEScene.remove( this._cpuUsageChart.THREEModel );
            this._cpuUsageChart = null;
        }
    }

    _update3DCPUUsageBarChart( cpuData ) {
        if ( this._cpuUsageChart ) {
            this._cpuUsageChart.usageUpdate( cpuData );
        }
    }

    _needsUpdate() {
        return ( this._enabled && !this._waitingForResponse );
    }

}
/**
 * Created by jongabilondo on 19/01/2018.
 */


/***
 * A wrapper base class to a UI tree element. Gives a 3D context functionalities to a UI tree element node.
 * Do not instance this class, use subclasses.
 */
class ORG3DUIElement {

    /***
     *
     * @param elementNode. The JSON object describing the UI element, the one in the UI tree. Could be WDA/Org...
     */
    constructor(elementNode) {
        this._element = elementNode;
    }

    get elementJSON() {
        return this._element;
    }

    get bounds() {
        throw new Error("Subclasses must override this method.");
    }

    get hasSize() {
        throw new Error("Subclasses must override this method.");
    }

    /***
     * Calculates the Box2 of the element in the given device screen.
     * @param device. The ORGDevice of the connected device.
     * @param deviceScreen. ORG3DDeviceScreen.
     * @return THREE.Box2 with the bounds of the element in the screen.
     */
    getBoundsInDeviceScreen(device, deviceScreen) {
        const deviceDisplaySize = device.displaySizeWithOrientation;
        const deviceDisplayScale = device.displayScale;
        const deviceScreenSize = device.screenSizeWithOrientation; // In points
        const screenPlanePosition = deviceScreen.screenWorldPosition; // in world coordinates
        const elementBounds = this.bounds; // In points

        // Attention. In iOS the 0,0 is at top left of screen

        var elementBox2 = new THREE.Box2(
            new THREE.Vector2( elementBounds.left * deviceDisplayScale.x, (deviceScreenSize.height - elementBounds.bottom) * deviceDisplayScale.y),
            new THREE.Vector2( elementBounds.right * deviceDisplayScale.x, (deviceScreenSize.height - elementBounds.top) * deviceDisplayScale.y));
        elementBox2.translate( new THREE.Vector2( - ( deviceDisplaySize.width / 2.0 ), - ( deviceDisplaySize.height / 2.0 ))); // translate relative to center 0,0
        elementBox2.translate( new THREE.Vector2( screenPlanePosition.x , screenPlanePosition.y )); // translate to device location

        return elementBox2;
    }

}
/**
 * Created by jongabilondo on 25/01/2018.
 */


class ORG3DWDAUIElement extends ORG3DUIElement {

    get bounds() {
        return {
            left: this.elementJSON.rect.x,
            top: this.elementJSON.rect.y ,
            bottom: this.elementJSON.rect.y + this.elementJSON.rect.height,
            right: this.elementJSON.rect.x + this.elementJSON.rect.width};
    }

    get hasSize() {
        const bounds = this.bounds;
        return (bounds.right - bounds.left) > 0 && (bounds.bottom - bounds.top) > 0;
    }

}
/**
 * Created by jongabilondo on 25/01/2018.
 */


class ORG3DORGUIElement extends ORG3DUIElement {

    get bounds() {
        return this.elementJSON.bounds;
    }

    get hasSize() {
        const bounds = this.bounds;
        return (bounds.right - bounds.left) > 0 && (bounds.bottom - bounds.top) > 0;
    }

}
/**
 * Created by jongabilondo on 02/12/2017.
 */

class ORGUIJSONTreeManager {

    constructor(placeholder, nodePlaceholder) {
        this._treePlaceholder = placeholder;
        this._nodePlaceholder = nodePlaceholder;
        this._treeAdaptor = null;
        this._treeType = null;
    }

    update(jsonTree, treeType) {
        if (treeType === undefined) {
            console.debug('Tree update requested but type undefined.');
            return;
        }

        this._treeType = treeType;
        switch (treeType) {
            case ORGUIJSONTreeManager.TREE_TYPE_WDA : {
                this._treeAdaptor =  ORGUIJSONWDATreeAdaptor;
            } break;
            case ORGUIJSONTreeManager.TREE_TYPE_ORGANISMO : {
                this._treeAdaptor = ORGUIJSONOrganismoTreeAdaptor;
            } break;
            default : {
                return;
            }
        }

        if (jsonTree == null) {
            this.remove();
            return;
        }

        var adaptedTree = this._treeAdaptor.adaptTree(jsonTree);
        var _this = this;
        $(this._treePlaceholder).treeview({
            data: adaptedTree,
            levels: 15,
            showBorder:false,
            expandIcon:'glyphicon glyphicon-triangle-right',
            collapseIcon:'glyphicon glyphicon-triangle-bottom',
            onNodeSelected: (event, node) => { _this._nodeSelected(event, node);},
            onNodeEnter: (event, node) => { _this._nodeEnter(event, node);},
            onNodeLeave: (event, node) => { _this._nodeLeave(event, node);},
            onNodeContextMenu: (event, node) => { _this._nodeContextMenu(event, node);}
        } );
    }

    remove() {
        $(this._treePlaceholder).treeview('remove');
        $(this._nodePlaceholder).html("");
    }

    nodeParent(node) {
        let parents = $(this._treePlaceholder).treeview('getParents', [node]);
        return (parents.length ?parents[0] :null);
    }


    showClassHierarchy(classHierarchy) {
        var html = "<h4><b>" + "Hierarchy" + "</b></h4>";

        for (let className of classHierarchy) {
            html += '<div style="text-align: center;"><h4><span class="label label-primary text-center">' + className + '</span></h4></div>';
        }
        $(this._nodePlaceholder).html(html);
    }

    _nodeSelected(event, node) {
        const nodeHTMLData = this._treeAdaptor.nodeToHTML(node.representedNode);
        ORG.dispatcher.dispatch({
            actionType: 'uitree-node-selected',
            node:node.representedNode,
            html:nodeHTMLData
        });
    }

    _nodeEnter(event, node) {
        var node3DElement = null;

        if (node  && !node.representedNode) {
            console.debug("The mouseover tree node has no data !");
            return;
        }

        switch (this._treeType) {
            case ORGUIJSONTreeManager.TREE_TYPE_WDA : {
                node3DElement = new ORG3DWDAUIElement(node.representedNode);
            } break;
            case ORGUIJSONTreeManager.TREE_TYPE_ORGANISMO : {
                node3DElement = new ORG3DORGUIElement(node.representedNode);
            } break;
            default : {
                return;
            }
        }

        ORG.dispatcher.dispatch({
            actionType: 'uitree-node-enter',
            node:node3DElement
        });
    }

    _nodeLeave(event, node) {
        ORG.dispatcher.dispatch({
            actionType: 'uitree-node-leave'
        });
    }

    _nodeContextMenu(event, node) {
        //event.clientX = node.clientX;
        //event.clientY = node.clientY;
        ORG.UIJSONTreeContextMenuManager.onContextMenu(event, node);
        //$('#content-wrapper').contextMenu({x:event.clientX, y:event.clientY});
    }
}

ORGUIJSONTreeManager.TREE_TYPE_WDA = 0;
ORGUIJSONTreeManager.TREE_TYPE_ORGANISMO = 1;

/**
 * Created by jongabilondo on 23/01/2018.
 */


/***
 * Functions to adapt a WDA JSON tree to a patternfly-bootstrap-treeview.
 */
class ORGUIJSONWDATreeAdaptor {

    static adaptTree(jsonTree) {
        var newTree = [];
        if (!jsonTree) {
            return null;
        }
        for (let node of jsonTree) {
            var newNode = { representedNode:node};
            newTree.push(newNode);
            newNode.nodes = node.children;

            // Compose text for node
            newNode.text = node.type;
            if (node.label) {
                newNode.text += " - " + node.label;
            } else if (node.name) {
                newNode.text += " - " + node.name;
            } else if (node.value) {
                newNode.value += " - " + node.value;
            }

            // hidden icon
            if (node.isVisible == "0") {
                newNode.icon = 'glyphicon glyphicon-eye-close';
            }

            // subnodes
            var subTree = this.adaptTree(node.children);
            if (subTree) {
                newNode.nodes = subTree;
            }
        }
        return newTree;
    }

    static nodeToHTML(node) {
        var description = "";

        const className = node.type;
        if (className) {
            description += "<h4><b>" + className + "</b></h4>";
        }

        for (let key in node) {
            if (this.ignoreNodeKey(key)) {
                continue;
            }
            if (key == "rect") {
                description += "<b>" + key + "</b>:&nbsp" + JSON.stringify(node.rect) + "<br>";
            } else {
                description += "<b>" + key + "</b>:&nbsp" + node[key] + "<br>";
            }
        }
        description += "<br>";

        return description;
    }

    static ignoreNodeKey(key) {
        return (key == "text" || key == "state" || key == "children" || key == "nodes" || key == "$el" || key == "screenshot" || key == "nodeId" || key == "parentId");
    }
}
/**
 * Created by jongabilondo on 23/01/2018.
 */


/***
 * Functions to adapt an Organismo UI tree to a patternfly-bootstrap-treeview.
 */
class ORGUIJSONOrganismoTreeAdaptor {

    static adaptTree(jsonTree) {
        var newTree = [];
        if (!jsonTree) {
            return null;
        }
        for (let node of jsonTree) {
            var newNode = { representedNode:node};
            newTree.push(newNode);
            newNode.nodes = node.subviews;

            // Compose text for node
            newNode.text = node.class;
            if (node.accessibilityLabel) {
                newNode.text += " - " + node.accessibilityLabel;
            } else if (node.currentTitle) {
                newNode.text += " - " + node.currentTitle;
            } else if (node.text) {
                newNode.text += " - " + node.text;
            }

            // hidden icon
            if (node.hidden) {
                newNode.icon = 'glyphicon glyphicon-eye-close';
            }

            // subnodes
            var subTree = this.adaptTree(node.subviews);
            if (subTree) {
                newNode.nodes = subTree;
            }
        }
        return newTree;
    }

    static nodeToHTML(node) {
        var description = "";

        const className = node.class;
        if (className) {
            description += "<h4><b>" + className + "</b></h4>";
        }

        for (let key in node) {
            if (this.ignoreNodeKey(key)) {
                continue;
            }
            if (key == "bounds") {
                description += "<b>" + key + "</b>:&nbsp" + JSON.stringify(node.bounds) + "<br>";
            } else {
                description += "<b>" + key + "</b>:&nbsp" + node[key] + "<br>";
            }
        }
        description += "<br>";

        return description;
    }

    static ignoreNodeKey(key) {
        return (key == "text" || key == "state" || key == "subviews" || key == "nodes" || key == "$el" || key == "screenshot" || key == "nodeId" || key == "parentId");
    }

}
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
                case "ORG":
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
            bootbox.dialog({ closeButton: false, message: '<div class="text-center"><h5><i class="fa fa-spin fa-spinner"></i> Connecting to device ...</h5></div>' }); // Progress alert
            // 1. Open session
            let session = await controller.openSession();
            ORG.dispatcher.dispatch({
                actionType: 'session-open'
            });

            bootbox.hideAll();
            bootbox.dialog({ closeButton: false, message: '<div class="text-center"><h5><i class="fa fa-spin fa-spinner"></i> Getting device information...</h5></div>' }); // Progress alert

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

            controller.requestScreenshot(); // start getting screenshots

        } catch(err) {
            bootbox.hideAll();
            this._handleError(err);
        }
    }

    static async refreshUITree() {
        bootbox.dialog({ message: '<div class="text-center"><h5><i class="fa fa-spin fa-spinner"></i>&nbsp;Getting device information...</h5></div>' });
        try {
            let controller = ORG.deviceController;
            let orientation = await controller.getDeviceOrientation();
            let tree = await controller.getElementTree();
            let screenshot = await controller.getScreenshot();

            ORG.dispatcher.dispatch({
                actionType: 'ui-json-tree-update',
                tree: tree.children,
                treeType: (ORG.deviceController.type === "WDA") ?ORGUIJSONTreeManager.TREE_TYPE_WDA :ORGUIJSONTreeManager.TREE_TYPE_ORGANISMO
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
            bootbox.hideAll()
            this._handleError(err)
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
/**
 * Created by jongabilondo on 04/05/2016.
 */
/**
 *   Snap marker to closest point on a line.
 *
 *   Based on Distance to line example by
 *	Marcelo, maps.forum.nu - http://maps.forum.nu/gm_mouse_dist_to_line.html
 *   Then
 *	@ work of Björn Brala - Swis BV who wrapped the algorithm in a class operating on GMap Objects
 *   And now
 *	Bill Chadwick who factored the basic algorithm out of the class (removing much intermediate storage of results)
 *   	and added distance along line to nearest point calculation
 *
 *
 *   Usage:
 *
 *   Create the class
 *       var oSnap = new cSnapToRoute();
 *
 *   Initialize the subjects
 *       oSnap.init(oMap, oMarker, oPolyline);
 *
 *   If needed change the marker or polyline subjects. use null when no update
 *       Change Both:
 *           oSnap.updateTargets(oMarker, oPolyline);
 *       Change marker:
 *           oSnap.updateTargets(oMarker, null);
 *       Change polyline:
 *           oSnap.updateTargets(null, oPolyline);
 **/

function cSnapToRoute(){

    this.routePoints    = Array();
    this.routePixels    = Array();
    this.routeOverlay   = null;
    this.normalProj     = G_NORMAL_MAP.getProjection();


    /**
     *   @desc Initialize the objects.
     *   @param Map object
     *   @param GMarker object to move along the route
     *   @param GPolyline object - the 'route'
     **/
    this.init = function(oMap, oMarker, oPolyline){
        this._oMap      = oMap;
        this._oMarker   = oMarker;
        this._oPolyline = oPolyline;

        this.loadRouteData();   // Load needed data for point calculations
        this.loadMapListener();
    }

    /**
     *   @desc Update targets
     *   @param GMarker object to move along the route
     *   @param GPolyline object - the 'route'
     **/
    this.updateTargets = function(oMarker, oPolyline) {
        this._oMarker   = oMarker   || this._oMarker;
        this._oPolyline = oPolyline || this._oPolyline;
        this.loadRouteData();
    }

    /**
     *   @desc internal use only, Load map listeners to calculate and update this.oMarker position.
     **/
    this.loadMapListener = function(){
        var self = this;
        GEvent.addListener(self._oMap, 'mousemove', GEvent.callback(self, self.updateMarkerLocation));
        GEvent.addListener(self._oMap, 'zoomend', GEvent.callback(self, self.loadRouteData));
    }

    /**
     *   @desc internal use only, Load route points into RoutePixel array for calculations, do this whenever zoom changes
     **/
    this.loadRouteData = function(){
        var zoom = this._oMap.getZoom();
        this.routePixels = new Array();
        for ( var i = 0; i < this._oPolyline.getVertexCount(); i++ ) {
            var Px = this.normalProj.fromLatLngToPixel(this._oPolyline.getVertex(i), zoom);
            this.routePixels.push(Px);
        }
    }

    /**
     *   @desc internal use only, Handle the move listeners output and move the given marker.
     *   @param GLatLng()
     **/
    this.updateMarkerLocation = function(mouseLatLng) {
        var oMarkerLatLng = this.getClosestLatLng(mouseLatLng);
        this._oMarker.setPoint(oMarkerLatLng);
    }

    /**
     *   @desc Get closest point on route to test point
     *   @param GLatLng() the test point
     *   @return new GLatLng();
     **/
    this.getClosestLatLng = function(latlng){
        var r = this.distanceToLines(latlng);
        return this.normalProj.fromPixelToLatLng(new GPoint(r.x,r.y), this._oMap.getZoom());
    }

    /**
     *   @desc Get distance along route in meters of closest point on route to test point
     *   @param GLatLng() the test point
     *   @return distance in meters;
     **/
    this.getDistAlongRoute = function(latlng){
        var r = this.distanceToLines(latlng);
        return this.getDistToLine(r.i, r.fTo);
    }

    /**
     *   @desc internal use only, gets test point xy and then calls fundamental algorithm
     **/
    this.distanceToLines = function(mouseLatLng) {
        var zoom        = this._oMap.getZoom();
        var mousePx     = this.normalProj.fromLatLngToPixel(mouseLatLng, zoom);
        var routePixels = this.routePixels;
        return getClosestPointOnLines(mousePx,routePixels);
    }

    /**
     *   @desc internal use only, find distance along route to point nearest test point
     **/
    this.getDistToLine = function(iLine, fTo){

        var routeOverlay = this._oPolyline;
        var d = 0;
        for (var n = 1 ; n < iLine ; n++ )
            d += routeOverlay.getVertex(n-1).distanceFrom(routeOverlay.getVertex(n));
        d += routeOverlay.getVertex(iLine-1).distanceFrom(routeOverlay.getVertex(iLine)) * fTo;

        return d;
    }


}

/* desc Static function. Find point on lines nearest test point
 test point pXy with properties .x and .y
 lines defined by array aXys with nodes having properties .x and .y
 return is object with .x and .y properties and property i indicating nearest segment in aXys
 and property fFrom the fractional distance of the returned point from aXy[i-1]
 and property fTo the fractional distance of the returned point from aXy[i]	*/


function getClosestPointOnLines (pXy,aXys) {

    var minDist;
    var fTo;
    var fFrom;
    var x;
    var y;
    var i;
    var dist;

    if (aXys.length > 1){

        for (var n = 1 ; n < aXys.length ; n++ ) {

            if (aXys[n].x != aXys[n-1].x) {
                var a = (aXys[n].y - aXys[n-1].y) / (aXys[n].x - aXys[n-1].x);
                var b = aXys[n].y - a * aXys[n].x;
                dist = Math.abs(a*pXy.x + b - pXy.y) / Math.sqrt(a*a+1);
            }
            else
                dist = Math.abs(pXy.x - aXys[n].x)

            // length^2 of line segment
            var rl2 = Math.pow(aXys[n].y - aXys[n-1].y,2) + Math.pow(aXys[n].x - aXys[n-1].x,2);

            // distance^2 of pt to end line segment
            var ln2 = Math.pow(aXys[n].y - pXy.y,2) + Math.pow(aXys[n].x - pXy.x,2);

            // distance^2 of pt to begin line segment
            var lnm12 = Math.pow(aXys[n-1].y - pXy.y,2) + Math.pow(aXys[n-1].x - pXy.x,2);

            // minimum distance^2 of pt to infinite line
            var dist2 = Math.pow(dist,2);

            // calculated length^2 of line segment
            var calcrl2 = ln2 - dist2 + lnm12 - dist2;

            // redefine minimum distance to line segment (not infinite line) if necessary
            if (calcrl2 > rl2)
                dist = Math.sqrt( Math.min(ln2,lnm12) );

            if ( (minDist == null) || (minDist > dist) ) {
                if(calcrl2 > rl2){
                    if(lnm12 < ln2){
                        fTo = 0;//nearer to previous point
                        fFrom = 1;
                    }
                    else{
                        fFrom = 0;//nearer to current point
                        fTo = 1;
                    }
                }
                else {
                    // perpendicular from point intersects line segment
                    fTo  = ((Math.sqrt(lnm12 - dist2)) / Math.sqrt(rl2));
                    fFrom = ((Math.sqrt(ln2 - dist2))   / Math.sqrt(rl2));
                }
                minDist = dist;
                i = n;
            }
        }

        var dx = aXys[i-1].x - aXys[i].x;
        var dy = aXys[i-1].y - aXys[i].y;

        x = aXys[i-1].x - (dx * fTo);
        y = aXys[i-1].y - (dy * fTo);

    }

    return {'x':x, 'y':y, 'i':i, 'fTo':fTo, 'fFrom':fFrom};

}


/*********************************************************************\
*                                                                     *
* epolys.js                                          by Mike Williams *
* updated to API v3                                  by Larry Ross    *
*                                                                     *
* A Google Maps API Extension                                         *
*                                                                     *
* Adds various Methods to google.maps.Polygon and google.maps.Polyline *
*                                                                     *
* .Contains(latlng) returns true is the poly contains the specified   *
*                   GLatLng                                           *
*                                                                     *
* .Area()           returns the approximate area of a poly that is    *
*                   not self-intersecting                             *
*                                                                     *
* .Distance()       returns the length of the poly path               *
*                                                                     *
* .Bounds()         returns a GLatLngBounds that bounds the poly      *
*                                                                     *
* .GetPointAtDistance() returns a GLatLng at the specified distance   *
*                   along the path.                                   *
*                   The distance is specified in metres               *
*                   Reurns null if the path is shorter than that      *
*                                                                     *
* .GetPointsAtDistance() returns an array of GLatLngs at the          *
*                   specified interval along the path.                *
*                   The distance is specified in metres               *
*                                                                     *
* .GetIndexAtDistance() returns the vertex number at the specified    *
*                   distance along the path.                          *
*                   The distance is specified in metres               *
*                   Returns null if the path is shorter than that      *
*                                                                     *
* .Bearing(v1?,v2?) returns the bearing between two vertices          *
*                   if v1 is null, returns bearing from first to last *
*                   if v2 is null, returns bearing from v1 to next    *
*                                                                     *
*                                                                     *
***********************************************************************
*                                                                     *
*   This Javascript is provided by Mike Williams                      *
*   Blackpool Community Church Javascript Team                        *
*   http://www.blackpoolchurch.org/                                   *
*   http://econym.org.uk/gmap/                                        *
*                                                                     *
*   This work is licenced under a Creative Commons Licence            *
*   http://creativecommons.org/licenses/by/2.0/uk/                    *
*                                                                     *
***********************************************************************
*                                                                     *
* Version 1.1       6-Jun-2007                                        *
* Version 1.2       1-Jul-2007 - fix: Bounds was omitting vertex zero *
*                                add: Bearing                         *
* Version 1.3       28-Nov-2008  add: GetPointsAtDistance()           *
* Version 1.4       12-Jan-2009  fix: GetPointsAtDistance()           *
* Version 3.0       11-Aug-2010  update to v3                         *
*                                                                     *
\*********************************************************************/

// === first support methods that don't (yet) exist in v3
google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {
  var EarthRadiusMeters = 6378137.0; // meters
  var lat1 = this.lat();
  var lon1 = this.lng();
  var lat2 = newLatLng.lat();
  var lon2 = newLatLng.lng();
  var dLat = (lat2-lat1) * Math.PI / 180;
  var dLon = (lon2-lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = EarthRadiusMeters * c;
  return d;
}

google.maps.LatLng.prototype.latRadians = function() {
  return this.lat() * Math.PI/180;
}

google.maps.LatLng.prototype.lngRadians = function() {
  return this.lng() * Math.PI/180;
}

// === A method for testing if a point is inside a polygon
// === Returns true if poly contains point
// === Algorithm shamelessly stolen from http://alienryderflex.com/polygon/ 
google.maps.Polygon.prototype.Contains = function(point) {
  var j=0;
  var oddNodes = false;
  var x = point.lng();
  var y = point.lat();
  for (var i=0; i < this.getPath().getLength(); i++) {
    j++;
    if (j == this.getPath().getLength()) {j = 0;}
    if (((this.getPath().getAt(i).lat() < y) && (this.getPath().getAt(j).lat() >= y))
    || ((this.getPath().getAt(j).lat() < y) && (this.getPath().getAt(i).lat() >= y))) {
      if ( this.getPath().getAt(i).lng() + (y - this.getPath().getAt(i).lat())
      /  (this.getPath().getAt(j).lat()-this.getPath().getAt(i).lat())
      *  (this.getPath().getAt(j).lng() - this.getPath().getAt(i).lng())<x ) {
        oddNodes = !oddNodes
      }
    }
  }
  return oddNodes;
}

// === A method which returns the approximate area of a non-intersecting polygon in square metres ===
// === It doesn't fully account for spherical geometry, so will be inaccurate for large polygons ===
// === The polygon must not intersect itself ===
google.maps.Polygon.prototype.Area = function() {
  var a = 0;
  var j = 0;
  var b = this.Bounds();
  var x0 = b.getSouthWest().lng();
  var y0 = b.getSouthWest().lat();
  for (var i=0; i < this.getPath().getLength(); i++) {
    j++;
    if (j == this.getPath().getLength()) {j = 0;}
    var x1 = this.getPath().getAt(i).distanceFrom(new google.maps.LatLng(this.getPath().getAt(i).lat(),x0));
    var x2 = this.getPath().getAt(j).distanceFrom(new google.maps.LatLng(this.getPath().getAt(j).lat(),x0));
    var y1 = this.getPath().getAt(i).distanceFrom(new google.maps.LatLng(y0,this.getPath().getAt(i).lng()));
    var y2 = this.getPath().getAt(j).distanceFrom(new google.maps.LatLng(y0,this.getPath().getAt(j).lng()));
    a += x1*y2 - x2*y1;
  }
  return Math.abs(a * 0.5);
}

// === A method which returns the length of a path in metres ===
google.maps.Polygon.prototype.Distance = function() {
  var dist = 0;
  for (var i=1; i < this.getPath().getLength(); i++) {
    dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i-1));
  }
  return dist;
}

// === A method which returns the bounds as a GLatLngBounds ===
google.maps.Polygon.prototype.Bounds = function() {
  var bounds = new google.maps.LatLngBounds();
  for (var i=0; i < this.getPath().getLength(); i++) {
    bounds.extend(this.getPath().getAt(i));
  }
  return bounds;
}

// === A method which returns a GLatLng of a point a given distance along the path ===
// === Returns null if the path is shorter than the specified distance ===
google.maps.Polygon.prototype.GetPointAtDistance = function(metres) {
  // some awkward special cases
  if (metres == 0) return this.getPath().getAt(0);
  if (metres < 0) return null;
  if (this.getPath().getLength() < 2) return null;
  var dist=0;
  var olddist=0;
  for (var i=1; (i < this.getPath().getLength() && dist < metres); i++) {
    olddist = dist;
    dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i-1));
  }
  if (dist < metres) {
    return null;
  }
  var p1= this.getPath().getAt(i-2);
  var p2= this.getPath().getAt(i-1);
  var m = (metres-olddist)/(dist-olddist);
  return new google.maps.LatLng( p1.lat() + (p2.lat()-p1.lat())*m, p1.lng() + (p2.lng()-p1.lng())*m);
}

// === A method which returns an array of GLatLngs of points a given interval along the path ===
google.maps.Polygon.prototype.GetPointsAtDistance = function(metres) {
  var next = metres;
  var points = [];
  // some awkward special cases
  if (metres <= 0) return points;
  var dist=0;
  var olddist=0;
  for (var i=1; (i < this.getPath().getLength()); i++) {
    olddist = dist;
    dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i-1));
    while (dist > next) {
      var p1= this.getPath().getAt(i-1);
      var p2= this.getPath().getAt(i);
      var m = (next-olddist)/(dist-olddist);
      points.push(new google.maps.LatLng( p1.lat() + (p2.lat()-p1.lat())*m, p1.lng() + (p2.lng()-p1.lng())*m));
      next += metres;    
    }
  }
  return points;
}

// === A method which returns the Vertex number at a given distance along the path ===
// === Returns null if the path is shorter than the specified distance ===
google.maps.Polygon.prototype.GetIndexAtDistance = function(metres) {
  // some awkward special cases
  if (metres == 0) return this.getPath().getAt(0);
  if (metres < 0) return null;
  var dist=0;
  var olddist=0;
  for (var i=1; (i < this.getPath().getLength() && dist < metres); i++) {
    olddist = dist;
    dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i-1));
  }
  if (dist < metres) {return null;}
  return i;
}

// === A function which returns the bearing between two vertices in decgrees from 0 to 360===
// === If v1 is null, it returns the bearing between the first and last vertex ===
// === If v1 is present but v2 is null, returns the bearing from v1 to the next vertex ===
// === If either vertex is out of range, returns void ===
google.maps.Polygon.prototype.Bearing = function(v1,v2) {
  if (v1 == null) {
    v1 = 0;
    v2 = this.getPath().getLength()-1;
  } else if (v2 ==  null) {
    v2 = v1+1;
  }
  if ((v1 < 0) || (v1 >= this.getPath().getLength()) || (v2 < 0) || (v2 >= this.getPath().getLength())) {
    return;
  }
  var from = this.getPath().getAt(v1);
  var to = this.getPath().getAt(v2);
  if (from.equals(to)) {
    return 0;
  }
  var lat1 = from.latRadians();
  var lon1 = from.lngRadians();
  var lat2 = to.latRadians();
  var lon2 = to.lngRadians();
  var angle = - Math.atan2( Math.sin( lon1 - lon2 ) * Math.cos( lat2 ), Math.cos( lat1 ) * Math.sin( lat2 ) - Math.sin( lat1 ) * Math.cos( lat2 ) * Math.cos( lon1 - lon2 ) );
  if ( angle < 0.0 ) angle  += Math.PI * 2.0;
  angle = angle * 180.0 / Math.PI;
  return parseFloat(angle.toFixed(1));
}




// === Copy all the above functions to GPolyline ===
google.maps.Polyline.prototype.Contains             = google.maps.Polygon.prototype.Contains;
google.maps.Polyline.prototype.Area                 = google.maps.Polygon.prototype.Area;
google.maps.Polyline.prototype.Distance             = google.maps.Polygon.prototype.Distance;
google.maps.Polyline.prototype.Bounds               = google.maps.Polygon.prototype.Bounds;
google.maps.Polyline.prototype.GetPointAtDistance   = google.maps.Polygon.prototype.GetPointAtDistance;
google.maps.Polyline.prototype.GetPointsAtDistance  = google.maps.Polygon.prototype.GetPointsAtDistance;
google.maps.Polyline.prototype.GetIndexAtDistance   = google.maps.Polygon.prototype.GetIndexAtDistance;
google.maps.Polyline.prototype.Bearing              = google.maps.Polygon.prototype.Bearing;






