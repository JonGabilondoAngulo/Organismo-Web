var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify-es').default;

gulp.task('js-min', function(){
    return gulp.src(
    	['js-organismo/ORG.Namespaces.js',
    	'js-organismo/ORGConstants.js',
    	'js-organismo/ORGWebSocket.js',
    	'js-organismo/ORGDeviceConnection.js',
    	'js-organismo/ORGUITreeModel.js',
    	'js-organismo/ORGMouseListener.js',
    	'js-organismo/ORG3DUIElementHiliter.js',
    	'js-organismo/ORGTooltip.js',
    	'js-organismo/ORG3DScene.js',
    	'js-organismo/ORGMessageBuilder.js',
    	'js-organismo/ORGContextMenuManager.js',
    	'js-organismo/ORGFloorMap.js',
    	'js-organismo/ORGLocationProvider.js',
    	'js-organismo/ORGMap.js',
    	'js-organismo/ORGDevice.js',
    	'js-organismo/ORGTestApp.js',
    	'js-organismo/ORGDeviceBaseController.js',
    	'js-organismo/ORGDeviceController.js',
    	'js-organismo/ORGDeviceWDAController.js',
    	'js-organismo/ORGWebSocketDeviceController.js',
    	'js-organismo/ORGiMobileDeviceController.js',
    	'js-organismo/ORG3DSceneFloor.js',
    	'js-organismo/ORG3DDeviceModelLoader.js',
    	'js-organismo/ORG3DDeviceModel.js',
    	'js-organismo/ORG3DDeviceScreen.js',
    	'js-organismo/ORGWebSocketDelegate.js',
    	'js-organismo/ORGiControlProxyWSDelegate.js',
    	'js-organismo/ORGOrganismoWSDelegate.js',
    	'js-organismo/ORG3DRaycaster.js',
    	'js-organismo/ORGLocationManager.js',
    	'js-organismo/ORGFluxStore.js',
    	'js-organismo/ORG.SplitterResize.js',
    	'js-organismo/ORG.WindowResize.js',
    	'js-organismo/ORGMain.js',
    	'js-organismo/ORGDeviceConnectionControls.js',
    	'js-organismo/ORGTreeEditor.js',
    	'js-organismo/ORGSettingsControls.js',
    	'js-organismo/ORG3DLocationMarker.js',
    	'js-third-party/dist.js',
    	'js-third-party/epoly.js',
    	'js-organismo/ORGItinerary.js',
    	'js-organismo/ORGItineraryLocation.js',
    	'js-organismo/ORGItineraryRunner.js'])
        .pipe(gp_concat('concat.js'))
        .pipe(gulp.dest('build'))
        .pipe(gp_rename('organismo.min.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('js-libs'));
});


gulp.task('default', function(){ gulp.start('js-min');});