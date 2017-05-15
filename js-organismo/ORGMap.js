/**
 * Created by jongabilondo on 10/12/2016.
 */


class ORGMap {

    constructor() {
        this._map = null;
        this._delegates = [];

        this._map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -33.8688, lng: 151.2195},
            zoom: 13,
            mapTypeId: 'roadmap'
        });

        this._initAutocomplete();
    }

    get isCreated() {
        return !!this._map;
    }

    addDelegate( delegate ) {
        this._delegates.push( delegate );
    }

    removeDelegate( delegate ) {
        for (let i=0; i<this._delegates.length; i++) {
            if ( this._delegates[i] == delegate) {
                this._delegates.splice( i, 1);
                break;
            }
        }
    }

    removeDelegates() {
        this._delegates = [];
    }

    _initAutocomplete() {

        // Create the search box and link it to the UI element.
        const input = document.getElementById('pac-input');
        const searchBox = new google.maps.places.SearchBox(input);
        this._map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        const _this = this;
        // Bias the SearchBox results towards current map's viewport.
        this._map.addListener('bounds_changed', function () {
            searchBox.setBounds( _this._map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function () {
            const places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // Clear out the old markers.
            markers.forEach(function (marker) {
                marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            const bounds = new google.maps.LatLngBounds();
            places.forEach(function (place) {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                const icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                markers.push(new google.maps.Marker({
                    map: _this._map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location
                }));

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }

                // Inform delegates.
                const msg = ORGMessageBuilder.locationUpdate( place.geometry.location );
                if (ORG.deviceController) {
                    ORG.deviceController.sendRequest(msg);
                }

                for (let i=0; i<_this._delegates.length; i++) {
                    if (_this._delegates[i].locationUpdate) {
                        _this._delegates[i].locationUpdate( place.geometry.location, place.name );
                    }
                }

            });
            _this._map.fitBounds(bounds);
        });
    }
}