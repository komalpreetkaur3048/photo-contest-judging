/* =========================================================
   PHOTOJUDGE — LEADERBOARD ENGINE
========================================================= */


/* =========================================================
   CONSTANTS
========================================================= */

const WEIGHTS = {

    creativity: 0.40,

    technical: 0.30,

    theme: 0.30

};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const leaderboardContainer =
    document.querySelector("#leaderboardContainer");

const emptyLeaderboard =
    document.querySelector("#emptyLeaderboard");

const podium =
    document.querySelector("#podium");

const entryCount =
    document.querySelector("#entryCount");

const judgeCount =
    document.querySelector("#judgeCount");

const leaderboardStatus =
    document.querySelector("#leaderboardStatus");


/* =========================================================
   LOAD DATA
========================================================= */

const entries =
    JSON.parse(
        localStorage.getItem("photoEntries")
    ) || [];


const judgeScores =
    JSON.parse(
        localStorage.getItem("judgeScores")
    ) || [];


/* =========================================================
   CALCULATE RAW WEIGHTED SCORE
========================================================= */

function calculateWeightedScore(score) {

    return (

        Number(score.creativity) *
        WEIGHTS.creativity

        +

        Number(score.technical) *
        WEIGHTS.technical

        +

        Number(score.theme) *
        WEIGHTS.theme

    );

}


/* =========================================================
   GROUP SCORES BY JUDGE
========================================================= */

/*

IMPORTANT:

Your current score.js does not yet save a judge identity.

Therefore we first create a judge grouping based on
the available score records.

Once we add actual judge accounts, this can be changed
to use judge IDs.

*/

function getJudgeGroups() {

    const groups = {};

    judgeScores.forEach(function(score) {

        const judgeId =
            score.judgeId ||
            score.judge ||
            "judge-" + score.id;

        if (!groups[judgeId]) {

            groups[judgeId] = [];

        }

        groups[judgeId].push(score);

    });

    return groups;

}


/* =========================================================
   CALCULATE JUDGE MEAN
========================================================= */

function calculateJudgeMean(scores) {

    if (!scores.length) {

        return 0;

    }

    const total =
        scores.reduce(
            function(sum, score) {

                return sum +
                    calculateWeightedScore(score);

            },
            0
        );

    return total / scores.length;

}


/* =========================================================
   CALCULATE OVERALL MEAN
========================================================= */

function calculateOverallMean() {

    if (!judgeScores.length) {

        return 0;

    }

    const total =
        judgeScores.reduce(
            function(sum, score) {

                return sum +
                    calculateWeightedScore(score);

            },
            0
        );

    return total / judgeScores.length;

}


/* =========================================================
   NORMALIZE SCORE
========================================================= */

/*

We use a mean-centering approach.

The idea:

    normalized score =
        raw score
        - judge mean
        + overall mean

This reduces the effect of a judge consistently scoring
higher or lower than the others.

Example:

Judge A average = 8.5
Judge B average = 6.5

A score from Judge A is shifted down,
while a score from Judge B is shifted up.

The ranking therefore depends less on judge strictness.

*/

function normalizeScore(
    rawScore,
    judgeMean,
    overallMean
) {

    return (
        rawScore -
        judgeMean +
        overallMean
    );

}


/* =========================================================
   BUILD JUDGE STATISTICS
========================================================= */

function buildJudgeStatistics() {

    const judgeGroups =
        getJudgeGroups();

    const overallMean =
        calculateOverallMean();

    const statistics = {};

    Object.keys(judgeGroups).forEach(
        function(judgeId) {

            statistics[judgeId] = {

                mean:
                    calculateJudgeMean(
                        judgeGroups[judgeId]
                    )

            };

        }
    );

    return {

        statistics,

        overallMean

    };

}


/* =========================================================
   CALCULATE ENTRY FINAL SCORE
========================================================= */

