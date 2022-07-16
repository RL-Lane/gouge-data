// var scrapedMakeUrl = "https://gouge-data.herokuapp.com/api/v1.0/scraped/makes"
var scrapedMakeUrl = "api/v1.0/scraped/makes"

d3.json(scrapedMakeUrl).then((data) => {
  // console.log(data.names)

  let dropdown = d3.select("#selscrapemake");

  data.make.forEach((id) => {
      //console.log(id);

      dropdown.append("option").text(id).property("value", id);
    // for (let i=0; i < 5; i++){
    //   dropdown.append("option").text("blank").property("value", "blank");
    // }

    
  });

  // BuildCharts(data.names[0]);
})

function optionChanged (selected) {
  // console.log(selected);
  BuildCharts(selected);
}

var gougeapi = 'api/v1.0/scraped/gouge'
// Perform a GET request to the query URL/
d3.json(gougeapi).then(function (data) {

    // console.log(data)
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });
  
  
  function createFeatures(scrapeData) {
  
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.dealername}</h3><hr>
                      Vehicles Counted: ${feature.properties.count}<br>
                      <h6 style="background-color:${getColor(feature.properties.gougescore)}">Gouge Score: ${Math.round(100 * feature.properties.gougescore)/100}</h6>`)
      
    }
  
    

    var dealerships = L.geoJSON
    (
      scrapeData,//.filter(e => e.properties.mag < 1), 
      {
        pointToLayer: function (feature, latlng) 
          {
          return L.circleMarker(latlng, geojsonMarkerOptions(feature));
          },
          onEachFeature: onEachFeature
      }
    );




    function geojsonMarkerOptions(feature) {

      // console.log(feature.geometry.coordinates[2]);

      return {      
        radius: Math.sqrt(feature.properties.count) *3.5,
        fillColor: getColor(feature.properties.gougescore),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }
  };
  
    // Send our earthquakes layer to the createMap function/
    createMap(dealerships);
  }

  
  // gouge colors.  When combined with gouge list, it generalizes the colors so the legend automatically
  // matches marker colors.

  function getColor(d) {
    return d > 1.02    ? '#ff0000' :
           d > 0.98    ? '#ffff00' :
                         '#00ff00';
  }

  // var depths = [30, 20, 15, 10, 5, 2.5, 0];


  function createMap(dealerships) {
  
    // Create the base layers.
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    var baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    var overlayMaps = {
      Dealerships: dealerships
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    var myMap = L.map("map", {
      center: [31.113185, -96.88849],
      zoom: 6,
      layers: [street, dealerships],
      scrollWheelZoom: false
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.


    L.control.layers(baseMaps, overlayMaps, {collapsed:false}).addTo(myMap);

    // create legend

    function  getColour(s) {
      if (s === 'Dealer Price < MSRP')
      return '#00ff00'; //green
      else if (s === 'Dealer Price ≈ MSRP')
      return '#ffff00'; //yellow
      else
      return '#ff0000' //red 
  }

  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
      let legendDiv =  L.DomUtil.create('div', 'info legend'),
         gouge = [
          'Dealer Price < MSRP', 
          'Dealer Price ≈ MSRP', 
          'Dealer Price > MSRP'
          ],
         labels = ['<h6 style="font-size: small"> TX Dealership Gouge<br>Score Index</h6><br><h6 class="blockquote-footer">circle size reflects scraped dealership vehicle count<hr></h6>'];
      for ( let i=0; i < gouge.length; i++) {
          labels.push( 
              '<i class="square" style="background:' + getColour(gouge[i]) + '"></i>'+ gouge[i] + '')
      }
      legendDiv.innerHTML = labels.join(' ');

      return legendDiv;
  }

  legend.addTo(myMap);
    


  
  }
  

let leafletmap = L.map("map", {
    center: [31.113185,	-96.88849],
    zoom: 8
  });
  
  // Adding a tile layer (the background map image) to our map:
  // We use the addTo() method to add objects to our map.
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(leafletmap);
