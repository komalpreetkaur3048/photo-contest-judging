/* =========================================================
   PHOTOJUDGE — SCORE ENGINE
========================================================= */

// ==========================================
// GET LOGGED-IN USER
// ==========================================

const currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );

const currentJudge =
    currentUser ? String(currentUser._id || currentUser.id) : null;

if (!currentUser || currentUser.role !== "judge") {
    window.location.href = "login.html";
}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const scoreImage =
    document.querySelector("#scoreImage");

const scorePhotoTitle =
    document.querySelector("#scorePhotoTitle");

const scoreParticipant =
    document.querySelector("#scoreParticipant");

const scoreDescription =
    document.querySelector("#scoreDescription");

const creativity =
    document.querySelector("#creativity");

const technical =
    document.querySelector("#technical");

const theme =
    document.querySelector("#theme");

const creativityValue =
    document.querySelector("#creativityValue");

const technicalValue =
    document.querySelector("#technicalValue");

const themeValue =
    document.querySelector("#themeValue");

const weightedScore =
    document.querySelector("#weightedScore");

const submitScoreBtn =
    document.querySelector("#submitScoreBtn");

const scoreMessage =
    document.querySelector("#scoreMessage");

const scoreStatus =
    document.querySelector("#scoreStatus");


/* =========================================================
   GET ENTRY ID FROM URL & LOAD ENTRY ASYNC
========================================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const entryId =
    urlParams.get("id");

let entry = null;
let contest = null;

const TOTAL_JUDGES = 3;

let WEIGHTS = {
    creativity: 0.40,
    technical: 0.30,
    theme: 0.30
};

async function loadEntryAndContest() {
    let entries = JSON.parse(localStorage.getItem("photoEntries")) || [];
    
    // Find entry in local storage first
    entry = entries.find(function (item) {
        return String(item._id || item.id) === String(entryId);
    });

    // If not found in localStorage, fetch from Backend API
    if (!entry && window.EntriesAPI && entryId && entryId !== "undefined") {
        try {
            const apiRes = await window.EntriesAPI.getById(entryId);
            if (apiRes && apiRes.data && apiRes.data.entry) {
                entry = apiRes.data.entry;
                entries.push(entry);
                localStorage.setItem("photoEntries", JSON.stringify(entries));
            }
        } catch (e) {
            console.warn("Could not load entry from API:", e);
        }
    }

    // Resolve Contest & Criteria Weights
    if (entry) {
        let contests = JSON.parse(localStorage.getItem("contests")) || [];
        contest = contests.find(function (c) {
            return String(c.id || c._id) === String(entry.contestId);
        });

        if (!contest && window.ContestsAPI) {
            try {
                const cRes = await window.ContestsAPI.getAll();
                const list = cRes?.data?.contests || cRes?.contests || [];
                contest = list.find(c => String(c.id || c._id) === String(entry.contestId));
            } catch (e) {
                console.warn("Could not load contests from API:", e);
            }
        }

        const criteria = contest?.criteria || {
            creativity: 40,
            technical: 30,
            themeFit: 30
        };

        WEIGHTS = {
            creativity: (criteria.creativity || 40) / 100,
            technical: (criteria.technical || 30) / 100,
            theme: (criteria.themeFit || criteria.theme || 30) / 100
        };
    }

    displayEntry();
    updateScoreDisplay();
    updateJudgingStatus();
    checkSelectedJudge();
}


/* =========================================================
   LOAD EXISTING JUDGE SCORES
========================================================= */

function getJudgeScores() {
    return JSON.parse(
        localStorage.getItem("judgeScores")
    ) || [];
}


/* =========================================================
   DISPLAY ENTRY
========================================================= */

function displayEntry() {
    if (!entry) {
        if (scorePhotoTitle) scorePhotoTitle.textContent = "Submission not found";
        if (scoreDescription) scoreDescription.textContent = "The photograph you are trying to evaluate could not be found or has an invalid ID.";
        if (submitScoreBtn) submitScoreBtn.disabled = true;
        if (scoreMessage) {
            scoreMessage.textContent = "Invalid photograph submission.";
            scoreMessage.className = "score-message error";
        }
        return;
    }

    if (scoreImage) {
        scoreImage.src = entry.image;
        scoreImage.alt = entry.title || "Submitted photograph";
    }

    if (scorePhotoTitle) {
        scorePhotoTitle.textContent = entry.title || "Untitled Photograph";
    }

    if (scoreParticipant) {
        scoreParticipant.textContent = entry.participantName || "Anonymous";
    }

    if (scoreDescription) {
        scoreDescription.textContent = entry.description || "No description provided.";
    }
}


