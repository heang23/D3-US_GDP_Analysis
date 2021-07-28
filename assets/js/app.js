// set the dimensions and margins of the graph
var margin = {top: 20, right: 40, bottom: 200, left: 100},
    svgWidth = 960, svgHeight = 620,
    // calculate chart height and width
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

// Add the chart to scatter element
var chart = d3.select('#scatter')
    .append('div')
    .classed('chart', true);
// Create an SVG wrapper, append an SVG group that will hold the chart
var svg = chart.append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);
var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

//initial parameters(values) for x and y axis
var Xvalue = 'poverty';
var Yvalue = 'healthcare';

// Create a function for updating the x-scale variable upon click of label
function xScale(Data, Xvalue) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(Data, d => d[Xvalue]) * 0.8,
        d3.max(Data, d => d[Xvalue]) * 1.2])
        .range([0, width]);

    return xLinearScale;
}
// Create a function for updating y-scale variable
function yScale(Data, Yvalue) {
  // Create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[Yvalue]) * 0.8,
    d3.max(Data, d => d[Yvalue]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
}
// Create a function for updating the xAxis variables
function renderXAxis(newXScale, Xvalue) {
  var bottomAxis = d3.axisBottom(newXScale);
  // Create scales
  xAxis.transition()
    .duration(2000)
    .call(bottomAxis);

  return xAxis;
}

// Create a function used for updating yAxis variables
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  // Create scales
  yAxis.transition()
    .duration(2000)
    .call(leftAxis);

  return yAxis;
}

// Create a function for updating the circles with a transition to new circles 
function renderCircles(circlesGroup, newXScale, Xvalue, newYScale, Yvalue) {
    // Create scales
    circlesGroup.transition()
        .duration(2000)
        .attr('cx', data => newXScale(data[Xvalue]))
        .attr('cy', data => newYScale(data[Yvalue]))

    return circlesGroup;
}

// Create a function for updating STATE labels
function renderText(textGroup, newXScale, Xvalue, newYScale, Yvalue) {

    textGroup.transition()
        .duration(2000)
        .attr('x', d => newXScale(d[Xvalue]))
        .attr('y', d => newYScale(d[Yvalue]));

    return textGroup
}
// Create a function to stylize x-axis values for tooltips
function styleX(value, Xvalue) {
    //style based on variable
    if (Xvalue === 'poverty') {
        return `${value}%`;
    }
    else if (Xvalue === 'income') {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
}

// Create a funtion for updating circles group
function updateToolTip(Xvalue, Yvalue, circlesGroup) {
    //style based on variable
    if (Xvalue === 'poverty') {var xLabel = 'Poverty:';}
    else if (Xvalue === 'income'){var xLabel = 'Median Income:';}
    else {var xLabel = 'Age:';}
    // Set Y label
    if (Yvalue ==='healthcare') {var yLabel = "No Healthcare:"}
    else if(Yvalue === 'obesity') {var yLabel = 'Obesity:';}
    else{var yLabel = 'Smokers:';}
    
    //create tooltip
    var toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-8, 0])
        .html(function(d) {
        return (`${d.state}<br>${xLabel} ${styleX(d[Xvalue], Xvalue)}<br>${yLabel} ${d[Yvalue]}%`);
    });
    
    circlesGroup.call(toolTip);

    circlesGroup.on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);
    
    return circlesGroup;
}

