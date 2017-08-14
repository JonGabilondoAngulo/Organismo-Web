
var ORG = ORG || {};
ORG.UI = {};

ORG.contentWrapper = document.getElementById('content-wrapper');
ORG.leftSection = document.getElementById('3d-canvas-col');
ORG.canvasDomElem = document.getElementById('threejs-canvas');
ORG.rightSection = document.getElementById('right-tabs');
ORG.scene = new ORG3DScene(ORG.canvasDomElem, {"width":320, "height":568});
ORG.locationManager = new ORGLocationManager();
ORG.locationManager.addListener( ORG.scene );
ORG.deviceController = null;
ORG.device = null;
ORG.map = null;

ORG.fontLoader = new THREE.FontLoader();
ORG.fontLoader.load( 'three.js/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {
    ORG.font_helvetiker_regular = font;
} );

// Constants
ORG.Request = {
    AppInfo : "app-info",
    DeviceInfo : "device-info",
    Screenshot : "screenshot",
    ElementTree : "element-tree"};


ORG.dispatcher = new Flux.Dispatcher();
ORG.fluxStore = new ORGFluxStore(ORG.dispatcher);

// Resize splitter
$( "#3d-canvas-col" ).resizable({
    handles: 'e,w',
    minWidth: 500,
    resize:function(event, ui) {

        const newRightWidth = ORG.contentWrapper.offsetWidth - ui.size.width;
        const newLeftWidth = ui.size.width;
        ORG.leftSection.style.width = newLeftWidth + 'px';
        ORG.canvasDomElem.style.width = newLeftWidth + 'px';
        ORG.scene.resize(ui.size);
        ORG.rightSection.style.width = newRightWidth + 'px';

    }
});


google.charts.load('current', {'packages' : ['columnchart']});
//google.charts.setOnLoadCallback(function() { sendAndDraw('') });

