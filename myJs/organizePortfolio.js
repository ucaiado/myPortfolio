function draw(data) {
  //select the holder of all my projects
  var projects = d3.select("#myProject");

  // Inert a row to each datum
  var Row = projects.selectAll("div.row")
      .data(data)
      .enter()
      .append("div")
      .attr("class","row");

  // Insert the title and the link to the project of each json object
  //first the title
  var myP = Row.append("p");
  myP.append("a")
    .attr("href",function(d){
      return d.link;
    })
    .append("div")
      .attr("class", "col-md-4 col-md-offset-2")
      .text(function (d){
        return d.title;
      });
  //and then the date of the project
  myP.append("div")
        .attr("class", "col-md-3 col-md-offset-1 text-right")
      .append("span")
        .attr("class","date")
        .text(function (d){
          return d.date;
        });
  
  //Now insert the thumbnail of each project
  Row.append("div")
      .attr("class", "col-md-8 col-md-offset-2")
    .append("a")
      .attr("href",function (d) {
        return d.link;
      })
      .attr("class","thumbnail")
    .append("img")
      .attr("src",function (d){
        return d.imgSrc;
      })
      .attr("alt",function (d){
        return d.imgAlt;
      });
};