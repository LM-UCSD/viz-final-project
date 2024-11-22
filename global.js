// global.js

document.addEventListener("DOMContentLoaded", () => {
    const navBar = document.createElement("nav");
    navBar.className = "navbar";
    navBar.innerHTML = `
        <ul class="navbar-list">
            <li class="navbar-item"><a href="../index.html" class="navbar-link">Home</a></li>
            <li class="navbar-item"><a href="../barchart/map.html" class="navbar-link">Bar Chart</a></li>
            <li class="navbar-item"><a href="../dotmap/dotmap.html" class="navbar-link">Dot Map</a></li>
            <li class="navbar-item"><a href="../heatmap/heatmap.html" class="navbar-link">Heat Map</a></li>
            <li class="navbar-item"><a href="../bubble/bubble.html" class="navbar-link">Bubble Map</a></li>
        </ul>
    `;
    document.body.insertBefore(navBar, document.body.firstChild);
});

