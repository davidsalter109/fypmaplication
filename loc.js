let polyline = null;
let polyline2 = null;
var marker2, infoWindow, elevator, id, mapArray, map, poly, latArray, lngArray, circle, accuracy, distance, totalDistance;
var markersArray = [];
var posArray = [];
var recordedLocArray = [];
var bikeLayer = null;
var distanceArray = [];
var last_pos, latest_pos, latest_pos_lat, latest_pos_lng, last_pos_lat, last_pos_lng;
var pos, currentLocation;
var watchPositionID;
var recordOptions;

//Load the google visualisation package
google.load('visualization', '1', {packages: ['columnchart']});

//Haversine Distance calculation
function haversine_distance(last_pos_lat, latest_pos_lat, last_pos_lng, latest_pos_lng) {
    var rlat1 = last_pos_lat * (Math.PI/180); // Convert degrees to radians
    var rlat2 = latest_pos_lat * (Math.PI/180); // Convert degrees to radians
    var difflat = (latest_pos_lat - last_pos_lat) * (Math.PI/180); // Converts the difference to radians
    var difflng = (latest_pos_lng - last_pos_lng) * (Math.PI/180); // Radian difference (longitudes)  
    
    var R = 3958.8; // Radius of the Earth in miles
      var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflng/2)*Math.sin(difflng/2)));
      return d;
    }

function addUserLocation() {
    //Creating the accuracy circle
    circle = new google.maps.Circle({
        clickable: false,
    radius: accuracy,
    map: map,
    fillColor: '#3333FF',
    fillOpacity: 0.1,
    strokeColor: '#00008b',
    strokeOpacity: 0.4,
    }); 
    //Creating the arrow to display location and orientation
    marker2 = new google.maps.Marker({
        clickable : false,
        icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              strokeColor : '#3333FF',
              strokeWeight : 3,
              scale: 2.5
            },
        shadow : null,
        zIndex : 999,
     //   title : genProps.pMyLocationTitle,
        map : map
    });
    enableWatchPosition();
    enableOrientationArrow();
}

//Changing the orientation of the location arrow to show users device orientation
function enableOrientationArrow() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(event) {
            var alpha = null;
            //Check for iOS property
            if (event.webkitCompassHeading) { 
                alpha = event.webkitCompassHeading;
            }
            //non iOS
            else {
                alpha = event.alpha;
            }
            var locationIcon = marker2.get('icon');
            locationIcon.rotation = 360 - alpha;
            marker2.set('icon', locationIcon);
        }, false);
    }
}

//Watching the users position to feed the accuracy circle and location arrow coodinates
function enableWatchPosition() {
    if (navigator.geolocation) {
        watchPositionId = navigator.geolocation.watchPosition(locateByBrowser, error, {enableHighAccuracy : true});
    }
}

//Setting the accuracy of the location and setting the location arrow onto the map
function locateByBrowser(position) {
    
    var accuracy = position.coords.accuracy; //accuracy of the location
    currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude); //gets the current user location
    //setting the location arrow
    marker2.setPosition(currentLocation);
    marker2.setMap(map);
    //setting the accuracy circle
    circle.setCenter(currentLocation);
    circle.setRadius(accuracy);
    circle.setMap(map);
}

//Start recording the users position by storing coordinates into an array
function startRecording() {
    //creating the array for the recorded elevation chart
   mapArray = [];
    //setting the recording options
  recordOptions = {enableHighAccuracy: false, timeout: 5000, maximumAge: 0}
//watching the users location
   id = navigator.geolocation.watchPosition(function(position){
        var pos2 = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
       //passing the position to be entered into the mapArray
        arrayStuff(pos2);
       //setting the map to center whenever the users position changes
       map.setCenter(pos2);
       // Calculate the distance travelled
    latest_pos = mapArray.slice(-1)[0]; //latest position taken from mapArray
    last_pos = mapArray.slice(-2)[0]; //previous position taken from mapArray 
    latest_pos_lat = latest_pos.lat; //latest position latitude
    latest_pos_lng = latest_pos.lng; //latest position longitude
    last_pos_lat = last_pos.lat; //previous position latitude
    last_pos_lng = last_pos.lng; //previous position longitude
       
    //distance travelled calculation
    distance = haversine_distance(last_pos_lat, latest_pos_lat, last_pos_lng, latest_pos_lng);
    distanceArray.push(distance);     
    }, error, recordOptions) //End of id watchPosition
    
    //Pushing the location into the mapArray
    function arrayStuff(pos3) {
    mapArray.push(pos3);
    }
       recordedLocArray = mapArray;  //Used to draw the polyline of the users recorded journey
}

