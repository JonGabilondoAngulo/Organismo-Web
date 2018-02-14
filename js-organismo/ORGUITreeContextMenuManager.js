/**
 * Created by jongabilondo on 13/02/2018.
 */

/***
 * Class to wrapp the functionality of the UITree context menu
 */
class ORGUITreeContextMenuManager {

    /**
     *
     * @param contextElement the element where the context menu shows up.
     */
    constructor(contextElement) {
        this._node = null;
        this._contextElement = contextElement;

        // Instantiate the context menu
        $.contextMenu({
            selector: this._contextElement,
            trigger: 'none',
            build: ($trigger, e) => {
                if (ORG.deviceController.type == "WDA") {
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
                            "show-class-hierarchy": {name: "Class Hierarchy"}
                        }
                    };
                }
            },
            callback: (key, options) => {
                this._processMenuSelection(key);
            }
        });
    }


    /**
     * Shows the context menu at the point of event.
     * @param event
     */
    onContextMenu(event, node) {
        if (!ORG.deviceController || ORG.deviceController.isConnected == false) {
            return;
        }
        this._node = node.representedNode;
        $(this._contextElement).contextMenu({x:node.clientX, y:node.clientY});
    }

    /**
     * The user has selected a menu option. This function will respond to the selection.
     * @param menuOptionKey The string that represents the selected menu option.
     */
    _processMenuSelection(menuOptionKey) {

        switch (menuOptionKey) {
            case 'tap': {
                alert('Not implemented');
            } break;
            case 'long-press': {
                alert('Not implemented');
            } break;
            case 'swipe-left': {
                alert('Not implemented');
            } break;
            case 'swipe-right': {
                alert('Not implemented');
            } break;
            case 'swipe-up': {
                alert('Not implemented');
            } break;
            case 'swipe-down': {
                alert('Not implemented');
            } break;
            case 'look-at' : {
                alert('Not implemented');
            } break;
            case 'look-front-at': {
                alert('Not implemented');
            } break;
            case 'show-class-hierarchy': {
                if (this._node && (typeof this._node.class != undefined)) {
                    ORG.deviceController.sendRequest(ORGMessageBuilder.classHierarchy(this._node.class));
                }
            } break;
        }
    }
}