function calculateEntryResult(
    entry,
    judgeStatistics
) {

    const entryScores =
        judgeScores.filter(
            function(score) {

                return String(score.entryId) ===
                    String(entry.id);

            }
        );


    if (entryScores.length === 0) {

        return {

            entry: entry,

            scoreCount: 0,

            rawAverage: 0,

            normalizedAverage: 0

        };

    }


    let rawTotal = 0;

    let normalizedTotal = 0;


    entryScores.forEach(
        function(score) {

            const rawScore =
                calculateWeightedScore(score);

            rawTotal += rawScore;


            const judgeId =
                score.judgeId ||
                score.judge ||
                "judge-" + score.id;


            const judgeMean =
                judgeStatistics
                    .statistics[judgeId]
                    ?.mean
                ?? judgeStatistics.overallMean;


            const normalizedScore =
                normalizeScore(
                    rawScore,
                    judgeMean,
                    judgeStatistics.overallMean
                );


            normalizedTotal +=
                normalizedScore;

        }
    );


    const rawAverage =
        rawTotal / entryScores.length;


    const normalizedAverage =
        normalizedTotal / entryScores.length;


    return {

        entry: entry,

        scoreCount:
            entryScores.length,

        rawAverage:
            rawAverage,

        normalizedAverage:
            normalizedAverage

    };

}


/* =========================================================
   BUILD LEADERBOARD
========================================================= */

function buildLeaderboard() {

    const judgeStatistics =
        buildJudgeStatistics();


    const results =
        entries.map(
            function(entry) {

                return calculateEntryResult(
                    entry,
                    judgeStatistics
                );

            }
        );


    /* =============================================
       ONLY RANK SCORED ENTRIES
    ============================================= */

    const scoredEntries =
    results.filter(
        function(result) {

            return result.scoreCount >= 3;

        }
    );


    /* =============================================
       SORT
    ============================================= */

    scoredEntries.sort(
    function(a, b) {

        return (
            b.normalizedAverage -
            a.normalizedAverage
        );

    }
);


// ==========================================
// UPDATE ENTRY JUDGING STATES
// ==========================================

let storedEntries =
    JSON.parse(
        localStorage.getItem("photoEntries")
    ) || [];


// Update every entry based on judge count

results.forEach(function(result) {

    const storedEntry =
        storedEntries.find(function(entry) {

            return String(entry.id) ===
                   String(result.entry.id);

        });


    if (!storedEntry) {
        return;
    }


    storedEntry.judgesCompleted =
        result.scoreCount;


    // 0 judges
    if (result.scoreCount === 0) {

        storedEntry.judgingStatus =
            "submitted";

        storedEntry.isRanked =
            false;

    }


    // 1 or 2 judges
    else if (result.scoreCount < 3) {

        storedEntry.judgingStatus =
            "judging";

        storedEntry.isRanked =
            false;

    }

});


// ==========================================
// FINAL RANKED ENTRIES
// ==========================================

scoredEntries.forEach(
    function(result, index) {

        const storedEntry =
            storedEntries.find(
                function(entry) {

                    return String(entry.id) ===
                           String(result.entry.id);

                }
            );


        if (!storedEntry) {
            return;
        }


        storedEntry.judgingStatus =
            "ranked";

        storedEntry.isRanked =
            true;

        storedEntry.rank =
            index + 1;

        storedEntry.finalScore =
            Number(
                result.normalizedAverage.toFixed(2)
            );

        storedEntry.judgesCompleted =
            result.scoreCount;

    }
);


localStorage.setItem(
    "photoEntries",
    JSON.stringify(storedEntries)
);

return scoredEntries;

}
/* =========================================================
   FORMAT SCORE
========================================================= */

function formatScore(score) {

    return Number(score).toFixed(2);

}


/* =========================================================
   CREATE PODIUM CARD
========================================================= */