//Stops the recording
function stopRecording() {
    //Clear id
        navigator.geolocation.clearWatch(id);
    id = 0; 
    mapArray = []; //Empty mapArray
    map.setCenter(currentLocation); //Center the Map
    distanceArray = []; //Empty the distance array to reset distance travelled
}

//On window load this is executed, used to show the map and other functionalities
function showLocation() {
    //Draw the users location
    addUserLocation();
    //Creating a custom map style for the map
var customMapStyles = [
  {
    "featureType": "landscape.man_made",
    "stylers": [
      {
        "color": "#c0c0c0"
      },
      {
        "lightness": 25
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "landscape.natural.landcover",
    "stylers": [
      {
        "saturation": 5
      }
    ]
  },
  {
    "featureType": "poi.attraction",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.government",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.medical",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#95ca8e"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.icon",
    "stylers": [
      {
        "color": "#008000"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "poi.place_of_worship",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.school",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.sports_complex",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "weight": 1.5
      }
    ]
  },
  {
    "featureType": "transit.station.airport",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "transit.station.airport",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit.station.airport",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "transit.station.bus",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "transit.station.bus",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "transit.station.bus",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  }
]

//Initialising elevation service
   elevator = new google.maps.ElevationService;
    
    //Creating the mapoptions
    var mapOptions = { 
      center: pos,
      zoom: 12,
      styles: customMapStyles,
      streetViewControl: false,
      clickableIcons: false,
    }; 
    
    //Loading the map
    map = new google.maps.Map(document.getElementById("map"), mapOptions); 
    
	//HTML5 geolocation to get position
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
              pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
             //Center the map on current position
            map.setCenter(pos);
          }, error, {enableHighAccuracy: true} );
        }

    var bounds = new google.maps.LatLngBounds();

    //On map click listener    
    map.addListener('click', function(event) {
        addMarker(event.latLng);
        drawPolyline();
      }); 
  
    //Ensuring the polyline and markers stay on screen when the user location changes
    for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(map);
      drawPolyline();
    } 
    
    //Ensuring that the polyline, bikelayer stays on the screen when the location changes, calculates the distance as well to be updated
    map.addListener('bounds_changed', function(){
        drawPolyline2();
        drawBikeLayer();
        calculateDistance(totalDistance);
    })
        //Initialise the bicycle layer
        bikeLayer = new google.maps.BicyclingLayer();
};

//Calculate the distance travelled
function calculateDistance(){
    //Adding all the ditances in distanceArray together to calculate the total distance
        totalDistance = distanceArray.reduce(function (a,b){
            return (+a)+(+b);
        }); 
    //Setting the text on the page to show the total distance travelled
      document.getElementById('msg').innerHTML = "Distance that has been travelled: " + totalDistance.toFixed(2) + " mi.";
}

//Function to add marker with latLng on click
function addMarker(latLng) {
    //Load the marker
      var marker = new google.maps.Marker({
          map: map,
          position: latLng,
          draggable: true
      });
      //Add a listener to redraw the polyline when the markers change position
      marker.addListener('position_changed', function() {
        drawPolyline();
      });
      //Store the marker object inside a global array
      markersArray.push(marker);
}

//Function that draws polyline connecting the markers' position
function drawPolyline() {

      var markersPositionArray = [];
      //Obtaining latLng of all markers on map
      markersArray.forEach(function(event) {
        markersPositionArray.push(event.getPosition());
      });
    //Used for route planned elevation chart
    posArray = markersPositionArray;
 
      //Checks if there is already a polyline drawn on map
      //Removing the polyline from map before we draw new one
      if (polyline !== null) {
        polyline.setMap(null);
      }
    
      //Draw a new polyline at markers' position
      polyline = new google.maps.Polyline({
        map: map,
        path: markersPositionArray,
        strokeColor: '#FF0000',
        strokeOpacity: 0.4
      });
    }

