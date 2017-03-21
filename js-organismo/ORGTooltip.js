/**
 * Created by jongabilondo on 27/07/2016.
 */

function ORGTooltip( canvasDomElement) {

    var _threeCanvasDomElement = canvasDomElement;
    var _hilitedObj = null;
    var _tooltipOpen = false;

    //$(_threeCanvasDomElement).uitooltip({
    //    items: $(_threeCanvasDomElement),
    //    content: "....",
    //    track: true
    //    //using: function( position, feedback ) {
    //    //    console.log("position: " + position);
    //    //    //$( this ).css( position );
    //    ////    $( "<div>" )
    //    ////        .addClass( "arrow" )
    //    ////        .addClass( feedback.vertical )
    //    ////        .addClass( feedback.horizontal )
    //    ////        .appendTo( this );
    //    //}
    //});


    this.destroy = function() {
        if (_threeCanvasDomElement) {
            $( _threeCanvasDomElement ).uitooltip( "destroy" );
        }
    }

    // DELEGATE METHOD Gets called when hilite must change
    this.mouseOverElement = function( threeElement ) {
        if ( !!threeElement ) {
            // Mouse is over some UI element

            var mustShowTip = false;
            if ( !_hilitedObj) {
                mustShowTip = true;
            } else if ( _hilitedObj.id != threeElement.id ) {
                mustShowTip = true;
            }

            if ( mustShowTip ) {
                console.log(threeElement.parent.userData.class);
                show( threeElement.parent.userData );
            }

            //updatePosition();
        } else  {
            hide(); // Mouse is NOT over any UI element
        }
    }

    // PRIVATE

    function show( elementInfo ) {
        if (!_tooltipOpen) {
            $(_threeCanvasDomElement).uitooltip({
                items: $(_threeCanvasDomElement),
                content: createTooltipContent(elementInfo),
                track: true,
                open: function( event, ui ) {
                    console.log( ui );
                }
            });
            //$( _threeCanvasDomElement ).uitooltip( "option", "content", createTooltipContent(elementInfo) );
            $( _threeCanvasDomElement ).uitooltip( "option", "track", true );
            $( _threeCanvasDomElement ).uitooltip( "open" );
            _tooltipOpen = true;
        }
    }

    function hide() {
        //$( _threeCanvasDomElement ).uitooltip( "option", "hide", { effect: "fadeOut", duration: 500 } );
        //$( _threeCanvasDomElement ).tooltip( "option", "hide" );
        if (_tooltipOpen) {
            //$( _threeCanvasDomElement ).uitooltip( "close" );
            //$( _threeCanvasDomElement ).uitooltip( "option", "content", null );
            $( _threeCanvasDomElement ).uitooltip( "destroy" );
            _tooltipOpen = false;
        }
    }

    function updatePosition() {
        $( _threeCanvasDomElement ).uitooltip( "option", "position", { at: "left+50 top+400"} );
    }

    function createTooltipContent( elementInfo) {

        if (!elementInfo) {
            return "";
        }

        var content = "<div>" + elementInfo.class;
        for (var key in elementInfo){
            if ( key == "screenshot" || key == "class" || key == "subviews" || key == "threeObj" || key == "layerZPosition" || key == "zPosition") {
                continue;
            }

            if ( key == "accessibility") {
                content += serializeDictionary( elementInfo[key] );
                continue;
            }

            if ( key == "bounds" ) {
                content += "<br><span class='ui-tooltip-key'>bounds: </span>" + "<span class='ui-tooltip-value'>" + serializeBounds( elementInfo[key] ) + "</span>";
                continue;
            }

            if ( key == "gestures") {
                content += "<br><span class='ui-tooltip-key'>gestures: </span>" + "<span class='ui-tooltip-value'>" + serializeGestures( elementInfo[key] ) + "</span>";
                continue;
            }

            if ( key == "segues") {
                content += "<br><span class='ui-tooltip-key'>segues: </span>" + "<span class='ui-tooltip-value'>" + serializeSegues( elementInfo[key] ) + "</span>";
                continue;
            }

            if ( key == "controlEvents") {
                content += "<br><span class='ui-tooltip-key'>controlEvents: </span>" + "<span class='ui-tooltip-value'>" + serializeStrings( elementInfo[key] ) + "</span>";
                continue;
            }

            if ( key == "targets") {
                content += "<br><span class='ui-tooltip-key'>targets: </span>" + "<span class='ui-tooltip-value'>" + serializeStrings( elementInfo[key] ) + "</span>";
                continue;
            }


            content += "<br><span class='ui-tooltip-key'>" + key + ": </span>" + "<span class='ui-tooltip-value'>" + elementInfo[key] + "</span>";
        }
        return content += "</div>";
    }

    function serializeDictionary( dictionary ) {
        var content = "";
        for (var key in dictionary){
            content += "<br><span class='ui-tooltip-key'>" + key + ": </span>" + "<span class='ui-tooltip-value'>" + dictionary[key] + "</span>";
        }
        return content;
    }

    function serializeBounds( dictionary ) {
        var content = "x:" + dictionary.left + " y:" + dictionary.top.toString() + " w:" + (dictionary.right-dictionary.left).toString() + " h:" + (dictionary.bottom-dictionary.top).toString();
        return content;
    }

    function serializeGestures( gestures ) {
        var content = "";
        for ( var i=0; i<gestures.length; i++ ) {
            content += serializeGesture( gestures[i] );
        }
        return content;
    }

    function serializeGesture( gesture ) {
        var content = "";
        for (var key in gesture) {
            if ( content.length) {
                content += ", ";
            }
            content += key + ":" + gesture[key];
        }
        return "[" + content + "]";
    }

    function serializeSegues( segues ) {
        var content = "";
        for ( var i=0; i<segues.length; i++ ) {
            content += serializeSegue( segues[i] );
        }
        return content;
    }

    function serializeSegue( segue ) {
        var content = "";
        for (var key in segue) {
            if ( content.length) {
                content += ", ";
            }
            content += key + ":" + segue[key];
        }
        return "[" + content + "]";
    }

    function serializeStrings( strings ) {
        var content = "";
        for ( var i=0; i<strings.length; i++ ) {
            content += (content.length ?", " :"") + strings[i];
        }
        return content;
    }

}