function createPodiumCard(
    result,
    rank
) {

    const entry =
        result.entry;


    const card =
        document.createElement("article");


    card.className =
        "podium-card" +
        (rank === 1 ? " first" : "");


    card.innerHTML = `

        <div class="podium-image">

            <span
                class="rank-badge ${rank === 1 ? "first" : ""}"
            >
                ${rank}
            </span>

            <img
                src="${entry.image}"
                alt="${escapeHTML(entry.title || "Photograph")}"
            >

        </div>


        <div class="podium-content">

            <h3>
                ${escapeHTML(
                    entry.title || "Untitled Photograph"
                )}
            </h3>

            <p class="participant-name">
                by
                ${escapeHTML(
                    entry.participantName || "Anonymous"
                )}
            </p>

            <div class="final-score">

                <span class="final-score-number">
                    ${formatScore(result.normalizedAverage)}
                </span>

                <span class="final-score-label">
                    / 10
                </span>

            </div>

        </div>

    `;


    return card;

}


/* =========================================================
   RENDER PODIUM
========================================================= */

function renderPodium(results) {

    podium.innerHTML = "";


    const topThree =
        results.slice(0, 3);


    topThree.forEach(
        function(result, index) {

            podium.appendChild(
                createPodiumCard(
                    result,
                    index + 1
                )
            );

        }
    );


    if (topThree.length === 0) {

        podium.innerHTML = `

            <div class="empty-leaderboard">

                <h2>
                    Waiting for evaluations
                </h2>

                <p>
                    The podium will appear once judges
                    begin scoring submissions.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   CREATE RANKING ROW
========================================================= */

function createRankingRow(
    result,
    rank
) {

    const entry =
        result.entry;


    const row =
        document.createElement("article");


    row.className =
        "ranking-row";


    row.innerHTML = `

        <div
            class="ranking-position
            ${rank <= 3 ? "top" : ""}"
        >
            ${rank}
        </div>


        <div class="ranking-thumbnail">

            <img
                src="${entry.image}"
                alt="${escapeHTML(entry.title || "Photograph")}"
            >

        </div>


        <div class="ranking-info">

            <h3>
                ${escapeHTML(
                    entry.title ||
                    "Untitled Photograph"
                )}
            </h3>

            <p>
                ${escapeHTML(
                    entry.participantName ||
                    "Anonymous"
                )}
            </p>

        </div>


        <div class="ranking-score">

            <span class="ranking-score-number">
                ${formatScore(
                    result.normalizedAverage
                )}
            </span>

            <span class="ranking-score-label">
                normalized score / 10
            </span>

        </div>

    `;


    return row;

}


/* =========================================================
   RENDER LEADERBOARD
========================================================= */

function renderLeaderboard(results) {

    leaderboardContainer.innerHTML = "";


    results.forEach(
        function(result, index) {

            leaderboardContainer.appendChild(
                createRankingRow(
                    result,
                    index + 1
                )
            );

        }
    );


    if (results.length === 0) {

        leaderboardContainer.style.display =
            "none";

        emptyLeaderboard.style.display =
            "block";

    }

    else {

        leaderboardContainer.style.display =
            "flex";

        emptyLeaderboard.style.display =
            "none";

    }

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
   UPDATE SUMMARY
========================================================= */

function updateSummary(results) {

    entryCount.textContent =
        entries.length;


    const uniqueJudges =
        new Set();


    judgeScores.forEach(
        function(score) {

            const judgeId =
                score.judgeId ||
                score.judge ||
                score.id;

            uniqueJudges.add(judgeId);

        }
    );


    judgeCount.textContent =
        uniqueJudges.size;


    if (results.length === 0) {

        leaderboardStatus.textContent =
            "Waiting for judge evaluations";

    }

    else {

        leaderboardStatus.textContent =
            `${results.length} ranked entries`;

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeLeaderboard() {

    const results =
        buildLeaderboard();


    updateSummary(results);

    renderPodium(results);

    renderLeaderboard(results);

}


/* =========================================================
   START
========================================================= */

initializeLeaderboard();