// @TODO: Load data from CSV file: data.csv
d3.csv('./assets/data/data.csv').then(function(Data) {
    console.log(Data) // print data out
    // cast each value in data as a number(initial) using unary + operator
    Data.forEach(function(data) {
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    //create linear scales
    var xLinearScale = xScale(Data, Xvalue);
    var yLinearScale = yScale(Data, Yvalue);

    //create x axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Add X axis
    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    // Add Y axis
    var yAxis = chartGroup.append('g')
        .classed('y-axis', true)
        //.attr
        .call(leftAxis);
    
    // Add circle
    var circlesGroup = chartGroup.selectAll('circle')
        .data(Data)
        .enter()
        .append('circle')
        .classed('stateCircle', true)
        .attr('cx', d => xLinearScale(d[Xvalue]))
        .attr('cy', d => yLinearScale(d[Yvalue]))
        .attr('r', 14)
        .attr('opacity', '.5');

    //append Initial Text
    var textGroup = chartGroup.selectAll('.stateText')
        .data(Data)
        .enter()
        .append('text')
        .classed('stateText', true)
        .attr('x', d => xLinearScale(d[Xvalue]))
        .attr('y', d => yLinearScale(d[Yvalue]))
        .attr('dy', 3)
        .attr('font-size', '10px')
        .text(function(d){return d.abbr});

    //create a group for the x axis labels
    var xLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var povertyLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .text('In Poverty (%)');
      
    var ageLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')
        .text('Age (Median)');  

    var incomeLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')
        .text('Household Income (Median)')

    //create a group for Y labels
    var yLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

    var healthcareLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 0 - 20)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'healthcare')
        .text('Without Healthcare (%)');
    
    var smokesLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 0 - 40)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'smokes')
        .text('Smoker (%)');
    
    var obesityLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 0 - 60)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'obesity')
        .text('Obese (%)');
    
    //update the toolTip
    var circlesGroup = updateToolTip(Xvalue, Yvalue, circlesGroup);

    // Set X axis event listener
    xLabelsGroup.selectAll('text').on('click', function() {
        var value = d3.select(this).attr('value');
        if (value != Xvalue) {
          // Replace x property with value
          Xvalue = value; 
          //update x with new scale
          xLinearScale = xScale(Data, Xvalue);
          //update x for new data
          xAxis = renderXAxis(xLinearScale, xAxis);
          //upate circles with a new x value
          circlesGroup = renderCircles(circlesGroup, xLinearScale, Xvalue, yLinearScale, Yvalue);
          //update circles text 
          textGroup = renderText(textGroup, xLinearScale, Xvalue, yLinearScale, Yvalue);
          //update tooltip
          circlesGroup = updateToolTip(Xvalue, Yvalue, circlesGroup);
          //change of classes changes text
          if (Xvalue === 'poverty') {
            povertyLabel.classed('active', true)
            .classed('inactive', false);
            ageLabel.classed('active', false)
            .classed('inactive', true);
            incomeLabel.classed('active', false)
            .classed('inactive', true);}
          else if (Xvalue === 'age') {
            povertyLabel.classed('active', false)
            .classed('inactive', true);
            ageLabel.classed('active', true)
            .classed('inactive', false);
            incomeLabel.classed('active', false)
            .classed('inactive', true);}
          else {
            povertyLabel.classed('active', false)
            .classed('inactive', true);
            ageLabel.classed('active', false)
            .classed('inactive', true);
            incomeLabel.classed('active', true)
            .classed('inactive', false);}
        }
    });
    // Set Y axis lables event listener
    yLabelsGroup.selectAll('text').on('click', function() {
        var value = d3.select(this).attr('value');
        if(value !=Yvalue) {
            //replace chosenY with value  
            Yvalue = value;
            //update Y scale
            yLinearScale = yScale(Data, Yvalue);
            //update Y axis with new data
            yAxis = renderYAxis(yLinearScale, yAxis);
            //Udate circles with new y
            circlesGroup = renderCircles(circlesGroup, xLinearScale, Xvalue, yLinearScale, Yvalue);
            //update test with new Y values
            textGroup = renderText(textGroup, xLinearScale, Xvalue, yLinearScale, Yvalue);
            //update tooltips
            circlesGroup = updateToolTip(Xvalue, Yvalue, circlesGroup);
            //Change of the classes changes text
        if (Yvalue === 'obesity') {
            obesityLabel.classed('active', true)
            .classed('inactive', false);
            smokesLabel.classed('active', false)
            .classed('inactive', true);
            healthcareLabel.classed('active', false)
            .classed('inactive', true);}
          else if (Yvalue === 'smokes') {
            obesityLabel.classed('active', false)
            .classed('inactive', true);
            smokesLabel.classed('active', true)
            .classed('inactive', false);
            healthcareLabel.classed('active', false)
            .classed('inactive', true);}
          else {
            obesityLabel.classed('active', false)
            .classed('inactive', true);
            smokesLabel.classed('active', false)
            .classed('inactive', true);
            healthcareLabel.classed('active', true)
            .classed('inactive', false);}
        }
    });
}).catch(function(error) {
    console.log(error);
});