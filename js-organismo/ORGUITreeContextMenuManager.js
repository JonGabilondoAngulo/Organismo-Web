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
        this._node = null; // the tree component node
        this._contextElement = contextElement;

        // Instantiate the context menu
        $.contextMenu({
            selector: this._contextElement,
            trigger: 'none',
            build: ($trigger, e) => {
                return {items: this._menuItemsForNode()}
            },
            callback: (key, options) => {
                this._processMenuSelection(key);
            }
        })
    }


    /**
     * Shows the context menu at the point of event.
     * @param event
     */
    onContextMenu(event, node) {
        if (!ORG.deviceController || ORG.deviceController.isConnected === false) {
            return;
        }
        this._node = node;
        $(this._contextElement).contextMenu({x:node.clientX, y:node.clientY});
    }

    /**
     * The user has selected a menu option. This function will respond to the selection.
     * @param menuOptionKey The string that represents the selected menu option.
     */
    _processMenuSelection(menuOptionKey) {

        switch (menuOptionKey) {
            case 'tap': {
                ORGConnectionActions.tapOnXpath(this._getElementXPath(this._node));
            } break;
            case 'long-press': {
                ORGConnectionActions.longPressOnXpath(this._getElementXPath(this._node));
            } break;
            case 'swipe-left': {
                ORGConnectionActions.swipeOnXpath(this._getElementXPath(this._node), "left");
            } break;
            case 'swipe-right': {
                ORGConnectionActions.swipeOnXpath(this._getElementXPath(this._node), "right");
            } break;
            case 'swipe-up': {
                ORGConnectionActions.swipeOnXpath(this._getElementXPath(this._node), "up");
            } break;
            case 'swipe-down': {
                ORGConnectionActions.swipeOnXpath(this._getElementXPath(this._node), "down");
            } break;
            case 'look-at' : {
                alert('Not implemented');
            } break;
            case 'look-front-at': {
                alert('Not implemented');
            } break;
            case 'show-class-hierarchy': {
                if (this._node && (typeof this._node.representedNode.class !== undefined)) {
                    ORG.deviceController.sendRequest(ORGMessageBuilder.classHierarchy(this._node.representedNode.class));
                }
            } break;
        }
    }

    _menuItemsForNode() {
        let controller = ORG.deviceController;
        var items = {};

        if (controller.type === "WDA") {
            items["tap"] = {name: "Tap"};
            items["long-press"] = {name: "Long Press"};
            items["swipe"] = {
                name: "Swipe",
                items: {
                    "swipe-left": {name: "Left"},
                    "swipe-right": {name: "Right"},
                    "swipe-up": {name: "Up"},
                    "swipe-down": {name: "Down"},
                }
            }
        }

        if (controller.type === "ORG") {
            items["show-class-hierarchy"] = {name: "Class Hierarchy"}
            items["separator-look"] = { "type": "cm_separator" };
            items["look-at"] = {name: "Look at"}
            items["look-front-at"] = {name: "Look Front at"}
        }

        return items;
    }

    _getElementXPath(node) {
        if (!node) {
            return '//XCUIElementTypeApplication[1]'
        }
        let parent = ORG.UIJSONTreeManager.nodeParent(node)
        let idx = 0;
        if (parent) {
            for (let child of parent.nodes) {
                if (child.representedNode.type === node.representedNode.type) {
                    idx++;
                }
                if (child.nodeId === node.nodeId) {
                    break;
                }
            }
        } else {
            idx = 1;
        }

        return this._getElementXPath(parent) +
            '/' +
            'XCUIElementType' + node.representedNode.type + '[' + idx + ']'
    }

}