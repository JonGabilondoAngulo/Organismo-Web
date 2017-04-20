/**
 * Created by jongabilondo on 02/07/2016.
 */

/**
 * This class builds and manages the expanded 3D UI model. Given a JSON UI model it creates an expanded model of THREE objects.
 * @constructor
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

class ORGUITreeModel {

    constructor( visualizationFlag ) {

        this._treeData = null; // json of ui elements tree as arrived from device
        this._threeElementTreeGroup = null; // threejs group with all the ui elements.
        this._extrudeDuration = 500; // ms
        this._screenSize = null;
        this._threeScene = null;
        this._collapseTweenCount = 0; // collapse animation counter
        this._visualizationFlags = visualizationFlag;
    }

    setVisualizationFlags( flags ) {
        this._visualizationFlags = flags;
    }

    createUITreeModel(treeTopLevelNodes, threeScene, deviceScreenSize) {

        this._collapseTweenCount = 0;
        this._screenSize = deviceScreenSize;
        this._treeData = treeTopLevelNodes;
        this._threeScene = threeScene;

        this._createUITreeModel(this._treeData, this._threeScene, this._screenSize);
    }

    updateUITreeModel(treeTopLevelNodes, threeScene, screenshotImage, deviceScreenSize) {

        if (this._treeData) {
            this.removeUITreeModel(threeScene); // remove existing first
        }
        this.createUITreeModel(treeTopLevelNodes, threeScene, deviceScreenSize);
    }

    /**
     * Collapses the tree and expands its again, rebuilding it.
     * Call it when some visualization property change requires to rebuild the tree.
     * It animates the collapse/expand.
     * e.g. When hidding/showing the private classes.
     * @param scene the ORG scene to take the new parameters
     */
    collapseAndExpandAnimated(scene) {

        for (let i in this._treeData) {
            const treeNode = this._treeData[i];
            const _this = this;
            const callback = function () {
                _this._createUITreeModel(_this._treeData, _this._threeScene, _this._screenSize);
            };
            _this._collapseNodeAnimatedWithCompletion(treeNode, callback);
        }
    }

    collapseWithCompletion(completion) {

        for (let i in this._treeData) {
            const treeNode = this._treeData[i];
            this._collapseNodeAnimatedWithCompletion(treeNode, completion)
        }
    }

    removeUITreeModel(threeScene) {
        if (this._threeElementTreeGroup) {
            threeScene.remove(this._threeElementTreeGroup);
            this._threeElementTreeGroup = null;
        }
    }

    hideTextures(hide) {
        if (this._threeElementTreeGroup) {
            this._threeElementTreeGroup.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
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

    hideNonInteractiveViews(hide) {
        if (this._threeElementTreeGroup) {
            this._threeElementTreeGroup.traverse(function (child) {
                if (child instanceof THREE.Group) {
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
        if (this._threeElementTreeGroup) {
            this._threeElementTreeGroup.traverse(function (child) {
                if (child instanceof THREE.Group) {
                    const nodeData = child.userData;
                    if (_nodeIsInteractive(nodeData)) {
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

    getTreeGroup() {
        return this._threeElementTreeGroup;
    }

    // PRIVATE

    _createUITreeModel(treeData, threeScene, deviceScreenSize) {

        if (this._threeElementTreeGroup) {
            this.removeUITreeModel(threeScene); // remove existing first
        }

        this._threeElementTreeGroup = new THREE.Group();
        this._createTreeModel(treeData, deviceScreenSize); // add all the ui tree in threeElementTreeGroup
        threeScene.add(this._threeElementTreeGroup);
    }

    _createTreeModel(tree, deviceScreenSize) {
        for (let i in tree) {
            if (this._mustCreateTreeBranch(tree[i])) {
                this._createTreeNodeModel(tree[i], deviceScreenSize);
                this._createTreeModel(tree[i].subviews, deviceScreenSize);
            } else {
                console.log("ignoring tree branch.");
            }
        }
    }

    _createTreeNodeModel(treeNode, deviceScreenSize) {

        if (typeof( treeNode) == "object") {

            if ( !this._mustCreateTreeObject(treeNode)) {
                return;
            }

            let threeScreenshotTexture = null;
            let elementBase64Image = treeNode.screenshot;
            if (elementBase64Image) {
                let img = new Image();
                img.src = "data:image/png;base64," + elementBase64Image;
                threeScreenshotTexture = new THREE.Texture(img);
                threeScreenshotTexture.minFilter = THREE.NearestFilter;
                threeScreenshotTexture.needsUpdate = true;
            }
            //var drawAsCube = false;//_mustDrawTreeObjectAsCube(treeJson[i], parentTreeObj);

            //if (drawAsCube) {
            // Create Texture for view
            //if (!!screenshotImage) {
            //    threeScreenshotTexture = new THREE.Texture(screenshotImage);
            //    threeScreenshotTexture.needsUpdate = true;
            //    //screenshotImage.onload = function () { threeScreenshotTexture.needsUpdate = true; };
            //}
            //}

            const zPosition = this._calculateElementZPosition(treeNode, this._treeData, 0, deviceScreenSize);

            let threeGroupObj = this._createUIObject(treeNode, threeScreenshotTexture, deviceScreenSize, zPosition);
            if (threeGroupObj) {

                this._threeElementTreeGroup.add(threeGroupObj);
                treeNode.threeObj = threeGroupObj;
                threeGroupObj.userData = treeNode;

                if (this._mustHideTreeObject(treeNode)) {
                    threeGroupObj.visible = false;
                } else {
                    // The final zPosition is in treeNode, not in the mesh object which is at 0.
                    const finalMeshPosition = {x: threeGroupObj.position.x, y: threeGroupObj.position.y, z: treeNode.zPosition};
                    const tween = new TWEEN.Tween(threeGroupObj.position)
                        .to(finalMeshPosition, this._extrudeDuration)
                        .start();
                }
            }
        } else {
            console.log("what is this ?", i, upperTreeNodes[i]);
        }
    }

    _createUIObject(uiObjectDescription, threeScreenshotTexture, screenSize, zPosition) {
        var threeGeometry, threeMaterial, uiObject, uiObjectWidth, uiObjectHeight, uiObjectLeft, uiObjectRight, uiObjectTop, uiObjectBottom, threeObjPosition;

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

        // create obj at Z = 0. We will animate it to its real position later.

        threeGeometry = new THREE.PlaneBufferGeometry(uiObjectWidth, uiObjectHeight, 1, 1);
        uiObjectDescription.zPosition = zPosition; // keep it here for later use
        threeObjPosition = new THREE.Vector3(-( screenSize.width / 2 - uiObjectLeft - uiObjectWidth / 2.0), screenSize.height / 2 - uiObjectTop - uiObjectHeight / 2.0, 0);

        if (this._mustShowScreenshots() && threeScreenshotTexture) {
            threeMaterial = new THREE.MeshBasicMaterial({map: threeScreenshotTexture, transparent: false, side: THREE.DoubleSide});
        } else {
            threeMaterial = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide, transparent:false });
        }
        uiObject = new THREE.Mesh(threeGeometry, threeMaterial);
        uiObject.position.set(threeObjPosition.x, threeObjPosition.y, threeObjPosition.z);

        uiObject.ORGData = { threeScreenshotTexture : threeScreenshotTexture }; // keep a reference to make the show/hide of textures

        threeUIElementGroup.add(uiObject);
        threeUIElementGroup.add(new THREE.BoxHelper(uiObject, 0xffffff));

        return threeUIElementGroup;
    }

    _collapseNodeAnimatedWithCompletion(node, completionFunction) {
        var threeObj = node.threeObj; // the obj is a THREE.Group
        if (threeObj) {
            const _this = this;
            const tween = new TWEEN.Tween(threeObj.position)
                .to({x: threeObj.position.x, y: threeObj.position.y, z: 0}, this._extrudeDuration)
                .onStart( function() {
                    _this._collapseTweenCount++;
                })
                .onComplete( function() {
                    _this._hideNodeGroup(threeObj, true);
                    node.zPosition = 0;

                    if (--_this._collapseTweenCount <= 0 ) {
                        _this._collapseTweenCount = 0;

                        if (_this._threeElementTreeGroup) {
                            _this._threeScene.remove(_this._threeElementTreeGroup);
                            _this._threeElementTreeGroup = null;
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
            this._collapseNodeAnimatedWithCompletion(treeNode, completionFunction);
        }
    }

    _modelVisualizationChanged() {
        if (this._threeElementTreeGroup) {
            const _this = this;
            this._threeElementTreeGroup.traverse(function (child) {
                if (child instanceof THREE.Group) {
                    var nodeData = child.userData;
                    if (nodeData) {
                        this._hideNodeGroup(child, _this._mustHideTreeObject( nodeData));
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

    _changeOpacity(treeJson, opacity) {
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
                this._changeOpacity(treeJson[i].subviews, opacity);
            }
        }
    }

    _mustDrawTreeObjectAsCube(treeJson, inParentTreeObj) {
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
        if (nodeData.hidden && !this._mustShowHiddenViews()) {
            mustBeHidden = true;
        } else if (nodeData.hidden==false && this._mustShowHiddenViewsOnly()) {
            mustBeHidden = true;
        } else if (this._nodeIsInteractive(nodeData)) {
            mustBeHidden = !this._mustShowInteractiveViews();
        } else {
            mustBeHidden = !this._mustShowNonInteractiveViews();
        }
        return mustBeHidden;
    }

    _mustCreateTreeBranch( nodeData ) {
        if (this._isKeyboardWindow(nodeData) && !this._mustShowKeyboard()) {
            return false;
        }
        return true;
    }


    /**
     * Returns true if the ui element must be created as a 3D object.
     * This is different than '_mustHideTreeObject'. An object can be created but might be set hidden.
     * e.g the visualization flags may require not to visualize the non interactive views, but they still have to be created and shown ans invisible.
     * @param nodeData
     */
    _mustCreateTreeObject ( nodeData ) {

        if (!this._mustShowPrivate()) {
            if (nodeData.private && nodeData.private == true) {
                return false;
            }
        }

        if (!this._mustShowOutOfScreen()) {
            if (this._treeObjectIsOutOfScreen(nodeData, deviceScreenSize)) {
                return false;
            }
        }
        if (this._isStatusBarWindow(nodeData)) {
            return false;
        }
         return true;
    }

    _removeScreenshotFromScreen() {
        screenPlane.material.color = 0x000000;
        //screenPlane.material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
    }

    _calculateElementZPosition( element, tree, currentZPosition, deviceScreenSize) {

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

                runningObjRect = {
                    "left": (objMesh.geometry.boundingBox.min.x + objMesh.position.x + deviceScreenSize.width / 2),
                    "top": Math.abs(objMesh.geometry.boundingBox.max.y + objMesh.position.y - deviceScreenSize.height / 2),
                    "right": (objMesh.geometry.boundingBox.max.x + objMesh.position.x + deviceScreenSize.width / 2),
                    "bottom": Math.abs(objMesh.geometry.boundingBox.min.y + objMesh.position.y - deviceScreenSize.height / 2)
                };

                if ( !!newObjRect && !!runningObjRect && this._rectsIntersect(newObjRect, runningObjRect)) {

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
            zPosition = this._calculateElementZPosition( element, tree[i].subviews, zPosition, deviceScreenSize); // calculate against next level in tree
        }
        return zPosition;
    }

    _rectsIntersect(a, b) {
        return (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom);
    }

    _treeObjectIsOutOfScreen(treeJson, deviceScreenSize) {
        return (treeJson.bounds.top > deviceScreenSize.height);
    }

    _nodeIsInteractive(treeNode) {
        if (treeNode.gestures) {
            return true;
        }
        if (treeNode.controlEvents) {
            return true;
        }
        if (treeNode.class == "UITextField" && treeNode.userInteractionEnabled) {
            return true;
        }
        if (treeNode.class == "MKMapView" && treeNode.userInteractionEnabled) {
            return true;
        }
        if (treeNode.class == "_MKUserTrackingButton" && treeNode.userInteractionEnabled) {
            return true;
        }
    }

    _hideNodeGroup(threeNodeGroup, hide) {
        var mesh = threeNodeGroup.children[0]; // the first is the mesh, second is the BoxHelper
        if (mesh) {
            mesh.visible = !hide;
        }
        var boxHelper = threeNodeGroup.children[1];
        if (boxHelper) {
            boxHelper.visible = !hide;
        }
    }

    _isStatusBarWindow(inUIElement) {
        if (inUIElement.nativeClass == "UIAWindow") {
            const child = inUIElement.subviews[0];
            if (child.nativeClass == "UIAStatusBar") {
                return true;
            }
        }
        return false;
    }

    _isKeyboardWindow(nodeData) {
        return (nodeData.class == "UITextEffectsWindow");
    }

    _mustShowKeyboard() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowKeyboardWindow);
    }
    _mustShowPrivate() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowPrivate);
    }
    _mustShowHiddenViews() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowHiddenViews);
    }
    _mustShowHiddenViewsOnly() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowHiddenViewsOnly);
    }
    _mustShowOutOfScreen() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowOutOfScreen);
    }
    _mustShowInteractiveViews() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowInteractiveViews);
    }
    _mustShowNonInteractiveViews() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowNonInteractiveViews);
    }
    _mustShowScreenshots() {
        return (this._visualizationFlags & ORGTreeVisualizationMask.ShowScreenshots);
    }

}