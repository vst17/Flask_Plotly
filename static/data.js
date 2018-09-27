// Getting references
var $selDataset = document.getElementById("selDataset");
var $sampleMetadata = document.getElementById("sampleMetadata");
var $bubble = document.getElementById("bubble");
var $gauge = document.getElementById("gauge");

// Creating drop down
d3.json("/names", function(error, response) {
    if (error) return console.log(error);

    // console.log(response);

    var items = response;
    // console.log(items);

    for (var i = 0; i < items.length; i++) {

        // Create option elemeent
        var $option = document.createElement("option");
        $option.setAttribute("value", items[i]);
        $option.innerHTML = items[i];

        // Append to select tag
        $selDataset.appendChild($option);
    };
});

// Inital loading page
function init() {

    // Initial sample metadata
    d3.json("/metadata/BB_940", function(error, response) {
        if (error) return console.log(error);

        // console.log(response);

        var keys = Object.keys(response);
        // console.log(keys);

        for (var i = 0; i < keys.length; i++) {
            var $p = document.createElement("p");
            $p.innerHTML = `${keys[i]}: ${response[keys[i]]}`;

            $sampleMetadata.appendChild($p);
        };
    });

    // Inital pie & bubble plots
    d3.json("/samples/BB_940", function(error, response) {
        if (error) console.log(error);
    
        // Data slices
        var idSlice = response.otu_ids.slice(0,10);
        var valueSlice = response.sample_values.slice(0,10);

        // Pie data
        var pieIds = [];
        var pieValues = [];
        for (var i = 0; i < valueSlice.length; i++) {
            if (valueSlice[i] != 0) {
                pieIds.push(idSlice[i]);
                pieValues.push(valueSlice[i]);
            };
        };
    
        // Bubble plot variables
        var bubbleIds = [];
        var bubbleValues = [];
        for (var i = 0; i < response.sample_values.length; i++) {
            if (response.sample_values[i] != 0) {
                bubbleIds.push(response.otu_ids[i]);
                bubbleValues.push(response.sample_values[i]);
            };
        };
    
        d3.json("/otu", function(error, response) {
            if (error) console.log(error);
    
            // Pie chart labels
            var pieLabels = [];
            for (var i = 0; i < pieIds.length; i++) {
                pieLabels.push(response[pieIds[i]]);
            };
    
            // Bubble plot labels
            var bubbleLabels = [];
            for (var i = 0; i < bubbleIds.length; i++) {
                bubbleLabels.push(response[bubbleIds[i]]);
            }
    
            // Plotting pie chart
            var pieData = [{
                values: pieValues,
                labels: pieIds,
                type: "pie",
                hovertext: pieLabels
            }];
            Plotly.newPlot("pie", pieData);
    
            // Plotting bubble plot
            var bubbleData = [{
                x: bubbleIds,
                y: bubbleValues,
                mode: "markers",
                text: bubbleLabels,
                marker: {
                    size: bubbleValues,
                    color: bubbleIds.map(row=>row),
                    colorscale: "Rainbow"
                }
            }];
            var bubbleLayout = {
                xaxis: {
                    title: "OTU ID"
                }
            };
            Plotly.newPlot("bubble", bubbleData, bubbleLayout);
        });
    });

    // Initial gauge chart
    d3.json("/wfreq/BB_940", function(error, response) {
        if (error) console.log(error);

        // Trig to calc meter point
        var degrees = 180 - response * 20,
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);
    
        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);
    
        var data = [{ type: 'scatter',
        x: [0], y:[0],
            marker: {size: 28, color:'850000'},
            showlegend: false,
            name: 'WFREQ',
            text: '',
            hoverinfo: 'text+name'},
        {values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition:'inside',
        marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(47, 143, 31, .5)',
                            'rgba(73, 157, 59, .5)', 'rgba(99, 171, 87, .5)',
                            'rgba(125, 185, 115, .5)', 'rgba(151, 199, 143, .5)',
                            'rgba(177, 213, 171, .5)', 'rgba(203, 227, 199, .5)',
                            'rgba(229, 241, 227, .5)', 'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
        }];
    
        var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
            }],
        title: 'Scrubs per Week',
        xaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]}
        };
    
        Plotly.newPlot('gauge', data, layout);
    })

};

// Update pie & bubble plots
function updatePlots(newPie, newBubble) {
    
    // Restyle pie chart
    var pieUpdate = {
        values: [newPie.values],
        labels: [newPie.lables],
        hovertext: [newPie.hovertext]
    };
    Plotly.restyle("pie", pieUpdate);

    // Restyle bubble plot
    Plotly.restyle("bubble", "x", [newBubble.x]);
    Plotly.restyle("bubble", "y", [newBubble.y]);
    Plotly.restyle("bubble", "text", [newBubble.text]);
    Plotly.restyle("bubble", "marker.size", [newBubble.y]);
    Plotly.restyle("bubble", "marker.color", [newBubble.x.map(row=>row)]);
};

// Update gauge chart
function updateChart(newGauge) {

    // Trig to calc meter point
    var degrees = 180 - newGauge * 20,
    radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    Plotly.relayout("gauge", "shapes[0].path", path);
};

// Get new data
function optionChanged(dataset) {

    // Update metadata
    var dataURL = `/metadata/${dataset}`;
    d3.json(dataURL, function(error, response) {
        if (error) return console.log(error);

        $sampleMetadata.innerHTML = "";

        var keys = Object.keys(response);

        for (var i = 0; i < keys.length; i++) {
            var $p = document.createElement("p");
            $p.innerHTML = `${keys[i]}: ${response[keys[i]]}`;
            $sampleMetadata.appendChild($p);
        };
    });

    // Update pie & bubble plots
    var plotURL = `/samples/${dataset}`;
    d3.json(plotURL, function(error, response) {
        if (error) return console.log(error);

        // Empty object for new data
        var newPie = {};
        var newBubble = {};

        // Data slices
        var idSlice = response.otu_ids.slice(0,10);
        var valueSlice = response.sample_values.slice(0,10);

        // Pie data
        var pieIds = [];
        var pieValues = [];
        for (var i = 0; i < valueSlice.length; i++) {
            if (valueSlice[i] != 0) {
                pieIds.push(idSlice[i]);
                pieValues.push(valueSlice[i]);
            };
        };
        newPie["values"] = pieValues;
        newPie["labels"] = pieIds;

        // Bubble data
        var bubbleIds = [];
        var bubbleValues = [];
        for (var i = 0; i < response.sample_values.length; i++) {
            if (response.sample_values[i] != 0) {
                bubbleIds.push(response.otu_ids[i]);
                bubbleValues.push(response.sample_values[i]);
            };
        };
        newBubble["x"] = bubbleIds;
        newBubble["y"] = bubbleValues;

        d3.json("/otu", function(error, response) {
            if (error) console.log(error);

            var pieLabels = [];
            for (var i = 0; i < pieIds.length; i++) {
                pieLabels.push(response[pieIds[i]]);
            };
            newPie["hovertext"] = pieLabels;

            var bubbleLables = [];
            for (var i = 0; i < bubbleIds.length; i++) {
                bubbleLables.push(response[bubbleIds[i]]);
            };
            newBubble["text"] = bubbleLables;

            // Update plots
            updatePlots(newPie, newBubble);
        });
    });

    // Update gauge chart
    var chartURL = `/wfreq/${dataset}`;
    d3.json(chartURL, function(error, response) {
        if (error) console.log(error)

        updateChart(response);
    });
};  

// Run initial function
init();