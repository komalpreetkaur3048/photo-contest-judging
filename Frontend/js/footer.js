// =========================================================
// PHOTOJUDGE — GLOBAL FOOTER
// =========================================================

const footer = document.createElement("footer");

footer.className = "site-footer";

footer.innerHTML = `

    <div class="footer-container">

        <!-- =========================
             BRAND
        ========================== -->

        <div class="footer-brand">

            <a href="${window.location.pathname.includes("/pages/")
                ? "../index.html"
                : "index.html"}"
                class="footer-logo"
            >
                PhotoJudge<span>.</span>
            </a>

            <p>
                A modern photo contest platform dedicated to
                artistic integrity, fair weighted judging,
                and bias-adjusted normalization.
            </p>

            <div class="footer-badge">
                ✓ Verified Fair Normalization
            </div>

        </div>


        <!-- =========================
             COMPETITIONS
        ========================== -->

        <div class="footer-column">

            <h3>
                COMPETITIONS
            </h3>

            <a href="${window.location.pathname.includes("/pages/")
                ? "explore.html"
                : "pages/explore.html"}">
                Explore Community
            </a>

            <a href="${window.location.pathname.includes("/pages/")
                ? "contests.html"
                : "pages/contests.html"}">
                All Contests
            </a>

            <a href="${window.location.pathname.includes("/pages/")
                ? "contests.html?status=active"
                : "pages/contests.html?status=active"}">
                Active Contests
            </a>

            <a href="${window.location.pathname.includes("/pages/")
                ? "contests.html?status=upcoming"
                : "pages/contests.html?status=upcoming"}">
                Upcoming Contests
            </a>

            <a href="${window.location.pathname.includes("/pages/")
                ? "leaderboard.html"
                : "pages/leaderboard.html"}">
                Final Leaderboard
            </a>

        </div>


        <!-- =========================
             PARTICIPANT PORTAL
        ========================== -->

        <div class="footer-column">

            <h3>
                PARTICIPANT PORTAL
            </h3>

            <a href="${window.location.pathname.includes("/pages/")
                ? "submit.html"
                : "pages/submit.html"}">
                Submit Photograph
            </a>

            <a href="${window.location.pathname.includes("/pages/")
                ? "my-entries.html"
                : "pages/my-entries.html"}">
                My Entries & Scores
            </a>

            <a href="${window.location.pathname.includes("/pages/")
                ? "participant-dashboard.html"
                : "pages/participant-dashboard.html"}">
                Participant Dashboard
            </a>

            <a href="${window.location.pathname.includes("/pages/")
                ? "register.html"
                : "pages/register.html"}">
                Create Free Account
            </a>

        </div>


        <!-- =========================
             OFFICIAL JURY
        ========================== -->

        <div class="footer-column">

            <h3>
                OFFICIAL JURY
            </h3>

            <a href="${window.location.pathname.includes("/pages/")
                ? "judge.html"
                : "pages/judge.html"}">
                Judge Dashboard
            </a>

            <a href="${window.location.pathname.includes("/pages/")
                ? "login.html"
                : "pages/login.html"}">
                Juror Sign In
            </a>

            <a href="#">
                Judging Criteria Guide
            </a>

            <a href="#">
                Fairness Engine
            </a>

        </div>

    </div>


    <!-- =========================
         BOTTOM BAR
    ========================== -->

    <div class="footer-bottom">

        <p>
            © 2026 PhotoJudge. Fair judging for better photography.
            All rights reserved.
        </p>

        <span class="footer-status">
            <span class="status-dot"></span>
            Scoring Engine Active
        </span>

    </div>

`;


// Add footer after page content
document.body.appendChild(footer);