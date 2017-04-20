/**
 * Created by jongabilondo on 15/09/2016.
 */


/**
 * Class to create context menus in the 3d scene.
 * It implements the delegate call for ORGMouseListener in order to get the right mouse click.
 * It implements the delegate call for ORG3DRaycaster which informs what is the selected three obj.
 * @param domElement
 * @constructor
 */
class ORGContextMenuManager {

    /**
     *
     * @param scene The ORG scene.
     */
    constructor( scene ) {
        this._selectedThreeObject = null; // the three obj where the mouse is on.
        this._intersectionPoint = null;
        this._scene = scene; // We will need to get information from some objects in the scene

        const _this = this;

        /**
         * Instantiate the context menu
         */
        $.contextMenu({
            selector: '#threejs-canvas',
            trigger: 'none',
            build: function($trigger, e) {
                if (_this._selectedThreeObject) {
                    return {
                        items: {
                            "tap": {name: "Tap"},
                            "long-press": {name: "Long Press"},
                            "swipe": {
                                name: "Swipe",
                                items: {
                                    "swipe-left": {name: "Left"},
                                    "swipe-right": {name: "Right"},
                                    "swipe-up": {name: "Up"},
                                    "swipe-down": {name: "Down"}
                                }
                            }
                        }
                    };
                } else {
                    return {
                        items: {
                            "reset-camera": {name: "Reset Camera"}
                        }
                    };
                }
            },
            callback: function(key, options) {
                //var m = "clicked: " + key;
                //window.console && console.log(m) || alert(m);

                _this._processMenuSelection(key, _this._selectedThreeObject, _this._scene);
            }
        });
    }


    /**
     * ORGMouseListener calls this method on right click
     * @param event
     */
    onContextMenu(event) {

        $('#threejs-canvas').contextMenu({x:event.clientX, y:event.clientY});
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
            case 'tap' : {
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case 'long-press' : {
                parameters.duration = 0.5;
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case 'swipe-left' : {
                parameters.direction = "left";
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case 'swipe-right' : {
                parameters.direction = "right";
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case 'swipe-up' : {
                parameters.direction = "up";
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case 'swipe-down' : {
                parameters.direction = "down";
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
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
            case 'reset-camera' : {
                scene.resetCameraPosition();
            }
        }
    }
}