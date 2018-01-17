/**
 * Created by jongabilondo on 20/07/2017.
 */


class ORGFluxStore extends FluxUtils.Store {

    __onDispatch(payload) {
        switch (payload.actionType) {

            case 'ui-tree-refresh': {
                ORG.deviceController.requestElementTree({
                    "status-bar": true,
                    "keyboard": true,
                    "alert": true,
                    "normal": true
                });
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
            case 'uitree-expanded': {
//mySlider .bootstrapSlider('setValue', 5) .bootstrapSlider('setValue', 7); this way ?
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
            case 'beacon-selected' : {
                ORG.scene.showHideBeaconTransformControls( payload.beacon );
            } break;
            case 'device-disconnect': {
                ORG.UI.connectButton.text("Connect");
                ORG.UI.buttonExpand.text("Expand");
                ORG.UI.deviceNameLabel.text('');
                ORG.UI.deviceSystemVersionLabel.text('');
                ORG.UI.deviceModelLabel.text('');
                ORG.UI.testAppBundleIdLabel.text('');
                ORG.UI.testAppNameLabel.text('');
                ORG.UI.testAppVersionLabel.text('');
                ORG.UIJSONTreeManager.update(null);
            } break;
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
            case 'websocket-open' : {
                ORG.UI.connectButton.text("Disconnect");
            } break;
            case 'websocket-closed' : {
                ORG.UI.connectButton.text("Connect");
                ORG.UI.buttonExpand.text("Expand");
                ORG.UI.deviceNameLabel.text('');
                ORG.UI.deviceSystemVersionLabel.text('');

                if (payload.code == 1006) {
                    if (payload.deviceController == "ORGDeviceController") {
                        alert("Error connecting to device.\nMake sure the device is connected and the application is open.");
                    } else {
                        alert("Error connecting to idevicecontrolproxy.\nMake sure the proxy is running.\nRead about it @ https://github.com/JonGabilondoAngulo/idevicecontrolproxy");
                    }
                }
            }
        }


    }
}