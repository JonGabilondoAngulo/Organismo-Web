
var ORG = ORG || {};

ORG.canvasDomElem = document.getElementById('threejs-canvas');
ORG.scene = new ORG3DScene(ORG.canvasDomElem, {"width":320, "height":568});

ORG.mask = {};
ORG.mask.show = {};

ORG.deviceController = null;
ORG.device = null;
