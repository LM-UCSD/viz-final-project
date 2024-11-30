// Chart dimensions
const margin = { top: 20, right: 30, bottom: 30, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Append SVG container
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Load and process data
d3.csv("../covid_data_log_200922.csv").then((data) => {
    // Convert log-transformed deaths to actual death counts
    const deathsPerState = d3.rollups(
      data,
      (v) =>
        d3.sum(v, (d) => Math.exp(+d.Deaths)), // Reverse log-transformation
      (d) => d.State // Group by state
    );
  
    const formattedData = deathsPerState.map(([state, deaths]) => ({
      state,
      deaths,
    }));
  
    // Sort data in descending order of deaths
    formattedData.sort((a, b) => b.deaths - a.deaths);
  
    // Scales
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([0, height]).padding(0.1);
  
    const color = d3.scaleOrdinal(d3.schemeTableau10);
  
    // Axes
    svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg.append("g").attr("class", "y-axis");
  
    // Set initial scale domains
    x.domain([0, d3.max(formattedData, (d) => d.deaths)]);
    y.domain(formattedData.map((d) => d.state));
  
    // Function to update the chart
    function updateChart(data) {
      // Update scales
      x.domain([0, d3.max(data, (d) => d.deaths)]);
      y.domain(data.map((d) => d.state));
  
      // Bind data to bars
      const bars = svg.selectAll(".bar").data(data, (d) => d.state);
  
      // Enter bars
      bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", (d) => y(d.state))
        .attr("height", y.bandwidth())
        .attr("width", (d) => x(d.deaths))
        .attr("fill", (d) => color(d.state))
        .merge(bars) // Update
        .transition()
        .duration(1000)
        .attr("y", (d) => y(d.state))
        .attr("width", (d) => x(d.deaths));
  
      // Remove exiting bars
      bars.exit().remove();
  
      // Update axes
      svg.select(".x-axis").transition().duration(1000).call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2s")));
      svg.select(".y-axis").transition().duration(1000).call(d3.axisLeft(y));
    }
  
    // Animate the chart
    let currentIndex = 0;
  
    function animate() {
      // Rotate the data for animation
      const data = formattedData.slice(currentIndex, currentIndex + 10);
      updateChart(data);
      currentIndex = (currentIndex + 1) % formattedData.length;
      setTimeout(animate, 1500); // Update every 1.5 seconds
    }
  
    // Start the animation
    animate();
  });
  