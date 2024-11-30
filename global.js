// global.js

document.addEventListener("DOMContentLoaded", () => {
    const navBar = document.createElement("nav");
    navBar.className = "navbar";

    const isHomePage = document.documentElement.classList.contains('home');

    navBar.innerHTML = `
        <ul class="navbar-list">
            <li class="navbar-item"><a href="${isHomePage ? "" : "../"}" class="navbar-link">Home</a></li>
            <li class="navbar-item"><a href="${isHomePage ? "barchart/map.html" : "../barchart/map.html"}" class="navbar-link">Bar Chart</a></li>
            <li class="navbar-item"><a href="${isHomePage ? "dotmap/dotmap.html" : "../dotmap/dotmap.html"}" class="navbar-link">Dot Chart</a></li>
            <li class="navbar-item"><a href="${isHomePage ? "heatmap/heatmap.html" : "../heatmap/heatmap.html"}" class="navbar-link">Heat Map</a></li>
            <li class="navbar-item"><a href="${isHomePage ? "bubble/bubble.html" : "../bubble/bubble.html"}" class="navbar-link">Bubble Map</a></li>
            <li class="navbar-item"><a href="${isHomePage ? "animated_bar/index.html" : "../animated_bar/index.html"}" class="navbar-link">Animated Bar</a></li>
        </ul>
    `;
    document.body.insertBefore(navBar, document.body.firstChild);
});