//Drawing a polyline where the user has travelled
function drawPolyline2() {
 
    //Removing old polyline before drawing a new one
    if (polyline2 !== null) {
        polyline2.setMap(null);
      }
    
    //Drawing the polyline using the recorded location
      polyline2 = new google.maps.Polyline({
        map: map,
        path: recordedLocArray,
        strokeColor: '#00008b',
        strokeOpacity: 0.4
      });
}

//Clearing the planned route
function clearMarker() {
//For each marker remove them from the map, clearing the arrays  
    for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
    }
     markersArray = [];
     polyline.setMap(null);
     posArray = [];
}

//Clear the line showing where the user has travelled
function clearLine() {
    polyline2.setMap(null);
    recordedLocArray = [];
}

//Toggle google maps bicycle layer on/off
function drawBikeLayer()
    {
        if(document.getElementById('bikeLayer').checked)
            {
            bikeLayer.setMap(map);
            }else
                {
                bikeLayer.setMap(null);
                }
}

//On click creates the elevation charts
function getElevationCharts() {
     elevator = new google.maps.ElevationService;
         displayPathElevation2(posArray, elevator, map)
     displayPathElevation(mapArray, elevator, map);
}

//Shows the elevation of the recorded journey
 function displayPathElevation(path, elevator, map){

    elevator.getElevationAlongPath({
    'path': path,
    'samples': 256
  }, plotElevation);
     
//Creates the chart that shows the elevation
function plotElevation(elevations, status) {
  var chartDiv = document.getElementById('elevation_chart');
  if (status !== 'OK') {
    // Show the error code inside the chartDiv.
    chartDiv.innerHTML = 'Cannot show elevation: request failed because ' +
        status;
    return;
  }
  // Create a new chart in the elevation_chart DIV.
  var chart = new google.visualization.ColumnChart(chartDiv);

  // Extract the data from which to populate the chart.
  // Because the samples are equidistant, the 'Sample'
  // column here does double duty as distance along the
  // X axis.
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Sample');
  data.addColumn('number', 'Elevation');
  for (var i = 0; i < elevations.length; i++) {
    data.addRow(['', elevations[i].elevation]);
  }

  // Draw the chart using the data within its DIV.
  chart.draw(data, {
    height: 150,
    legend: 'none',
    titleY: 'Elevation (m)'
  });
}
}

//Shows the elevation chart for the planned route
function displayPathElevation2(path2, elevator, map) {
        // Create a PathElevationRequest object using this array.
        // Ask for 256 samples along that path.
        // Initiate the path request.
        elevator.getElevationAlongPath({
          'path': path2,
          'samples': 256
        }, plotElevation2);
      }

      // Takes an array of ElevationResult objects, draws the path on the map
      // and plots the elevation profile on a Visualization API ColumnChart.
      function plotElevation2(elevations, status) {
        var chartDiv = document.getElementById('elevation_chart2');
        if (status !== 'OK') {
          // Show the error code inside the chartDiv.
          chartDiv.innerHTML = 'Cannot show elevation: request failed because ' +
              status;
          return;
        }
        // Create a new chart in the elevation_chart DIV.
        var chart2 = new google.visualization.ColumnChart(chartDiv);

        // Extract the data from which to populate the chart.
        // Because the samples are equidistant, the 'Sample'
        // column here does double duty as distance along the
        // X axis.
        var data2 = new google.visualization.DataTable();
        data2.addColumn('string', 'Sample');
        data2.addColumn('number', 'Elevation');
        for (var i = 0; i < elevations.length; i++) {
          data2.addRow(['', elevations[i].elevation]);
        }

        // Draw the chart using the data within its DIV.
        chart2.draw(data2, {
          height: 150,
          legend: 'none',
          titleY: 'Elevation (m)',
        });
      }    

//Alert with error message
function error(err) {
    alert(`ERROR(${err.code}): ${err.message}`)
  console.warn(`ERROR(${err.code}): ${err.message}`);
};