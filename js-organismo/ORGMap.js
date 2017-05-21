/**
 * Created by jongabilondo on 10/12/2016.
 */


class ORGMap extends ORGLocationBroadcaster {

    constructor() {

        super();

        this._map = null;
        this._marker = null;

        this._map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -33.8688, lng: 151.2195},
            zoom: 13,
            mapTypeId: 'roadmap'
        });
        this._elevationService = new google.maps.ElevationService();
        this._geocoder = new google.maps.Geocoder();

        this._initAutocomplete();
    }

    get isCreated() {
        return !!this._map;
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

        this._map.addListener('rightclick', function(event) {
            _this._onRightClick(event, _this);
        });

        this._map.addListener('click', function(event) {
            _this._onClick(event, _this);
        });


        //var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function () {
            const places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // Clear out the old markers.
            //markers.forEach(function (marker) {
            //    marker.setMap(null);
            //});
            //markers = [];

            _this._removeMarker();

            // For each place, get the icon, name and location.
            const bounds = new google.maps.LatLngBounds();
            places.forEach(function (place) {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                //const icon = {
                //    url: place.icon,
                //    size: new google.maps.Size(71, 71),
                //    origin: new google.maps.Point(0, 0),
                //    anchor: new google.maps.Point(17, 34),
                //    scaledSize: new google.maps.Size(25, 25)
                //};
                //
                //// Create a marker for each place.
                //markers.push(new google.maps.Marker({
                //    map: _this._map,
                //    icon: icon,
                //    title: place.name,
                //    position: place.geometry.location
                //}));
                _this._createMarker(place.geometry.location);

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }

                // Find location info, and broadcast.
                _this._getLocationInfoAndBroadcast(place.geometry.location);
            });
            _this._map.fitBounds(bounds);
        });
    }

    _onClick(event, ORGMap) {

        ORGMap._removeMarker();
        ORGMap._createMarker(event.latLng);
        ORGMap._getLocationInfoAndBroadcast(event.latLng);
    }

    _onRightClick(event, ORGMap) {

    }

    _createMarker(location) {
        this._marker = new google.maps.Marker({
            position: location,
            map: this._map,
            animation: google.maps.Animation.DROP,
            draggable: true
        });
    }

    _removeMarker() {
        if (this._marker) {
            this._marker.setMap(null);
        }
    }

    _getLocationInfoAndBroadcast(location) {
        const _this = this;
        this._geocodePosition(location, function(location, address, elevation) {
            _this._broadcastLocation(location, address, elevation);
        });
    }

    _geocodePosition(location, onCompletion) {
        const _this = this;

        this._geocoder.geocode({
            latLng: location
        }, function(responses) {
            if (responses && responses.length > 0) {
                _this._elevationPosition(location, responses[0].formatted_address, onCompletion);
            } else {
                _this._elevationPosition(location, null, onCompletion);
            }
        });
    }

    _elevationPosition(location, address, onCompletion) {
        const _this = this;

        this._elevationService.getElevationForLocations({
            'locations': [location]
        }, function(results, status) {

            if (status === 'OK') {
                if (results[0] && onCompletion) {
                    onCompletion(location, address, results[0].elevation);
                }
            }
        });
    }

}