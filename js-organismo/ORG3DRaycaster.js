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
class ORG3DRaycaster {

    constructor(rendererDomElement, threeCamera, threeTargetObject) {
        this._raycaster = new THREE.Raycaster();
        this._rcmouse = new THREE.Vector2();
        this._hilitedObj = null;
        this._myMouseDown = false; // It will help us to ignore the mousemoves while mousedown.
        this._threeTargetObject = threeTargetObject; // The threejs object to raycast on
        this._rendererDomElement = rendererDomElement;
        this._threeCamera = threeCamera;
        this._listeners = [];
        this._enabled = true;
    }


    addDelegate( delegate ) {
        this._listeners.push( delegate );
    }

    removeDelegate( delegate ) {
        for (var i=0; i<this._listeners.length; i++) {
            if ( this._listeners[i] == delegate) {
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
        this._myMouseDown = true;

        if (this._hilitedObj) {
            var uiElement = this._hilitedObj.object.parent.userData;
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
    onMouseUp(event) {
        this._myMouseDown = false;
    }

    /**
     * ORGMouseListener informs of event
     * @param event
     */
    onMouseMove(event) {

        if (this._myMouseDown) {
            return;
        }
        if (!this._threeTargetObject) {
            return;
        }
        var canvasW = $(this._rendererDomElement).width();
        var canvasH = $(this._rendererDomElement).height();
        var canvasOffset = $(this._rendererDomElement).offset();

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        this._rcmouse.x = ( (event.clientX - canvasOffset.left) / canvasW ) * 2 - 1;
        this._rcmouse.y = - ( (event.clientY - canvasOffset.top) / canvasH ) * 2 + 1;

        this._raycaster.setFromCamera( this._rcmouse, this._threeCamera );
        var intersects = this._raycaster.intersectObject( this._threeTargetObject, true ); // return alwaay an array. The first one is the closest object.

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
        for (var i=0; i<this._listeners.length; i++) {
            if (this._listeners[i].mouseOverElement) {
                this._listeners[i].mouseOverElement( elementToHilite, intersectionPoint );
            }
        }
    }
}
