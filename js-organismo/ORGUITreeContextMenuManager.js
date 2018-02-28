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
            case ORG.Actions.TAP:
            case ORG.Actions.LONG_PRESS:
            case ORG.Actions.SWIPE_LEFT:
            case ORG.Actions.SWIPE_RIGHT:
            case ORG.Actions.SWIPE_UP:
            case ORG.Actions.SWIPE_DOWN:
            {
                ORGConnectionActions.playGesture(menuOptionKey, this._getElementXPath(this._node));
            } break;
            case ORG.Actions.LOOK_AT : {
                alert('Not implemented');
            } break;
            case ORG.Actions.LOOK_FRONT_AT: {
                alert('Not implemented');
            } break;
            case ORG.Actions.SHOW_CLASS_HIERARCHY: {
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
            items[ORG.Actions.TAP] = {name: "Tap"};
            items[ORG.Actions.LONG_PRESS] = {name: "Long Press"};
            items[ORG.Actions.SWIPE] = {
                name: "Swipe",
                items: {
                    [ORG.Actions.SWIPE_LEFT]: {name: "Left"},
                    [ORG.Actions.SWIPE_RIGHT]: {name: "Right"},
                    [ORG.Actions.SWIPE_UP]: {name: "Up"},
                    [ORG.Actions.SWIPE_DOWN]: {name: "Down"},
                }
            }
        }

        if (controller.type === "ORG") {
            items[ORG.Actions.SHOW_CLASS_HIERARCHY] = {name: "Class Hierarchy"}
            items["separator-look"] = { "type": "cm_separator" };
            items[ORG.Actions.LOOK_AT] = {name: "Look at"}
            items[ORG.Actions.LOOK_FRONT_AT] = {name: "Look Front at"}
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