/* =========================================================
   GET JUDGES WHO HAVE ALREADY SCORED THIS PHOTO
========================================================= */

function getJudgesForEntry() {
    if (!entry) return [];
    const actualEntryId = String(entry._id || entry.id || entryId);
    const scores = getJudgeScores();

    return scores
        .filter(function (score) {
            return String(score.entryId) === actualEntryId;
        })
        .map(function (score) {
            return String(score.judgeId);
        });
}


/* =========================================================
   UPDATE JUDGING STATUS
========================================================= */

function updateJudgingStatus(skipCheckJudge = false) {
    if (!entry) {
        return;
    }

    const judgedBy = [...new Set(getJudgesForEntry())];
    const numberOfJudges = Math.max(judgedBy.length, Number(entry.judgesCompleted || 0));

    if (numberOfJudges >= TOTAL_JUDGES || entry.judgingStatus === "ranked" || entry.isRanked) {
        if (scoreStatus) {
            scoreStatus.textContent = "✓ All 3 judges have completed their evaluations.";
            scoreStatus.className = "score-status success";
        }
        if (submitScoreBtn) submitScoreBtn.disabled = true;
        return;
    }

    if (scoreStatus) {
        scoreStatus.textContent = `${numberOfJudges} of ${TOTAL_JUDGES} judges have completed this evaluation.`;
        scoreStatus.className = "score-status";
    }

    if (!skipCheckJudge) {
        checkSelectedJudge();
    }
}


/* =========================================================
   CHECK SELECTED JUDGE (SELF-JUDGING & DUPLICATE CHECKS)
========================================================= */

function checkSelectedJudge() {
    if (!entry) {
        return;
    }

    const actualEntryId = String(entry._id || entry.id || entryId);

    if (!currentJudge) {
        if (submitScoreBtn) submitScoreBtn.disabled = true;
        if (scoreMessage) {
            scoreMessage.textContent = "Judge identity not found. Please log in again.";
            scoreMessage.className = "score-message error";
        }
        return;
    }

    // Check Self-Judging
    if (String(entry.participantId) === currentJudge) {
        if (submitScoreBtn) submitScoreBtn.disabled = true;
        if (scoreMessage) {
            scoreMessage.textContent = "Judges are not permitted to evaluate their own submissions.";
            scoreMessage.className = "score-message error";
        }
        return;
    }

    const scores = getJudgeScores();
    const alreadyScored = scores.some(function (score) {
        return String(score.entryId) === actualEntryId && String(score.judgeId) === currentJudge;
    });

    if (alreadyScored) {
        if (submitScoreBtn) submitScoreBtn.disabled = true;
        if (scoreMessage) {
            scoreMessage.textContent = "You have already evaluated this photograph.";
            scoreMessage.className = "score-message error";
        }
        return;
    }

    if (submitScoreBtn) submitScoreBtn.disabled = false;
    if (scoreMessage) {
        scoreMessage.textContent = "";
        scoreMessage.className = "score-message";
    }
}


/* =========================================================
   CALCULATE WEIGHTED SCORE
========================================================= */

function calculateWeightedScore() {
    const creativityScore = creativity ? Number(creativity.value) : 5;
    const technicalScore = technical ? Number(technical.value) : 5;
    const themeScore = theme ? Number(theme.value) : 5;

    const finalScore =
        (creativityScore * WEIGHTS.creativity) +
        (technicalScore * WEIGHTS.technical) +
        (themeScore * WEIGHTS.theme);

    if (weightedScore) {
        weightedScore.textContent = finalScore.toFixed(2);
    }

    return finalScore;
}


/* =========================================================
   UPDATE SLIDER VALUES
========================================================= */

function updateScoreDisplay() {
    if (creativityValue && creativity) {
        creativityValue.textContent = creativity.value;
    }

    if (technicalValue && technical) {
        technicalValue.textContent = technical.value;
    }

    if (themeValue && theme) {
        themeValue.textContent = theme.value;
    }

    calculateWeightedScore();
}


/* =========================================================
   SAVE JUDGE SCORE
========================================================= */

