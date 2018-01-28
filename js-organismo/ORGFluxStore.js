/**
 * Created by jongabilondo on 20/07/2017.
 */


class ORGFluxStore extends FluxUtils.Store {

    __onDispatch(payload) {
        switch (payload.actionType) {

            case 'screenshot-update': {
                ORG.scene.setScreenshotImage(payload.image);
            } break;

            case 'beacon-selected' : {
                ORG.scene.showHideBeaconTransformControls( payload.beacon );
            } break;

            case 'device-info-update' : {
                ORG.UI.deviceNameLabel.text(payload.device.name);
                ORG.UI.deviceSystemVersionLabel.text(payload.device.systemVersion);
                ORG.UI.deviceModelLabel.text(payload.device.productName);

                ORG.scene.createDeviceScreen( payload.device.displaySize.width, payload.device.displaySize.height, 0);
                if ( ORG.scene.flagShowDevice3DModel ) {
                    ORG.scene.showDevice3DModel();
                }
                ORG.scene.devicePositionHasChanged();
            } break;

            case 'app-info-update' : {
                ORG.UI.testAppNameLabel.text(payload.app.name );
                ORG.UI.testAppVersionLabel.text(payload.app.version );
                ORG.UI.testAppBundleIdLabel.text(payload.app.bundleIdentifier );
            } break;

            //************************************************************
            // JSON UI TREE
            //************************************************************

            case 'ui-json-tree-update': {
                ORG.UIJSONTreeManager.update(payload.tree, payload.treeType);
            } break;
            case 'ui-tree-refresh': {
                ORG.deviceController.refreshUITree();
            } break;
            case 'uitree-node-selected': {
                $('#ui-json-tree-node').html(payload.html);
            } break;
            case 'uitree-node-enter': {
                ORG.scene.highlightUIElement(payload.node);
            } break;
            case 'uitree-node-leave': {
                ORG.scene.highlightUIElement(null);
            } break;

            //************************************************************
            // 3D UI TREE
            //************************************************************
            case 'uitree-expanded': {
                ORG.UI.sliderTreeLayersRange.bootstrapSlider( 'setAttribute', 'min', 0);
                ORG.UI.sliderTreeLayersRange.bootstrapSlider( 'setAttribute', 'max', payload.ui_tree.layerCount);
                ORG.UI.sliderTreeLayersRange.bootstrapSlider( 'setValue', payload.ui_tree.layerCount);
            } break;
            case 'uitree-layer-range-change': {
                ORG.scene.setExpandedTreeLayersVisibleRange( payload.value );
            } break;
            case 'uitree-layer-spacing-change': {
                ORG.scene.setExpandedTreeLayersDistance( payload.value );
            } break;


            //************************************************************
            // LOCATION
            //************************************************************
            case 'itinerary-location-update': {
                ORG.map.updateItineraryLocation(payload.lat, payload.lng);
            } break;
            case 'start-location-update': {
                $('#label-lat').text(payload.lat);
                $('#label-lng').text(payload.lng);
                if (payload.elevation) {
                    $('#label-altitude').text(payload.elevation + "m");
                }
                if (payload.address) {
                    ORG.UI.startPoint.val(payload.address);
                }
            } break;
            case 'end-location-update': {
                $('#label-lat-end').text(payload.lat);
                $('#label-lng-end').text(payload.lng);
                if (payload.elevation) {
                    $('#label-altitude-end').text(payload.elevation + "m");
                }
                ORG.UI.endPoint.val(payload.address);
            } break;
            case 'reset-itinerary' : {
                $('#label-lat').text("");
                $('#label-lng').text("");
                $('#label-lat-end').text("");
                $('#label-lng-end').text("");
                $('#label-altitude').text("");
                $('#label-distance').text("");
                $('#label-duration').text("");
                ORG.UI.startPoint.val("");
                ORG.UI.endPoint.val("");
            } break;
            case 'itinerary-changed' : {
                $('#label-distance').text(payload.distance + "m");
                $('#label-duration').text(payload.duration + "s");
                ORG.UI.startPoint.val(payload.start_address);
                ORG.UI.endPoint.val(payload.end_address);
                $('#label-lat').text(payload.start_location.lat());
                $('#label-lng').text(payload.start_location.lng());
                $('#label-lat-end').text(payload.end_location.lat());
                $('#label-lng-end').text(payload.end_location.lng());
            } break;

            //************************************************************
            // DEVICE CONNECTIONS
            //************************************************************
            case 'device-disconnect': {
                ORG.scene.handleDeviceDisconnection();  // ORGWebSocketDelegate is not getting called onClose, at least within a reasonable time. Let's update the UI here.
                if ( ORG.systemInfoManager ) {
                    ORG.systemInfoManager.stop();
                }
                ORG.deviceController = null;
                ORG.device = null;
                ORG.testApp = null;

                ORG.UI.connectButton.text("Connect");
                ORG.UI.buttonExpand.text("Expand");
                ORG.UI.deviceNameLabel.text('');
                ORG.UI.deviceSystemVersionLabel.text('');
                ORG.UI.deviceModelLabel.text('');
                ORG.UI.testAppBundleIdLabel.text('');
                ORG.UI.testAppNameLabel.text('');
                ORG.UI.testAppVersionLabel.text('');
                ORG.UIJSONTreeManager.remove();
            } break;
            case 'wda-session-open' :
            case 'websocket-open' : {
                ORG.UI.connectButton.text("Disconnect");
            } break;
            case 'wda-session-open-error' : {
                bootbox.alert({
                    title: "Error connecting to device",
                    message: "1. Connect your device.<br/>2. The WebDriverAgent must be running on your device.<br/>3. A localport at 8100 must be opened to talk to the device (iproxy 8100 8100)."
                });
                console.debug(payload.error);
            } break;
            case 'wda-session-closed' :
            case 'websocket-closed' : {
                ORG.UI.connectButton.text("Connect");
                ORG.UI.buttonExpand.text("Expand");
                ORG.UI.deviceNameLabel.text('');
                ORG.UI.deviceSystemVersionLabel.text('');

                if (payload.code == 1006) {
                    if (payload.deviceController == "ORGDeviceController") {
                        bootbox.alert({
                            title: "Error connecting to device",
                            message: "1. Connect your device.<br/>2. The iOS application enabled for Organismo must be front.<br/>3. A localport at 5567 must be opened to talk to the device (iproxy 5567 5567)."
                        })
                    } else {
                        bootbox.alert("Error connecting to idevicecontrolproxy.\nMake sure the proxy is running.\nRead about it @ https://github.com/JonGabilondoAngulo/idevicecontrolproxy");
                    }
                }
            }
        }


    }
}