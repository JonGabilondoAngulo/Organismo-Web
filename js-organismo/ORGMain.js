
var ORG = ORG || {};

ORG.canvasDomElem = document.getElementById('threejs-canvas');
ORG.scene = new ORG3DScene(ORG.canvasDomElem, {"width":320, "height":568});

ORG.mask = {};
ORG.mask.show = {};

ORG.deviceController = null;
ORG.device = null;

ORG.mask.treeVisualization = {
    ShowNormalWindow : 0x1,
    ShowAlertWindow : 0x2,
    ShowKeyboardWindow : 0x4,
    ShowStatusWindow : 0x8,
    ShowScreenshots : 0x10,
    ShowPrivate : 0x20,
    ShowPublic : 0x40,
    ShowHiddenViews : 0x80,
    ShowHiddenViewsOnly : 0x100,
    ShowInteractiveViews : 0x0200,
    ShowNonInteractiveViews : 0x0400,
    ShowNonInteractiveViews : 0x0800
};
