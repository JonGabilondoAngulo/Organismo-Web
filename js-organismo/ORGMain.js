
var ORG = ORG || {};
ORG.UI = {};

ORG.canvasDomElem = document.getElementById('threejs-canvas');
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


$( "#3d-canvas-col" ).resizable({
    handles: 'e',
    minWidth: 500,
    resize:function(event,ui){
        //var x=ui.element.outerWidth();
        //var y=ui.element.outerHeight();
        //var par=$(this).parent().width();
        //var ele=ui.element;
        //var factor = par-x;

        //
        //if (x==par) {
        //    jsEditor.resize();
        //    cssEditor.resize();
        //    htmEditor.resize();
        //    return;
        //}
        //
        //$.each(ele.siblings(),function(idx,item){
        //
        //    ele.siblings().eq(idx).css('height',y+'px');
        //    ele.siblings().eq(idx).css('width',(factor)+'px');
        //
        //});
        //
        //if (x>=(par-100)) {
        //    $(".resize").resizable("option","maxWidth",ui.size.width);
        //    return;
        //}
        //
        //jsEditor.resize();
        //cssEditor.resize();
        //htmEditor.resize();
    }


});


google.charts.load('current', {'packages' : ['columnchart']});
//google.charts.setOnLoadCallback(function() { sendAndDraw('') });

