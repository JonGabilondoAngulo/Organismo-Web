/**
 * Created by jongabilondo on 02/12/2017.
 */

class ORGUIJSONTreeManager {

    constructor(placeholder, nodePlaceholder) {
        this._treePlaceholder = placeholder;
        this._nodePlaceholder = nodePlaceholder;
        this._treeAdaptor = null;
        this._treeType = null;
    }

    update(jsonTree, treeType) {
        this._treeType = treeType;
        switch (treeType) {
            case ORGUIJSONTreeManager.TREE_TYPE_WDA : {
                this._treeAdaptor =  ORGUIJSONWDATreeAdaptor;
            } break;
            case ORGUIJSONTreeManager.TREE_TYPE_ORGANISMO : {
                this._treeAdaptor = ORGUIJSONOrganismoTreeAdaptor;
            } break;
            default : {
                return;
            }
        }

        if (jsonTree == null) {
            $(this._treePlaceholder).treeview('remove');
            $(this._nodePlaceholder).html("");
            return;
        }

        var adaptedTree = this._treeAdaptor.adaptTree(jsonTree);
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
        const nodeHTMLData = this._treeAdaptor.nodeToHTML(node.representedNode);
        ORG.dispatcher.dispatch({
            actionType: 'uitree-node-selected',
            node:node.representedNode,
            html:nodeHTMLData
        });
    }

    _nodeEnter(event, node) {
        var node3DElement = null;

        if (node  && !node.representedNode) {
            console.debug("The mouseover tree node has no data !");
            return;
        }

        switch (this._treeType) {
            case ORGUIJSONTreeManager.TREE_TYPE_WDA : {
                node3DElement = new ORG3DWDAUIElement(node.representedNode);
            } break;
            case ORGUIJSONTreeManager.TREE_TYPE_ORGANISMO : {
                node3DElement = new ORG3DORGUIElement(node.representedNode);
            } break;
            default : {
                return;
            }
        }

        ORG.dispatcher.dispatch({
            actionType: 'uitree-node-enter',
            node:node3DElement
        });
    }

    _nodeLeave(event, node) {
        ORG.dispatcher.dispatch({
            actionType: 'uitree-node-leave'
        });
    }
}

ORGUIJSONTreeManager.TREE_TYPE_WDA = 0;
ORGUIJSONTreeManager.TREE_TYPE_ORGANISMO = 1;
