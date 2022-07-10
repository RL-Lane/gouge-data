
// Fill in available test subject IDs
d3.json("samples.json").then((data) => {
    // console.log(data.names)

    let dropdown = d3.select("#selDataset");

    data.names.forEach((id) => {
        // console.log(id);

        dropdown.append("option").text(id).property("value", id);
    });
    BuildCharts(data.names[0]);
})

function optionChanged (selected) {
    // console.log(selected);
    BuildCharts(selected);
}

function BuildCharts(selected) {
    
    // load data for charting
    d3.json("samples.json").then((data) => {
        // console.log(data)
        results = data.samples.filter(obj => obj.id == selected);

        // test outputs
        // console.log(results);
        // console.log(results[0].otu_ids.slice(0,10));
        // console.log(results[0].otu_labels);
        // console.log(results[0].sample_values.slice(0,10));

        // bar chart of top 10 samples
        let trace1 = {
            x: results[0].sample_values.slice(0,10).reverse(),
            y: results[0].otu_ids.slice(0,10).map(a => 'OTU ' + a.toString()),
            hovertext: results[0].otu_labels.slice(0,10).map(a => a.replaceAll(';', ',  ')),
            type: "bar",
            // autosize: false
            orientation: 'h',
            marker: {
                color: results[0].sample_values.slice(0,10).reverse(),
                colorscale: "Portland"
            }
        };

        let databar = [trace1];

        let bar_layout = {
            title: '10 Largest Samples'
        };
        Plotly.newPlot("bar", databar, bar_layout);


        // bubble chart
        let bubbletrace = {
            type: 'scatter',
            x: results[0].otu_ids,
            y: results[0].sample_values,
            mode: 'markers',
            text: results[0].otu_labels.map(a => a.replaceAll(';', ',  ')),
            marker: {
                size: results[0].sample_values.map(a => (a ** 1.5 * 15)),
                sizemode: 'area',
                color: results[0].otu_ids,
                
                colorscale: [[0, 'indigo'], [0.5, 'limegreen'], [1, 'orangered']]
            }
        };

        let databubble = [bubbletrace];

        let bubble_layout = {          
            title: 'Samples',          
            showlegend: false,          
            height: 800          
            // width: 600          
          };

        Plotly.newPlot("bubble", databubble, bubble_layout);


        // load demographics info
        demo = data.metadata.filter(obj => obj.id == selected)[0];
        // console.log(demo);
        const ele = document.getElementById('sample-metadata');
        // ele.innerHTML += '<table>'
        ele.innerHTML = "";
        for (let key in demo) {
            ele.innerHTML += `<i style="color: #A0A0A0">${key}:</i> ${demo[key]}<br style="margin-bottom: 10px">`;
            console.log(`${key} : ${demo[key]}`);

            var scrubs = demo.wfreq;
            }
        // ele.innerHTML += '</table>'
        

        var data = [
            {
              type: "pie",       
              domain: { x: [0, 1], y: [0, 1] },          
              value: scrubs,          
              title: { text: "Weekly Scrubs" },          
              type: "indicator",          
              mode: "gauge+number",         
              gauge: {          
                axis: { range: [null, 9] },          
                steps: [          
                  { range: [2, 7], color: "#e3e3e3" }, 
                  { range: [7, 9], color: "#c3c3c3"}          
                ],          
                threshold: {          
                  line: { color: "blue", width: 3 },          
                  thickness: 0.75,          
                  value: 0.5          
                }          
              }          
            }          
          ];          
          
          var layout = { width: 600, height: 450, margin: { t: 0, b: 0 } };          
          Plotly.newPlot('gauge', data, layout);

          
    })



}

