var d3 = require('d3');

// Parse the date / time
var parseDate = d3.time.format("%m/%d").parse;

// Parse the date / time
var parseFullDate = d3.time.format("%m/%d/%Y").parse;

var cscale = d3.scale.category20b();

function color_by_year(year) {
  // d3.scale.category20c(year);
  // console.log(year);
  if (year == "2017") {
    return "red";//"rgb(31, 119, 180)";//"#80A9D0";
  // } else if (year == "2015") {
    // return "green";//"#D13D59";
  } else {
    return cscale(year);//
    // return "blue";//"#FFCC32";
  }
}

// setting sizes of interactive
var margin = {
  top: 15,
  right: 100,
  bottom: 50,
  left: 100
};
if (screen.width > 768) {
  var width = 700 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
} else if (screen.width <= 768 && screen.width > 480) {
  var width = 650 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
} else if (screen.width <= 480 && screen.width > 340) {
  console.log("big phone");
  var margin = {
    top: 20,
    right: 45,
    bottom: 35,
    left: 30
  };
  var width = 340 - margin.left - margin.right;
  var height = 350 - margin.top - margin.bottom;
} else if (screen.width <= 340) {
  console.log("mini iphone")
  var margin = {
    top: 20,
    right: 55,
    bottom: 35,
    left: 30
  };
  var width = 310 - margin.left - margin.right;
  var height = 350 - margin.top - margin.bottom;
}

// create SVG container for chart components
var svg = d3.select(".line-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// x-axis scale
var x = d3.time.scale()
    .range([0,width]);

// y-axis scale
var y = d3.scale.linear()
    .range([height, 0]);

var voronoi = d3.geom.voronoi()
    .x(function(d) {
      return x(d.Date);
    })
    .y(function(d) {
      return y(d.SWC);
    })
    .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%b")); // tickFormat

var yAxis = d3.svg.axis().scale(y)
    .orient("left");

var SWCNested = d3.nest()
  .key(function(d){ return d.waterYear; })
  .entries(snowwaterData);

x.domain([parseFullDate('10/01/2015'), parseFullDate('08/01/2016')]);
y.domain([0,50]);

var lineSWC = d3.svg.line()
    // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
    .x(function(d) {
      // return x(parseFullDate(d.Date));
      var datetemp = d.Date.split("/");
      if (datetemp[0] >= 10) {
        var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/2015";
      } else {
        var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/2016";
      }
      // var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/"+d.Year;
      return x(parseFullDate(datetemp2));
    })
    .y(function(d) {
      return y(d.SWC);
    });

SWCNested.forEach(function(d) {
  var class_list = "line voronoi id"+d.key;
  svg.append("path")
    .attr("class", class_list)
    .style("stroke", color_by_year(d.key))//cscale(d.key))//
    .attr("d", lineSWC(d.values));
});

var focus = svg.append("g")
    .attr("transform", "translate(-100,-100)")
    .attr("class", "focus");

if (screen.width >= 480) {
  focus.append("circle")
      .attr("r", 3.5);

  focus.append("rect")
      .attr("x",-110)
      .attr("y",-25)
      .attr("width","170px")
      .attr("height","20px")
      .attr("opacity","0.5")
      .attr("fill","white");

  focus.append("text")
      .attr("x", -100)
      .attr("y", -10);
}

var voronoiGroup = svg.append("g")
    .attr("class", "voronoi");

var flatData = [];
snowwaterData.forEach(function(d,idx){
  var datetemp = d.Date.split("/");
  var datetemp2 = datetemp[0]+"/"+datetemp[1];
  if (datetemp[0] >= 10) {
    var datetemp3 = datetemp[0]+"/"+datetemp[1]+"/2015";
  } else {
    var datetemp3 = datetemp[0]+"/"+datetemp[1]+"/2016";
  }
  var datetemp3 = parseFullDate(datetemp3);
  // var datetemp = d.Date.split("/");
  // var datetemp2 = datetemp[0]+"/"+datetemp[1];
  // var datetemp3 = parseFullDate(datetemp2);
  flatData.push(
    {key: d.waterYear, SWC: d.SWC, DateString: d.Date, Date: datetemp3}
  );
});

voronoiGroup.selectAll(".voronoi")
  .data(voronoi(flatData))
  .enter().append("path")
  .attr("d", function(d) {
    if (d) {
      return "M" + d.join("L") + "Z";
    }
  })
  .datum(function(d) {
    if (d) {
      return d.point;
    }
  })
  .on("mouseover", mouseover)
  .on("mouseout", mouseout);

function mouseover(d) {
  d3.select(".id"+d.key).classed("line-hover", true);
  d3.select(".snow-info").text(d.key);
  focus.attr("transform", "translate(" + x(d.Date) + "," + y(d.SWC) + ")");
  focus.select("text").text(d.DateString+": "+d.SWC+ " inches");
}

function mouseout(d) {
  d3.select(".id"+d.key).classed("line-hover", false);
  focus.attr("transform", "translate(-100,-100)");
}

var nodes = svg.selectAll(".path")
    .data(flatData)
    .enter().append("g")
    .attr("class","node");

if (screen.width <= 480){
nodes.append("text")
    .attr("x", function(d) {
      return (x(d.Date)-40);
    })
    .attr("y", function(d) {
      return y(d.SWC)-10;
    })
    .attr("class","dottextslope")
    .style("fill","black")//"#3F3F3F")
    .style("font-size","14px")
    .style("font-family","AntennaMedium")
    // .style("font-style","italic")
    .text(function(d) {
        if (d.DateString == "1/10/17"){
            return d.DateString+": "+d.SWC+ " inches";
        } else {
            return "";
        }
    });
} else {
nodes.append("text")
    .attr("x", function(d) {
      return (x(d.Date)-10);
    })
    .attr("y", function(d) {
      return y(d.SWC)-20;
    })
    .attr("class","dottextslope")
    .style("fill","black")//"#3F3F3F")
    .style("font-size","14px")
    .style("font-family","AntennaMedium")
    // .style("font-style","italic")
    .text(function(d) {
        if (d.DateString == "1/10/17"){
            return d.SWC+ " inches";
        } else {
            return "";
        }
    });
}

if (screen.width <= 480) {
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)" )
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", 35)
      .style("text-anchor", "end")
      .text("Month")
} else {
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", 40)
      .style("text-anchor", "end")
      .text("Month");
}

if (screen.width <= 480) {
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .attr("x", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      // .style("fill","white")
      .text("Snowpack (equivalent water, inches)")
} else {
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      // .style("fill","white")
      .text("Snowpack (equivalent water, inches)")
}
