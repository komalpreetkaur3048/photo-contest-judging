/* =========================================================
   PHOTOJUDGE — OFFICIAL LEADERBOARD & AWARDS ENGINE
   Powered by MongoDB Atlas & Statistical Bias-Normalization
========================================================= */

// DOM Elements
const leaderboardContainer = document.querySelector("#leaderboardContainer");
const emptyLeaderboard = document.querySelector("#emptyLeaderboard");
const podiumSection = document.querySelector("#podiumSection");
const podium = document.querySelector("#podium");
const entryCount = document.querySelector("#entryCount");
const judgeCount = document.querySelector("#judgeCount");
const leaderboardStatus = document.querySelector("#leaderboardStatus");
const leaderboardContestName = document.querySelector("#leaderboardContestName");
const leaderboardCriteria = document.querySelector("#leaderboardCriteria");
const contestFilterSelect = document.querySelector("#contestFilterSelect");

// URL query parameter for pre-filtering
const urlParams = new URLSearchParams(window.location.search);
let currentContestFilter = urlParams.get("contestId") || "all";

// Cache contests
let contestCache = [];

/**
 * Load available contests into dropdown filter
 */
async function initializeContestFilter() {
    if (!contestFilterSelect) return;

    try {
        if (window.PhotoJudgeAPI) {
            const res = await window.PhotoJudgeAPI.getContests();
            contestCache = res?.contests || res?.data?.contests || [];
        }
    } catch (e) {
        console.warn("Could not fetch contests for leaderboard filter:", e);
    }

    if (!contestCache.length) {
        try {
            contestCache = JSON.parse(localStorage.getItem("contests")) || [];
        } catch (e) {
            contestCache = [];
        }
    }

    // Populate dropdown
    contestFilterSelect.innerHTML = `<option value="all">🏆 All Contests (Global Rankings)</option>`;
    
    contestCache.forEach(function (contest) {
        const cId = contest.id || contest.contestId || contest._id;
        const statusLabel = contest.status === "completed" ? " [Completed]" : (contest.status === "active" ? " [Active]" : "");
        contestFilterSelect.innerHTML += `
            <option value="${cId}">
                ${contest.title}${statusLabel}
            </option>
        `;
    });

    if (currentContestFilter && currentContestFilter !== "all") {
        contestFilterSelect.value = currentContestFilter;
    }

    contestFilterSelect.addEventListener("change", function () {
        currentContestFilter = contestFilterSelect.value;
        loadLeaderboard(currentContestFilter);
    });
}

/**
 * Fetch and render bias-normalized rankings
 */
async function loadLeaderboard(contestId = "all") {
    if (leaderboardStatus) {
        leaderboardStatus.textContent = "Calculating normalized rankings...";
    }

    // Update Header Contest Name & Criteria
    if (contestId === "all") {
        if (leaderboardContestName) leaderboardContestName.textContent = "All Competitions";
        if (leaderboardCriteria) leaderboardCriteria.textContent = "Multi-Criteria Normalized";
    } else {
        const found = contestCache.find(c => 
            String(c.id) === String(contestId) || 
            String(c._id) === String(contestId)
        );
        if (found) {
            if (leaderboardContestName) leaderboardContestName.textContent = found.title;
            if (leaderboardCriteria && found.criteria) {
                leaderboardCriteria.textContent = `${found.criteria.creativity || 40}% · ${found.criteria.technical || 30}% · ${found.criteria.themeFit || found.criteria.theme || 30}%`;
            }
        }
    }

    let leaderboardData = null;

    try {
        if (window.PhotoJudgeAPI) {
            const res = await window.PhotoJudgeAPI.getLeaderboard(contestId);
            if (res && res.success && Array.isArray(res.rankings) && res.rankings.length > 0) {
                leaderboardData = res;
            }
        }
    } catch (err) {
        console.warn("Failed to fetch live leaderboard from API:", err);
    }

    // Fallback calculation from local cache if API failed, offline, or returned 0 entries
    if (!leaderboardData || !leaderboardData.rankings || leaderboardData.rankings.length === 0) {
        const localData = computeLocalFallbackLeaderboard(contestId);
        if (localData && localData.rankings && localData.rankings.length > 0) {
            leaderboardData = localData;
        } else if (!leaderboardData) {
            leaderboardData = localData;
        }
    }

    renderLeaderboardView(leaderboardData);
}

