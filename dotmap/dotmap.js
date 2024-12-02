// Load the CSV data
d3.csv("../covid_data_log_200922.csv").then(data => {
    // Set up SVG dimensions and dot settings
    const width = 800,
        height = 600,
        dotSize = 5,
        spacing = 10;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Race mappings
    const races = [
        { name: "White", maleKey: "W_Male", femaleKey: "W_Female" },
        { name: "Black", maleKey: "B_Male", femaleKey: "B_Female" },
        { name: "Hispanic", maleKey: "H_Male", femaleKey: "H_Female" },
        { name: "American Indian", maleKey: "I_Male", femaleKey: "I_Female" },
        { name: "Asian", maleKey: "A_Male", femaleKey: "A_Female" },
        { name: "Native Hawaiian", maleKey: "NH_Male", femaleKey: "NH_Female" }
    ];

    let currentRaceIndex = 0;
    let showGenderSplit = false;

    // Function to prepare dots for a specific race
    const prepareDots = (maleKey, femaleKey, splitByGender) => {
        const maleCount = Math.floor(d3.sum(data, d => +d[maleKey] || 0));
        const femaleCount = Math.floor(d3.sum(data, d => +d[femaleKey] || 0));
        const totalCount = maleCount + femaleCount;

        const dots = [];
        for (let i = 0; i < totalCount; i++) {
            if (splitByGender) {
                dots.push({
                    gender: i < maleCount ? "Male" : "Female",
                    group: i < maleCount ? "Male" : "Female"
                });
            } else {
                dots.push({ gender: "Total", group: "Total" });
            }
        }
        return dots;
    };

    // Arrange dots for visualization
    const arrangeDots = (dots) => {
        const cols = Math.floor(width / (dotSize + spacing));
        if (!showGenderSplit) {
            dots.forEach((dot, i) => {
                dot.x = (i % cols) * (dotSize + spacing) + dotSize;
                dot.y = Math.floor(i / cols) * (dotSize + spacing) + dotSize;
            });
        } else {
            const maleDots = dots.filter(d => d.group === "Male");
            const femaleDots = dots.filter(d => d.group === "Female");

            maleDots.forEach((dot, i) => {
                dot.x = (i % cols) * (dotSize + spacing) + dotSize;
                dot.y = Math.floor(i / cols) * (dotSize + spacing) + dotSize;
            });

            femaleDots.forEach((dot, i) => {
                dot.x = (i % cols) * (dotSize + spacing) + width / 2 + spacing;
                dot.y = Math.floor(i / cols) * (dotSize + spacing) + dotSize;
            });
        }
        return dots;
    };

    // Update chart function
    const updateChart = () => {
        const race = races[currentRaceIndex];
        const dots = arrangeDots(
            prepareDots(race.maleKey, race.femaleKey, showGenderSplit)
        );

        // Update annotation
        d3.select("#annotation").text(
            `COVID-19 Cases: ${
                showGenderSplit ? `${race.name} Male vs ${race.name} Female` : `Total for ${race.name}`
            }`
        );

        // Bind dots to circles
        const circles = svg.selectAll("circle").data(dots);

        // Enter new dots
        circles
            .enter()
            .append("circle")
            .attr("r", dotSize)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .style("fill", d => {
                if (!showGenderSplit) return "gray";
                return d.gender === "Male" ? "steelblue" : "pink";
            })
            .style("opacity", 0)
            .on("mouseover", (event, d) => {
                const race = races[currentRaceIndex];
                const maleCount = Math.floor(d3.sum(data, d => +d[race.maleKey] || 0));
                const femaleCount = Math.floor(d3.sum(data, d => +d[race.femaleKey] || 0));
                const totalCount = maleCount + femaleCount;
            
                tooltip
                    .style("opacity", 1)
                    .html(
                        showGenderSplit
                            ? `Gender: ${d.gender}<br>
                               Total Males: ${maleCount}<br>
                               Total Females: ${femaleCount}`
                            : `Total Count: ${totalCount}`
                    )
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 10 + "px");
            })            
            .on("mouseout", () => tooltip.style("opacity", 0))
            .transition()
            .duration(1000)
            .style("opacity", 1);

        // Update existing dots
        circles
            .transition()
            .duration(1000)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .style("fill", d => {
                if (!showGenderSplit) return "gray";
                return d.gender === "Male" ? "steelblue" : "pink";
            });

        // Remove unused dots
        circles
            .exit()
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .remove();
    };

    // Initialize chart with the first race
    updateChart();

    // Toggle gender split
    d3.select("#toggle-gender").on("click", () => {
        showGenderSplit = !showGenderSplit;
        updateChart();
    });

    // Navigation buttons
    d3.select("#prev").on("click", () => {
        if (currentRaceIndex > 0) {
            currentRaceIndex--;
            showGenderSplit = false;
            updateChart();
        }
        d3.select("#next").attr("disabled", currentRaceIndex === races.length - 1 ? "disabled" : null);
        d3.select("#prev").attr("disabled", currentRaceIndex === 0 ? "disabled" : null);
    });

    d3.select("#next").on("click", () => {
        if (currentRaceIndex < races.length - 1) {
            currentRaceIndex++;
            showGenderSplit = false;
            updateChart();
        }
        d3.select("#next").attr("disabled", currentRaceIndex === races.length - 1 ? "disabled" : null);
        d3.select("#prev").attr("disabled", currentRaceIndex === 0 ? "disabled" : null);
    });
});
