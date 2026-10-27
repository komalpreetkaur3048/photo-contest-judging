/* =========================================================
   PHOTOJUDGE — CONTESTS REGISTRY & DETAILS (DYNAMIC API + LIFECYCLE)
========================================================= */

let cachedContests = [];

// Fallback initial contests if backend is offline
const fallbackContests = [
    {
        id: "nature-2026",
        title: "Nature Through My Lens",
        category: "Nature",
        description: "Capture the raw beauty, subtle emotion, and breathtaking diversity of nature through your lens.",
        deadline: "2026-11-30",
        status: "active",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 40, technical: 30, themeFit: 30 }
    },
    {
        id: "minimalism-2026",
        title: "Minimalist Compositions",
        category: "Minimal & Artistic",
        description: "Find elegance in simplicity through negative space, clean geometric forms, and color balance.",
        deadline: "2026-10-30",
        status: "active",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 45, technical: 25, themeFit: 30 }
    },
    {
        id: "seasons-2026",
        title: "Seasons in Focus",
        category: "Seasonal",
        description: "Celebrate the changing light, vibrant colors, weather, and mood of seasonal transitions.",
        deadline: "2026-11-30",
        status: "upcoming",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 35, technical: 30, themeFit: 35 }
    },
    {
        id: "portraits-2026",
        title: "Portraits & Soul",
        category: "Portrait",
        description: "Capture personality, candid emotion, human identity, and authentic character.",
        deadline: "2026-10-10",
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 40, technical: 30, themeFit: 30 }
    },
    {
        id: "night-light-2026",
        title: "Night & Light Play",
        category: "Night Photography",
        description: "Explore the mood, neon reflections, long exposures, and atmosphere after dark.",
        deadline: "2026-10-20",
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 30, technical: 45, themeFit: 25 }
    },
    {
        id: "urban-stories-2026",
        title: "Urban Stories & Architecture",
        category: "Architecture & Urban",
        description: "Tell stories through architectural lines, dynamic city streets, shadows, and urban life.",
        deadline: "2026-09-30",
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 35, technical: 35, themeFit: 30 }
    },
    {
        id: "travel-2026",
        title: "Travel & Culture",
        category: "Travel",
        description: "Document iconic places, vibrant cultural traditions, landscapes, and journey experiences.",
        deadline: "2026-09-20",
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 40, technical: 30, themeFit: 30 }
    },
    {
        id: "wildlife-2026",
        title: "Wildlife Wonders",
        category: "Wildlife",
        description: "Showcase the behavior, habitats, and spirit of animals in their natural environment.",
        deadline: "2026-09-10",
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 30, technical: 40, themeFit: 30 }
    },
    {
        id: "monochrome-mastery",
        title: "Monochrome & Shadow",
        category: "Black & White",
        description: "Pure contrast, light mastery, and timeless emotional tones without color distraction.",
        deadline: "2025-12-15",
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 40, technical: 30, themeFit: 30 }
    }
];

// Fetch contests from MongoDB Atlas backend API (or fallback)
async function getContestsData(forceRefresh = false) {
    if (!forceRefresh && cachedContests.length > 0) return cachedContests;

    if (window.ContestsAPI || window.PhotoJudgeAPI) {
        try {
            const res = window.ContestsAPI 
                ? await window.ContestsAPI.getAll()
                : await window.PhotoJudgeAPI.getContests();

            const contestList = res?.data?.contests || res?.contests;
            if (Array.isArray(contestList) && contestList.length > 0) {
                cachedContests = contestList.map(function (c) {
                    return {
                        ...c,
                        id: c.id || c.contestId || c._id
                    };
                });
                return cachedContests;
            }
        } catch (e) {
            console.warn("Failed to fetch contests from backend API. Using local fallback.", e);
        }
    }

    return fallbackContests;
}

// ==========================================
// THEME CAROUSEL
// ==========================================

