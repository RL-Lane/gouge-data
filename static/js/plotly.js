var kaggleMakeUrl = "api/v1.0/kaggle/makes"

d3.json(kaggleMakeUrl).then((data) => {
  // console.log(data.names)

  let dropdown = d3.select("#sel_kaggle_make");
  let dropdown2 = d3.select("#sel_kaggle_make2");

  data.make.forEach((id) => {
      // console.log(id);

      dropdown.append("option").text(id).property("value", id);
      dropdown2.append("option").text(id).property("value", id);
      dropdown2.enter(data.make[1]);
    // for (let i=0; i < 5; i++){
    //   dropdown.append("option").text("blank").property("value", "blank");
    // }

    
  });
  BuildCharts(data.make[0]);
  BuildCharts2(data.make[1]);

})



function optionChangedKaggle (selected) {
  console.log(selected);
  BuildCharts(selected);
}

function optionChangedKaggle2 (selected) {
  console.log(selected);
  BuildCharts2(selected);
}


function BuildCharts(selected) {
  KaggleSelectQuery = kaggleMakeUrl + '/' + selected.toString();
  // console.log(KaggleSelectQuery);
  // load data for charting
  d3.json(KaggleSelectQuery).then((data) => {
      // console.log(data)
      results = data.filter(a => a.model !== '0').filter(a => a.avg_msrp > 1000);

      // console.log(results);

      let avg_msrp = [];
      let model = [];
      let count = [];
      let body_style = [];
      let msrp_money = [];



      var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',

        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
      });



      for (let i = 0; i < results.length; i++) {
        avg_msrp.push(results[i].avg_msrp);
        model.push(results[i].model);
        count.push(results[i].count);
        body_style.push(results[i].body_style);
        // msrp_money.push(formatter.format(results[i].avg_msrp));
      }

      // console.log(avg_msrp);
      // console.log(model);
      // console.log(count);
      // console.log(body_style);


      // test outputs
      // console.log(results);
      // console.log(results[0].otu_ids.slice(0,10));
      // console.log(results[0].otu_labels);
      // console.log(results[0].sample_values.slice(0,10));

      // Create our number formatter.



      // bar chart of top 10 samples
      // deal with color scale issues
      let colormin = Math.min.apply(null, avg_msrp);
      let colormax = Math.max.apply(null, avg_msrp);
      // console.log(colormin);
      // console.log(colormax);
      let colorlist = [];
      for (let i=0; i < avg_msrp.length; i++) {
        colorlist.push( (avg_msrp[[i]] - colormin) / colormax  );
      }
      // console.log(colorlist);

      // bar chart of top 10 samples
      let trace1 = {
          x: avg_msrp.reverse(),
          y: model.reverse().map(a => selected + ' ' + a.toString()),
          hovertext: msrp_money.reverse(),
          type: "bar",
          // autosize: false
          orientation: 'h',
          marker: {
              color: colorlist.reverse(),
              colorscale: "Portland"
          }
      };

      let databar = [trace1];

      let bar_layout = {
          title: `Average Model MSRP for ${selected.toString()}`, 
          width: 600, 
          height: 500,
          xaxis: {
            title: 'Average MSRP'
          },
          yaxis: {
            title: 'Vehicle Model',
            automargin: true,
            tickwidth: 2
          },
          paper_bgcolor:'#f5f5dc',
          plot_bgcolor: '#f5f5dc'
          }
      
      Plotly.newPlot("bar", databar, bar_layout)
      


      // bubble chart
      let bubbletrace = {
          type: 'scatter',
          x: avg_msrp,
          y: model.map(a => selected + ' ' + a.toString()),
          mode: 'markers',
          // text: results[0].count.map(a => a.replaceAll(';', ',  ')),
          marker: {
              size: results[i].model,
              sizemode: 'area',
              color: results[i].avg_msrp,
              
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










function BuildCharts2(selected) {
  KaggleSelectQuery = kaggleMakeUrl + '/' + selected.toString();
  // console.log(KaggleSelectQuery);
  // load data for charting
  d3.json(KaggleSelectQuery).then((data) => {
      // console.log(data)
      results = data.filter(a => a.model !== '0').filter(a => a.avg_msrp > 1000);

      // console.log(results);

      let avg_msrp = [];
      let model = [];
      let count = [];
      let body_style = [];
      let msrp_money = [];



      for (let i = 0; i < results.length; i++) {
        avg_msrp.push(results[i].avg_msrp);
        model.push(results[i].model);
        count.push(results[i].count);
        body_style.push(results[i].body_style);
        // msrp_money.push(formatter.format(results[i].avg_msrp));
      }

      // console.log(avg_msrp);
      // console.log(model);
      // console.log(count);
      // console.log(body_style);


      // test outputs
      // console.log(results);
      // console.log(results[0].otu_ids.slice(0,10));
      // console.log(results[0].otu_labels);
      // console.log(results[0].sample_values.slice(0,10));

      // Create our number formatter.



      // bar chart of top 10 samples
      // deal with color scale issues
      let colormin = Math.min.apply(null, avg_msrp);
      let colormax = Math.max.apply(null, avg_msrp);
      // console.log(colormin);
      // console.log(colormax);
      let colorlist = [];
      for (let i=0; i < avg_msrp.length; i++) {
        colorlist.push( (avg_msrp[[i]] - colormin) / colormax  );
      }
      // console.log(colorlist);

      // bar chart of top 10 samples
      let trace1 = {
          x: avg_msrp.reverse(),
          y: model.reverse().map(a => selected + ' ' + a.toString()),
          hovertext: msrp_money.reverse(),
          type: "bar",
          // autosize: false
          orientation: 'h',
          marker: {
              color: colorlist.reverse(),
              colorscale: "Portland"
          }
      };

      let databar = [trace1];

      let bar_layout = {
          title: `Average Model MSRP for ${selected.toString()}`, 
          width: 600, 
          height: 500,
          xaxis: {
            title: 'Average MSRP'
          },
          yaxis: {
            title: 'Vehicle Model',
            automargin: true,
            tickwidth: 2
          },
          paper_bgcolor:'#f5f5dc',
          plot_bgcolor: '#f5f5dc'
          }
      
      Plotly.newPlot("bar2", databar, bar_layout)
      




        
  })



}