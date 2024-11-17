// Set dimensions and margins
const width = 960;
const height = 600;

// Create an SVG element
const svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a clip path
svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

// Create a group element and apply the clip path
const g = svg.append("g")
    .attr("clip-path", "url(#clip)");

// Define a color scale
const color = d3.scaleQuantize()
    .range(d3.schemeReds[9]);

// Define the zoom behavior
const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Set the zoom scale extent
    .on("zoom", zoomed);

// Apply the zoom behavior to the SVG element
svg.call(zoom);

// Function to handle zoom events
function zoomed(event) {
    const {transform} = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1.5 / transform.k);
}

// Load and process data
Promise.all([
    d3.json("https://d3js.org/us-10m.v1.json"),
    d3.csv("covid_data_log_200922.csv") // Replace with your data source
]).then(([us, data]) => {
    const datasets = [
        { name: "Risk_Index", label: "Risk Index" },
        { name: "Poverty", label: "Poverty" } // Add Poverty dataset
    ];
    let currentIndex = 0;

    const riskIndex = {};
    data.forEach(d => {
        riskIndex[d.FIPS] = +d[datasets[currentIndex].name]; // Use FIPS as the key
    });

    // Function to update the map
    function updateMap() {
        // Update the color scale domain based on the current dataset
        const values = data.map(d => +d[datasets[currentIndex].name]);
        color.domain([d3.min(values), d3.max(values)]);

        g.selectAll(".county")
            .data(topojson.feature(us, us.objects.counties).features)
            .attr("fill", d => color(riskIndex[d.id] || 0)); // Match FIPS with id

        // Update the annotation text
        d3.select("#annotation").text(`Currently displaying: ${datasets[currentIndex].label}`);
    }

    // Draw the counties
    g.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("class", "county")
        .attr("d", d3.geoPath())
        .attr("fill", d => color(riskIndex[d.id] || 0)); // Match FIPS with id

    // Draw the state borders
    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("class", "state-border")
        .attr("d", d3.geoPath())
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", "1.5px");

    // Add event listener to the button
    d3.select("#toggle-display").on("click", () => {
        currentIndex = (currentIndex + 1) % datasets.length;
        data.forEach(d => {
          riskIndex[d.FIPS] = +d[datasets[currentIndex].name]; // Update risk index
        });
        updateMap(); // Update the map with new data
    });

    // Initial map rendering
    updateMap();
});