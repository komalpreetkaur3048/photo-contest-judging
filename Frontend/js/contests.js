/* =========================================================
   PHOTOJUDGE — CONTESTS REGISTRY & DETAILS
========================================================= */

// ==========================================
// PHOTO CONTEST DATA
// ==========================================

const contests = [
    {
        id: "nature-2026",
        title: "Nature Through My Lens",
        category: "Nature",
        description: "Capture the raw beauty, subtle emotion, and breathtaking diversity of nature through your lens.",
        deadline: "2026-08-30",
        status: "active",
        maxSubmissions: 3,
        criteria: {
            creativity: 40,
            technical: 30,
            themeFit: 30
        }
    },
    {
        id: "wildlife-2026",
        title: "Wildlife Wonders",
        category: "Wildlife",
        description: "Showcase the behavior, habitats, and spirit of animals in their natural environment.",
        deadline: "2026-09-10",
        status: "upcoming",
        maxSubmissions: 3,
        criteria: {
            creativity: 30,
            technical: 40,
            themeFit: 30
        }
    },
    {
        id: "travel-2026",
        title: "Travel & Culture",
        category: "Travel",
        description: "Document iconic places, vibrant cultural traditions, landscapes, and journey experiences.",
        deadline: "2026-09-20",
        status: "upcoming",
        maxSubmissions: 3,
        criteria: {
            creativity: 40,
            technical: 30,
            themeFit: 30
        }
    },
    {
        id: "urban-stories-2026",
        title: "Urban Stories & Architecture",
        category: "Architecture & Urban",
        description: "Tell stories through architectural lines, dynamic city streets, shadows, and urban life.",
        deadline: "2026-09-30",
        status: "upcoming",
        maxSubmissions: 3,
        criteria: {
            creativity: 35,
            technical: 35,
            themeFit: 30
        }
    },
    {
        id: "portraits-2026",
        title: "Portraits & Soul",
        category: "Portrait",
        description: "Capture personality, candid emotion, human identity, and authentic character.",
        deadline: "2026-10-10",
        status: "upcoming",
        maxSubmissions: 3,
        criteria: {
            creativity: 40,
            technical: 30,
            themeFit: 30
        }
    },
    {
        id: "night-light-2026",
        title: "Night & Light Play",
        category: "Night Photography",
        description: "Explore the mood, neon reflections, long exposures, and atmosphere after dark.",
        deadline: "2026-10-20",
        status: "upcoming",
        maxSubmissions: 3,
        criteria: {
            creativity: 30,
            technical: 45,
            themeFit: 25
        }
    },
    {
        id: "minimalism-2026",
        title: "Minimalist Compositions",
        category: "Minimal & Artistic",
        description: "Find elegance in simplicity through negative space, clean geometric forms, and color balance.",
        deadline: "2026-10-30",
        status: "upcoming",
        maxSubmissions: 3,
        criteria: {
            creativity: 45,
            technical: 25,
            themeFit: 30
        }
    },
    {
        id: "seasons-2026",
        title: "Seasons in Focus",
        category: "Seasonal",
        description: "Celebrate the changing light, vibrant colors, weather, and mood of seasonal transitions.",
        deadline: "2026-11-10",
        status: "upcoming",
        maxSubmissions: 3,
        criteria: {
            creativity: 35,
            technical: 30,
            themeFit: 35
        }
    }
];


// ==========================================
// SEED DEFAULT CONTESTS
// ==========================================

function initializeContests() {
    const existingContests = localStorage.getItem("contests");
    if (!existingContests) {
        localStorage.setItem("contests", JSON.stringify(contests));
    }
}

initializeContests();


// ==========================================
// DISPLAY CONTESTS WITH INTERACTIVE FILTERS
// ==========================================

