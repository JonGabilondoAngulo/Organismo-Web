/**
 * Created by jongabilondo on 01/08/2016.
 */

/**
 * A helper class to highlight the edges of the 3d UI elements when the UI is expanded.
 * When attached to a Raycaster as a delegate it will start to receive the "mouseOverElement" call and it will produce the highlight visual effect.
 * It implements the ORGRayscaster delegate method "mouseOverElement".
 * It is based in the usage of the THREE.BoxHelper object that is grouped with the 3D UI object.
 */
class ORG3DUIElementHiliter {

    constructor() {
        this._hilitedObj = null;
    }

    /**
     * Implementation of the Raycaster method to receive the UI element the mouse in on.
     * This method will manage the show and hide the highlights of the 3d objects.
     * @param threeElement
     */
    mouseOverElement( threeElement ) {
        if ( !!threeElement ) {
            // Mouse is over some UI element

            var mustHilite = false;
            if ( !this._hilitedObj) {
                mustHilite = true;
            } else if ( this._hilitedObj.id != threeElement.id ) {
                this._highlightUIElement( this._hilitedObj, false);
                mustHilite = true;
            }

            if ( mustHilite ) {
                this._highlightUIElement( threeElement, true);
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
     * @param threeUIElement
     * @param hilite
     */
    _highlightUIElement( threeUIElement, hilite) {

        if (!!threeUIElement) {
            if (threeUIElement.geometry.type == "PlaneBufferGeometry" || threeUIElement.geometry.type == "BoxGeometry") {

                var parent = threeUIElement.parent; // parent must be a group, holds edgesHelper and the uiobject plane
                if (parent) {
                    for (var i in parent.children) {
                        if (parent.children[i] instanceof THREE.BoxHelper) {
                            var edgesHelperObject = parent.children[i];
                            edgesHelperObject.material.color.set( (hilite ?0xff0000 :0xffffff) );
                            edgesHelperObject.material.needsUpdate = true;
                            this._hilitedObj = (hilite ?threeUIElement :null); // keep the hilited obj
                            break;
                        }
                    }
                }
            }
        }
    }
}