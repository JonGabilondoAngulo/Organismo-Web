/**
 * Created by jongabilondo on 02/12/2017.
 */

class ORGUIJSONTreeManager {

    constructor(scene, placeholder) {
        this._scene = scene; // ORG3DScene
        this._treePlaceholder = placeholder;
    }

    update(jsonTree) {
        this._adaptor(jsonTree);
        let _this = this;
        $(this._treePlaceholder).treeview({
            data: jsonTree,
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
        const nodeHTMLData = this._nodeAdaptor(node);
        $('#ui-json-tree-node').html(nodeHTMLData);
        ORG.scene.highlightUIElement(node);
    }

    _nodeEnter(event, node) {
    }

    _nodeLeave(event, node) {
    }

    _adaptor(jsonTree) {
        if (!jsonTree) {
            return;
        }
        for (let i=0; i < jsonTree.length; i++) {
            let node = jsonTree[i];
            node.nodes = node.subviews;
            node.text = node.class;
            if (node.state) {
                node._state = node.state;
                delete node.state;
            }
            if (node.hidden) {
                node.icon = 'glyphicon glyphicon-eye-close';
            }
            this._adaptor(node.nodes);
        }
    }

    _nodeAdaptor(node) {
        var description = "";
        for (let key of Object.keys(node)) {
            if (this._ignoreNodeKey(key)) {
                continue;
            }
            if (key == "bounds") {
                description += "<b>" + key + "</b> :" + JSON.stringify(node.bounds) + "<br>";
            } else if (key == "_state") {
                description += "<b>" + "state" + "</b> :" + node[key] + "<br>";
            } else {
                description += "<b>" + key + "</b> :" + node[key] + "<br>";
            }
        }
        return description;
    }

    _ignoreNodeKey(key) {
        return (key == "text" || key == "state" || key == "subviews" || key == "nodes" || key == "$el" || key == "screenshot" || key == "nodeId" || key == "parentId");
    }

}