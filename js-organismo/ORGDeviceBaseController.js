/**
 * Created by jongabilondo on 26/02/2017.
 */

class ORGDeviceBaseController {

    constructor(ip, port) {
        this._ip = ip;
        this._port = port;
    }
    get type() {
        _throwError();
    };
    get isConnected() {
        _throwError();
    };
    get RESTPrefix() {
        return "http://" + this.IPandPort;
    }
    get IPandPort() {
        return this._ip + ":" + this._port;
    }

    openSession() {
        _throwError();
    };
    closeSession() {
        _throwError();
    };
    screenshot() {
        _throwError();
    };
    elementTree() {
        _throwError();
    };

    _throwError() {
        throw new Error("Executing base class method. Subclass must implement this method.");
    }
}