function displayContests(filterStatus) {
    const contestsContainer = document.querySelector("#contestsContainer");
    if (!contestsContainer) return;

    let savedContests = JSON.parse(localStorage.getItem("contests")) || contests;

    // Filter resolution: argument > URL param > 'all'
    const urlParams = new URLSearchParams(window.location.search);
    const activeFilter = filterStatus !== undefined ? filterStatus : (urlParams.get("status") || "all");

    // Update filter buttons UI
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(function (btn) {
        const btnFilter = btn.getAttribute("data-filter") || btn.textContent.trim().toLowerCase();
        if (btnFilter === activeFilter || (activeFilter === "all" && btnFilter.includes("all"))) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    if (activeFilter && activeFilter !== "all") {
        savedContests = savedContests.filter(function (contest) {
            return contest.status === activeFilter;
        });
    }

    contestsContainer.innerHTML = "";

    if (savedContests.length === 0) {
        contestsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; background: #ffffff; border: 1px dashed var(--border-strong); border-radius: var(--radius-lg);">
                <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 12px;">No contests found in this category.</p>
                <button class="filter-btn active" onclick="displayContests('all')" style="cursor:pointer;">View All Contests</button>
            </div>
        `;
        return;
    }

    savedContests.forEach(function (contest) {
        const card = document.createElement("article");
        card.className = "contest-card";

        const statusBadgeColor =
            contest.status === "active"
                ? "background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;"
                : contest.status === "completed"
                ? "background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;"
                : "background: #fef3c7; color: #92400e; border: 1px solid #fde68a;";

        card.innerHTML = `
            <div class="contest-card-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                    <span class="contest-category">
                        ${contest.category}
                    </span>
                    <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; ${statusBadgeColor}">
                        ${contest.status}
                    </span>
                </div>

                <h2>
                    ${contest.title}
                </h2>

                <p>
                    ${contest.description}
                </p>

                <div class="contest-card-meta">
                    <div>
                        <strong>Status</strong>
                        <span>${contest.status.toUpperCase()}</span>
                    </div>
                    <div>
                        <strong>Deadline</strong>
                        <span>${new Date(contest.deadline).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <strong>Max Entries</strong>
                        <span>${contest.maxSubmissions} Photos</span>
                    </div>
                </div>

                <div class="contest-weights">
                    <p>
                        <strong>Judging Weights</strong>
                    </p>
                    <span>Creativity: ${contest.criteria.creativity}%</span>
                    <span>Technical: ${contest.criteria.technical}%</span>
                    <span>Theme Fit: ${contest.criteria.themeFit}%</span>
                </div>

                <a href="contest-details.html?id=${contest.id}" class="contest-btn">
                    View Contest & Criteria →
                </a>
            </div>
        `;

        contestsContainer.appendChild(card);
    });
}

// Bind filter buttons on click
document.addEventListener("DOMContentLoaded", function () {
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            const filter = btn.getAttribute("data-filter") || "all";
            displayContests(filter);
        });
    });
});


// ==========================================
// DISPLAY CONTEST DETAILS
// ==========================================

function displayContestDetails() {
    const container = document.querySelector("#contestDetailsContainer");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const contestId = params.get("id");

    const savedContests = JSON.parse(localStorage.getItem("contests")) || contests;
    const contest = savedContests.find(function (item) {
        return item.id === contestId;
    });

    if (!contest) {
        container.innerHTML = `
            <div class="contest-detail-card" style="text-align: center; padding: 60px 20px;">
                <h1>Contest Not Found</h1>
                <p style="color: var(--text-muted); margin-bottom: 24px;">The contest you are looking for does not exist or has been removed.</p>
                <a href="contests.html" class="contest-submit-btn">Back to Contests</a>
            </div>
        `;
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    let actionBtnHTML;
    if (contest.status === "active") {
        if (currentUser && currentUser.role === "judge") {
            actionBtnHTML = `
                <a href="judge.html" class="contest-submit-btn">
                    Open Judge Dashboard →
                </a>
            `;
        } else {
            actionBtnHTML = `
                <a href="submit.html?contestId=${encodeURIComponent(contest.id)}" class="contest-submit-btn">
                    Submit Photo to This Contest →
                </a>
            `;
        }
    } else {
        actionBtnHTML = `
            <div class="contest-submit-btn" style="opacity: 0.65; cursor: not-allowed; text-align: center;">
                Submissions Open Soon (${contest.status.toUpperCase()})
            </div>
        `;
    }

    container.innerHTML = `
        <div class="contest-detail-card">
            <span class="eyebrow" style="color: var(--accent-gold-dark); font-weight: 800;">
                ${contest.category.toUpperCase()} COMPETITION
            </span>

            <h1>
                ${contest.title}
            </h1>

            <p class="contest-description">
                ${contest.description}
            </p>

            <div class="contest-detail-meta">
                <div>
                    <strong>Status</strong>
                    <span>${contest.status.toUpperCase()}</span>
                </div>
                <div>
                    <strong>Submission Deadline</strong>
                    <span>${new Date(contest.deadline).toLocaleDateString()}</span>
                </div>
                <div>
                    <strong>Max Submissions</strong>
                    <span>${contest.maxSubmissions} per Photographer</span>
                </div>
                <div>
                    <strong>Evaluation Jury</strong>
                    <span>3 Professional Jurors</span>
                </div>
            </div>

            <section class="contest-criteria">
                <h2>Weighted Judging Criteria</h2>
                <div class="criteria-grid">
                    <div>
                        <strong>${contest.criteria.creativity}%</strong>
                        <span>Creativity & Storytelling</span>
                    </div>
                    <div>
                        <strong>${contest.criteria.technical}%</strong>
                        <span>Technical Quality & Composition</span>
                    </div>
                    <div>
                        <strong>${contest.criteria.themeFit}%</strong>
                        <span>Theme Fit & Interpretation</span>
                    </div>
                </div>
            </section>

            ${actionBtnHTML}
        </div>
    `;
}

// Initializers
displayContests();
displayContestDetails();