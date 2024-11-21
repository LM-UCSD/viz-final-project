// Set up the dimensions with margins for better readability
const margin = { top: 50, right: 250, bottom: 70, left: 80 };
const width = 900 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Append the SVG canvas to the chart div
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Tooltip
const tooltip = d3.select(".tooltip");

// Define color scale
const colorScale = d3.scaleOrdinal()
    .domain(["Low", "Above Average", "High"])
    .range(["#1f77b4", "#ff7f0e", "#d62728"]);

// Legend container
const legend = svg.append("g")
    .attr("transform", `translate(${width + 50}, 20)`);

// Legend for colors with explanations
const legendData = [
    { label: "Low", description: "Lower Risk Index" },
    { label: "Above Average", description: "Moderate Risk Index" },
    { label: "High", description: "High Risk Index" }
];

legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 40)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => colorScale(d.label));

legend.selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 20)
    .attr("y", (d, i) => i * 40 + 12)
    .text(d => `${d.label}: ${d.description}`)
    .style("font-size", "12px");

// Load the data
d3.csv('covid_data_log_200908.csv').then(data => {
    data.forEach(d => {
        // Apply the exponential transformation to revert the log values
        d.Poverty = Math.exp(+d.Poverty); // Reverting the log transformation for Poverty
        d.DeathsPerCapita = Math.exp(+d.Deaths) / Math.exp(+d.Population); // Apply the formula for deaths per capita
        d.Population = Math.exp(+d.Population); // Apply the transformation for Population

        // Add a new column for the sum of race groups (TotalPop)
        d.TotalPop = Math.exp(+d.W_Male) + Math.exp(+d.W_Female) + Math.exp(+d.B_Male) + Math.exp(+d.B_Female) +
                     Math.exp(+d.I_Male) + Math.exp(+d.I_Female) + Math.exp(+d.A_Male) + Math.exp(+d.A_Female) +
                     Math.exp(+d.NH_Male) + Math.exp(+d.NH_Female); // Sum the subgroups and transform
    });

    // Define the scales
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Poverty) * 0.8, d3.max(data, d => d.Poverty) * 1.2])  // Scaling the Poverty range more tightly
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.DeathsPerCapita) * 1.2])  // Slightly scale the Deaths per Capita
        .range([height, 0]);

    const rScale = d3.scaleSqrt()
        .domain([d3.min(data, d => d.TotalPop), d3.max(data, d => d.TotalPop)])  // Log transformation for size scaling
        .range([5, 30]);  // Rescale bubbles to a more appropriate size

    // Draw initial bubbles
    const bubbles = svg.selectAll(".bubble")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("cx", d => xScale(d.Poverty))
        .attr("cy", d => yScale(d.DeathsPerCapita))
        .attr("r", 0) // Start with radius 0 for animation
        .attr("fill", d => colorScale(d.Risk_Cat))
        .attr("opacity", 0.7)
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`<strong>County:</strong> ${d.County}<br><strong>State:</strong> ${d.State}<br><strong>Poverty Rate:</strong> ${d.Poverty.toFixed(2)}%<br><strong>Deaths per Capita:</strong> ${(d.DeathsPerCapita * 100).toFixed(2)}%<br><strong>Population:</strong> ${d.TotalPop}<br><strong>Risk:</strong> ${d.Risk_Cat}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        });

    // Animate bubbles on load
    bubbles.transition()
        .delay((d, i) => i * 20)
        .duration(1000)
        .attr("r", d => rScale(d.TotalPop));

    // Add X-Axis and Title with custom formatting
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5));  // Removed percentage formatting for clarity

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Poverty Rate");

    // Add Y-Axis and Title with custom formatting
    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5));  // Removed percentage formatting for clarity

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Deaths per Capita");

    // Define the update function to filter bubbles
    function updateBubbles() {
        const selectedCategories = checkboxes.selectAll("input:checked")
            .nodes()
            .map(input => input.value);

        bubbles
            .attr("display", d => selectedCategories.includes(d.Risk_Cat) ? null : "none");
    }

    // Add checkboxes after defining updateBubbles
    const checkboxes = d3.select("#chart")
        .append("div")
        .style("margin-top", "10px");

    legendData.forEach(riskCat => {
        const label = checkboxes.append("label");
        label.append("input")
            .attr("type", "checkbox")
            .attr("checked", true)
            .attr("value", riskCat.label)
            .on("change", updateBubbles);
        label.append("span").text(riskCat.label);
    });
});
