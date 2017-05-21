
var ORG = ORG || {};
ORG.UI = {};

ORG.canvasDomElem = document.getElementById('threejs-canvas');
ORG.scene = new ORG3DScene(ORG.canvasDomElem, {"width":320, "height":568});
ORG.locationManager = new ORGLocationManager();
ORG.locationManager.addListener( ORG.scene );
ORG.deviceController = null;
ORG.device = null;
ORG.map = null;

var loader = new THREE.FontLoader();
loader.load( 'three.js/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {
    ORG.font_helvetiker_regular = font;
} );

// Constants
ORG.Request = {
    AppInfo : "app-info",
    DeviceInfo : "device-info",
    Screenshot : "screenshot",
    ElementTree : "element-tree"};