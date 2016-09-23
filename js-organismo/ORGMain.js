//

var treeData;
var material;
var threejsCanvas = document.getElementById('threejs-canvas');
var motionMode = "receive";
var motionActive = false;
var showVideo = false;
var orgScene = new ORG3DScene(threejsCanvas, {"width":320, "height":568}, true);


function modelChangeShowHidden( inTreeObj, showHidden) {

    // Show/Hide Hidden objects
    for (var i in inTreeObj) {
        if (typeof(inTreeObj[i])=="object") {
            if (inTreeObj[i].hidden) {
                console.log("UI Element hidden: ", inTreeObj[i]);
                var threeObj = inTreeObj[i]["threeObj"];
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
            modelChangeShowHidden(inTreeObj[i].children, showHidden);
        }
    }
}

function modelChangeShowHiddenOnly( inTreeObj, showHidden, showHiddenOnly) {

    // Show/Hide Hidden objects
    for (var i in inTreeObj) {
        if (!!inTreeObj[i]==true && typeof(inTreeObj[i])=="object") {
            var mesh = inTreeObj[i]["threeObj"];
            if (mesh) {
                if (inTreeObj[i].hidden) {
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
            modelChangeShowHiddenOnly(inTreeObj[i].children, showHidden, showHidden);
        }
    }
}

function changeOpacity(inTreeObj, opacity) {
    //console.log("change obj to solid:", inTreeObj);

    for (var i in inTreeObj) {
        if (!!inTreeObj[i] && typeof(inTreeObj[i])=="object") {
            var mesh = inTreeObj[i]["threeObj"];
            if (mesh) {
                //console.log("FOUND OBJECT:",mesh, i);

                if (inTreeObj[i].nativeClass == "UITextEffectsWindow") {
                    continue;
                } else if (inTreeObj[i].nativeClass && inTreeObj[i].nativeClass.lastIndexOf("_",0)==0) {
                    continue;
                } else {
                    mesh.material.opacity = opacity;
                    mesh.needsUpdate = true;
                }
            } else {
                //console.log("OBJECT nas no three obj !!!!!!!!", inTreeObj[i], JSON.stringify(inTreeObj[i]));
            }
            changeOpacity(inTreeObj[i].children, opacity);
        }
    }

}

function position(t)
{
    // x(t) = cos(2t)·(3+cos(3t))
    // y(t) = sin(2t)·(3+cos(3t))
    // z(t) = sin(3t)
    return new THREE.Vector3(
        20.0 * Math.cos(2.0 * t) * (3.0 + Math.cos(3.0 * t)),
        20.0 * Math.sin(2.0 * t) * (3.0 + Math.cos(3.0 * t)),
        50.0 * Math.sin(3.0 * t) );
}



function isStatusBarWindow( inUIElement) {
    if (inUIElement.nativeClass == "UIAWindow") {
        var child = inUIElement.children[0];
        if (child.nativeClass == "UIAStatusBar") {
            return true;
        }
    }
    return false;
}
function isKeyboardWindow( inUIElement) {
    if (inUIElement.nativeClass == "UIAWindow") {
        var child = inUIElement.children[0];
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
