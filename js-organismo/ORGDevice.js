/**
 * Created by jongabilondo on 11/12/2016.
 */


/**
 * Class that represents a connected device. Holds device's basic information.
 */
class ORGDevice {

    constructor( deviceInfo ) {
        this.name = deviceInfo.name;
        this.model = deviceInfo.model;
        this.systemVersion = deviceInfo.systemVersion;
        this.productName = deviceInfo.productName;
        this.screenSize = deviceInfo.screenSize;
    }

    get isLikeiPhone5() {
        return this.productName.startsWith('iPhone 5');
    };
    get isLikeiPhone6() {
        return this.productName == 'iPhone 6' || this.productName == 'iPhone 7' || this.productName == 'iPhone 8';
    };
    get isLikeiPhone6Plus() {
        return this.productName == 'iPhone 6+' || this.productName == 'iPhone 7+' || this.productName == 'iPhone 8+';
    };
    get isLikeiPhoneX() {
        return this.productName == 'iPhone X';
    };

    /**
     * Get device physical size. Gets the values from ORG.DeviceMetrics global.
     * @returns {{width: *, height: *}} in meters.
     */
    get bodySize() {
        var body = null;
        if (this.isLikeiPhone5) {
            body = ORG.DeviceMetrics.iPhone5.Body;
        } else if (this.isLikeiPhone6) {
            body = ORG.DeviceMetrics.iPhone6.Body;
        } else if (this.isLikeiPhone6Plus) {
            body = ORG.DeviceMetrics.iPhone6Plus.Body;
        } else if (this.isLikeiPhoneX) {
            body = ORG.DeviceMetrics.iPhoneX.Body;
        } else {
            body = ORG.DeviceMetrics.iPhone6.Body;
        }
        return {"width": math.unit( body.W ).toNumber('m'), "height": math.unit( body.H ).toNumber('m')};
    }

    /**
     * Get displays' physical size. Gets the values from ORG.DeviceMetrics global.
     * @returns {{width, height}|*} in meters.
     */
    get displaySize() {
        var display = null;
        if (this.isLikeiPhone5) {
            display = ORG.DeviceMetrics.iPhone5.Display;
        } else if (this.isLikeiPhone6) {
            display = ORG.DeviceMetrics.iPhone6.Display;
        } else if (this.isLikeiPhone6Plus) {
            display = ORG.DeviceMetrics.iPhone6Plus.Display;
        } else if (this.isLikeiPhoneX) {
            display = ORG.DeviceMetrics.iPhoneX.Display;
        } else {
            display = ORG.DeviceMetrics.iPhone6.Display;
        }
        return this._calculateDisplaySize( math.unit( display.Diagonal).toNumber('m'), display.Ratio );
    }

    /**
     * Scale from pixels to real device size
     * @returns {{x: number, y: number}}
     */
    get displayScale() {
        const displaySize = this.displaySize;
        return { x:displaySize.width/this.screenSize.width, y:displaySize.height/this.screenSize.height};
    }

    // PRIVATE

    _calculateDisplaySize( diagonal, ratio ) {
        const w = Math.sqrt( Math.pow( diagonal, 2) / (1.0 +  Math.pow( ratio, 2)));
        const h = w * ratio;
        return { width:w, height:h };
    }

}