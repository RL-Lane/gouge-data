var kaggleMakeUrl = "api/v1.0/kaggle/makes"

d3.json(kaggleMakeUrl).then((data) => {
  // console.log(data.names)

  let dropdown = d3.select("#sel_kaggle_make");

  data.make.forEach((id) => {
      console.log(id);

      dropdown.append("option").text(id).property("value", id);
    // for (let i=0; i < 5; i++){
    //   dropdown.append("option").text("blank").property("value", "blank");
    // }

    
  });
  // build charts here
  var kaggleMakeBrand = "/api/v1.0/kaggle/makes/<brand>"

  d3.json(kaggleMakeBrand).then((data) => {

    let sample = data.model
     let sample1 = data.count

    
    //.kaggleMakeBrand.filter(values => values.temp_dict) 
  
  var data = [
    {
      x: sample,
      y: sample1,
      type: 'bar'
    }
  ];
  
  Plotly.newPlot('plotly', data);

})

})
