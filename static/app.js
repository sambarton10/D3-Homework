// Create SVG Wrapper Dimensions

var svgWidth = 800;
var svgHeight = 500;

// Create Margin
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

//Create SVG Wrapper, append SVG group that will hold our chart

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//Append the SVG Group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.right})`);

//First xAxis

var firstxAxis = "poverty";

function xScale(demographicData, firstxAxis) {
    //Create Scales
    var xLinearScale =d3.scaleLinear()
        .domain([d3.min(demographicData, d => d[firstxAxis]) * 0.8,
            d3.max(demographicData, d => d[firstxAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}

//Function Used For Updating xAxis var upon click on axis label
function renderAxes(newXscale, xAxis) {
    var bottomAxis = d3.axisBottom(newXscale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}
//function used for updating circle group with a transition to new circles
function renderCircles(circlesGroup, newXscale, firstxAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXscale(d[firstxAxis]));

    return circlesGroup;
}
function updateToolTip(firstxAxis, circlesGroup) {

    var label;
  
    if (firstxAxis === "poverty") {
      label = "Poverty:";
    }
    else {
      label = "Obesity:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[firstxAxis]}<br> Obesity: ${d.obesity}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
    //toolTip.style("display", "block")
        toolTip.show(data);
    })
      // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
  
        return circlesGroup;
}
d3.csv("static/data.csv").then(function(demographicData, err) {
    if (err) throw err;

    //parse data
    demographicData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.obesity = +data.obesity;
        data.healthcare = +data.healthcare;
    });

    var xLinearScale = xScale(demographicData, firstxAxis);

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(demographicData, d => d.obesity)])
        .range([height, 0]);
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    //append y axis
    chartGroup.append("g")
    .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(demographicData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[firstxAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 5)
    .attr("fill", "pink")
    //.attr("opacity", ".5");

var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("% in Poverty");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("% Obese");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(firstxAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== firstxAxis) {

        // replaces chosenXAxis with value
        firstxAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(demographicData, firstxAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, firstxAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(firstxAxis, circlesGroup);

        // changes classes to change bold text
        if (firstxAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});

