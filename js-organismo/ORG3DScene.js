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

const kORGCameraTWEENDuration = 600.0;
const kORGFloorPositionY = -450;


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
        this._uiTreeModelRaycaster = null; // a ORG3DRaycaster
        this._screenRaycaster = null; // a ORG3DRaycaster
        this._mouseListener = null; // a ORGMouseListener
        this._device3DModel = null; // a ORG3DDeviceModel
        this._tooltiper = null; // a ORGTooltip
        this._threeScene = null;
        this._threeCamera = null;
        this._threeRenderer = null;
        this._threeOrbitControls = null;
        this._keyboardState = null;
        this._threeClock = null;
        this._screenshotImage = null;
        this._screenshotNeedsUpdate = false;
        this._deviceScreenSize = null;
        this._uiExpanded = false;
        this._canvasDomElement = null; // the table cell where the renderer will be created, it contains _threeRendererDOMElement
        this._threeRendererDOMElement = null; // threejs scene is displayed in this DOM element
        this._contextMenuManager = null;
        this._locationMarker = null;
        this._lastLocationName = "?";
        this._transformControl = null;
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
            ORGTreeVisualizationMask.ShowScreenshots;

        this._uiTreeModel = new ORGUITreeModel( this._treeVisualizationFlags);
        this._initialize(domContainer, this.flagShowFloor);
    }

    //------------------------------------------------------------------------------------------------------------------
    // GET/SET
    //------------------------------------------------------------------------------------------------------------------
    get isExpanded() {
        return this._uiExpanded;
    }

    get deviceScreenBoundingBox() {
        return this._deviceScreen.boundingBox;
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
    }

    /**
     * Sets the Image that will be used to create the texture to set it to the device screen.
     * It sets the image in a variable to be used in the next render cycle.
     * @param image.
     */
    setScreenshotImage(image) {
        this._screenshotImage = image;
        this._screenshotNeedsUpdate = true;
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
        this._uiExpanded = true;
        this._uiTreeModel.updateUITreeModel( treeJson, this._threeScene, this._screenshotImage, this._deviceScreenSize);

        this.createRaycasterFor3DTreeModel(); // Create Raycaster for the 3D UI Model object

        if ( this.flagShowTooltips) {
            this.enableTooltips();
        }
    };

    removeUITreeModel( ) {
        this._uiTreeModel.removeUITreeModel( this._threeScene);
    }

    createDeviceScreen(width, height, zPosition) {
        //var geometry,material;
        this._deviceScreenSize = { width:width, height:height};
        this._deviceScreen = new ORG3DDeviceScreen(width, height, zPosition, this._threeScene);
    }

    removeDeviceScreen() {
        if ( this._deviceScreen) {
            this.removeRaycasterForDeviceScreen();
            this._deviceScreen.destroy();
            this._deviceScreen = null;
        }
    }

    setDeviceOrientation(orientation, width, height) {

        if ( this._uiExpanded && this._uiTreeModel) {
            this._uiTreeModel.removeUITreeModel( this._threeScene);
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

    createRaycasterFor3DTreeModel() {
        this._uiTreeModelRaycaster = new ORG3DRaycaster( this._threeRendererDOMElement, this._threeCamera, this._uiTreeModel.treeGroup);
        this._uiTreeModelRaycaster.addDelegate( new ORG3DUIElementHiliter()); // attach a hiliter
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

    createRaycasterForDeviceScreen() {
        this._screenRaycaster = new ORG3DRaycaster( this._threeRendererDOMElement, this._threeCamera, this._deviceScreen.screenPlane);
        this._screenRaycaster.addDelegate( this._contextMenuManager); // attach a context menu manager

        // Activate mouse listener
        this._mouseListener.addDelegate( this._screenRaycaster); // send the mouse events to the Raycaster
        this._mouseListener.enable();
    }

    removeRaycasterForDeviceScreen() {
        // Deactivate mouse listener
        this._mouseListener.disable();
        this._mouseListener.removeDelegate( this._screenRaycaster); // send the mouse events to the Raycaster

        // Destroy raycaster
        this._screenRaycaster = null;
    }

    setLiveScreen(live) {
        this.flagContinuousScreenshot = live;
        if ( this._deviceScreen) {
            if ((this._sceneVisualFlags & ORGSceneVisualizationMask.ContinuousUpdate) && !this._uiExpanded) {
                ORG.deviceController.requestScreenshot();
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
            this._tooltiper = new ORGTooltip( this._threeRendererDOMElement);
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
        if ( !this._sceneFloor) {
            this._sceneFloor = this._createFloor( this._threeScene);
            this.devicePositionHasChanged();
        }
    };

    removeFloor() {
        if ( this._sceneFloor) {
            this._removeFloor();
        }
    };

    expand() {
        if ( !this._uiExpanded) {
            ORG.deviceController.requestElementTree({
                "status-bar": true,
                "keyboard": true,
                "alert": true,
                "normal": true
            });
        }
    }

    collapseAndExpandAnimated() {
        const _this = this;
        this.collapse( function () {
            _this.expand();
        } )
    }

    collapse( completionCallback ) {
        if ( this._uiExpanded) {
            // we dont need the mouse listener and the raycaster anymore
            this._mouseListener.disable();

            this.disableTooltips();

            const _this = this;
            const requestScreenshot = this.flagContinuousScreenshot;

            this._uiTreeModel.collapseWithCompletion( function() {
                if (_this._deviceScreen) {
                    _this._deviceScreen.show();
                }
                if (requestScreenshot) {
                    ORG.deviceController.requestScreenshot(); // keep updating screenshot
                }
                _this.createRaycasterForDeviceScreen();
                _this._uiExpanded = false;

                if (completionCallback) {
                    completionCallback();
                }
            });
        }
    }

    rotateDevice() {
        if (this._transformControl) {
            this._threeScene.remove( this._transformControl );
            this._transformControl = null;
        } else {
            const _this = this;
            this._transformControl = new THREE.TransformControls( this._threeCamera, this._threeRenderer.domElement );
            this._transformControl.setMode("rotate");
            this._transformControl.addEventListener( 'change', function() {
                _this._transformControlChanged();
            } );
            this._transformControl.attach( this._deviceScreen.screenPlane );
            this._threeScene.add( this._transformControl );
        }
    }

    /**
     * Locate the camera at default position and looking a t 0,0,0.
     */
    resetCameraPosition() {

        // Avoid flickering by stopping screen updates
        const liveScreen = this.flagContinuousScreenshot;
        if ( liveScreen) {
            this.setLiveScreen( false);
        }

        const _this = this;
        new TWEEN.Tween( this._threeCamera.position ).to( {
            x: 0,
            y: 0,
            z: 900}, kORGCameraTWEENDuration)
            .easing( TWEEN.Easing.Quadratic.InOut)
            .onComplete(function () {
                if (liveScreen) {
                    _this.setLiveScreen( true);
                }
            }).start();

        // TWEEN camera lookAt. But we can't do it setting camera.lookAt ! Due to collision with OrbitControls !
        // We must use the OrbitControl.target instead.
        new TWEEN.Tween( _this._threeOrbitControls.target ).to( {
            x: 0,
            y: 0,
            z: 0}, kORGCameraTWEENDuration)
            .easing( TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    /**
     * Function to reset the rotation of the Device.
     */
    resetDevicePosition() {

        const screenObject = this._transformControl.object;

        if (this._deviceScreen) {
            this._deviceScreen.screenPlane.rotation.set(0,0,0);
        }

        if (this._device3DModel) {

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

            // translate device
            this._device3DModel.THREEObject.applyMatrix(new THREE.Matrix4().makeTranslation( position.x, position.y, position.z ) );

            // Broadcast the value to the device
            if (ORG.deviceController) {
                const msg = ORGMessageBuilder.attitudeUpdate(screenObject.quaternion);
                ORG.deviceController.sendMessage(msg);
            }
        }
    }

    /**
     * Set the camera looking at the given THREE object.
     * @param threeObject
     */
    lookAtObject( threeObject ) {

        // We can't do it setting camera.lookAt ! Due to collision with OrbitControls !
        // We must use the OrbitControl.target instead.
        new TWEEN.Tween( this._threeOrbitControls.target ).to( {
            x: threeObject.position.x,
            y: threeObject.position.y,
            z: threeObject.position.z}, kORGCameraTWEENDuration)
            .easing( TWEEN.Easing.Quadratic.InOut)
            .start();

    }

    lookFrontAtObject( threeObject ) {

        // We can't do it setting camera.lookAt ! Due to collision with OrbitControls !
        // We must use the OrbitControl.target instead.

        new TWEEN.Tween( this._threeCamera.position ).to( {
            x: threeObject.position.x,
            y: threeObject.position.y,
            z: 900}, kORGCameraTWEENDuration)
            .easing( TWEEN.Easing.Quadratic.InOut)
            .start();

        new TWEEN.Tween( this._threeOrbitControls.target ).to( {
            x: threeObject.position.x,
            y: threeObject.position.y,
            z: threeObject.position.z}, kORGCameraTWEENDuration)
            .easing( TWEEN.Easing.Quadratic.InOut)
            .start();

    }

    addDevice3DModel( device3DModel ) {
        this._device3DModel = device3DModel;
        this._device3DModel.addToScene( this._threeScene);
        this.devicePositionHasChanged();
    }

    showDevice3DModel() {
        this.hideDevice3DModel();
        ORG3DDeviceModelLoader.loadDevice3DModel( ORG.device, this ); // async. When loaded it will call "addDevice3DModel"
    }

    hideDevice3DModel() {
        if ( !!this._device3DModel ) {
            this._device3DModel.destroy();
            this._device3DModel = null;
        }
        this.devicePositionHasChanged();
    }

    enableShowLocation() {
        this.flagShowLocation = true;

        if (!this._locationMarker) {
            const floorPosition = this._calculateFloorPosition();
            this._locationMarker = new ORG3DLocationMarker( floorPosition, this._lastLocationName, this._threeScene);
        }
    }

    disableShowLocation() {
        this.flagShowLocation = false;
        if (this._locationMarker) {
            this._locationMarker.destructor();
            this._locationMarker = null;
        }
    }

    setShowPrivate(flag) {
        this.flagShowPrivateClasses = flag;
        this._uiTreeModel.visualizationFlags = this._treeVisualizationFlags;

        const _this = this;
        if ( this._uiExpanded && this._uiTreeModel) {
            this.collapseAndExpandAnimated();
        }
    }

    setShowTextures(flag) {
        this.flagShowScreenshots = flag;
        this._uiTreeModel.visualizationFlags = this._treeVisualizationFlags;

        if ( this._uiTreeModel ) {
            this._uiTreeModel.hideTextures(!flag);
        }
    };

    setShowInteractive( flag ) {
        this.flagShowInteractiveViews = flag;
        this._uiTreeModel.visualizationFlags = this._treeVisualizationFlags;
        if ( this._uiExpanded && this._uiTreeModel) {
            this.collapseAndExpandAnimated( );
        }
    }

    setShowNonInteractive( flag ) {
        this.flagShowNonInteractiveViews = flag;
        this._uiTreeModel.visualizationFlags = this._treeVisualizationFlags;
        if ( this._uiExpanded && this._uiTreeModel) {
            this.collapseAndExpandAnimated( );
        }
    }

    setShowHiddenViews( flag) {
        this.flagShowHiddenViews = flag;
        this._uiTreeModel.visualizationFlags = this._treeVisualizationFlags;
        if (this._uiExpanded && this._uiTreeModel) {
            this.collapseAndExpandAnimated();
        }
    }

    setShowNormalWindow(flag) {
    }

    setShowKeyboardWindow(flag) {
        this.flagShowKeyboardWindow = flag;
        this._uiTreeModel.visualizationFlags = this._treeVisualizationFlags;
        if (this._uiExpanded && this._uiTreeModel) {
            this.collapseAndExpandAnimated( );
        }
    }

    setShowAlertWindow(flag) {
    }

    devicePositionHasChanged() {
        const bBox = this._deviceBoundingBox();
        this._adjustFloorPosition(bBox);
        this._adjustLocationMarkerPosition(bBox);
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
                this._locationMarker = new ORG3DLocationMarker( floorPosition, this._lastLocationName, this._threeScene);
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

        this._threeScene = new THREE.Scene();
        this._threeCamera = new THREE.PerspectiveCamera(75, rendererCanvasWidth / rendererCanvasHeight, 0.1, 10000);
        this._threeRenderer = new THREE.WebGLRenderer({antialias: true /*, alpha:true (if transparency wanted)*/});
        this._threeRenderer.domElement.style.position = 'absolute';
        this._threeRenderer.domElement.style.top = 0;
        //_threeRenderer.domElement.style.zIndex = 0;
        //_threeRenderer.setClearColor(0x000000);

        this._threeRenderer.setSize(rendererCanvasWidth, rendererCanvasHeight);
        this._canvasDomElement.appendChild( this._threeRenderer.domElement);
        this._threeRendererDOMElement = this._threeRenderer.domElement; // the DOM element for the renderer

        this._threeOrbitControls = new THREE.OrbitControls( this._threeCamera, this._threeRenderer.domElement);//this._canvasDomElement);
        this._keyboardState = new KeyboardState();

        //this._zPosition += 10;
        if (showFloor) {
            this._sceneFloor = this._createFloor(this._threeScene);
        }

        this._createLights();

        this._threeCamera.position.z = 900;
        this._threeClock = new THREE.Clock();

        // Create the rightMouse click manager
        this._contextMenuManager = new ORGContextMenuManager(this);

        // Create a mouse event listener and associate delegates
        this._mouseListener = new ORGMouseListener( this._threeRendererDOMElement);
        this._mouseListener.addDelegate( this._contextMenuManager);
        this._mouseListener.enable();

        this._render();
        ORG.WindowResize( this._threeRenderer, this._threeCamera, this._canvasDomElement);

    }

    _calculateFloorPosition() {
        if (this._sceneFloor) {
            return this._sceneFloor.position;
        } else {
            return new THREE.Vector3(0, kORGFloorPositionY, 0);
        }
    }

    _createFloor( threeScene ) {
        return new ORG3DSceneFloor(4000, 50, true, threeScene, kORGFloorPositionY);
    }

    _removeFloor() {
        if (this._sceneFloor) {
            this._sceneFloor.remove();
        }
        this._sceneFloor = null;
    }

    _createLights() {
        // LIGHTS
        var light = new THREE.PointLight(0xaaaaaa);
        light.position.set(500,-500,500);
        this._threeScene.add(light);

        light = new THREE.PointLight(0xaaaaaa);
        light.position.set(500,500,500);
        this._threeScene.add(light);

        light = new THREE.PointLight(0xaaaaaa);
        light.position.set(-500,-500,-500);
        this._threeScene.add(light);

        light = new THREE.PointLight(0xaaaaaa);
        light.position.set(-500,500,-500);
        this._threeScene.add(light);

//            var light2 = new THREE.AmbientLight(0xffffff);
//            scene.add(light2);
    }

    _updateScreenshot() {

        if (this._deviceScreen && this._screenshotNeedsUpdate && this._screenshotImage) {
            this._screenshotNeedsUpdate = false;
            this._deviceScreen.setScreenshot(this._screenshotImage);
        }
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

    _adjustFloorPosition(deviceBoundingBox) {
        if (deviceBoundingBox && this._sceneFloor) {
            this._sceneFloor.setPosition(0, deviceBoundingBox.min.y - 50, 0);
        }
    }

    _adjustLocationMarkerPosition(deviceBoundingBox) {
        if ( deviceBoundingBox && this._locationMarker) {
            this._locationMarker.setPositionY(deviceBoundingBox.min.y - 50);
        }
    }

    _render() {

        const _this = this;

        requestAnimationFrame( function() {
            _this._threeRenderer.render( _this._threeScene, _this._threeCamera);
            _this._threeOrbitControls.update();
            _this._updateScene();
            TWEEN.update();
            _this._render();
        });
    }

    _updateScene()
    {
        //var t0 = clock.getElapsedTime();
        //var timeOffset = 0.125 * t0;
        //var delta = _threeClock.getDelta(); // seconds.
        //var moveDistance = 200 * delta; // 200 pixels per second
        //var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
        //var deviceMotionChanged = false;

        this._updateScreenshot();
        if (this._transformControl) {
            this._transformControl.update();
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
    _transformControlChanged() {
        if (this._transformControl) {
            const screenObject = this._transformControl.object;
            if (screenObject) {
                if (this._device3DModel) {

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

                    // translate device
                    this._device3DModel.THREEObject.applyMatrix(new THREE.Matrix4().makeTranslation( position.x, position.y, position.z ) );

                    // Broadscast Attitude
                    if (ORG.deviceController) {
                        const msg = ORGMessageBuilder.attitudeUpdate(screenObject.quaternion);
                        ORG.deviceController.sendMessage(msg);
                    }
                }
            }
        }
    }
}