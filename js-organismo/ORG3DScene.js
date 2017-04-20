/**
 * Created by jongabilondo on 02/07/2016.
 */


const ORGSceneVisualizationMask = {
    ShowFloor : 0x1,
    ShowDevice : 0x2,
    ShowTooltips : 0x4,
    ContinuousUpdate : 0x8
}

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
        //this._zPosition = 20.0;
        this._sceneVisualFlags = ORGSceneVisualizationMask.ShowFloor |
            ORGSceneVisualizationMask.ShowDevice |
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

    /**
     * Properties
     */
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

        // Create the 3D UI model
        this._uiExpanded = true;
        this._uiTreeModel.updateUITreeModel( treeJson, this._threeScene, this._screenshotImage, this._deviceScreenSize);

        // Create Raycaster for the 3D UI Model object
        this._uiTreeModelRaycaster = new ORG3DRaycaster( this._threeRendererDOMElement, this._threeCamera, this._uiTreeModel.getTreeGroup());
        this._uiTreeModelRaycaster.addDelegate( new ORG3DUIElementHiliter()); // attach a hiliter
        this._uiTreeModelRaycaster.addDelegate( this._contextMenuManager); // attach a context menu manager, needs to know what three obj is the mouse on

        // Activate mouse listener
        this._mouseListener.addDelegate( this._uiTreeModelRaycaster); // send the mouse events to the Raycaster
        this._mouseListener.enable();
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
        this.positionFloorUnderDevice();
    }

    setDeviceScreenSize(width, height) {
        if ( this._deviceScreen) {
            this.removeDeviceScreen();
            this.createDeviceScreen(width, height, 0);
            this.positionFloorUnderDevice();
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

    createRaycasterForDeviceScreen() {
        this._screenRaycaster = new ORG3DRaycaster( this._threeRendererDOMElement, this._threeCamera, this._deviceScreen.screenPlane);
        this._screenRaycaster.addDelegate( this._contextMenuManager); // attach a context menu manager

        // Activate mouse listener
        this._mouseListener.addDelegate( this._screenRaycaster); // send the mouse events to the Raycaster
        this._mouseListener.enable();
    };

    removeRaycasterForDeviceScreen() {
        // Deactivate mouse listener
        this._mouseListener.disable();
        this._mouseListener.removeDelegate( this._screenRaycaster); // send the mouse events to the Raycaster

        // Destroy raycaster
        this._screenRaycaster = null;
    }

    positionFloorUnderDevice() {
        if ( this._deviceScreen && this._sceneFloor) {
            var bBox = null;
            if ( (this._sceneVisualFlags & ORGSceneVisualizationMask.ShowDevice) && this._device3DModel ) {
                bBox = this._device3DModel.getBoundingBox();
            }
            if ( !bBox) {
                bBox = this._deviceScreen.boundingBox;
            }
            if ( bBox) {
                this._sceneFloor.setPosition(0, bBox.min.y - 50, 0);
            }
        }
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

    setShowPrivate(flag) {
        this.flagShowPrivateClasses = flag;
        this._uiTreeModel.setVisualizationFlags( this._treeVisualizationFlags);

        if ( this._uiExpanded && this._uiTreeModel) {
            this._uiTreeModel.collapseAndExpandAnimated( this);
        }
    }

    createFloor() {
        if ( !this._sceneFloor) {
            this._sceneFloor = this._createFloor( this._threeScene);
            this.positionFloorUnderDevice();
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

    collapse() {
        if ( this._uiExpanded) {
            // we dont need the mouse listener and the raycaster anymore
            this._mouseListener.disable();

            this.disableTooltips();
            // _mouseListener.removeDelegate(_uiTreeModelRaycaster);
            // _uiTreeModelRaycaster = null;
            // _tooltiper = null;

            const _this = this;
            const requestScreenshot = this.flagContinuousScreenshot;

            this._uiTreeModel.collapseWithCompletion( function() {
                if (_this._deviceScreen) {
                    _this._deviceScreen.show();
                }
                if (requestScreenshot) {
                    ORG.deviceController.requestScreenshot(); // keep updating screenshot
                }
            });
            this.createRaycasterForDeviceScreen();
            this._uiExpanded = false;
        }
    };

    /**
     * Locate the camera at default position.
     */
    resetCameraPosition() {

        // Avoi flickering by stopping screen updates
        const liveScreen = this.flagContinuousScreenshot;
        if ( liveScreen) {
            this.setLiveScreen( false);
        }

        const _this = this;
        new TWEEN.Tween( this._threeCamera.position ).to( {
            x: 0,
            y: 0,
            z: 900}, 600)
            .easing( TWEEN.Easing.Quadratic.InOut)
            .onComplete(function () {
                if (liveScreen) {
                    _this.setLiveScreen( true);
                }
            }).start();
    }

    addDevice3DModel( device3DModel ) {
        this._device3DModel = device3DModel;
        this._device3DModel.addToScene( this._threeScene);
        this.positionFloorUnderDevice();
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
        this.positionFloorUnderDevice();
    }

    setShowTextures(flag) {
        this.flagShowScreenshots = flag;
        this._uiTreeModel.setVisualizationFlags(this._treeVisualizationFlags);

        if ( this._uiTreeModel ) {
            this._uiTreeModel.hideTextures(!flag);
        }
    };

    setShowInteractive( flag ) {
        this.flagShowInteractiveViews = flag;
        this._uiTreeModel.setVisualizationFlags( this._treeVisualizationFlags);
        if ( this._uiExpanded && this._uiTreeModel) {
            this._uiTreeModel.collapseAndExpandAnimated( this);
        }
    }

    setShowNonInteractive( flag ) {
        this.flagShowNonInteractiveViews = flag;
        this._uiTreeModel.setVisualizationFlags( this._treeVisualizationFlags);
        if ( this._uiExpanded && this._uiTreeModel) {
            this._uiTreeModel.collapseAndExpandAnimated( this);
        }
    }

    setShowHiddenViews( flag) {
        this.flagShowHiddenViews = flag;
        this._uiTreeModel.setVisualizationFlags( this._treeVisualizationFlags);
        if (this._uiExpanded && this._uiTreeModel) {
            this._uiTreeModel.collapseAndExpandAnimated(this);
        }
    }

    setShowNormalWindow(flag) {
    }

    setShowKeyboardWindow(flag) {
        this.flagShowKeyboardWindow = flag;
        this._uiTreeModel.setVisualizationFlags( this._treeVisualizationFlags);
        if (this._uiExpanded && this._uiTreeModel) {
            this._uiTreeModel.collapseAndExpandAnimated( this);
        }
    }

    setShowAlertWindow(flag) {
    }

    // PRIVATE

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

        this._threeOrbitControls = new THREE.OrbitControls( this._threeCamera, this._canvasDomElement);

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

    _createFloor( threeScene ) {
        return new ORG3DSceneFloor(4000, 50, true, threeScene);
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

    _render() {

        const _this = this;

        requestAnimationFrame( function() {
            _this._threeRenderer.render( _this._threeScene, _this._threeCamera);
            _this._threeOrbitControls.update();
            _this._updateScene();
            TWEEN.update();
            _this._render();
        });

        //requestAnimationFrame( this._render );
        //this._threeRenderer.render( this._threeScene, this._threeCamera);
        //this._threeOrbitControls.update();
        //this._updateScene();
        //TWEEN.update();
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
}