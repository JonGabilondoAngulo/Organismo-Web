/**
 * Created by jongabilondo on 6/21/15.
 */

/**
 * Class to detect the THREE object the mouse is on.
 * It calls its delegates to inform them the THREE obj the mouse is onto.
 * If the mouse is not over any obj then it passes a null.
 * The Delegate must implement mouseOverElement.
 *
 * This class is as well a delegate for ORGMouseListener.
 * It implements onMouseDown, onMouseUp, onMouseMove to receive the mouse events.
 * @constructor
 */
function ORGRaycaster(rendererDomElement, threeCamera, threeTargetObject) {

    var _raycaster = new THREE.Raycaster();
    var _rcmouse = new THREE.Vector2();
    var _hilitedObj = null;
    var _myMouseDown = false; // It will help us to ignore the mousemoves while mousedown.
    var _threeTargetObject = threeTargetObject; // The threejs object to raycast on
    var _rendererDomElement = rendererDomElement;
    var _threeCamera = threeCamera;
    var _delegates = [];
    var _enabled = true;

    this.addDelegate = function( delegate ) {
        _delegates.push( delegate );
    }

    this.removeDelegate = function( delegate ) {
        for (var i=0; i<_delegates.length; i++) {
            if ( _delegates[i] == delegate) {
                _delegates.splice( i, 0);
            }
        }
    }

    // ORGMouseListener DELEGATE METHODS

    /**
     * ORGMouseListener informs of event
     * @param event
     */
    this.onMouseDown = function (event) {
        _myMouseDown = true;

        if (_hilitedObj) {
            var uiElement = _hilitedObj.object.parent.userData;
            var uiElementForEditor = {};
            for (var key in uiElement) {
                if (key != "threeObj" && key != "children") {
                    uiElementForEditor[key] = uiElement[key];
                }
            }
        }
    }

    /**
     * ORGMouseListener informs of event
     * @param event
     */
    this.onMouseUp = function (event) {
        _myMouseDown = false;
    }

    /**
     * ORGMouseListener informs of event
     * @param event
     */
    this.onMouseMove = function (event) {

        if (_myMouseDown) {
            return;
        }
        if (!_threeTargetObject) {
            return;
        }
        var canvasW = $(_rendererDomElement).width();
        var canvasH = $(_rendererDomElement).height();
        var canvasOffset = $(_rendererDomElement).offset();

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        _rcmouse.x = ( (event.clientX - canvasOffset.left) / canvasW ) * 2 - 1;
        _rcmouse.y = - ( (event.clientY - canvasOffset.top) / canvasH ) * 2 + 1;

        _raycaster.setFromCamera( _rcmouse, _threeCamera );
        var intersects = _raycaster.intersectObject( _threeTargetObject, true ); // return alwaay an array. The first one is the closest object.

        var elementToHilite = null;
        var intersectionPoint = null;
        if (intersects && intersects.length) {
            elementToHilite = intersects[0].object;
            intersectionPoint = intersects[0].point;

            // Make sure the object is the uiobj plane and not the edges helper
            if (elementToHilite instanceof THREE.BoxHelper) {
                var parent = elementToHilite.parent; // parent must be a group, holds edgesHelper and the uiobject plane
                elementToHilite = null;
                if (parent) {
                    for (var i in parent.children) {
                        if (  (parent.children[i] instanceof THREE.BoxHelper) == false) {
                            elementToHilite = parent.children[i];
                            break;
                        }
                    }
                }
            }
        }

        // Inform delegates about the intersected element, null is sent as well.
        for (var i=0; i<_delegates.length; i++) {
            if (_delegates[i].mouseOverElement) {
                _delegates[i].mouseOverElement( elementToHilite, intersectionPoint );
            }
        }
    }
}
