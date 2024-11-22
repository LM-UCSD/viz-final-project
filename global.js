// global.js

document.addEventListener("DOMContentLoaded", () => {
    const navBar = document.createElement("nav");
    navBar.className = "navbar";

    const isHomePage = window.location.pathname.endsWith("index.html");

    navBar.innerHTML = `
        <ul class="navbar-list">
            <li class="navbar-item"><a href="${isHomePage ? "" : "../"}index.html" class="navbar-link">Home</a></li>
            <li class="navbar-item"><a href="${isHomePage ? "viz-final-project/barchart/map.html" : "../barchart/map.html"}" class="navbar-link">Bar Chart</a></li>
            <li class="navbar-item"><a href="${isHomePage ? "viz-final-project/dotmap/dotmap.html" : "../dotmap/dotmap.html"}" class="navbar-link">Dot Chart</a></li>
            <li class="navbar-item"><a href="${isHomePage ? "viz-final-project/heatmap/heatmap.html" : "../heatmap/heatmap.html"}" class="navbar-link">Heat Map</a></li>
            <li class="navbar-item"><a href="${isHomePage ? "viz-final-project/bubble/bubble.html" : "../bubble/bubble.html"}" class="navbar-link">Bubble Map</a></li>
        </ul>
    `;
    document.body.insertBefore(navBar, document.body.firstChild);
});