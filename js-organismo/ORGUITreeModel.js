/**
 * Created by jongabilondo on 02/07/2016.
 */

/**
 * This class builds and manages the expanded 3D UI model. Given a JSON UI model it created a THREE objects expanded model.
 * @constructor
 */
function ORGUITreeModel() {

    var _treeData = null; // json of ui element tree as arrived from device
    var _threeElementTreeGroup = null; // threejs group with all the ui elements.
    //var _useCubes = true;
    var _flagShowHidden = false;
    var _flagShowHiddenOnly = false;
    var _showOutOfScreen = true;
    var _extrudeDuration = 400; // ms
    var _screenSize = null;
    var _threeScene = null;
    var _collapseTweenCount = 0; // collapse animation counter

    this.createUITreeModel = function (treeTopLevelNodes, threeScene, deviceScreenSize, orgScene) {

        _collapseTweenCount = 0;
        _screenSize = deviceScreenSize;
        _treeData = treeTopLevelNodes;
        _threeScene = threeScene;

        this._createUITreeModel(_treeData, _threeScene, _screenSize, orgScene.showPrivate(), !orgScene.wireframeMode());
    };


    this.updateUITreeModel = function (treeTopLevelNodes, threeScene, screenshotImage, deviceScreenSize, orgScene) {

        if (_treeData) {
            this.removeUITreeModel(threeScene); // remove existing first
        }
        this.createUITreeModel(treeTopLevelNodes, threeScene, deviceScreenSize, orgScene);
    };

    //this.expand = function () {
    //    _collapseTweenCount = 0;
    //    _threeElementTreeGroup = new THREE.Group();
    //    createTreeModel(_treeData, deviceScreenSize, orgScene.showPrivate()); // add all the ui tree in threeElementTreeGroup
    //    threeScene.add(_threeElementTreeGroup);
    //}

    /**
     * Collapses the tree and expands its again, rebuilding it again.
     * Call it when some visualization property change requires to rebuild the tree.
     * It animates the collapse/expand.
     * e.g. When hidding/showing the private classes.
     * @param orgScene the ORG scene to take the new parameters
     */
    this.collapseAndExpandAnimated = function (orgScene) {

        for (var i in _treeData) {
            var treeNode = _treeData[i];
            var thisTreeModelObj = this;
            var callback = function () {
                thisTreeModelObj._createUITreeModel(_treeData, _threeScene, _screenSize, orgScene.showPrivate(), !orgScene.wireframeMode());
            };
            collapseNodeAnimatedWithCompletion(treeNode, callback);
        }
    };

    this.collapseAndShowScreen = function (threeScreenPlane) {

        for (var i in _treeData) {
            var treeNode = _treeData[i];
            collapseNodeAnimatedWithCompletion(treeNode, function() {
                if (threeScreenPlane) {
                    threeScreenPlane.visible = true;
                }
                if (orgScene.continuousScreenshot()) {
                    orgDeviceConnection.requestScreenshot(); // keep updating screenshot
                }
            })
        }
    };

    this.removeUITreeModel = function (threeScene) {
        if (_threeElementTreeGroup) {
            threeScene.remove(_threeElementTreeGroup);
            _threeElementTreeGroup = null;
        }
    };

    this.hideTextures = function (hide) {
        if (_threeElementTreeGroup) {
            _threeElementTreeGroup.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    if (hide) {
                        child.material.map = null;
                        child.material.color = 0x000000;
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
    };

    this.hideNonInteractiveViews = function(hide) {
        if (_threeElementTreeGroup) {
            _threeElementTreeGroup.traverse(function (child) {
                if (child instanceof THREE.Group) {
                    if (hide) {
                        var nodeData = child.userData;
                        if (nodeData) {
                            if (!nodeIsInteractive(nodeData)) {
                                hideNodeGroup(child, true);
                            }
                        }
                    } else {
                        hideNodeGroup(child, false);
                    }
                }
            });
        }
    };

    this.showConnections = function( show , threeScene) {
        if (_threeElementTreeGroup) {
            _threeElementTreeGroup.traverse(function (child) {
                if (child instanceof THREE.Group) {
                    var nodeData = child.userData;
                    if (nodeIsInteractive(nodeData)) {
                        var mesh = child.children[0];
                        if (mesh) {
                            var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), mesh.position, 400, 0x0000ff, 50, 25 );
                            var cone = arrowHelper.cone;
                            threeScene.add( arrowHelper );
                        }
                    }
                }
            });
        }
    };

    this.getTreeGroup = function() {
        return _threeElementTreeGroup;
    };

    this._createUITreeModel = function(treeData, threeScene, deviceScreenSize, showPrivate, showScreenshots) {

        if (_threeElementTreeGroup) {
            this.removeUITreeModel(threeScene); // remove existing first
        }

        _threeElementTreeGroup = new THREE.Group();
        createTreeModel(treeData, deviceScreenSize, showPrivate, showScreenshots); // add all the ui tree in threeElementTreeGroup
        threeScene.add(_threeElementTreeGroup);
    };


    // PRIVATE

    function collapseNodeAnimatedWithCompletion(node, completionFunction) {
        var threeObj = node.threeObj;
        if (threeObj) {
            var mesh = threeObj.children[0];
            var tween = new TWEEN.Tween(mesh.position)
                .to({x: mesh.position.x, y: mesh.position.y, z: 0}, _extrudeDuration)
                .onStart( function() {
                    _collapseTweenCount++;
                })
                .onComplete( function() {
                    hideNodeGroup(threeObj, true);
                    node.zPosition = 0;


                    if (--_collapseTweenCount <= 0 ) {
                        _collapseTweenCount = 0;

                        if (_threeElementTreeGroup) {
                            _threeScene.remove(_threeElementTreeGroup);
                            _threeElementTreeGroup = null;
                        }

                        if (completionFunction) {
                            completionFunction();
                        }
                    }
                })
                .start();
        }

        var subNodes = node.subviews;
        for (var i in subNodes) {
            var treeNode = subNodes[i];
            collapseNodeAnimatedWithCompletion(treeNode, completionFunction);
        }
    }

    function createTreeModel(tree, deviceScreenSize, showPrivate, showScreenshots) {
        for (var i in tree) {
            createTreeNodeModel(tree[i], deviceScreenSize, showPrivate, showScreenshots);
            createTreeModel(tree[i].subviews, deviceScreenSize, showPrivate, showScreenshots);
        }
    }

    function createTreeNodeModel(treeNode, deviceScreenSize, showPrivate, showScreenshots) {

        if (typeof( treeNode) == "object") {

            if (!showPrivate) {
                if (treeNode.private && treeNode.private == true) {
                    return;
                }
            }
            if (treeNode.class == "UITextEffectsWindow") {
                return;
            }
            if (!_showOutOfScreen) {
                if (treeObjectIsOutOfScreen(treeNode, deviceScreenSize)) {
                    return;
                }
            }
            if (mustHideTreeObject(treeNode)) {
                return;
            }
            if (isStatusBarWindow(treeNode)) {
                return;
            }
            if (isKeyboardWindow(treeNode)) {
                return;
            }


            var threeScreenshotTexture = null;
            var elementBase64Image = treeNode.screenshot;
            if (elementBase64Image) {
                var img = new Image();
                img.src = "data:image/png;base64," + elementBase64Image;
                threeScreenshotTexture = new THREE.Texture(img);
                threeScreenshotTexture.minFilter = THREE.NearestFilter;
                threeScreenshotTexture.needsUpdate = true;
            }
            //var drawAsCube = false;//mustDrawTreeObjectAsCube(treeJson[i], parentTreeObj);

            //if (drawAsCube) {
            // Create Texture for view
            //if (!!screenshotImage) {
            //    threeScreenshotTexture = new THREE.Texture(screenshotImage);
            //    threeScreenshotTexture.needsUpdate = true;
            //    //screenshotImage.onload = function () { threeScreenshotTexture.needsUpdate = true; };
            //}
            //}

            var zPosition = calculateElementZPosition(treeNode, _treeData, 0, deviceScreenSize);

            var threeGroupObj = createUIObject(treeNode, threeScreenshotTexture, deviceScreenSize, zPosition, showScreenshots);
            if (threeGroupObj) {

                if (mustHideTreeObject(treeNode)) {
                    threeGroupObj.visible = false;
                } else {
                    var mesh = threeGroupObj.children[0];
                    if (mesh) {
                        // The final zPosition is in tree node, not in the mesh object which is at 0.
                        var finalMeshPosition = {x: mesh.position.x, y: mesh.position.y, z: treeNode.zPosition};
                        var tween = new TWEEN.Tween(mesh.position)
                            .to(finalMeshPosition, _extrudeDuration)
                            .start();
                    }
                }
                _threeElementTreeGroup.add(threeGroupObj);
                treeNode.threeObj = threeGroupObj;
                threeGroupObj.userData = treeNode;
            }
        } else {
            console.log("what is this ?", i, upperTreeNodes[i]);
        }
    }

    function createUIObject(uiObjectDescription, threeScreenshotTexture, screenSize, zPosition, showScreenshots) {
        var threeGeometry, threeMaterial, uiObject, uiObjectWidth, uiObjectHeight, uiObjectLeft, uiObjectRight, uiObjectTop, uiObjectBottom;

        if (!uiObjectDescription.bounds) {
            //console.log("Object has no boundsInScreen !", uiObjectDescription, JSON.stringify(uiObjectDescription));
            return null;
        }
        var threeUIElementGroup = new THREE.Group();

        uiObjectWidth = uiObjectDescription.bounds.right - uiObjectDescription.bounds.left;
        uiObjectHeight = uiObjectDescription.bounds.bottom - uiObjectDescription.bounds.top;
        uiObjectLeft = uiObjectDescription.bounds.left;
        //uiObjectRight = uiObjectDescription.bounds.right;
        uiObjectTop = uiObjectDescription.bounds.top;
        //uiObjectBottom = uiObjectDescription.bounds.bottom;


        // create obj at Z = 0. We will animate it to its real position.

        threeGeometry = new THREE.PlaneBufferGeometry(uiObjectWidth, uiObjectHeight, 1, 1);
        uiObjectDescription.zPosition = zPosition; // keep it here
        threeObjPosition = new THREE.Vector3(-( screenSize.width / 2 - uiObjectLeft - uiObjectWidth / 2.0), screenSize.height / 2 - uiObjectTop - uiObjectHeight / 2.0, 0);

        if (showScreenshots && threeScreenshotTexture) {
            threeMaterial = new THREE.MeshBasicMaterial({map: threeScreenshotTexture, transparent: true, side: THREE.DoubleSide});
        } else {
            threeMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                side: THREE.DoubleSide,
                opacity: 1.0
            });
        }
        uiObject = new THREE.Mesh(threeGeometry, threeMaterial);
        uiObject.position.set(threeObjPosition.x, threeObjPosition.y, threeObjPosition.z);
        uiObject.ORGData = { threeScreenshotTexture : threeScreenshotTexture }; // keep a reference to make the show/hide of textures

        threeUIElementGroup.add(uiObject);
        threeUIElementGroup.add(new THREE.EdgesHelper(uiObject, 0xffffff));

        return threeUIElementGroup;
    }

    function modelChangeShowHidden( treeJson, showHidden) {

        // Show/Hide Hidden objects
        for (var i in treeJson) {
            if (typeof(treeJson[i])=="object") {
                if (treeJson[i].hidden) {
                    console.log("UI Element hidden: ", treeJson[i]);
                    var threeObj = treeJson[i].threeObj;
                    if (threeObj) {
                        if (showHidden) {
                            threeObj.visible = true;
                        } else {
                            threeObj.visible = false;
                        }
                        threeObj.needsUpdate = true;
                    } else {
                        console.log("UI Hidden Element has no THREE OBJ !!");
                    }
                }
                modelChangeShowHidden(treeJson[i].subviews, showHidden);
            }
        }
    }

    function modelChangeShowHiddenOnly( treeJson, showHidden, showHiddenOnly) {

        // Show/Hide Hidden objects
        for (var i in treeJson) {
            if (!!treeJson[i]==true && typeof(treeJson[i])=="object") {
                var mesh = treeJson[i].threeObj;
                if (mesh) {
                    if (treeJson[i].hidden) {
                        if (showHidden || showHiddenOnly) {
                            mesh.visible = true;
                        } else {
                            mesh.visible = false;
                        }
                        mesh.needsUpdate = true;
                    } else {
                        // Not hidden ui obj
                        if (showHiddenOnly) {
                            mesh.visible = false;
                        } else {
                            mesh.visible = true;
                        }
                        mesh.needsUpdate = true;
                    }
                }
                modelChangeShowHiddenOnly(treeJson[i].subviews, showHidden, showHidden);
            }
        }
    }

    function changeOpacity(treeJson, opacity) {
        //console.log("change obj to solid:", treeJson);

        for (var i in treeJson) {
            if (!!treeJson[i] && typeof(treeJson[i])=="object") {
                var mesh = treeJson[i].threeObj;
                if (mesh) {
                    //console.log("FOUND OBJECT:",mesh, i);

                    if (treeJson[i].class == "UITextEffectsWindow") {
                        continue;
                    } else if (treeJson[i].private == true) {
                        continue;
                    } else {
                        mesh.material.opacity = opacity;
                        mesh.needsUpdate = true;
                    }
                } else {
                    //console.log("OBJECT nas no three obj !!!!!!!!", treeJson[i], JSON.stringify(treeJson[i]));
                }
                changeOpacity(treeJson[i].subviews, opacity);
            }
        }
    }

    function mustDrawTreeObjectAsCube(treeJson, inParentTreeObj) {
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

    function mustHideTreeObject(treeJson) {
        var mustBeHidden = false;
        if (treeJson.hidden && !_flagShowHidden) {
            mustBeHidden = true;
        } else if (treeJson.hidden==false && _flagShowHiddenOnly) {
            mustBeHidden = true;
        }
        return mustBeHidden;
    }

    function isStatusBarWindow( inUIElement) {
        if (inUIElement.nativeClass == "UIAWindow") {
            var child = inUIElement.subviews[0];
            if (child.nativeClass == "UIAStatusBar") {
                return true;
            }
        }
        return false;
    }
    function isKeyboardWindow( inUIElement) {
        if (inUIElement.nativeClass == "UIAWindow") {
            var child = inUIElement.subviews[0];
            if (child.nativeClass == "UIAKeyboard") {
                return true;
            }
        }
        return false;
    }


    function removeScreenshotFromScreen() {
        screenPlane.material.color = 0x000000;
        //screenPlane.material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
    }

    function calculateElementZPosition( element, tree, currentZPosition, deviceScreenSize) {

        if (!element || !tree) {
            return currentZPosition;
        }

        var zPosition = currentZPosition;
        var newObjRect = element.bounds;

        for (var i in tree) {

            //if (element == tree[i]) {
            //    return zPosition; // we have arrived to the element itself, no more to do
            //}

            var threeObj = tree[i].threeObj;
            if ((element != tree[i]) && threeObj) {

                // This element has been visualized in 3D, we have to check if the new element must be in front of this one.
                var objMesh = threeObj.children[0];
                objMesh.geometry.computeBoundingBox();

                var runningObjRect;
                if (true) {

                    runningObjRect = {
                        "left": (objMesh.geometry.boundingBox.min.x + objMesh.position.x + deviceScreenSize.width / 2),
                        "top": Math.abs(objMesh.geometry.boundingBox.max.y + objMesh.position.y - deviceScreenSize.height / 2),
                        "right": (objMesh.geometry.boundingBox.max.x + objMesh.position.x + deviceScreenSize.width / 2),
                        "bottom": Math.abs(objMesh.geometry.boundingBox.min.y + objMesh.position.y - deviceScreenSize.height / 2)
                    };
                }
                //else {
                //    runningObjRect = {
                //        "left": (objMesh.geometry.boundingBox.min.x + deviceScreenSize.width / 2),
                //        "top": Math.abs(objMesh.geometry.boundingBox.max.y - deviceScreenSize.height / 2),
                //        "right": (objMesh.geometry.boundingBox.max.x + deviceScreenSize.width / 2),
                //        "bottom": Math.abs(objMesh.geometry.boundingBox.min.y - deviceScreenSize.height / 2)
                //    };
                //}

                if ( !!newObjRect && !!runningObjRect && rectsIntersect(newObjRect, runningObjRect)) {

                    var meshZPos = tree[i].zPosition; // The real position is in the treenode.zPosition, not in the threejs mesh, there they are all at z=0

                    //if (objMesh.geometry.type == "BoxGeometry") {
                    //    meshZPos += 5;
                    //}

                    if (meshZPos >= zPosition) {
                        zPosition = meshZPos + 10;
                        //if (objMesh.geometry.type == "BoxGeometry") {
                        //    zPosition += 5;
                        //}
                    }
                }
            }
            zPosition = calculateElementZPosition( element, tree[i].subviews, zPosition, deviceScreenSize); // calculate against next level in tree
        }
        return zPosition;
    }

    function rectsIntersect(a, b) {
        return (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom);
    }

    function treeObjectIsOutOfScreen(treeJson, deviceScreenSize) {
        return (treeJson.bounds.top > deviceScreenSize.height);
    }

    function nodeIsInteractive(treeNode) {
        if (treeNode.gestures) {
            return true;
        }
        if (treeNode.controlEvents) {
            return true;
        }
        if (treeNode.class == "UITextField" && treeNode.userInteractionEnabled) {
            return true;
        }
    }

    function hideNodeGroup(threeNodeGroup, hide) {
        var mesh = threeNodeGroup.children[0]; // the first is the mesh, second is the edges helper
        if (mesh) {
            mesh.visible = !hide;
        }
        var edgesHelper = threeNodeGroup.children[1]; // the first is the mesh, second is the edges helper
        if (edgesHelper) {
            edgesHelper.visible = !hide;
        }
    }
}