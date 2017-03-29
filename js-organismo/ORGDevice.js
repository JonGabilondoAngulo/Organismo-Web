/**
 * Created by jongabilondo on 11/12/2016.
 */


/**
 * Class that represents a connected device. Holds device's basic information.
 */
class ORGDevice {

    constructor(deviceInfo) {
        this.name = deviceInfo.name;
        this.model = deviceInfo.model;
        this.systemVersion = deviceInfo.systemVersion;
        this.productName = deviceInfo.productName;
    }

}