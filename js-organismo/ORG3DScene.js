/**
 * Created by jongabilondo on 02/07/2016.
 */

/**
 * The class that holds the 3D scene witht the GLRenderer.
 * It provides all the methods to handle the operations on the Scene.
 *
 * @param domContainer The dom element where to create the 3D scene.
 * @param screenSize An initial size for the 3D scene. It will be updated to the real size of the container once the scene has been created.
 * @constructor
 */
function ORG3DScene(domContainer, screenSize) {

    const SceneVisualizationMask = {
        ShowFloor : 0x1,
        ShowDevice : 0x2,
        ShowTooltips : 0x4,
        ContinuousUpdate : 0x8
    }

    var _sceneFloor = null; // a ORG3DSceneFloor
    var _deviceScreen = null; // a ORG3DDeviceScreen
    var _uiTreeModelRaycaster = null; // a ORGRaycaster
    var _screenRaycaster = null; // a ORGRaycaster
    var _mouseListener = null; // a ORGMouseListener
    var _device3DModel = null; // a ORG3DDeviceModel
    var _tooltiper = null; // a ORGTooltip
    var _threeScene;
    var _threeCamera;
    var _threeRenderer;
    var _threeOrbitControls;
    var _keyboardState;
    var _threeClock;
    var _screenshotImage;
    var _screenshotNeedsUpdate = false;
    var _deviceScreenSize;
    var _uiExpanded = false;
    var _canvasDomElement = null; // the table cell where the renderer will be created, it contains _threeRendererDOMElement
    var _threeRendererDOMElement = null; // threejs scene is displayed in this DOM element
    var _contextMenuManager = null;
    var _zPosition = 20.0;
    var _sceneVisualFlags = SceneVisualizationMask.ShowFloor |
        SceneVisualizationMask.ShowDevice |
        SceneVisualizationMask.ContinuousUpdate;
    var _treeVisualizationFlags = TreeVisualizationMask.ShowNormalWindow |
        TreeVisualizationMask.ShowAlertWindow |
        TreeVisualizationMask.ShowKeyboardWindow |
        TreeVisualizationMask.ShowOutOfScreen |
        TreeVisualizationMask.ShowInteractiveViews |
        TreeVisualizationMask.ShowNonInteractiveViews |
        TreeVisualizationMask.ShowScreenshots;


    var _uiTreeModel = new ORGUITreeModel(_treeVisualizationFlags);
    initialize(domContainer, screenSize, _sceneVisualFlags&SceneVisualizationMask.ShowFloor, this);

    /**
     * Remove the Device from the scene. After device disconnection all models and data of device must be removed.
     */
    this.handleDeviceDisconnection = function() {
        this.removeDeviceScreen();
        this.removeUITreeModel();
        this.hideDevice3DModel();
    }

    /**
     * Sets the Image that will be used to create the texture to set it to the device screen.
     * It sets the image in a variable to be used in the next render cycle.
     * @param image.
     */
    this.setScreenshotImage = function(image) {
        _screenshotImage = image;
        _screenshotNeedsUpdate = true;
    };

    this.updateUITreeModel = function( treeJson ) {

        // First destroy the raycaster for the screen
        this.removeRaycasterForDeviceScreen();
        this.hideDeviceScreen( );

        // Create the 3D UI model
        _uiExpanded = true;
        _uiTreeModel.updateUITreeModel( treeJson, _threeScene, _screenshotImage, _deviceScreenSize);

        // Create Raycaster for the 3D UI Model object
        _uiTreeModelRaycaster = new ORGRaycaster(_threeRendererDOMElement, _threeCamera, _uiTreeModel.getTreeGroup());
        _uiTreeModelRaycaster.addDelegate(new ORGElementHiliter()); // attach a hiliter
        _uiTreeModelRaycaster.addDelegate(_contextMenuManager); // attach a context menu manager, needs to know what three obj is the mouse on

        // Activate mouse listener
        _mouseListener.addDelegate(_uiTreeModelRaycaster); // send the mouse events to the Raycaster
        _mouseListener.enable();
    };

    this.removeUITreeModel = function( ) {
        _uiTreeModel.removeUITreeModel( _threeScene);
    };

    this.createDeviceScreen = function(width, height, zPosition) {
        var geometry,material;

        _deviceScreenSize = { width:width, height:height};
        _deviceScreen = new ORG3DDeviceScreen(width, height, zPosition, _threeScene);
    };

    this.removeDeviceScreen = function() {
        if (_deviceScreen) {
            this.removeRaycasterForDeviceScreen();
            _deviceScreen.destroy();
        }
    }

    this.setDeviceOrientation = function(orientation, width, height) {

        if (_uiExpanded && _uiTreeModel) {
            _uiTreeModel.removeUITreeModel(_threeScene);
            _uiExpanded = false;
            buttonExpand.text("Expand");
        }

        if (_deviceScreen) {
            this.removeDeviceScreen();
            this.createDeviceScreen(width, height, 0);
        }
        if (_device3DModel) {
            _device3DModel.setOrientation(orientation);
        }
        this.positionFloorUnderDevice();
    };

    this.setDeviceScreenSize = function(width, height) {
        if (_deviceScreen) {
            this.removeDeviceScreen();
            this.createDeviceScreen(width, height, 0);
            this.positionFloorUnderDevice();
         }
    };

    this.hideDeviceScreen = function() {
        if (_deviceScreen) {
            _deviceScreen.hide();
        }
    };

    this.showDeviceScreen = function() {
        if (_deviceScreen) {
            _deviceScreen.show();
        }
    };

    this.createRaycasterForDeviceScreen = function() {
        _screenRaycaster = new ORGRaycaster(_threeRendererDOMElement, _threeCamera, _deviceScreen.screenPlane);
        _screenRaycaster.addDelegate(_contextMenuManager); // attach a context menu manager

        // Activate mouse listener
        _mouseListener.addDelegate(_screenRaycaster); // send the mouse events to the Raycaster
        _mouseListener.enable();
    };

    this.removeRaycasterForDeviceScreen = function() {
        // Deactivate mouse listener
        _mouseListener.disable();
        _mouseListener.removeDelegate(_screenRaycaster); // send the mouse events to the Raycaster

        // Destroy raycaster
        _screenRaycaster = null;
    };

    this.getDeviceScreenBoundingBox = function() {
        return _deviceScreen.boundingBox;
    };

    this.positionFloorUnderDevice = function() {
        if (_deviceScreen && _sceneFloor) {
            var bBox = null;
            if ( (_sceneVisualFlags&SceneVisualizationMask.ShowDevice) && _device3DModel ) {
                //bBox = new THREE.Box3().setFromObject(_device3DModel); // _device3DModel is a THREE.Group. Don't have geometry to compute bbox.
                bBox = _device3DModel.getBoundingBox();
            }
            if ( !bBox) {
                bBox = _deviceScreen.boundingBox;
            }
            if ( bBox) {
                _sceneFloor.setPosition(0, bBox.min.y - 50, 0);
            }
        }
    };

    this.continuousScreenshot = function() {
        return _sceneVisualFlags & SceneVisualizationMask.ContinuousUpdate;
    };

    this.setLiveScreen = function(live) {
        if (live) {
            _sceneVisualFlags |= SceneVisualizationMask.ContinuousUpdate;
        } else {
            _sceneVisualFlags &= ~SceneVisualizationMask.ContinuousUpdate;
        }
        if (_deviceScreen) {
            if ((_sceneVisualFlags & SceneVisualizationMask.ContinuousUpdate) && !_uiExpanded) {
                ORG.deviceController.requestScreenshot();
            }
        }
    };

    this.setShowTooltips = function(show) {
        if (show) {
            _sceneVisualFlags |= SceneVisualizationMask.ShowTooltips;
        } else {
            _sceneVisualFlags &= ~SceneVisualizationMask.ShowTooltips;
        }

        //if (_deviceScreen) {
            if (_sceneVisualFlags & SceneVisualizationMask.ShowTooltips) {
                this.enableTooltips();
            } else {
                this.disableTooltips();
            }
        //}
    };

    this.enableTooltips = function() {
        if (!_tooltiper) {
            _tooltiper = new ORGTooltip(_threeRendererDOMElement);
            if (_uiTreeModelRaycaster) {
                _uiTreeModelRaycaster.addDelegate(_tooltiper); // Attach it to the raycaster
            }
        }
    }

    this.disableTooltips = function() {
        if (_tooltiper) {
            if (_uiTreeModelRaycaster) {
                _uiTreeModelRaycaster.removeDelegate(_tooltiper); // Detach it from the raycaster
            }
            _tooltiper.destroy( );
            _tooltiper = null;
        }
    }

    this.showTooltip = function() {
        return _sceneVisualFlags & SceneVisualizationMask.ShowTooltips;
    };

    this.showPrivate = function() {
        return (_treeVisualizationFlags & TreeVisualizationMask.ShowPrivate);
    };

    this.setShowPrivate = function(flag) {
        if (flag) {
            _treeVisualizationFlags |= TreeVisualizationMask.ShowPrivate;
        } else {
            _treeVisualizationFlags &= ~TreeVisualizationMask.ShowPrivate;
        }
        _uiTreeModel.setVisualizationFlags(_treeVisualizationFlags);

        if (_uiExpanded && _uiTreeModel) {
            _uiTreeModel.collapseAndExpandAnimated(ORG.scene);
        }
    };

    this.UIExpanded = function() {
        return _uiExpanded;
    };

    this.setShowFloor = function(showFloor) {
        if (showFloor) {
            this.showFloor();
        } else {
            this.hideFloor();
        }
    };

    this.showFloor = function() {
        if (!_sceneFloor) {
            _sceneFloor = createFloor( _threeScene);
            this.positionFloorUnderDevice();
        }
    };

    this.hideFloor = function() {
        if (_sceneFloor) {
            deleteFloor();
        }
    };

    this.expand = function() {
        if (!_uiExpanded) {
            ORG.deviceController.requestElementTree({
                "status-bar": true,
                "keyboard": true,
                "alert": true,
                "normal": true
            });
        }
    }

    this.collapse = function() {
        if (_uiExpanded) {
            // we dont need the mouse listener and the raycaster anymore
            _mouseListener.disable();

            this.disableTooltips();
            // _mouseListener.removeDelegate(_uiTreeModelRaycaster);
            // _uiTreeModelRaycaster = null;
            // _tooltiper = null;

            var requestScreenshot = this.continuousScreenshot();
            _uiTreeModel.collapseWithCompletion( function() {
                if (_deviceScreen) {
                    _deviceScreen.show();
                }
                if (requestScreenshot) {
                    ORG.deviceController.requestScreenshot(); // keep updating screenshot
                }
            });
            this.createRaycasterForDeviceScreen();
            _uiExpanded = false;
        }
    };

    /**
     * Locate the camera at default position.
     */
    this.resetCameraPosition = function() {

        // Avoi flickering by stopping screen updates
        var liveScreen = this.continuousScreenshot();
        if ( liveScreen) {
            ORG.scene.setLiveScreen( false);
        }

        new TWEEN.Tween( _threeCamera.position ).to( {
            x: 0,
            y: 0,
            z: 900}, 600)
            .easing( TWEEN.Easing.Quadratic.InOut)
            .onComplete(function () {
                if (liveScreen) {
                    ORG.scene.setLiveScreen( true);
                }
            }).start();
    }

    this.mustShowDevice3DModel = function() {
        return _sceneVisualFlags & SceneVisualizationMask.ShowDevice;
    }

    this.addDevice3DModel = function( device3DModel ) {
        _device3DModel = device3DModel;
        _device3DModel.addToScene(_threeScene);
        this.positionFloorUnderDevice();
    }

    this.showDevice3DModel = function() {
        this.hideDevice3DModel();
        ORG3DDeviceModelLoader.loadDevice3DModel( ORG.device, this ); // async. WHen loaded it will call "addDevice3DModel"
    }

    this.hideDevice3DModel = function() {
        if ( !!_device3DModel ) {
            _device3DModel.destroy();
            _device3DModel = null;
        }
        this.positionFloorUnderDevice();
    }

    this.setShowTextures = function(flag) {
        if (flag) {
            _treeVisualizationFlags |= TreeVisualizationMask.ShowScreenshots;
        } else {
            _treeVisualizationFlags &= ~TreeVisualizationMask.ShowScreenshots;
        }
        _uiTreeModel.setVisualizationFlags(_treeVisualizationFlags);

        if ( _uiTreeModel ) {
            _uiTreeModel.hideTextures(!flag);
        }
    };

    this.setShowInteractive = function( flag ) {
        if (flag) {
            _treeVisualizationFlags |= TreeVisualizationMask.ShowInteractiveViews;
        } else {
            _treeVisualizationFlags &= ~TreeVisualizationMask.ShowInteractiveViews;
        }
        _uiTreeModel.setVisualizationFlags(_treeVisualizationFlags);
        if (_uiExpanded && _uiTreeModel) {
            _uiTreeModel.collapseAndExpandAnimated(ORG.scene);
        }
    }

    this.setShowNonInteractive = function( flag ) {
        if (flag) {
            _treeVisualizationFlags |= TreeVisualizationMask.ShowNonInteractiveViews;
        } else {
            _treeVisualizationFlags &= ~TreeVisualizationMask.ShowNonInteractiveViews;
        }
        _uiTreeModel.setVisualizationFlags(_treeVisualizationFlags);
        if (_uiExpanded && _uiTreeModel) {
            _uiTreeModel.collapseAndExpandAnimated(ORG.scene);
        }
    }

    this.setShowHiddenViews = function( flag) {
        if (flag) {
            _treeVisualizationFlags |= TreeVisualizationMask.ShowHiddenViews;
        } else {
            _treeVisualizationFlags &= ~TreeVisualizationMask.ShowHiddenViews;
        }
        _uiTreeModel.setVisualizationFlags(_treeVisualizationFlags);
        if (_uiExpanded && _uiTreeModel) {
            _uiTreeModel.collapseAndExpandAnimated(ORG.scene);
        }
    }

    this.setShowNormalWindow = function(flag) {
    }

    this.setShowKeyboardWindow = function(flag) {
        if (flag) {
            _treeVisualizationFlags |= TreeVisualizationMask.ShowKeyboardWindow;
        } else {
            _treeVisualizationFlags &= ~TreeVisualizationMask.ShowKeyboardWindow;
        }
        _uiTreeModel.setVisualizationFlags(_treeVisualizationFlags);
        if (_uiExpanded && _uiTreeModel) {
            _uiTreeModel.collapseAndExpandAnimated(ORG.scene);
        }
    }

    this.setShowAlertWindow = function(flag) {
    }

    // PRIVATE

    function initialize(domContainer, screenSize, showFloor, ORGScene) {

        _canvasDomElement = domContainer;
        var rendererCanvasWidth = _canvasDomElement.clientWidth;
        var rendererCanvasHeight = _canvasDomElement.clientHeight;

        _threeScene = new THREE.Scene();
        _threeCamera = new THREE.PerspectiveCamera(75, rendererCanvasWidth / rendererCanvasHeight, 0.1, 10000);
        _threeRenderer = new THREE.WebGLRenderer({antialias: true /*, alpha:true (if transparency wanted)*/});
        _threeRenderer.domElement.style.position = 'absolute';
        _threeRenderer.domElement.style.top = 0;
        //_threeRenderer.domElement.style.zIndex = 0;
        //_threeRenderer.setClearColor(0x000000);


        _threeRenderer.setSize(rendererCanvasWidth, rendererCanvasHeight);
        _canvasDomElement.appendChild(_threeRenderer.domElement);
        _threeRendererDOMElement = _threeRenderer.domElement; // the DOM element for the renderer

        _threeOrbitControls = new THREE.OrbitControls(_threeCamera, _canvasDomElement);

        _keyboardState = new KeyboardState();

        _zPosition += 10;
        if (showFloor) {
            _sceneFloor = createFloor(_threeScene);
        }

        createLights();

        _threeCamera.position.z = 900;
        _threeClock = new THREE.Clock();

        // Create a mouse event listener and associate delegates
        _mouseListener = new ORGMouseListener(_threeRendererDOMElement);

        // Create the rightMouse click manager
        _contextMenuManager = new ORGContextMenuManager(ORGScene);
        _mouseListener.addDelegate(_contextMenuManager);
        _mouseListener.enable();

        render();
        ORG.WindowResize(_threeRenderer, _threeCamera, _canvasDomElement);
    }

    function createFloor( threeScene ) {
        return new ORG3DSceneFloor(4000, 50, true, threeScene);
    }

    function deleteFloor() {
        if (_sceneFloor) {
            _sceneFloor.remove();
        }
        _sceneFloor = null;
    }

    function createLights() {
        // LIGHTS
        var light = new THREE.PointLight(0xaaaaaa);
        light.position.set(500,-500,500);
        _threeScene.add(light);

        light = new THREE.PointLight(0xaaaaaa);
        light.position.set(500,500,500);
        _threeScene.add(light);

        light = new THREE.PointLight(0xaaaaaa);
        light.position.set(-500,-500,-500);
        _threeScene.add(light);

        light = new THREE.PointLight(0xaaaaaa);
        light.position.set(-500,500,-500);
        _threeScene.add(light);

//            var light2 = new THREE.AmbientLight(0xffffff);
//            scene.add(light2);
    }

    function updateScreenshot() {

        if (_deviceScreen && _screenshotNeedsUpdate && _screenshotImage) {
            _screenshotNeedsUpdate = false;
            _deviceScreen.setScreenshot(_screenshotImage);
        }
    }

    function render () {

        requestAnimationFrame( render );
        _threeRenderer.render( _threeScene, _threeCamera);
        _threeOrbitControls.update();
        updateScene();
        TWEEN.update();
    }

    function updateScene()
    {
        //var t0 = clock.getElapsedTime();
        //var timeOffset = 0.125 * t0;
        //var delta = _threeClock.getDelta(); // seconds.
        //var moveDistance = 200 * delta; // 200 pixels per second
        //var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
        //var deviceMotionChanged = false;

        updateScreenshot();
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