// Dimensions and SVG setup
const width = 960, height = 600, margin = { top: 50, right: 60, bottom: 50, left: 60 };

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;

// Races and corresponding columns for male/female deaths
const races = [
    { name: "White", maleKey: "W_Male", femaleKey: "W_Female" },
    { name: "Black", maleKey: "B_Male", femaleKey: "B_Female" },
    { name: "Hispanic", maleKey: "H_Male", femaleKey: "H_Female" },
    { name: "Asian", maleKey: "A_Male", femaleKey: "A_Female" }
];

let currentRaceIndex = 0;

// Scales
const xScale = d3.scaleBand().range([0, plotWidth]).padding(0.2);
const yScale = d3.scaleLinear().range([plotHeight, 0]);
const colorScale = d3.scaleOrdinal().range(["steelblue", "pink"]); // Colors for Male and Female

// Axes
const xAxis = svg.append("g")
    .attr("transform", `translate(0, ${plotHeight})`);

const yAxis = svg.append("g");

// Axis Labels
svg.append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", plotWidth / 2)
    .attr("y", plotHeight + 40)
    .text("Gender");

svg.append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("x", -plotHeight / 2)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .text("Count of Deaths");

// Load and process data
d3.csv("covid_data_log_200908.csv").then(data => {
    // Function to update chart for a specific race
    function updateChart(race) {
        const raceData = [
            { category: "Male Deaths", value: d3.sum(data, d => +d[race.maleKey] || 0) },
            { category: "Female Deaths", value: d3.sum(data, d => +d[race.femaleKey] || 0) }
        ];

        // Update scales
        xScale.domain(raceData.map(d => d.category));
        yScale.domain([0, d3.max(raceData, d => d.value)]);

        // Update axes
        xAxis.transition().duration(500).call(d3.axisBottom(xScale));
        yAxis.transition().duration(500).call(d3.axisLeft(yScale));

        // Bind data to bars
        const bars = svg.selectAll(".bar").data(raceData);

        // Enter new bars
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.category))
            .attr("y", plotHeight)
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .attr("fill", (d, i) => colorScale(i))
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.value))
            .attr("height", d => plotHeight - yScale(d.value));

        // Update existing bars
        bars.transition()
            .duration(1000)
            .attr("x", d => xScale(d.category))
            .attr("y", d => yScale(d.value))
            .attr("height", d => plotHeight - yScale(d.value))
            .attr("fill", (d, i) => colorScale(i));

        // Remove old bars
        bars.exit().transition().duration(500).attr("height", 0).attr("y", plotHeight).remove();

        d3.select("#annotation").text(`Deaths: ${race.name} Male vs Female`);
    }

    // Initialize chart with the first race
    updateChart(races[currentRaceIndex]);

    // Button to cycle through races
    d3.select("#next").on("click", () => {
        currentRaceIndex = (currentRaceIndex + 1) % races.length;
        updateChart(races[currentRaceIndex]);
    });

    d3.select("#prev").on("click", () => {
        currentRaceIndex = (currentRaceIndex - 1 + races.length) % races.length;
        updateChart(races[currentRaceIndex]);
    });
});
