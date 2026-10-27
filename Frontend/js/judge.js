/* =========================================================
   PHOTOJUDGE — JUDGE DASHBOARD
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

const judgeEntriesContainer =
    document.querySelector("#judgeEntriesContainer");

const noJudgeEntries =
    document.querySelector("#noJudgeEntries");

const currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );

const currentJudgeName =
    document.querySelector("#currentJudgeName");


if (!currentUser || currentUser.role !== "judge") {

    window.location.href = "login.html";

}

/* =========================================================
   JUDGE CONFIGURATION
========================================================= */

const TOTAL_JUDGES = 3;

const JUDGES = {

    judge1: "Judge 1",

    judge2: "Judge 2",

    judge3: "Judge 3"

};


/* =========================================================
   GET CURRENT JUDGE
========================================================= */

function getCurrentJudge() {

    if (!currentUser) {
        return null;
    }

    return currentUser.id;
}


/* =========================================================
   UPDATE JUDGE DISPLAY
========================================================= */

function updateJudgeDisplay() {

    if (currentUser) {

        if (currentJudgeName) {
            currentJudgeName.textContent =
                currentUser.name;
        }

        const currentJudgeTitle =
            document.querySelector("#currentJudgeTitle");

        if (currentJudgeTitle) {
            currentJudgeTitle.textContent =
                currentUser.specialization || "Official Contest Judge";
        }

    }

}





/* =========================================================
   GET ALL PHOTO ENTRIES (API + LOCALSTORAGE SYNC)
========================================================= */

let liveEntriesCache = [];
let liveScoresCache = [];

async function syncDataWithBackend() {
    // 1. Fetch live entries from backend API
    if (window.PhotoJudgeAPI) {
        try {
            const res = await window.PhotoJudgeAPI.getEntries();
            const list = res?.entries || res?.data?.entries || res;
            if (Array.isArray(list) && list.length > 0) {
                liveEntriesCache = list.map(e => ({
                    ...e,
                    id: String(e._id || e.id),
                    _id: String(e._id || e.id)
                }));
                localStorage.setItem("photoEntries", JSON.stringify(liveEntriesCache));
            }
        } catch (e) {
            console.warn("Could not fetch entries from API:", e);
        }
    }

    if (!liveEntriesCache.length) {
        liveEntriesCache = JSON.parse(localStorage.getItem("photoEntries")) || [];
    }

    // 2. Fetch live scores from backend API
    if (window.ScoresAPI) {
        try {
            const res = await window.ScoresAPI.getAll();
            const list = res?.data?.scores || res?.scores || [];
            if (Array.isArray(list) && list.length > 0) {
                // Merge API scores with any local-only scores
                const localScores = JSON.parse(localStorage.getItem("judgeScores")) || [];
                const mergedMap = new Map();
                localScores.forEach(s => {
                    const key = `${s.entryId}_${s.judgeId}`;
                    mergedMap.set(key, s);
                });
                list.forEach(s => {
                    const key = `${s.entryId}_${s.judgeId}`;
                    mergedMap.set(key, s);
                });
                liveScoresCache = Array.from(mergedMap.values());
                localStorage.setItem("judgeScores", JSON.stringify(liveScoresCache));
            }
        } catch (e) {
            console.warn("Could not fetch scores from API:", e);
        }
    }

    if (!liveScoresCache.length) {
        liveScoresCache = JSON.parse(localStorage.getItem("judgeScores")) || [];
    }
}

function getEntries() {
    if (liveEntriesCache.length > 0) return liveEntriesCache;
    return JSON.parse(
        localStorage.getItem("photoEntries")
    ) || [];
}

/* =========================================================
   GET ALL JUDGE SCORES
========================================================= */

function getJudgeScores() {
    if (liveScoresCache.length > 0) return liveScoresCache;
    return JSON.parse(
        localStorage.getItem("judgeScores")
    ) || [];
}

/* =========================================================
   GET SCORES FOR ONE ENTRY
========================================================= */

function getScoresForEntry(entryId) {
    const scores = getJudgeScores();
    return scores.filter(
        function (score) {
            return String(score.entryId) === String(entryId);
        }
    );
}

/* =========================================================
   GET UNIQUE JUDGES WHO SCORED
========================================================= */

function getJudgesWhoScored(entryId) {
    const scores = getScoresForEntry(entryId);
    const judgeIds = scores
        .map(function (score) {
            return score.judgeId;
        })
        .filter(Boolean);

    return [...new Set(judgeIds.map(String))];
}

/* =========================================================
   GET JUDGING PROGRESS
========================================================= */

function getJudgingProgress(entry) {
    const entryId = String(entry._id || entry.id);
    const judgeIds = getJudgesWhoScored(entryId);
    
    // Check both unique scores and entry.judgesCompleted
    const count = Math.max(judgeIds.length, Number(entry.judgesCompleted || 0));
    const isComplete = count >= TOTAL_JUDGES || entry.judgingStatus === "ranked" || entry.isRanked === true;

    return {
        completed: Math.min(count, TOTAL_JUDGES),
        total: TOTAL_JUDGES,
        isComplete: isComplete
    };
}

