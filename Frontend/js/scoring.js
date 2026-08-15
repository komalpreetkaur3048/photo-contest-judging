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
    currentUser ? currentUser.id : null;

if (!currentUser || currentUser.role !== "judge") {

    window.location.href =
        "login.html";

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


// const judgeSelect =
//     document.querySelector("#judgeSelect");


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
   CONTEST WEIGHTS
========================================================= */

const WEIGHTS = {

    creativity: 0.40,

    technical: 0.30,

    theme: 0.30

};


/* =========================================================
   JUDGE INFORMATION
========================================================= */

const TOTAL_JUDGES = 3;


/* =========================================================
   GET ENTRY ID FROM URL
========================================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const entryId =
    urlParams.get("id");


/* =========================================================
   LOAD PHOTO ENTRIES
========================================================= */

const entries =
    JSON.parse(
        localStorage.getItem("photoEntries")
    ) || [];


/* =========================================================
   FIND ENTRY
========================================================= */

const entry =
    entries.find(function (item) {

        return String(item.id) ===
               String(entryId);

    });


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

        scorePhotoTitle.textContent =
            "Submission not found";

        scoreDescription.textContent =
            "The photograph you are trying to evaluate could not be found.";

        submitScoreBtn.disabled = true;

        scoreMessage.textContent =
            "Invalid submission.";

        scoreMessage.classList.add("error");

        return;
    }


    scoreImage.src =
        entry.image;

    scoreImage.alt =
        entry.title ||
        "Submitted photograph";


    scorePhotoTitle.textContent =
        entry.title ||
        "Untitled Photograph";


    scoreParticipant.textContent =
        entry.participantName ||
        "Anonymous";


    scoreDescription.textContent =
        entry.description ||
        "No description provided.";

}


/* =========================================================
   GET JUDGES WHO HAVE ALREADY SCORED THIS PHOTO
========================================================= */

function getJudgesForEntry() {

    const scores =
        getJudgeScores();


    return scores
        .filter(function (score) {

            return String(score.entryId) ===
                   String(entryId);

        })
        .map(function (score) {

            return score.judgeId;

        });

}


/* =========================================================
   UPDATE JUDGING STATUS
========================================================= */

function updateJudgingStatus() {

    if (!entry) {
        return;
    }


    const judgedBy =
        getJudgesForEntry();


    const numberOfJudges =
        judgedBy.length;


    if (numberOfJudges >= TOTAL_JUDGES) {

        scoreStatus.textContent =
            "All 3 judges have completed their evaluations.";

        scoreStatus.className =
            "score-status success";

        submitScoreBtn.disabled = true;

        judgeSelect.disabled = true;

        return;
    }


    scoreStatus.textContent =
        `${numberOfJudges} of ${TOTAL_JUDGES} judges have completed this evaluation.`;

    scoreStatus.className =
        "score-status";


    /*
        If a judge is selected,
        check whether they already scored.
    */

    checkSelectedJudge();

}


/* =========================================================
   CHECK SELECTED JUDGE
========================================================= */

function checkSelectedJudge() {

    if (!entry) {
        return;
    }

    if (!currentJudge) {

        submitScoreBtn.disabled = true;

        scoreMessage.textContent =
            "Judge identity not found.";

        scoreMessage.className =
            "score-message error";

        return;
    }


    const scores =
        getJudgeScores();


    const alreadyScored =
    scores.some(function (score) {

        return String(score.entryId) ===
                   String(entryId)

            &&

               score.judgeId ===
                   currentJudge;

    });

    if (alreadyScored) {

        submitScoreBtn.disabled = true;

        scoreMessage.textContent =
            "This judge has already evaluated this photograph.";

        scoreMessage.className =
            "score-message error";

        return;

    }


    submitScoreBtn.disabled = false;

    scoreMessage.textContent =
        "";

    scoreMessage.className =
        "score-message";

}


/* =========================================================
   CALCULATE WEIGHTED SCORE
========================================================= */

function calculateWeightedScore() {

    const creativityScore =
        Number(creativity.value);


    const technicalScore =
        Number(technical.value);


    const themeScore =
        Number(theme.value);


    const finalScore =

        (creativityScore *
            WEIGHTS.creativity)

        +

        (technicalScore *
            WEIGHTS.technical)

        +

        (themeScore *
            WEIGHTS.theme);


    weightedScore.textContent =
        finalScore.toFixed(2);


    return finalScore;

}


