/**
 * Created by jongabilondo on 15/09/2016.
 */


/**
 * Class to create context menus in the 3D scene.
 * It implements the delegate call for ORGMouseListener in order to get the right mouse click.
 * It implements the delegate call for ORG3DRaycaster which informs what is the selected three obj.
 * @param domElement
 * @constructor
 */
class ORGContextMenuManager {

    /**
     *
     * @param scene The ORG scene.
     * @param contextElement the element where the context menu shows up.
     */
    constructor(scene, contextElement) {
        this._selectedThreeObject = null; // the three obj where the mouse is on.
        this._intersectionPoint = null;
        this._scene = scene; // We will need to get information from some objects in the scene
        this._contextElement = contextElement;

        /**
         * Instantiate the context menu
         */
        $.contextMenu({
            selector: this._contextElement,
            trigger: 'none',
            build: ($trigger, e) => {
                if (this._selectedThreeObject) {
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
                                    "swipe-down": {name: "Down"},
                                }
                            },
                            "-": {name: "-"},
                            "look-at": {name: "Look at"},
                            "look-front-at": {name: "Look Front at"}
                        }
                    };
                } else {
                    return {
                        items: {
                            "reset-camera-position": {name: "Reset Camera Position"},
                            "reset-device-position": {name: "Reset Device Position"},
                            "device-screen-closeup": {name: "Device Screen Closeup"}
                        }
                    };
                }
            },
            callback: (key, options) => {
                this._processMenuSelection(key, this._selectedThreeObject, this._scene);
            }
        });
    }


    /**
     * ORGMouseListener calls this method on right click
     * @param event
     */
    onContextMenu(event) {
        if (!ORG.deviceController || ORG.deviceController.isConnected == false) {
            return;
        }
        $(this._contextElement).contextMenu({x:event.clientX, y:event.clientY});
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
            case 'look-at' : {
                scene.lookAtObject( threeObj );
            } break;
            case 'look-front-at' : {
                scene.lookFrontAtObject( threeObj );
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
            case 'reset-camera-position' : {
                scene.resetCameraPosition();
            } break;
            case 'reset-device-position' : {
                scene.resetDevicePosition();
            } break;
            case 'device-screen-closeup' : {
                scene.deviceScreenCloseup();
            } break;
        }
    }
}