async function saveJudgeScore() {
    if (!entry) {
        return;
    }

    const actualEntryId = String(entry._id || entry.id || entryId);

    if (!currentJudge) {
        if (scoreMessage) {
            scoreMessage.textContent = "Judge identity not found.";
            scoreMessage.className = "score-message error";
        }
        return;
    }

    // Prevent Self-Judging
    if (String(entry.participantId) === currentJudge) {
        if (scoreMessage) {
            scoreMessage.textContent = "Judges are not permitted to evaluate their own submissions.";
            scoreMessage.className = "score-message error";
        }
        if (submitScoreBtn) submitScoreBtn.disabled = true;
        return;
    }

    const scores = getJudgeScores();

    // Prevent duplicate score
    const duplicate = scores.some(function (score) {
        return String(score.entryId) === actualEntryId && String(score.judgeId) === currentJudge;
    });

    if (duplicate) {
        if (scoreMessage) {
            scoreMessage.textContent = "You have already scored this photograph.";
            scoreMessage.className = "score-message error";
        }
        if (submitScoreBtn) submitScoreBtn.disabled = true;
        return;
    }

    const creativityScore = creativity ? Number(creativity.value) : 5;
    const technicalScore = technical ? Number(technical.value) : 5;
    const themeScore = theme ? Number(theme.value) : 5;

    const finalScore =
        (creativityScore * WEIGHTS.creativity) +
        (technicalScore * WEIGHTS.technical) +
        (themeScore * WEIGHTS.theme);

    if (submitScoreBtn) {
        submitScoreBtn.disabled = true;
        submitScoreBtn.textContent = "Submitting Evaluation...";
    }

    // 1. Submit to Backend API if token is present
    if (typeof ScoresAPI !== "undefined" && localStorage.getItem("token")) {
        try {
            const apiRes = await ScoresAPI.submit({
                entryId: actualEntryId,
                creativity: creativityScore,
                technical: technicalScore,
                theme: themeScore
            });

            if (apiRes && !apiRes.ok && apiRes.data && apiRes.data.message) {
                if (scoreMessage) {
                    scoreMessage.textContent = apiRes.data.message;
                    scoreMessage.className = "score-message error";
                }
                if (submitScoreBtn) {
                    submitScoreBtn.disabled = false;
                    submitScoreBtn.textContent = "Submit Evaluation";
                }
                return;
            }
        } catch (apiErr) {
            console.warn("Backend score submit error:", apiErr);
        }
    }

    // 2. Save locally in judgeScores
    const scoreData = {
        id: Date.now(),
        entryId: actualEntryId,
        judgeId: currentJudge,
        judgeName: currentUser.name || "Judge",
        creativity: creativityScore,
        technical: technicalScore,
        theme: themeScore,
        weightedScore: Number(finalScore.toFixed(2)),
        judgedAt: new Date().toISOString()
    };

    scores.push(scoreData);
    localStorage.setItem("judgeScores", JSON.stringify(scores));

    // 3. Update Photo Entry State in localStorage
    let photoEntries = JSON.parse(localStorage.getItem("photoEntries")) || [];
    const targetEntry = photoEntries.find(function (p) {
        return String(p._id || p.id) === actualEntryId;
    });

    if (targetEntry) {
        const entryScores = scores.filter(function (s) {
            return String(s.entryId) === actualEntryId;
        });

        targetEntry.judgesCompleted = entryScores.length;
        if (entryScores.length >= TOTAL_JUDGES) {
            targetEntry.judgingStatus = "ranked";
            targetEntry.isRanked = true;
        } else if (entryScores.length > 0) {
            targetEntry.judgingStatus = "judging";
        }
        localStorage.setItem("photoEntries", JSON.stringify(photoEntries));
    }

    updateJudgingStatus(true);

    if (scoreMessage) {
        scoreMessage.textContent = "✓ Evaluation submitted successfully! Redirecting to dashboard...";
        scoreMessage.className = "score-message success";
    }

    if (submitScoreBtn) {
        submitScoreBtn.textContent = "✓ Evaluation Submitted";
        submitScoreBtn.disabled = true;
    }

    setTimeout(function () {
        window.location.href = "judge.html";
    }, 1200);
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

if (creativity) {
    creativity.addEventListener("input", updateScoreDisplay);
}

if (technical) {
    technical.addEventListener("input", updateScoreDisplay);
}

if (theme) {
    theme.addEventListener("input", updateScoreDisplay);
}

if (submitScoreBtn) {
    submitScoreBtn.addEventListener("click", saveJudgeScore);
}

const currentJudgeName = document.querySelector("#currentJudgeName");
const currentJudgeTitle = document.querySelector("#currentJudgeTitle");

if (currentUser) {
    if (currentJudgeName) {
        currentJudgeName.textContent = currentUser.name;
    }
    if (currentJudgeTitle) {
        currentJudgeTitle.textContent = currentUser.specialization || "Official Contest Judge";
    }
}


/* =========================================================
   INITIALIZE
========================================================= */

loadEntryAndContest();