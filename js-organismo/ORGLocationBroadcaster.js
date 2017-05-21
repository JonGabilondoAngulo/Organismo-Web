/**
 * Created by jongabilondo on 21/05/2017.
 */

class ORGLocationBroadcaster {

    constructor() {
        this._listeners = [];
    }

    addListener(delegate ) {
        this._listeners.push( delegate );
    }

    removeListeners(delegate ) {
        for (let i=0; i<this._listeners.length; i++) {
            if ( this._listeners[i] == delegate) {
                this._listeners.splice( i, 1);
                break;
            }
        }
    }

    removeListerners() {
        this._listeners = [];
    }

    _broadcastLocation(location, address, elevation) {
        for (let i=0; i<this._listeners.length; i++) {
            if (this._listeners[i].locationUpdate) {
                this._listeners[i].locationUpdate( location, address, elevation );
            }
        }
    }
}