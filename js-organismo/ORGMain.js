
// Constants
ORG.Request = {
    AppInfo : "app-info",
    DeviceInfo : "device-info",
    SystemInfo : "system-info",
    Screenshot : "screenshot",
    ElementTree : "element-tree"};

ORG.DeviceMetrics = {
    iPhone5 : {
        Body : {H : "123.8 mm", W: "58.6 mm", D: "7.6 mm"},
        Display: {Diagonal:"100 mm", Ratio:"1.7777777" /* 16/9 */}
    },
    iPhone6 : {
        Body : {H : "123.8 mm", W: "58.6 mm", D: "7.6 mm"},
        Display: {Diagonal:"100 mm", Ratio:"1.7777777" /* 16/9 */}
    }
};

ORG.contentWrapper = document.getElementById('content-wrapper');
ORG.leftSection = document.getElementById('3d-canvas-col');
ORG.canvasDomElem = document.getElementById('threejs-canvas');
ORG.rightSection = document.getElementById('right-tabs');
ORG.deviceController = null;
ORG.device = null;
ORG.map = null;
ORG.scenario = new ORGScenario();
ORG.dispatcher = new Flux.Dispatcher();
ORG.fluxStore = new ORGFluxStore(ORG.dispatcher);

ORG.fontLoader = new THREE.FontLoader();
ORG.fontLoader.load( 'three.js/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {

    ORG.font_helvetiker_regular = font;
    ORG.scene = new ORG3DScene(ORG.canvasDomElem, {"width":320, "height":568});
    ORG.locationManager = new ORGLocationManager();
    ORG.locationManager.addListener( ORG.scene );

    // Resize splitter
    ORG.SplitterResize(document.getElementById('org-splitter'), ORG.contentWrapper, ORG.leftSection, ORG.rightSection, ORG.scene);

    google.charts.load('current', {'packages' : ['columnchart']});
    //google.charts.setOnLoadCallback(function() { sendAndDraw('') });

    // System Info manager
    ORG.systemInfoManager = new ORGSystemInfoManager(ORG.scene);

    // UI JSON Tree
    ORG.UIJSONTreeManager = new ORGUIJSONTreeManager(ORG.scene, document.getElementById('ui-json-tree'));
} );



