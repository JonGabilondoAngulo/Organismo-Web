/**
 * Created by jongabilondo on 02/12/2017.
 */

class ORGUIJSONTreeManager {

    constructor(placeholder, nodePlaceholder) {
        this._treePlaceholder = placeholder;
        this._nodePlaceholder = nodePlaceholder;
    }

    update(jsonTree) {

        if (jsonTree == null) {
            $(this._treePlaceholder).treeview('remove');
            $(this._nodePlaceholder).html("");
            return;
        }

        var adaptedTree = this._adaptor(jsonTree);
        var _this = this;
        $(this._treePlaceholder).treeview({
            data: adaptedTree,
            levels: 15,
            showBorder:false,
            expandIcon:'glyphicon glyphicon-triangle-right',
            collapseIcon:'glyphicon glyphicon-triangle-bottom',
            onNodeSelected: function (event, node) { _this._nodeSelected(event, node);},
            onNodeEnter: function (event, node) { _this._nodeEnter(event, node);},
            onNodeLeave: function (event, node) { _this._nodeLeave(event, node);},
        } );
    }

    _nodeSelected(event, node) {
        const nodeHTMLData = this._nodeAdaptor(node.representedNode);
        ORG.dispatcher.dispatch({
            actionType: 'uitree-node-selected',
            node:node.representedNode,
            html:nodeHTMLData
        });
    }

    _nodeEnter(event, node) {
        ORG.dispatcher.dispatch({
            actionType: 'uitree-node-enter',
            node:node.representedNode
        });
    }

    _nodeLeave(event, node) {
        ORG.dispatcher.dispatch({
            actionType: 'uitree-node-leave'
        });
    }

    _adaptor(jsonTree) {
        var newTree = [];
        if (!jsonTree) {
            return null;
        }
        for (let node of jsonTree) {
            var newNode = { representedNode:node};
            newTree.push(newNode);
            newNode.nodes = node.subviews;

            // Compose text for node
            newNode.text = node.class;
            if (node.accessibilityLabel) {
                newNode.text += " - " + node.accessibilityLabel;
            } else if (node.currentTitle) {
                newNode.text += " - " + node.currentTitle;
            } else if (node.text) {
                newNode.text += " - " + node.text;
            }

            // hidden icon
            if (node.hidden) {
                newNode.icon = 'glyphicon glyphicon-eye-close';
            }

            // subnodes
            var subTree = this._adaptor(node.subviews);
            if (subTree) {
                newNode.nodes = subTree;
            }
        }
        return newTree;
    }

    _nodeAdaptor(node) {
        var description = "";

        const className = node.class;
        if (className) {
            description += "<h4><b>" + className + "</b></h4>";
        }

        for (let key of Object.keys(node)) {
            if (this._ignoreNodeKey(key)) {
                continue;
            }
            if (key == "bounds") {
                description += "<b>" + key + "</b>:&nbsp" + JSON.stringify(node.bounds) + "<br>";
            } else {
                description += "<b>" + key + "</b>:&nbsp" + node[key] + "<br>";
            }
        }
        description += "<br>";

        return description;
    }

    _ignoreNodeKey(key) {
        return (key == "text" || key == "state" || key == "subviews" || key == "nodes" || key == "$el" || key == "screenshot" || key == "nodeId" || key == "parentId");
    }

}