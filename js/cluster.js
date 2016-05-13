// API base URL and SQL strings.
var urlBase = 'http://www.civicdata.com/api/action/datastore_search_sql?sql=';
var startDate = moment().subtract(30, 'd').format("YYYY-MM-DD");
var markers_sql_string = "SELECT \"LAT\",\"LON\",\"OriginalAddress1\",\"OriginalZip\",\"PermitType\",\"PermitNum\",\"Link\",\"IssuedDate\" from \"6ace8b5c-fd67-4233-9b4d-7ef58010163f\" WHERE \"IssuedDate\" > \'" + startDate + "'";

// Create the map.
L.mapbox.accessToken = 'pk.eyJ1Ijoic2V0aGF4dGhlbG0iLCJhIjoiU1dNaUNYQSJ9.G7rc30ZBRUxUd0k6dSue8A';
var map = L.mapbox.map('cluster', 'mapbox.light', {
    legendControl: {
        // Any of the valid control positions:
        // https://www.mapbox.com/mapbox.js/api/v2.4.0/l-control/#control-positions
        position: 'topright'
    }
  })
  .setView([41.264675,-96.041927], 12);

map.legendControl.addLegend(document.getElementById('legend').innerHTML);

//map.addAttribution('Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>');


// Utility method to remove double quotes.
function formatStrings(str) {
  return str.replace(/"/g, '');
}

// Utility method to strip whotespace.
function trimSpaces(str) {
  return str.replace(/^\s+|\s+$/g,''); 
}

// Utility method to make HTTP request.
function getData(url, before, after) {
  $.ajax({
    url: url,
    beforeSend: function() {
      $(".fetch").show();
      before();
    },
    complete: function(xhr) {
      $(".fetch").hide();
      after(xhr);
    }
  });
}

// Function to place markers on map for each retrieved building permit.
function placeMarkers(xhr) {
  var markers = new L.MarkerClusterGroup();

  var records = xhr.responseJSON.result.records
  for(var i=0; i<records.length; i++) {
    if(!records[i].LAT || !records[i].LON) {
      continue;
    }
    //var marker = L.mapbox.map([records[i].LAT, records[i].LON]).addTo(map);
   var title = records[i].PermitNum;
   var marker = L.marker(new L.LatLng(records[i].LAT, records[i].LON), {
        icon: L.mapbox.marker.icon({'marker-symbol': 'building', 'marker-size': 'small','marker-color': '0044FF'}),
        title: title
    });

    var popUpContent = '<div><ul style="list-style-type: none;">';
    popUpContent += '<li class="permitNum"><strong>Permit Number:</strong> ' + records[i].PermitNum + '</li>';
    popUpContent += '<li class="address"><strong>Address:</strong> ' + records[i].OriginalAddress1 + '</li>';
    popUpContent += '<li class="zip hidden"><strong>Zip:</strong> ' + records[i].OriginalZip + '</li>';
    popUpContent += '<li class="permitType"><strong>Permit Type:</strong> ' + records[i].PermitType + '</li>';
    popUpContent += '<li class="IssuedDate"><strong>Issued Date:</strong> ' + records[i].IssuedDate + '</li>';
    popUpContent += '<li><a href="' + records[i].Link + '" class="details" target="_blank">Permit Details</a></li>';
    popUpContent += '</ul></div>';

    marker.bindPopup(popUpContent);
    markers.addLayer(marker);
  }

  map.addLayer(markers);
 
}

$(document).ready(function() {

  // Fetch permits and drop markers.
  getData(urlBase + encodeURIComponent(markers_sql_string), function(){}, placeMarkers);


});