/**
 * Render podium, rankings table, and statistics
 */
function renderLeaderboardView(data) {
    const rankings = data?.rankings || [];
    const podiumItems = data?.podium || rankings.slice(0, 3);
    const totalRanked = data?.totalRanked || rankings.length;
    const totalJudges = data?.totalJudges || (data?.overallMean ? 3 : 0);

    if (entryCount) entryCount.textContent = totalRanked;
    if (judgeCount) judgeCount.textContent = totalJudges;

    if (leaderboardStatus) {
        leaderboardStatus.textContent = totalRanked > 0 
            ? `✓ ${totalRanked} evaluated ${totalRanked === 1 ? "entry" : "entries"} normalized`
            : "Awaiting juror evaluations";
    }

    // Empty State Check
    if (rankings.length === 0) {
        if (podiumSection) podiumSection.style.display = "none";
        if (leaderboardContainer) leaderboardContainer.style.display = "none";
        if (emptyLeaderboard) {
            emptyLeaderboard.style.display = "block";
            emptyLeaderboard.innerHTML = `
                <div class="empty-icon">◇</div>
                <h2>No Official Rankings Yet</h2>
                <p>
                    Rankings will appear once photographs for this contest have been submitted and evaluated by the jury.
                </p>
                <a href="submit.html${currentContestFilter !== "all" ? `?contestId=${encodeURIComponent(currentContestFilter)}` : ""}" class="btn primary-btn" style="display: inline-block; margin-top: 18px; padding: 12px 24px; background: #0f172a; color: #fff; border-radius: var(--radius-sm); text-decoration: none; font-weight: 700;">
                    Submit a Photograph →
                </a>
            `;
        }
        return;
    }

    if (emptyLeaderboard) emptyLeaderboard.style.display = "none";
    if (leaderboardContainer) leaderboardContainer.style.display = "flex";

    // 1. Render Podium (Top 3)
    if (podium && podiumSection) {
        if (podiumItems.length > 0) {
            podiumSection.style.display = "block";

            // Visual podium order: 2nd place (left), 1st place (center), 3rd place (right)
            let orderedPodium = [];
            if (podiumItems.length >= 3) {
                orderedPodium = [podiumItems[1], podiumItems[0], podiumItems[2]];
            } else {
                orderedPodium = podiumItems;
            }

            podium.innerHTML = orderedPodium.map(function (item) {
                const rankNum = item.rank || 1;
                const rankClass = rankNum === 1 ? "first" : (rankNum === 2 ? "second" : "third");
                const entryIdStr = String(item.id || item._id || item.entryId);

                return `
                    <article class="podium-card ${rankClass}">
                        <span class="rank-badge ${rankClass}">
                            ${rankNum === 1 ? "1" : (rankNum === 2 ? "2" : "3")}
                        </span>

                        <div class="podium-image">
                            <img src="${item.image}" alt="${item.title}" loading="lazy">
                        </div>

                        <div class="podium-content">
                            <span style="font-size: 0.72rem; font-weight: 800; letter-spacing: 1.5px; color: var(--accent-gold-dark); text-transform: uppercase; display: block; margin-bottom: 4px;">
                                ${item.contestTitle || "PHOTO CONTEST"}
                            </span>

                            <h3>${item.title}</h3>
                            <p class="participant-name">By <strong>${item.participantName}</strong></p>

                            <div class="final-score">
                                <span class="final-score-number">${Number(item.finalScore).toFixed(2)}</span>
                                <span class="final-score-label">/ 10</span>
                            </div>

                            <a href="result.html?id=${entryIdStr}" style="margin-top: 16px; width: 100%; text-align: center; font-size: 0.84rem; padding: 10px 14px; background: #0f172a; color: #ffffff; border-radius: var(--radius-sm); text-decoration: none; display: block; font-weight: 700; transition: background 0.2s;">
                                View Detailed Evaluation →
                            </a>
                        </div>
                    </article>
                `;
            }).join("");
        } else {
            podiumSection.style.display = "none";
        }
    }

    // 2. Render Full Standings Table
    if (leaderboardContainer) {
        leaderboardContainer.innerHTML = rankings.map(function (item) {
            const entryIdStr = String(item.id || item._id || item.entryId);
            const isTop3 = item.rank <= 3;

            return `
                <article class="ranking-row">
                    <div class="ranking-position ${isTop3 ? "top" : ""}">
                        #${item.rank}
                    </div>

                    <div class="ranking-thumbnail">
                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                    </div>

                    <div class="ranking-info">
                        <span style="font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; color: var(--accent-gold-dark); text-transform: uppercase;">
                            ${item.contestTitle || "Photo Contest"}
                        </span>
                        <h3>${item.title}</h3>
                        <p>
                            By <strong>${item.participantName}</strong> · 
                            ${item.scoresCount || 1} Juror ${(item.scoresCount || 1) === 1 ? "Score" : "Scores"} Recorded
                        </p>
                    </div>

                    <div class="ranking-score">
                        <span class="ranking-score-number">${Number(item.finalScore).toFixed(2)}</span>
                        <span class="ranking-score-label">Normalized / 10</span>
                        <a href="result.html?id=${entryIdStr}" style="display: inline-block; margin-top: 6px; font-size: 0.78rem; font-weight: 700; color: var(--accent-gold-dark); text-decoration: none;">
                            Evaluation Details →
                        </a>
                    </div>
                </article>
            `;
        }).join("");
    }
}

