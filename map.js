// Load GeoJSON and extend data handling
Promise.all([
    d3.json("https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json"),
    d3.csv("covid_data_log_200908.csv")
]).then(([geojson, data]) => {
    // Map FIPS to Risk Index and Poverty
    const dataByFIPS = new Map(data.map(d => [d.FIPS, { risk: +d.Risk_Index, poverty: +d.Poverty }]));

    // Color scales
    const riskColor = d3.scaleSequential(d3.interpolateReds).domain([0, 1]);
    const povertyColor = d3.scaleSequential(d3.interpolateBlues).domain([0, 30]);

    const svgMap = d3.select("#map")
        .append("svg")
        .attr("width", 960)
        .attr("height", 600);

    const projection = d3.geoAlbersUsa().scale(1000).translate([480, 300]);
    const path = d3.geoPath().projection(projection);

    svgMap.selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", d => {
            const countyData = dataByFIPS.get(d.id);
            if (!countyData) return "#ccc"; // Default color for missing data
            const risk = countyData.risk;
            const poverty = countyData.poverty;
            return d3.interpolateRgb(riskColor(risk), povertyColor(poverty))(0.5);
        })
        .attr("stroke", "#999")
        .on("mouseover", (event, d) => {
            const countyData = dataByFIPS.get(d.id);
            if (countyData) {
                tooltip
                    .style("opacity", 1)
                    .html(`Risk Index: ${countyData.risk.toFixed(2)}<br>Poverty: ${countyData.poverty}%`)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 10 + "px");
            }
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
});
