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

  var data = [
    {
      x: ['giraffes', 'orangutans', 'monkeys'],
      y: [20, 14, 23],
      type: 'bar'
    }
  ];
  
  Plotly.newPlot('plotly', data)
})
