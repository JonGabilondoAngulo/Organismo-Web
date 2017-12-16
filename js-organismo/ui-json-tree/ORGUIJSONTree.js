/**
 * Created by jongabilondo on 23/11/2017.
 */

'use strict';

class ORGUIJSONTree extends React.PureComponent {

    constructor( props ) {

        super( props );
        this.state = {
            //data: this.expandShallow(props.data, 5)
        };
    }

    expandShallow(data, depth) {

        //data.expanded = true;
        //const nodes = data.nodes;
        //
        //if (nodes && depth > 1) {
        //    for (let i = 0; i < nodes.length; i++) {
        //        this.expandShallow(nodes[i], depth - 1);
        //    }
        //}
        //return data;
    }

    render() {

        //const props = this.props;
        //const data = this.props.data;
        ////const childrenCount = data.nodes && data.nodes.length || 0;
        //var lineList=[];
        //
        //const listItems = data.map(function(node) {
        //    //console.log(node.class);
        //    lineList.push(React.createElement('div', null, node.class));
        //});

        return <h1>Hello, there </h1>;

        //return lineList;
//        return React.createElement('div', null, 'Hello World!');
    }
}