/**
 * Created by jongabilondo on 26/02/2017.
 */


class ORGDeviceWDAController extends ORGDeviceBaseController {

    constructor(ip, port) {
        super(ip,port);
        this.xhr = new XMLHttpRequest();
        this.session = null;
    }

    get type() {
        return "WDA";
    }

    get isConnected() {
        return (this.session != null);
    }

    openSession() {
        var openStr = this.RESTPrefix  + "/session";
        this.xhr.open("POST", openStr, true);
        this.xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var json = JSON.parse(this.responseText);
            }
        }
        this.xhr.send();
    }

    closeSession() {
        var closeStr = this.RESTPrefix  + "/";
        xhr.open("POST", closeStr, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var json = JSON.parse(xhr.responseText);
            }
        }
        xhr.send();
    }

    screenshot() {

    }

    elementTree() {

    }

}