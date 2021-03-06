var permitsResourceId = "4f26538e-3f53-49a7-97e9-d9e725f79916";
var inspectionsResourceId = "2483a53a-b400-4f25-bac7-1bb7045e70b2";
var baseURI = "http://www.civicdata.com/api/action/datastore_search_sql?sql=";
var startDate = moment().subtract(30, 'd').format("YYYY-MM-DD");
var startDateMoment = moment().subtract(30, 'd');

$(document).ready(function() {
     
  // Helper function to make request for JSONP.
  function requestJSON(url, callback) {
    $.ajax({
      beforeSend: function() {
        // Handle the beforeSend event
      },
      url: url,
      complete: function(xhr) {
        callback.call(null, xhr.responseJSON);
         
      }
    });
  }

  /********************************************************************************/
  /* Get all activity in last 30 days (START)
  /********************************************************************************/

  var urlLast30Query = "SELECT \"PermitNum\",\"AppliedDate\",\"IssuedDate\",\"EstProjectCost\",\"PermitType\",\"PermitTypeMapped\",\"Link\",\"OriginalAddress1\" from \"permitsResourceId\" where \"StatusDate\" > \'" + startDate + "' order by \"AppliedDate\"";
  var urlLast30 = baseURI + encodeURIComponent(urlLast30Query.replace("permitsResourceId", permitsResourceId));

  requestJSON(urlLast30, function(json) {
    var records = json.result.records;

    //extract permits applied for in last 30 days
    var appliedLast30Days = records.filter(function(d) { 
      return moment(d.AppliedDate) > startDateMoment; 
    });
    
    //extract permits issued in last 30 days
    var issuedLast30Days = records.filter(function(d) { 
      return moment(d.IssuedDate) > startDateMoment; 
    });

    //total construction value for new project in last 30 days
    var totalConstructionValue = d3.sum(appliedLast30Days, function(d) {
      return Number(d.EstProjectCost);
    });

    $("#newApplications").text(appliedLast30Days.length);
    $("#issuedPermits").text(issuedLast30Days.length);
    $("#totalConstructionValue").text(numeral(totalConstructionValue).format('($ 0.00 a)'));

    /********************************************************************************/
    /* Load recent permit applications (Start)
    /********************************************************************************/
    
    var permitsToLoad = 10;
    var totalPermits = appliedLast30Days.length-1;
    var permitStart = 1
    
    for (var i = totalPermits; i > totalPermits - 10; i--) {
      $("#recent" + permitStart).attr("href", appliedLast30Days[i].Link);
      $("#permit" + permitStart).text(appliedLast30Days[i].PermitNum);
      $("#address" + permitStart).text(appliedLast30Days[i].OriginalAddress1);
      permitStart++;
    }

    /********************************************************************************/
    /* Load recent permit applications (END)
    /********************************************************************************/
    
    /********************************************************************************/
    /* Calculated permits applied for by day and by type (START)
    /********************************************************************************/
    
    var appliedByDayByType = d3.nest()
      .key(function(d) { return d.AppliedDate })
      .key(function(d) { return d.PermitTypeMapped })
      .rollup (function(v) { return v.length })
      .entries(appliedLast30Days);

    console.log(appliedByDayByType);

    var bld = ['Building'];
    var demo = ['Demolition'];
    var ele = ['Electrical'];
    var other = ['Other'];
    var mech = ['Mechanical'];
    var plm = ['Plumbing'];
    var datesArray = [];
    var bldAdded = false, demoAdded = false, eleAdded = false, otherAdded = false, mechAdded = false, plmAdded = false;
    var tempArray = [];

    appliedByDayByType.forEach(function(d) {
      var dArray = d.key.split("-");
      datesArray.push(dArray[1] + "-" + dArray[2]);

      bldAdded = false;
      demoAdded = false;
      eleAdded = false;
      otherAdded = false;
      mechAdded = false;
      plmAdded = false;

      d.values.forEach(function(i) {
        
        if (i.key == "Building") {
          bld.push(i.values);
          bldAdded = true;
        }
        if (i.key == "Demolition") {
          demo.push(i.values);
          demoAdded = true;
        }
        if (i.key == "Electrical") {
          ele.push(i.values);
          eleAdded = true;
        }
        if (i.key == "Other") {
          other.push(i.values);
          otherAdded = true;
        }
        if (i.key == "Mechanical") {
          mech.push(i.values);
          mechAdded = true;
        }
        if (i.key == "Plumbing") {
          plm.push(i.values);
          plmAdded = true;    
        }

      });

      if (!bldAdded)
        bld.push(0);
      if (!demoAdded)
        demo.push(0);
      if (!eleAdded)
        ele.push(0);
      if (!mechAdded)
        mech.push(0);
      if (!otherAdded)
        other.push(0);
      if (!plmAdded)
        plm.push(0);
  
    });

    var chart = c3.generate({
      bindto: '#byDay',
      data: {
        columns: [
            bld,
            demo,
            ele,
            other,
            mech,
            plm
        ],
        type: 'bar'//,
        //groups: [['Building','Electrical','Other','Mechanical','Plumbing']]
      },
      grid: {
        y: {
          lines: [{value:0}]
        }
      },
      axis: {
        x: {
          type: 'category',
          categories: datesArray
        }
      }
    });

    setTimeout(function () {
      chart.groups([['Building','Demolition','Electrical','Other','Mechanical','Plumbing']])
    }, 1000);

    /********************************************************************************/
    /* Calculated permits applied for by day and by type (END)
    /********************************************************************************/
    
  });
  /********************************************************************************/
  /* Get all permit details in last 30 days (END)
  /********************************************************************************/
  
  /********************************************************************************/
  /* Get all inspections in last 30 days (START)
  /********************************************************************************/

  forceDelay(2000);

  var urlLast30InspectionsQuery = "SELECT \"PermitNum\",\"InspType\",\"Result\",\"ScheduledDate\",\"InspectedDate\" from \"inspectionsResourceId\" where \"InspectedDate\" > \'" + startDate + "' order by \"InspectedDate\" DESC";
  
  var urlLast30Inspections = baseURI + encodeURIComponent(urlLast30InspectionsQuery.replace("inspectionsResourceId", inspectionsResourceId));

  requestJSON(urlLast30Inspections, function(json) {
    var records = json.result.records;

    $("#inspectionCount").text(records.length);

  });
  
  /********************************************************************************/
  /* Get all inspections in last 30 days (END)
  /********************************************************************************/

  /********************************************************************************/
  /* Permits by type (START)
  /********************************************************************************/ 

  forceDelay(5000);

  var permitTypesQuery = "SELECT \"PermitTypeMapped\", count(*) as Count from \"permitsResourceId\" where \"IssuedDate\" > '" + startDate + "' group by \"PermitTypeMapped\" order by Count desc";

  var permitTypesQ = baseURI + encodeURIComponent(permitTypesQuery.replace("permitsResourceId", permitsResourceId));
      
  requestJSON(permitTypesQ, function(json) {
    var records = json.result.records    
  
    var permitTypes = [];

    //Get a distinct list of neighborhoods
    for (var i = 0; i < records.length; i++) {
      permitTypes.push([records[i]["PermitTypeMapped"], records[i].count]);
    }

    var chart = c3.generate({
      bindto: '#permitTypes',
      data: {
        columns: permitTypes,
        type : 'pie'
      },
      donut: {
        title: "Permit Types"
      }
    }); 
        
  });

  /********************************************************************************/
  /* Permits by type (START)
  /********************************************************************************/ 

  /********************************************************************************/
  /* Average Issuance Days (START)
  /********************************************************************************/

  var urlLast12Query = "SELECT \"PermitNum\",\"AppliedDate\",\"IssuedDate\",\"PermitTypeMapped\" from \"permitsResourceId\" where \"IssuedDate\" > \'" + startDate + "' and \"IssuedDate\" <> '' and \"PermitTypeMapped\" <> \'Fence\' order by \"IssuedDate\" DESC";
  var urlLast12 = baseURI + encodeURIComponent(urlLast12Query.replace("permitsResourceId", permitsResourceId));
  
  requestJSON(urlLast12, function(json) {
    var records = json.result.records;

    var dateData = [];
    records.forEach(function(d) {
      var dateDataObj = {};
      var appliedDate = moment(d.AppliedDate);
      var issuedDate = moment(d.IssuedDate);
      dateDataObj.permitNum = d.PermitNum;
      dateDataObj.permitType = d.PermitTypeMapped;
      dateDataObj.dateDifference = Math.abs(appliedDate.diff(issuedDate, 'd'));
      dateDataObj.appliedDate = appliedDate.format('YYYY-MM-DD');
      dateDataObj.issuedDate = issuedDate.format('YYYY-MM-DD');
      dateData.push(dateDataObj);
    });

    var daysAnalysisByType = d3.nest()
      .key(function(d) { return d.permitType })
      .rollup (function(v) { return {
        avg: d3.mean(v, function(d) {return d.dateDifference}), 
        //high: d3.max(v, function (d) {return d.dateDifference}), 
        //low: d3.min(v, function (d) {return d.dateDifference}), 
        median: d3.median(v, function(d) {return d.dateDifference}), 
        standardDeviation: d3.deviation(v, function(d) {return d.dateDifference})
      }; })
      .entries(dateData);

    var avg = ['Average'];
    //var high = ['High'];
    //var low = ['Low'];
    var median = ['Median'];
    var stdDeviation = ['StdDeviation'];
    var permitTypes = [];

    daysAnalysisByType.forEach(function(d) {
      if (d.values.avg != undefined)
        avg.push(d.values.avg);
      else
        avg.push(0);
      //high.push(d.values.high);
      //low.push(d.values.low);
      if (d.values.median != undefined)
        median.push(d.values.median);
      else
        median.push(0);

      if (d.values.standardDeviation != undefined)
        stdDeviation.push(d.values.standardDeviation);
      else
        stdDeviation.push(0);

      permitTypes.push(d.key)
    });

    var chart = c3.generate({
      bindto: '#timeTo',
      data: {
        columns: [
            avg,
            //high,
            //low,
            //median,
            //stdDeviation
        ],
        type: 'bar',
        groups: [permitTypes]
      },
      axis: {
              x: {
                type: 'category',
                categories: permitTypes
              }
            }
    });

  });
  /********************************************************************************/
  /* Average Issuance Days (END)
  /********************************************************************************/
             
});

function forceDelay(millis) {
  var date = new Date();
  var curDate = null;

  do { curDate = new Date(); } 
    while (curDate - date < millis);
}
