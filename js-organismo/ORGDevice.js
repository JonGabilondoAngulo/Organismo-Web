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

    /**
     * Get device physical size. Gets the values from ORG.DeviceMetrics global.
     * @returns {{width: *, height: *}} in meters.
     */
    get bodySize() {
        var body = null;
        if ( this.productName.startsWith( 'iPhone 5' )) {
            body = ORG.DeviceMetrics.iPhone5.Body;
        } else if ( this.productName.startsWith( 'iPhone 6' )) {
            body = ORG.DeviceMetrics.iPhone6.Body;
        } else {
            body = ORG.DeviceMetrics.iPhone5.Body;
        }
        return {"width": math.unit( body.W ).toNumber('m'), "height": math.unit( body.H ).toNumber('m')};
    }

    /**
     * Get displays' physical size. Gets the values from ORG.DeviceMetrics global.
     * @returns {{width, height}|*} in meters.
     */
    get displaySize() {
        var display = null;
        if ( this.productName.startsWith( 'iPhone 5' )) {
            display = ORG.DeviceMetrics.iPhone5.Display;
        } else if ( this.productName.startsWith( 'iPhone 6' )) {
            display = ORG.DeviceMetrics.iPhone6.Display;
        } else {
            display = ORG.DeviceMetrics.iPhone5.Display;
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