/**
 * Created by jongabilondo on 01/08/2016.
 */


/**
 * Creates a mouse listener on a dom element.
 * Any object that wants to receive mouse events can add itself to this object as a delegate.
 * @param domElement where the mouse will be tracked
 * @constructor
 */
function ORGMouseListener(domElement) {

    var _domElement = domElement;
    var _delegates = [];

    /**
     * Activates the mouse events listening and informs the delegates.
     */
    this.enable = function(  ) {

        $(_domElement).bind("mousedown", function (event) {
            for (var i=0; i<_delegates.length; i++) {
                if (_delegates[i].onMouseDown) {
                    _delegates[i].onMouseDown( event );
                }
            }
        });

        $(_domElement).bind("mouseup", function (event) {
            for (var i=0; i<_delegates.length; i++) {
                if (_delegates[i].onMouseUp) {
                    _delegates[i].onMouseUp( event );
                }
            }
        });

        $(_domElement).bind("mousemove", function (event) {
            for (var i=0; i<_delegates.length; i++) {
                if (_delegates[i].onMouseMove) {
                    _delegates[i].onMouseMove( event );
                }
            }
        });

        $(_domElement).bind("contextmenu",function(event){
            event.preventDefault();
            for (var i=0; i<_delegates.length; i++) {
                if (_delegates[i].onContextMenu) {
                    _delegates[i].onContextMenu( event );
                }
            }
        });
    }

    /**
     * Stops listening to mouse events.
     */
    this.disable = function() {
        $(_domElement).unbind();
    }

    /**
     * Add a delegate to the list of objects to be notified of mouse events.
     * The delegate must implement onMouseDown, onMouseUp, onMouseMove
     * @param delegate
     */
    this.addDelegate = function( delegate ) {
        _delegates.push( delegate );
    }

    /**
     * Remove the delegate from the list.
     * @param delegate
     */
    this.removeDelegate = function( delegate ) {
        for (var i=0; i<_delegates.length; i++) {
            if ( _delegates[i] == delegate) {
                _delegates.splice( i, 0);
            }
        }
    }

}