/**
 * Created by jongabilondo on 26/02/2017.
 */

/**
 * Base class to communicate with mobile devices via web sockets.
 */
class ORGWebSocketDeviceController extends ORGDeviceBaseController {

    /**
     * Constructor
     * @param ip
     * @param port
     * @param webSocket delegate
     */
    constructor(ip, port, delegate) {
        super(ip,port);
        this.session = null;
        this.webSocketDelegate = delegate;
        this.webSocket = new ORGWebSocket();
        this._ws = null;
    }

    get isConnected() {
        return this.webSocket.isConnected();
    }

    openSession() {
        //this.webSocket.open(this.IPandPort, this.webSocketDelegate);
        return new Promise((resolve, reject) => {
            const eConnectionRefused = new ORGError(ORGERR.ERR_WS_CONNECTION_REFUSED, "Error opening session.");
            const url = "ws://" + this.IPandPort + "/main";
            this._ws = new WebSocket(url);
            this._ws.onopen = () => {
                resolve({sessionId: 0});
            };
            this._ws.onclose = () => {
                reject(eConnectionRefused)
            };
            this._ws.onmessage = (event) => {
                reject(eConnectionRefused)
            };
            this._ws.onerror = (event) => {
                reject(eConnectionRefused)
            };
        });
    }

    getDeviceInformation() {
        return new Promise((resolve, reject) => {
            this._ws.onopen = null;
            this._ws.onclose = () => {
                reject();
            };
            this._ws.onmessage = (msg) => {
                const device = new ORGDevice(msg.data);
                resolve(device);
            };
            this._ws.onerror = (event) => {
                reject(event);
            };
            this._ws.send(ORGMessageBuilder.deviceInfo());
        });
    }

    getAppInformation() {
        return new Promise((resolve, reject) => {
            this._ws.onopen = null;
            this._ws.onclose = () => {
                reject();
            };
            this._ws.onmessage = (msg) => {
                const appInfo = new ORGTestApp(msg.data);
                resolve(appInfo);
            };
            this._ws.onerror = (event) => {
                reject(event);
            };
            this._ws.send(ORGMessageBuilder.appInfo());
        });
    }

    getScreenshot() {
        return new Promise((resolve, reject) => {
            this._ws.onopen = null;
            this._ws.onclose = () => {
                reject();
            };
            this._ws.onmessage = (msg) => {
                var base64Img = msg.data.screenshot;
                if (base64Img) {
                    var img = new Image();
                    img.src = "data:image/jpg;base64," + base64Img;
                    img.onload = () => {
                        resolve(img);
                    }
                }
            };
            this._ws.onerror = (event) => {
                reject(event);
            };
            this._ws.send(ORGMessageBuilder.takeScreenshot());
        })
    }

    closeSession() {
        this.webSocket.close();
    }

    sendRequest(request) {
        this.webSocket.send(request);
    }

    sendMessage(message) {
        this.webSocket.send(message);
    }
}