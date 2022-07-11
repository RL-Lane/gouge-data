
d3.json(scrapedMakeUrl).then((data) => {
  // console.log(data.names)

  let dropdown = d3.select("#selscrapemake");

  data.make.forEach((id) => {
      console.log(id);

      dropdown.append("option").text(id).property("value", id);
    // for (let i=0; i < 5; i++){
    //   dropdown.append("option").text("blank").property("value", "blank");
    // }

    
  });
})