/**
 * Local calculation fallback for offline demo
 */
function computeLocalFallbackLeaderboard(contestId) {
    let entries = [];
    let scores = [];
    let contests = [];

    try {
        entries = JSON.parse(localStorage.getItem("photoEntries")) || [];
        scores = JSON.parse(localStorage.getItem("judgeScores")) || [];
        contests = JSON.parse(localStorage.getItem("contests")) || [];
    } catch (e) {}

    if (contestId && contestId !== "all") {
        entries = entries.filter(e => String(e.contestId) === String(contestId));
    }

    const contestMap = {};
    contests.forEach(c => { contestMap[c.id || c._id] = c; });

    const ranked = [];
    entries.forEach(entry => {
        const entryScores = scores.filter(s => String(s.entryId) === String(entry.id || entry._id));
        if (entryScores.length > 0) {
            const sum = entryScores.reduce((acc, s) => acc + Number(s.weightedScore || 0), 0);
            const avg = Number((sum / entryScores.length).toFixed(2));
            const c = contestMap[entry.contestId];
            ranked.push({
                ...entry,
                id: entry.id || entry._id,
                contestTitle: c ? c.title : "Photo Contest",
                finalScore: avg,
                scoresCount: entryScores.length
            });
        }
    });

    ranked.sort((a, b) => b.finalScore - a.finalScore);
    ranked.forEach((r, idx) => { r.rank = idx + 1; });

    return {
        success: true,
        totalRanked: ranked.length,
        totalJudges: 3,
        podium: ranked.slice(0, 3),
        rankings: ranked
    };
}

// Initializer
document.addEventListener("DOMContentLoaded", async function () {
    await initializeContestFilter();
    loadLeaderboard(currentContestFilter);
});

// Direct execution
initializeContestFilter().then(() => loadLeaderboard(currentContestFilter));
