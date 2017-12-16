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
        $(this._treePlaceholder).treeview({
            data: jsonTree,
            levels: 15,
            showBorder:false,
            expandIcon:'glyphicon glyphicon-triangle-right',
            collapseIcon:'glyphicon glyphicon-triangle-bottom',
            onNodeSelected: this._nodeSelected});
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

    _nodeSelected(event, node) {

        $('#ui-json-tree-node').html('<b>class:</b>' + node.text);
        ORG.scene.highlightUIElement(node);
    }
}