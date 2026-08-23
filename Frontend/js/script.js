// Get the Explore Contest button
const exploreButton = document.querySelector(".primary-btn") || document.querySelector(".hero-actions .btn");

// Add click event
if (exploreButton) {
    exploreButton.addEventListener("click", function (e) {
        if (!exploreButton.getAttribute("href")) {
            window.location.href = "pages/contests.html";
        }
    });
}