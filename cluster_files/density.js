// API base URL and SQL strings.
var urlBase = 'http://www.civicdata.com/api/action/datastore_search_sql?sql=';
var startDate = moment().subtract(30, 'd').format("YYYY-MM-DD");
var markers_sql_string = "SELECT \"LAT\",\"LON\",\"OriginalAddress1\",\"OriginalZip\",\"PermitType\",\"PermitNum\" from \"4f26538e-3f53-49a7-97e9-d9e725f79916\" WHERE \"IssuedDate\" > \'" + startDate + "'";

// Create the map.
L.mapbox.accessToken = 'pk.eyJ1Ijoic2V0aGF4dGhlbG0iLCJhIjoiU1dNaUNYQSJ9.G7rc30ZBRUxUd0k6dSue8A';
var map = L.mapbox.map('map-one', 'mapbox.streets')
  .setView([41.2524,-95.9980], 14);

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

    marker.bindPopup(title);
    markers.addLayer(marker);


    /* var popUpContent = '<div class="popup-content"><ul>';
    popUpContent += '<li class="address">Address: ' + records[i].OriginalAddress1 + '</li>';
    popUpContent += '<li class="zip hidden">Zip: ' + records[i].OriginalZip + '</li>';
    popUpContent += '<li class="permitType">Permit Type: ' + records[i].PermitType + '</li>';
    popUpContent += '<li class="permitNum">Permit Number: ' + records[i].PermitNum + '</li>';
    popUpContent += '<li><a href="#" class="details">Get Permit Details</a></li>';
    popUpContent += '<li><a href="#" class="zestimate">Get Zestimate</a></li>';
    popUpContent += '</div>';
    marker.bindPopup(popUpContent); */
  }

  map.addLayer(markers);
}


// Get building permit details.
/*
$("body").on("click", ".details", function() {
  var permitNum = trimSpaces($(this).closest("ul").find(".permitNum").text().substring(15));

  getData(urlBase + permit_sql_string + '\'' + permitNum + '\'', function() {
    $("#property").find("#address").empty().append('<td>Address</td>');
    $("#property").find("#city").empty().append('<td>City</td>');
    $("#property").find("#state").empty().append('<td>State</td>');
    $("#property").find("#zip").empty().append('<td>Zip</td>');
    $("#property").find("#permitnum").empty().append('<td>Permit Number</td>');
    $("#property").find("#permittype").empty().append('<td>Permit Type</td>');
    $("#property").find("#cost").empty().append('<td>Estimated Cost</td>');
    $("#property").find("#status").empty().append('<td>Permit Status</td>');
    $("#property").find("#zestamount").empty().append('<td>Zestimate Amount</td><td></td>');
    $("#property").find("#zestdate").empty().append('<td>Zestimate Date</td><td></td>');
  }, 
    function(xhr) {
      var records = xhr.responseJSON.result.records
      $("#property").find("#address").append('<td>' + formatStrings(JSON.stringify(records[0].OriginalAddress1)) + '</td>');
      $("#property").find("#city").append('<td>' + formatStrings(JSON.stringify(records[0].OriginalCity)) + '</td>');
      $("#property").find("#state").append('<td>' + formatStrings(JSON.stringify(records[0].OriginalState)) + '</td>');
      $("#property").find("#zip").append('<td>' + formatStrings(JSON.stringify(records[0].OriginalZip)) + '</td>');
      $("#property").find("#permitnum").append('<td><a href="' + formatStrings(JSON.stringify(records[0].Link)) + '" target="_blank">' + formatStrings(JSON.stringify(records[0].PermitNum)) + '</a></td>');
      $("#property").find("#permittype").append('<td>' + formatStrings(JSON.stringify(records[0].PermitTypeMapped)) + '</td>');
      $("#property").find("#cost").append('<td>$' + numeral(formatStrings(JSON.stringify(records[0].EstProjectCostDEC))).format('0,0') + '</td>');
      $("#property").find("#status").append('<td>' + formatStrings(JSON.stringify(records[0].StatusCurrent) + '</td>'));
    });
});*/


$(document).ready(function() {


// Fetch permits and drop markers.
getData(urlBase + encodeURIComponent(markers_sql_string), function(){}, placeMarkers);

});