async function initializeThemeCarousel() {
    const track = document.querySelector("#themeCarouselTrack");
    const progress = document.querySelector("#carouselProgress");
    if (!track || !progress) return;

    const allContests = await getContestsData();
    const carouselContests = allContests.slice(0, 6);
    if (!carouselContests.length) return;

    let currentIndex = 0;
    let autoPlay;

    track.innerHTML = carouselContests.map(function (contest, index) {
        return `
            <article class="theme-slide ${index === 0 ? "active" : ""}">
                <img src="${contest.image}" alt="${contest.title} theme photography" loading="${index === 0 ? "eager" : "lazy"}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&w=1200&q=80';">
                <div class="theme-slide-content">
                    <span class="theme-slide-category">${contest.category}</span>
                    <h2 class="theme-slide-title">${contest.title}</h2>
                    <p class="theme-slide-description">${contest.description}</p>
                </div>
            </article>
        `;
    }).join("");

    progress.innerHTML = carouselContests.map(function (_, index) {
        return `<span class="progress-dot ${index === 0 ? "active" : ""}" data-index="${index}"></span>`;
    }).join("");

    const slides = track.querySelectorAll(".theme-slide");
    const dots = progress.querySelectorAll(".progress-dot");

    function showSlide(index) {
        if (!slides.length) return;
        slides.forEach(s => s.classList.remove("active"));
        dots.forEach(d => d.classList.remove("active"));
        currentIndex = (index + slides.length) % slides.length;
        slides[currentIndex].classList.add("active");
        dots[currentIndex].classList.add("active");
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlay = setInterval(() => showSlide(currentIndex + 1), 6000);
    }

    function stopAutoPlay() {
        if (autoPlay) clearInterval(autoPlay);
    }

    const prevBtn = document.querySelector("#carouselPrev");
    const nextBtn = document.querySelector("#carouselNext");
    if (prevBtn) prevBtn.addEventListener("click", () => { showSlide(currentIndex - 1); startAutoPlay(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { showSlide(currentIndex + 1); startAutoPlay(); });

    dots.forEach(dot => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.index));
            startAutoPlay();
        });
    });

    track.addEventListener("mouseenter", stopAutoPlay);
    track.addEventListener("mouseleave", startAutoPlay);
    startAutoPlay();
}

// ==========================================
// DISPLAY CONTEST CARDS (GRID VIEW & FILTERING)
// ==========================================

