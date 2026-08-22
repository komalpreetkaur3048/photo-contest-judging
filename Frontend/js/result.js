// =========================================================
// PHOTOJUDGE — RESULT PAGE
// =========================================================


// ==========================================
// GET ENTRY ID
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const entryId =
    Number(
        params.get("id")
    );


// ==========================================
// RESULT CONTAINER
// ==========================================

const resultContainer =
    document.querySelector(
        "#resultContainer"
    );


// ==========================================
// LOAD DATA
// ==========================================

const entries =
    JSON.parse(
        localStorage.getItem("photoEntries")
    ) || [];


const judgeScores =
    JSON.parse(
        localStorage.getItem("judgeScores")
    ) || [];


const contests =
    JSON.parse(
        localStorage.getItem("contests")
    ) || [];


// ==========================================
// FIND ENTRY
// ==========================================

const entry =
    entries.find(function (item) {

        return Number(item.id) ===
               entryId;

    });


// ==========================================
// ENTRY NOT FOUND
// ==========================================

if (!entry) {

    resultContainer.innerHTML = `

        <section class="result-error">

            <h1>
                Result not found
            </h1>

            <p>
                We couldn't find the requested evaluation.
            </p>

            <a
                href="my-entries.html"
                class="result-btn"
            >
                Back to My Entries
            </a>

        </section>

    `;

}
else {

    // ==========================================
    // FIND CONTEST
    // ==========================================

    const contest =
        contests.find(function (item) {

            return String(item.id) ===
                   String(entry.contestId);

        });


    // ==========================================
    // GET SCORES FOR THIS ENTRY
    // ==========================================

    const scores =
        judgeScores.filter(function (score) {

            return String(score.entryId) ===
                   String(entry.id);

        });


    // ==========================================
    // CALCULATE WEIGHTS
    // ==========================================

    const weights =
        contest?.criteria || {

            creativity: 40,
            technical: 30,
            themeFit: 30

        };


    // ==========================================
    // CALCULATE AVERAGES
    // ==========================================

    function average(field) {

        if (!scores.length) {
            return 0;
        }

        const total =
            scores.reduce(
                function(sum, score) {

                    return sum +
                        Number(score[field] || 0);

                },
                0
            );

        return total / scores.length;

    }


    const creativityAverage =
        average("creativity");


    const technicalAverage =
        average("technical");


    const themeAverage =
        average("theme");


    // ==========================================
    // DISPLAY RESULT
    // ==========================================

    resultContainer.innerHTML = `

        <section class="result-header">

            <p class="eyebrow">
                FINAL EVALUATION
            </p>

            <h1>
                ${entry.title}
            </h1>

            <p class="result-contest">
                ${contest?.title || "Photo Contest"}
            </p>

            <p class="result-participant">
                by ${entry.participantName}
            </p>

        </section>


        <!-- =========================
             SCORE HERO
        ========================== -->

        <section class="result-score-card">

            <div class="result-rank-box">

                <span>
                    FINAL RANK
                </span>

                <strong>
                    #${entry.rank || "—"}
                </strong>

            </div>


            <div class="main-score">

                <span>
                    FINAL NORMALIZED SCORE
                </span>

                <strong>
                    ${Number(
                        entry.finalScore || 0
                    ).toFixed(2)}
                </strong>

                <small>
                    / 10
                </small>

            </div>


            <div class="judges-complete">

                <span>
                    JUDGING
                </span>

                <strong>
                    ${entry.judgesCompleted || scores.length}/3
                </strong>

            </div>

        </section>


        <!-- =========================
             PHOTO
        ========================== -->

        <section class="result-photo-section">

            <div class="result-photo">

                <img
                    src="${entry.image}"
                    alt="${entry.title}"
                >

            </div>


            <div class="result-story">

                <p class="eyebrow">
                    ABOUT THE ENTRY
                </p>

                <h2>
                    ${entry.title}
                </h2>

                <p>
                    ${entry.description}
                </p>

            </div>

        </section>


        <!-- =========================
             SCORE BREAKDOWN
        ========================== -->

        <section class="evaluation-section">

            <div class="section-header">

                <p class="eyebrow">
                    SCORE BREAKDOWN
                </p>

                <h2>
                    How your photograph performed
                </h2>

                <p>
                    Scores are calculated using the judging
                    criteria defined for this contest.
                </p>

            </div>


            <div class="criteria-results">


                <div class="criteria-result">

                    <div class="criteria-top">

                        <div>
                            <strong>
                                Creativity
                            </strong>

                            <span>
                                ${weights.creativity}%
                            </span>
                        </div>

                        <strong>
                            ${creativityAverage.toFixed(2)}
                            / 10
                        </strong>

                    </div>


                    <div class="result-progress">

                        <div
                            style="
                                width:${creativityAverage * 10}%
                            "
                        ></div>

                    </div>

                </div>


                <div class="criteria-result">

                    <div class="criteria-top">

                        <div>
                            <strong>
                                Technical Quality
                            </strong>

                            <span>
                                ${weights.technical}%
                            </span>
                        </div>

                        <strong>
                            ${technicalAverage.toFixed(2)}
                            / 10
                        </strong>

                    </div>


                    <div class="result-progress">

                        <div
                            style="
                                width:${technicalAverage * 10}%
                            "
                        ></div>

                    </div>

                </div>


                <div class="criteria-result">

                    <div class="criteria-top">

                        <div>
                            <strong>
                                Theme Fit
                            </strong>

                            <span>
                                ${weights.themeFit}%
                            </span>
                        </div>

                        <strong>
                            ${themeAverage.toFixed(2)}
                            / 10
                        </strong>

                    </div>


                    <div class="result-progress">

                        <div
                            style="
                                width:${themeAverage * 10}%
                            "
                        ></div>

                    </div>

                </div>

            </div>

        </section>


        <!-- =========================
             FAIRNESS
        ========================== -->

        <section class="fairness-result">

            <div>

                <p class="eyebrow">
                    FAIR EVALUATION
                </p>

                <h2>
                    Your score is normalized.
                </h2>

                <p>
                    PhotoJudge adjusts for differences in
                    judge scoring patterns before generating
                    the final ranking.
                </p>

            </div>


            <div class="fairness-badge">

                ✓

                <span>
                    Normalized
                </span>

            </div>

        </section>


        <!-- =========================
             ACTIONS
        ========================== -->

        <section class="result-actions">

            <a
                href="my-entries.html"
                class="secondary-result-btn"
            >
                ← My Entries
            </a>


            <a
                href="leaderboard.html"
                class="primary-result-btn"
            >
                View Leaderboard →
            </a>

        </section>

    `;

}