/* =========================================================
   CHECK WHETHER CURRENT JUDGE ALREADY SCORED
========================================================= */

function hasCurrentJudgeScored(entryId) {
    const currentJudge = getCurrentJudge();
    if (!currentJudge) return false;

    const scores = getScoresForEntry(entryId);
    return scores.some(
        function (score) {
            return String(score.judgeId) === String(currentJudge);
        }
    );
}

/* =========================================================
   CREATE ENTRY CARD
========================================================= */

function createJudgeCard(entry) {
    const entryId = String(entry._id || entry.id);
    const progress = getJudgingProgress(entry);
    const alreadyScored = hasCurrentJudgeScored(entryId);

    const card = document.createElement("article");
    card.className = "judge-card";

    /* =====================================================
       STATUS
    ====================================================== */

    let statusHTML;

    if (progress.isComplete) {
        statusHTML = `
            <span class="judging-status status-complete">
                Evaluation Complete
            </span>
        `;
    } else {
        statusHTML = `
            <span class="judging-status status-pending">
                Pending (${progress.completed}/${TOTAL_JUDGES})
            </span>
        `;
    }

    /* =====================================================
       SCORE ACTION
    ====================================================== */

    let actionHTML;

    if (progress.isComplete) {
        actionHTML = `
            <div class="completed-message" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; margin-bottom: 10px;">
                ✓ All 3 judges have evaluated this photo
            </div>
            <div style="display:flex; gap:10px; margin-top:8px;">
                <a href="result.html?id=${encodeURIComponent(entryId)}" style="flex:1; text-align:center; padding:9px 12px; background:#f1f5f9; color:#334155; border-radius:6px; font-weight:700; text-decoration:none; font-size:0.84rem;">
                    View Evaluation
                </a>
                <a href="leaderboard.html" style="flex:1; text-align:center; padding:9px 12px; background:#0f172a; color:#fff; border-radius:6px; font-weight:700; text-decoration:none; font-size:0.84rem;">
                    Leaderboard →
                </a>
            </div>
        `;
    } else if (
        currentUser &&
        String(entry.participantId) === String(currentUser._id || currentUser.id)
    ) {
        actionHTML = `
            <div class="completed-message" style="background:#fef3c7;color:#92400e;border:1px solid #fde68a;">
                Your submission (Self-judging disabled)
            </div>
        `;
    } else if (alreadyScored) {
        actionHTML = `
            <div class="completed-message" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe;">
                ✓ Your evaluation has been submitted (${progress.completed}/3 judges)
            </div>
        `;
    } else {
        actionHTML = `
            <a
                href="score.html?id=${encodeURIComponent(entryId)}"
                class="score-btn"
            >
                Score This Photo →
            </a>
        `;
    }

    /* =====================================================
       CARD HTML
    ====================================================== */

    const percentage = (progress.completed / TOTAL_JUDGES) * 100;

    card.innerHTML = `
        <div class="judge-image-wrapper">
            <img
                src="${entry.image}"
                alt="${escapeHTML(entry.title || "Submitted photograph")}"
            >
        </div>

        <div class="judge-card-content">
            <div class="judge-card-top">
                <h2>
                    ${escapeHTML(entry.title || "Untitled Photograph")}
                </h2>
                ${statusHTML}
            </div>

            <p class="participant-name">
                By
                <strong>
                    ${escapeHTML(entry.participantName || "Anonymous")}
                </strong>
            </p>

            <p class="judge-description">
                ${escapeHTML(entry.description || "No description provided.")}
            </p>

            <!-- Judging Progress -->
            <div class="judging-progress">
                <div class="progress-header">
                    <span class="progress-label">
                        Judging Progress
                    </span>
                    <span class="progress-count">
                        ${progress.completed}/${TOTAL_JUDGES}
                    </span>
                </div>

                <div class="progress-track">
                    <div
                        class="progress-bar"
                        style="width: ${percentage}%"
                    >
                    </div>
                </div>
            </div>

            ${actionHTML}
        </div>
    `;

    return card;
}

/* =========================================================
   DISPLAY ENTRIES
========================================================= */

async function displayJudgeEntries() {
    if (!judgeEntriesContainer) {
        return;
    }

    judgeEntriesContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); grid-column: 1 / -1;">
            <p>Loading photograph submissions & juror evaluations...</p>
        </div>
    `;

    await syncDataWithBackend();

    const entries = getEntries();

    /* =====================================================
       NO ENTRIES
    ====================================================== */

    if (entries.length === 0) {
        judgeEntriesContainer.innerHTML = "";
        if (noJudgeEntries) {
            noJudgeEntries.style.display = "block";
        }
        return;
    }

    /* =====================================================
       ENTRIES AVAILABLE
    ====================================================== */

    if (noJudgeEntries) {
        noJudgeEntries.style.display = "none";
    }

    judgeEntriesContainer.innerHTML = "";

    entries.forEach(function (entry) {
        const card = createJudgeCard(entry);
        judgeEntriesContainer.appendChild(card);
    });
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

/* =========================================================
   INITIALIZE
========================================================= */

updateJudgeDisplay();
displayJudgeEntries();