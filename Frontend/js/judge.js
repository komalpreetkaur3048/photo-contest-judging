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
   GET ALL PHOTO ENTRIES
========================================================= */

function getEntries() {

    return JSON.parse(
        localStorage.getItem("photoEntries")
    ) || [];

}


/* =========================================================
   GET ALL JUDGE SCORES
========================================================= */

function getJudgeScores() {

    return JSON.parse(
        localStorage.getItem("judgeScores")
    ) || [];

}


/* =========================================================
   GET SCORES FOR ONE ENTRY
========================================================= */

function getScoresForEntry(entryId) {

    const scores =
        getJudgeScores();

    return scores.filter(
        function (score) {

            return String(score.entryId) ===
                String(entryId);

        }
    );

}


/* =========================================================
   GET UNIQUE JUDGES WHO SCORED
========================================================= */

function getJudgesWhoScored(entryId) {

    const scores =
        getScoresForEntry(entryId);

    const judgeIds =
        scores
            .map(
                function (score) {

                    return score.judgeId;

                }
            )
            .filter(Boolean);


    return [...new Set(judgeIds)];

}


/* =========================================================
   GET JUDGING PROGRESS
========================================================= */

function getJudgingProgress(entryId) {

    const judgeIds =
        getJudgesWhoScored(entryId);


    return {

        completed:
            judgeIds.length,

        total:
            TOTAL_JUDGES,

        isComplete:
            judgeIds.length >= TOTAL_JUDGES

    };

}


/* =========================================================
   CHECK WHETHER CURRENT JUDGE ALREADY SCORED
========================================================= */

function hasCurrentJudgeScored(entryId) {

    const currentJudge =
        getCurrentJudge();

    const scores =
        getScoresForEntry(entryId);


    return scores.some(
        function (score) {

            return score.judgeId ===
                currentJudge;

        }
    );

}


/* =========================================================
   CREATE ENTRY CARD
========================================================= */

function createJudgeCard(entry) {

    const progress =
        getJudgingProgress(entry.id);


    const alreadyScored =
        hasCurrentJudgeScored(entry.id);


    const card =
        document.createElement("article");

    card.className =
        "judge-card";


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

                Pending

            </span>

        `;

    }


    /* =====================================================
       SCORE ACTION
    ====================================================== */

    let actionHTML;


    if (progress.isComplete) {

        actionHTML = `

            <div class="completed-message">

                ✓ All 3 judges have evaluated this photo

            </div>

        `;

    }

    else if (
        currentUser &&
        String(entry.participantId) === String(currentUser.id)
    ) {

        actionHTML = `

            <div class="completed-message" style="background:#fef3c7;color:#92400e;border:1px solid #fde68a;">
                Your submission (Self-judging disabled)
            </div>

        `;

    }

    else if (alreadyScored) {

        actionHTML = `

            <div class="completed-message">

                ✓ Your evaluation has been submitted

            </div>

        `;

    }

    else {

        actionHTML = `

            <a
                href="score.html?id=${encodeURIComponent(entry.id)}"
                class="score-btn"
            >

                Score This Photo →

            </a>

        `;

    }


    /* =====================================================
       CARD HTML
    ====================================================== */

    const percentage =
        (
            progress.completed /
            TOTAL_JUDGES
        ) * 100;


    card.innerHTML = `

        <div class="judge-image-wrapper">

            <img
                src="${entry.image}"
                alt="${escapeHTML(
                    entry.title || "Submitted photograph"
                )}"
            >

        </div>


        <div class="judge-card-content">

            <div class="judge-card-top">

                <h2>
                    ${escapeHTML(
                        entry.title ||
                        "Untitled Photograph"
                    )}
                </h2>

                ${statusHTML}

            </div>


            <p class="participant-name">

                By
                <strong>
                    ${escapeHTML(
                        entry.participantName ||
                        "Anonymous"
                    )}
                </strong>

            </p>


            <p class="judge-description">

                ${escapeHTML(
                    entry.description ||
                    "No description provided."
                )}

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

function displayJudgeEntries() {

    if (!judgeEntriesContainer) {

        return;

    }


    const entries =
        getEntries();


    /* =====================================================
       NO ENTRIES
    ====================================================== */

    if (entries.length === 0) {

        judgeEntriesContainer.innerHTML =
            "";

        if (noJudgeEntries) {

            noJudgeEntries.style.display =
                "block";

        }

        return;

    }


    /* =====================================================
       ENTRIES AVAILABLE
    ====================================================== */

    if (noJudgeEntries) {

        noJudgeEntries.style.display =
            "none";

    }


    judgeEntriesContainer.innerHTML =
        "";


    entries.forEach(
        function (entry) {

            const card =
                createJudgeCard(entry);

            judgeEntriesContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}


/* =========================================================
   INITIALIZE
========================================================= */

updateJudgeDisplay();

displayJudgeEntries();