async function displayContests(filterStatus) {
    const contestsContainer = document.querySelector("#contestsContainer");
    if (!contestsContainer) return;

    const savedContests = await getContestsData();

    const urlParams = new URLSearchParams(window.location.search);
    const activeFilter = filterStatus !== undefined ? filterStatus : (urlParams.get("status") || "all");

    // Update active filter button state
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(function (btn) {
        const btnFilter = btn.getAttribute("data-filter") || btn.textContent.trim().toLowerCase();
        if (btnFilter === activeFilter || (activeFilter === "all" && btnFilter.includes("all"))) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    const filteredContests = savedContests.filter(function (contest) {
        const status = (contest.status || "active").toLowerCase();
        if (activeFilter === "all") return true;
        return status === activeFilter.toLowerCase();
    });

    if (filteredContests.length === 0) {
        contestsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <p style="font-size: 1.2rem; color: var(--text-muted, #64748b);">No contests found in this category.</p>
            </div>
        `;
        return;
    }

    contestsContainer.innerHTML = "";

    filteredContests.forEach(function (contest) {
        const status = (contest.status || "active").toLowerCase();
        const statusBadgeClass = `status-${status} ${status}`;
        const card = document.createElement("article");
        card.className = "contest-card";

        const criteria = contest.criteria || { creativity: 40, technical: 30, themeFit: 30 };

        card.innerHTML = `
            <div class="contest-card-image">
                <img src="${contest.image}" alt="${contest.title} photography theme" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&w=1200&q=80';">
                <span class="contest-card-image-label">${contest.category}</span>
            </div>
            <div class="contest-card-content">
                <div class="contest-card-top">
                    <span class="contest-category">${contest.category}</span>
                    <span class="contest-status ${statusBadgeClass}">${status.toUpperCase()}</span>
                </div>
                <h2>${contest.title}</h2>
                <p>${contest.description}</p>
                <div class="contest-card-meta">
                    <div>
                        <strong>Status</strong>
                        <span>${status.toUpperCase()}</span>
                    </div>
                    <div>
                        <strong>Deadline</strong>
                        <span>${new Date(contest.deadline).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <strong>Max Entries</strong>
                        <span>${contest.maxSubmissions || 3} Photos</span>
                    </div>
                </div>
                <div class="contest-weights">
                    <p><strong>Judging Weights</strong></p>
                    <span>Creativity: ${criteria.creativity}%</span>
                    <span>Technical: ${criteria.technical}%</span>
                    <span>Theme Fit: ${criteria.themeFit}%</span>
                </div>
                <a href="contest-details.html?id=${encodeURIComponent(contest.id)}" class="contest-view-btn">
                    View Contest Details →
                </a>
            </div>
        `;

        contestsContainer.appendChild(card);
    });
}

// ==========================================
// DISPLAY CONTEST DETAILS
// ==========================================

async function displayContestDetails() {
    const container = document.querySelector("#contestDetailsContainer");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const contestId = params.get("id");

    const savedContests = await getContestsData();
    let contest = savedContests.find(item => item.id === contestId || item.contestId === contestId);

    if (!contest && (window.ContestsAPI || window.PhotoJudgeAPI) && contestId) {
        try {
            const apiRes = window.ContestsAPI 
                ? await window.ContestsAPI.getById(contestId)
                : await window.PhotoJudgeAPI.getContest(contestId);
            const found = apiRes?.data?.contest || apiRes?.contest;
            if (found) {
                contest = { ...found, id: found.id || found.contestId || found._id };
            }
        } catch (e) {
            console.warn("Failed to fetch contest detail:", e);
        }
    }

    if (!contest) {
        container.innerHTML = `
            <div class="contest-detail-card" style="text-align:center;">
                <div class="detail-content">
                    <h1>Contest Not Found</h1>
                    <p class="contest-description">The contest you are looking for does not exist or has been removed.</p>
                    <a href="contests.html" class="contest-submit-btn">Back to Contests</a>
                </div>
            </div>
        `;
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const status = (contest.status || "active").toLowerCase();
    let actionBtnHTML;

    if (status === "active") {
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
    } else if (status === "completed") {
        actionBtnHTML = `
            <div class="contest-submit-btn" style="opacity:.7; cursor:not-allowed; text-align:center; background:#64748b;">
                Submissions Closed (COMPLETED)
            </div>
        `;
    } else {
        actionBtnHTML = `
            <div class="contest-submit-btn" style="opacity:.65; cursor:not-allowed; text-align:center;">
                Submissions Open Soon (${status.toUpperCase()})
            </div>
        `;
    }

    const criteria = contest.criteria || { creativity: 40, technical: 30, themeFit: 30 };

    container.innerHTML = `
        <div class="contest-detail-card">
            <div class="detail-theme-image">
                <img src="${contest.image}" alt="${contest.title} photography theme" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&w=1200&q=80';">
                <div class="detail-theme-caption">
                    <small>${contest.category} competition</small>
                    <strong>Explore the theme through your lens</strong>
                </div>
            </div>
            <div class="detail-content">
                <span class="eyebrow" style="color:var(--accent-gold-dark, #d97706); font-weight:800;">
                    ${contest.category.toUpperCase()} COMPETITION
                </span>
                <h1>${contest.title}</h1>
                <p class="contest-description">${contest.description}</p>
                <div class="contest-detail-meta">
                    <div>
                        <strong>Status</strong>
                        <span style="font-weight:700;">${status.toUpperCase()}</span>
                    </div>
                    <div>
                        <strong>Submission Deadline</strong>
                        <span>${new Date(contest.deadline).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <strong>Max Submissions</strong>
                        <span>${contest.maxSubmissions || 3} per Photographer</span>
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
                            <strong>${criteria.creativity}%</strong>
                            <span>Creativity & Storytelling</span>
                        </div>
                        <div>
                            <strong>${criteria.technical}%</strong>
                            <span>Technical Quality & Composition</span>
                        </div>
                        <div>
                            <strong>${criteria.themeFit}%</strong>
                            <span>Theme Fit & Interpretation</span>
                        </div>
                    </div>
                </section>
                ${actionBtnHTML}
            </div>
        </div>
    `;
}

// ==========================================
// INITIALIZERS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    initializeThemeCarousel();
    displayContests();
    displayContestDetails();

    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            const filter = btn.getAttribute("data-filter") || "all";
            displayContests(filter);
        });
    });
});