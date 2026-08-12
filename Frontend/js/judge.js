// ==========================================
// JUDGE DASHBOARD
// ==========================================

const judgeEntriesContainer =
    document.querySelector("#judgeEntriesContainer");

const noJudgeEntries =
    document.querySelector("#noJudgeEntries");


// ==========================================
// DISPLAY SUBMISSIONS
// ==========================================

function displayJudgeEntries() {

    // Get entries from localStorage

    const entries =
        JSON.parse(
            localStorage.getItem("photoEntries")
        ) || [];


    // No submissions

    if (entries.length === 0) {

        judgeEntriesContainer.innerHTML = "";

        noJudgeEntries.style.display = "block";

        return;
    }


    // Hide no-entry message

    noJudgeEntries.style.display = "none";

    judgeEntriesContainer.innerHTML = "";


    // Display every submission

    entries.forEach(function (entry) {

        const card =
            document.createElement("div");

        card.className = "judge-card";


        card.innerHTML = `

            <img
                src="${entry.image}"
                alt="${entry.title}"
            >

            <div class="judge-card-content">

                <h2>
                    ${entry.title}
                </h2>

                <p>
                    <strong>Participant:</strong>
                    ${entry.participantName}
                </p>

                <p>
                    ${entry.description}
                </p>

                <a
                    href="score.html?id=${entry.id}"
                    class="score-btn"
                >
                    Score This Photo
                </a>

            </div>
        `;


        judgeEntriesContainer.appendChild(card);

    });

}


// Run when page loads

if (judgeEntriesContainer) {

    displayJudgeEntries();

}