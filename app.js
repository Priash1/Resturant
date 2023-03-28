function initMap() {
    // Initialize the map
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 37.7749, lng: -122.4194 } // Default location (San Francisco)
    });

    // Initialize the geocoder
    var geocoder = new google.maps.Geocoder();

    // Initialize the directions service and renderer
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

    // Listen for form submission
    document.getElementById('location-form').addEventListener('submit', function (e) {
        e.preventDefault();

        // Get the location input value
        var location = document.getElementById('location-input').value;

        // Geocode the location
        geocoder.geocode({ 'address': location }, function (results, status) {
            if (status === 'OK') {
                // Center the map on the geocoded location
                map.setCenter(results[0].geometry.location);

                // Create a marker for the geocoded location
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });

                // Find the 5 nearest hotels/restaurants
                var service = new google.maps.places.PlacesService(map);
                service.nearbySearch({
                    location: results[0].geometry.location,
                    radius: 5000,
                    type: ['lodging', 'restaurant']
                }, function (results, status) {
                    if (status === 'OK') {
                        // Loop through the results and create a marker for each place
                        for (var i = 0; i < results.length && i < 5; i++) {
                            var place = results[i];
                            var placeLoc = place.geometry.location;
                            var marker = new google.maps.Marker({
                                map: map,
                                position: placeLoc
                            });

                            // Create an info window for each marker
                            var infowindow = new google.maps.InfoWindow();
                            google.maps.event.addListener(marker, 'click', function () {
                                infowindow.setContent(place.name);
                                infowindow.open(map, this);
                            });
                        }
                    }
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });

        // Clear the previous directions, if any
        directionsRenderer.setDirections({ routes: [] });

        // Calculate and display the directions to the nearest place
        calculateAndDisplayRoute(map, directionsService, directionsRenderer);
    });
}

function calculateAndDisplayRoute(map, directionsService, directionsRenderer) {
    // Find the nearest place
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: map.getCenter(),
        radius: 5000,
        type: ['lodging', 'restaurant']
    }, function (results, status) {
        if (status === 'OK') {
            var nearestPlace = results[0];

            // Calculate the directions to the nearest place
            var request = {
                origin: map.getCenter(),
                destination: nearestPlace.geometry.location,
                travelMode: 'DRIVING'
            };
            directionsService.route(request, function (result, status) {
                if (status === 'OK') {
                    // Display the directions on the map
                    directionsRenderer.setDirections(result);
                }
            });
        }
    });
}
