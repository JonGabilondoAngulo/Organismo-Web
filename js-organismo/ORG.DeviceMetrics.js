/**
 * Created by jongabilondo on 24/01/2018.
 */


ORG.DeviceMetrics = {
    iPhone5 : {
        Body : {H : "123.8 mm", W: "58.6 mm", D: "7.6 mm"},
        Display: {Diagonal:"100 mm", Ratio:"1.7777777" /* 16/9 */},
        Points: { X:320 , Y:568},
        Scale: 2,
        ProductName: "iPhone 5"
    },
    iPhone6 : {
        Body : {H : "138.1 mm", W: "67.0 mm", D: "6.9 mm"},
        Display: {Diagonal:"120 mm", Ratio:"1.7777777" /* 16/9 */},
        Points: { X:375 , Y:667},
        Scale: 2,
        ProductName: "iPhone 6"
    },
    iPhone6Plus : {
        Body : {H : "158.1 mm", W: "77.8 mm", D: "7.1 mm"},
        Display: {Diagonal:"140 mm", Ratio:"1.7777777" /* 16/9 */},
        Points: { X:414, Y:736},
        Scale: 3,
        ProductName: "iPhone 6+"
    }
};

class ORGDeviceMetrics {

    /***
     * Finds the device in ORG.DeviceMetrics that match the screen points passed in argument.
     * @param size in screen points
     * @returns {String}
     */
    static deviceWithScreenPoints(size) {
        for (let key of Object.keys(ORG.DeviceMetrics)) {
            if (ORG.DeviceMetrics[key].Points.X == size.width && ORG.DeviceMetrics[key].Points.Y == size.height) {
                return ORG.DeviceMetrics[key].ProductName;
            }
        }
        return "unknown";
    }
}