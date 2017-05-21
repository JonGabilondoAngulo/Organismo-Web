/**
 * Created by jongabilondo on 01/08/2016.
 */


/**
 * Creates a mouse listener on a dom element.
 * Any object that wants to receive mouse events can add itself to this object as a delegate.
 * @param domElement where the mouse will be tracked
 * @constructor
 */
class ORGMouseListener {

    constructor( domElement ) {
        this._domElement = domElement;
        this._listeners = [];
    }

    /**
     * Activates the mouse events listening and informs the delegates.
     */
    enable(  ) {

        var this_backup = this;

        $(this._domElement).bind("mousedown", function (event) {
            for (var i=0; i<this_backup._listeners.length; i++) {
                if (this_backup._listeners[i].onMouseDown) {
                    this_backup._listeners[i].onMouseDown( event );
                }
            }
        });

        $(this._domElement).bind("mouseup", function (event) {
            for (var i=0; i<this_backup._listeners.length; i++) {
                if (this_backup._listeners[i].onMouseUp) {
                    this_backup._listeners[i].onMouseUp( event );
                }
            }
        });

        $(this._domElement).bind("mousemove", function (event) {
            for (var i=0; i<this_backup._listeners.length; i++) {
                if (this_backup._listeners[i].onMouseMove) {
                    this_backup._listeners[i].onMouseMove( event );
                }
            }
        });

        $(this._domElement).bind("contextmenu",function(event){
            event.preventDefault();
            for (var i=0; i<this_backup._listeners.length; i++) {
                if (this_backup._listeners[i].onContextMenu) {
                    this_backup._listeners[i].onContextMenu( event );
                }
            }
        });
    }

    /**
     * Stops listening to mouse events.
     */
    disable() {
        $(this._domElement).unbind();
    }

    /**
     * Add a delegate to the list of objects to be notified of mouse events.
     * The delegate must implement onMouseDown, onMouseUp, onMouseMove
     * @param delegate
     */
    addDelegate( delegate ) {
        this._listeners.push( delegate );
    }

    /**
     * Remove the delegate from the list.
     * @param delegate
     */
    removeDelegate( delegate ) {
        for (var i=0; i<this._listeners.length; i++) {
            if ( this._listeners[i] == delegate) {
                this._listeners.splice( i, 0);
            }
        }
    }

}