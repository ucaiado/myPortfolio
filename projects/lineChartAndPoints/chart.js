"use strict";

//draw the line chart
function draw(data) {

  //set the dimensions of the graph
  var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 930 - margin.left - margin.right,
    height = 370 - margin.top - margin.bottom,
    maxZoom=20,
    numticks=6;

  //calculate the extent of each dimension of the dataset
  var time_extent = d3.extent(data, function(d) {
      return d['DATE'];
  });

  var price_extent = d3.extent(data, function(d) {
      return d['preco'];
  });

  //create the variable to keep the limits to the pan extent
  var panExtent = {x: time_extent, y: price_extent };

  // Set a map function to convert datum to pixels.
  var x = d3.time.scale()
    .range([0, width])
    .domain(time_extent); 

  var y = d3.scale.linear()
    .range([height, 0])
    .domain(price_extent).nice();     

  //define function to plot line
  var line = d3.svg.line()
    .x(function(d) { return x(d.DATE); })
    .y(function(d) { return y(d.preco); });   

  //************************************************************
  // begin of help functions
  //************************************************************

  function panLimit(){
    /*
    Calculate the bounderies to pan the chart.
    Return those limits.
    */    

    var divisor = {h: height / ((y.domain()[1]-y.domain()[0])*zoom.scale()), w: width / ((x.domain()[1]-x.domain()[0])*zoom.scale())},
      minX = -(((x.domain()[0]-x.domain()[1])*zoom.scale())+(panExtent.x[1]-(panExtent.x[1]-(width/divisor.w)))),
      minY = -(((y.domain()[0]-y.domain()[1])*zoom.scale())+(panExtent.y[1]-(panExtent.y[1]-(height*(zoom.scale())/divisor.h))))*divisor.h,
      maxX = -(((x.domain()[0]-x.domain()[1]))+(panExtent.x[1]-panExtent.x[0]))*divisor.w*zoom.scale(),
      maxY = (((y.domain()[0]-y.domain()[1])*zoom.scale())+(panExtent.y[1]-panExtent.y[0]))*divisor.h*zoom.scale(), 

      tx = x.domain()[0] < panExtent.x[0] ? 
          minX : 
          x.domain()[1] > panExtent.x[1] ? 
            maxX : 
            zoom.translate()[0],
      ty = y.domain()[0]  < panExtent.y[0]? 
          minY : 
          y.domain()[1] > panExtent.y[1] ? 
            maxY : 
            zoom.translate()[1];

    return [tx,ty];    
  };

  function zoom_and_display(){
    /*Zoom the chart and display message hiden in the HTML.*/  
    d3.select(".reset").attr("style","display:inline;");
    zoomed()
  };

  function zoomed() {
    /*
    Zoom respecting the panLimit and redraw all objects of the chart again
    */ 
    zoom.translate(panLimit());
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);
    yGrid();
    xGrid();
    myline.attr("d", line(data));
    myPoints.attr("d", allTriangles(data));

  };

  function reset() {
    /*
    Reset any zooming done. Hide HTML message.
    */     
    d3.select(".reset").attr("style","display:none;");   
    d3.transition().duration(750).tween("zoom", function() {
      var ix = d3.interpolate(x.domain(), time_extent),
          iy = d3.interpolate(y.domain(), price_extent);
      return function(t) {
        zoom.x(x.domain(ix(t))).y(y.domain(iy(t)));
        zoomed();
      };
    });
  };  

  function triangles(my_dataset, kind,side){
    /*
    plot triangles on the line chart.

    my_dataset: it is the entirely dataset from cvs
    kind: a string to be added to the class name of each point
    side: up or down. A string the to be added to the type.
    */

    // Add the points!
    var myTriangles = myPoints.selectAll(".point-"+kind).data(my_dataset);
    
    myTriangles.enter()
       .append("path");
    
    myTriangles.exit().remove();

    myTriangles.attr({
      "class": "point-"+kind,
      "d": d3.svg.symbol().type("triangle-"+side),
      "transform" : function(d) { return "translate(" + x(d.DATE) + "," + y(d.preco) + ")"; },
      "opacity": 0.7
    })
  };  

  function allTriangles(data){
    /*
    plot all triangles needed, split the data into subsets
    */    

    //filter the data and plot the data
    var filtered = data.filter( function (d){
      return d['Lado']===1 && d['Tipo']===1});
    myPoints.attr("d", triangles(filtered,'greyC','up'));

    var filtered = data.filter( function (d){
      return d['Lado']===-1 && d['Tipo']===1});
    myPoints.attr("d", triangles(filtered,'greyV','down'));

    //filter the data and plot the data
    var filtered = data.filter( function (d){
      return d['Lado']===1 && d['Tipo']===0 && d['Resultado']===1});
    myPoints.attr("d", triangles(filtered,'positiveCp','up'));

    var filtered = data.filter( function (d){
      return d['Lado']===1 && d['Tipo']===0 && d['Resultado']===-1});
    myPoints.attr("d", triangles(filtered,'negativeCn','up'));    

    //filter the data and plot the data
    var filtered = data.filter( function (d){
      return d['Lado']===-1 && d['Tipo']===0 && d['Resultado']===1});
    myPoints.attr("d", triangles(filtered,'positiveVp','down'));    

    var filtered = data.filter( function (d){
      return d['Lado']===-1 && d['Tipo']===0 && d['Resultado']===-1});
    myPoints.attr("d", triangles(filtered,'negativeVn','down'));    

  };  

  function xGrid(data) {
    /*Plot the grid lines on the X axes */     
    var grid= myGrid.selectAll("line.verticalGrid").data(x.ticks(numticks))

    grid.enter()
        .append("line")
        .attr("class","verticalGrid");

    grid.exit().remove();

    grid.attr({
                "class":"verticalGrid",
                "x1" : function(d){ return x(d);},
                "x2" : function(d){ return x(d);},
                "y1" : height,
                "y2" : 0,
                "stroke-dasharray": ("4, 4")
              });
  };


  function yGrid(data) {
    /*Plot the grid lines on the Y axes */
    var grid= myGrid.selectAll("line.horizontalGrid").data(y.ticks(numticks))

    grid.enter()
        .append("line")
        .attr("class","horizontalGrid");

    grid.exit().remove();

    grid.attr({
                "class":"horizontalGrid",
                "x1" : 0,
                "x2" : width,
                "y1" : function(d){ return y(d);},
                "y2" : function(d){ return y(d);},
                "stroke-dasharray": ("4, 4")
              });
  };

  //************************************************************
  // end of help functions
  //************************************************************

  //call zoom function defined
  var zoom = d3.behavior.zoom()
      .x(x)
      .y(y)
      .scaleExtent([1, maxZoom])
      .on("zoom", zoom_and_display);

  //Add a svg canvas to the page
  var i_svgWidth=width + margin.left + margin.right
  var i_svgHeight=height + margin.top + margin.bottom

  var svg = d3.select("#MktCurve")
      .append("svg")
        .attr("width", "80%")
        .attr("height", "80%")
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("viewBox", "0 0 "+ i_svgWidth + " "+ i_svgHeight)
        .attr("preserveAspectRatio", "xMidYMid")
        //define zoom behaviour
        .call(zoom)
      ///define other atributes
      .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr('class','chart'); 



  // Add the clip path to the SVG to hidden objects ploted outside its borders.
  svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  // donfigure the axes
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(numticks);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(numticks);

  //create the axes
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price");  
  
  // Add the line path and plot the data
  var myline  = svg.append("path")  
                .attr("class", "line")
                .attr("clip-path", "url(#clip)");
              
  myline.attr("d", line(data));

  // Draw the gridline
  var myGrid  = svg.append("g")  
                .attr("clip-path", "url(#clip)");

  myGrid.call(yGrid)
        .call(xGrid);

  // Draw all triangles
  var myPoints= svg.append("g")  
                .attr("clip-path", "url(#clip)");
  
  myPoints.attr("d", allTriangles(data));
    


      
  //call reset function      
  d3.select(".reset").on("click", reset);  


// resize
// d3.select(window).on('resize', resize);

// debugger;
// var aspect = svg.width() / svg.height(),
//     container = svg.parent();
 
// function resize() {
//     var targetWidth = container.width();
//     svg.attr("width", targetWidth);
//     svg.attr("height", Math.round(targetWidth / aspect));
 
// }


// var chart = d3.select('#MktCurve'),
//     aspect = chart.width() / chart.height(),
//     container = chart.parent();
// $(window).on("resize", function() {
//     var targetWidth = container.width();
//     chart.attr("width", targetWidth);
//     chart.attr("height", Math.round(targetWidth / aspect));
// }).trigger("resize");





  
}//finish function draw