/* =========================================================
   UPDATE SLIDER VALUES
========================================================= */

function updateScoreDisplay() {

    creativityValue.textContent =
        creativity.value;


    technicalValue.textContent =
        technical.value;


    themeValue.textContent =
        theme.value;


    calculateWeightedScore();

}


/* =========================================================
   SAVE JUDGE SCORE
========================================================= */

function saveJudgeScore() {

    if (!entry) {
        return;
    }


    /* ==============================================
       CHECK JUDGE
    ============================================== */

    const currentJudge =
    currentUser.id;


    if (!currentJudge) {

    scoreMessage.textContent =
        "Judge identity not found.";

    scoreMessage.className =
        "score-message error";

    return;

}


    /* ==============================================
       LOAD EXISTING SCORES
    ============================================== */

    const scores =
        getJudgeScores();


    /* ==============================================
       PREVENT DUPLICATE JUDGING
    ============================================== */

    const duplicate =
    scores.some(function (score) {

        return String(score.entryId) ===
                   String(entry.id)

            &&

               score.judgeId ===
                   currentJudge;

    });


    if (duplicate) {

        scoreMessage.textContent =
            "This judge has already scored this photograph.";

        scoreMessage.className =
            "score-message error";

        submitScoreBtn.disabled = true;

        return;

    }


    /* ==============================================
       GET SCORES
    ============================================== */

    const creativityScore =
        Number(creativity.value);


    const technicalScore =
        Number(technical.value);


    const themeScore =
        Number(theme.value);


    /* ==============================================
       CALCULATE WEIGHTED SCORE
    ============================================== */

    const finalScore =

        (creativityScore *
            WEIGHTS.creativity)

        +

        (technicalScore *
            WEIGHTS.technical)

        +

        (themeScore *
            WEIGHTS.theme);


    /* ==============================================
       CREATE SCORE OBJECT
    ============================================== */

    const scoreData = {

    id: Date.now(),

    entryId: entry.id,

    judgeId: currentJudge,

    judgeName: currentUser.name,

    creativity: creativityScore,

    technical: technicalScore,

    theme: themeScore,

    weightedScore:
        Number(
            finalScore.toFixed(2)
        ),

    judgedAt:
        new Date().toISOString()

};


    /* ==============================================
       SAVE SCORE
    ============================================== */

    scores.push(scoreData);


    localStorage.setItem(
        "judgeScores",
        JSON.stringify(scores)
    );


    /* ==============================================
       SUCCESS
    ============================================== */

    scoreMessage.textContent =
        "Evaluation submitted successfully.";

    scoreMessage.className =
        "score-message success";


    submitScoreBtn.textContent =
        "Evaluation Submitted";


    submitScoreBtn.disabled =
        true;


    // judgeSelect.disabled =
    //     true;


    /* ==============================================
       UPDATE STATUS
    ============================================== */

    updateJudgingStatus();


    /* ==============================================
       REDIRECT
    ============================================== */

    setTimeout(function () {

        window.location.href =
            "judge.html";

    }, 1300);

}


/* =========================================================
   SLIDER EVENTS
========================================================= */

if (creativity) {

    creativity.addEventListener(
        "input",
        updateScoreDisplay
    );

}


if (technical) {

    technical.addEventListener(
        "input",
        updateScoreDisplay
    );

}


if (theme) {

    theme.addEventListener(
        "input",
        updateScoreDisplay
    );

}


/* =========================================================
   JUDGE SELECT EVENT
========================================================= */

// if (judgeSelect) {

//     judgeSelect.addEventListener(
//         "change",
//         checkSelectedJudge
//     );

// }


/* =========================================================
   SUBMIT EVENT
========================================================= */

if (submitScoreBtn) {

    submitScoreBtn.addEventListener(
        "click",
        saveJudgeScore
    );

}

// JUDGE

const currentJudgeName =
    document.querySelector("#currentJudgeName");

if (currentJudgeName && currentUser) {

    currentJudgeName.textContent =
        currentUser.name;

}






/* =========================================================
   INITIALIZE PAGE
========================================================= */

displayEntry();

updateScoreDisplay();

updateJudgingStatus();

checkSelectedJudge();