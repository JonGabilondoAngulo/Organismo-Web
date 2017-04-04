/**
 * Created by jongabilondo on 15/09/2016.
 */


/**
 * Class to create context menus in the 3d scene.
 * It implements the delegate call for ORGMouseListener in order to get the right mouse click.
 * It implements the delegate call for ORG3DRaycaster to know what is the selected three obj.
 * @param domElement
 * @constructor
 */
function ORGContextMenuManager(scene) {

    var _selectedThreeObject = null; // the three obj where the mouse is on.
    var _intersectionPoint = null;
    var _ORGScene = scene; // We will need to get information from some objects in the scene

    /**
     * Instantiate the context menu
     */
    $.contextMenu({
        selector: '#threejs-canvas',
        trigger: 'none',
        build: function($trigger, e) {
            if (_selectedThreeObject) {
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
                        "tap": {name: "General Options"}
                    }
                };
            }
        },
        callback: function(key, options) {
            //var m = "clicked: " + key;
            //window.console && console.log(m) || alert(m);

            _processMenuSelection(key, _selectedThreeObject, _ORGScene);
        }
    });

    /**
     * ORGMouseListener calls this method on right click
     * @param event
     */
    this.onContextMenu = function(event) {

        $('#threejs-canvas').contextMenu({x:event.clientX, y:event.clientY});
    }

    /**
     * ORG3DRaycaster calls this method to inform of the three obj the mouse is hoovering on.
     * @param threeElement
     */
    this.mouseOverElement = function(threeElement, point) {
        _selectedThreeObject = threeElement;
        _intersectionPoint = point;
    }

    // PRIVATE

    function _processMenuSelection(menuOptionKey, threeObj, ORGScene) {

        if (!threeObj) {
            return;
        }

        // Calculate the App coordinates where the mouse was clicked.

        var screenBbox = ORGScene.getDeviceScreenBoundingBox();
        var appX = _intersectionPoint.x - screenBbox.min.x;
        var appY = screenBbox.max.y - _intersectionPoint.y;

        var parameters = {location:{x:appX, y:appY}};

        switch (menuOptionKey) {
            case 'tap' : {
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
            case 'long-press' : {
                parameters.duration = 0.5;
                ORG.deviceController.sendRequest(ORGMessageBuilder.gesture(menuOptionKey, parameters));
            } break;
        }

    }
}