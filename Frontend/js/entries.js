// =========================================================
// PHOTOJUDGE — PHOTO SUBMISSION & ENTRY MANAGEMENT
// =========================================================


// ==========================================
// GET SELECTED CONTEST
// ==========================================

const submitParams =
    new URLSearchParams(
        window.location.search
    );

const selectedContestId =
    submitParams.get("contestId");


// ==========================================
// LOAD SELECTED CONTEST
// ==========================================

function getSelectedContest() {

    const contests =
        JSON.parse(
            localStorage.getItem("contests")
        ) || [];

    return contests.find(function (contest) {

        return contest.id === selectedContestId;

    });
}


// ==========================================
// DISPLAY SELECTED CONTEST
// ==========================================

function displaySelectedContest() {

    const contest =
        getSelectedContest();


    const contestName =
        document.querySelector(
            "#selectedContestName"
        );

    const criteriaContainer =
        document.querySelector(
            "#submissionCriteria"
        );


    // No contest selected

    if (!contest) {

        if (contestName) {

            contestName.textContent =
                "No contest selected";

        }

        if (criteriaContainer) {

            criteriaContainer.innerHTML = `
                <p>
                    Please select a contest before submitting.
                </p>
            `;

        }

        return;
    }


    // Contest name

    if (contestName) {

        contestName.textContent =
            contest.title;

    }


    // Criteria

    if (criteriaContainer) {

        criteriaContainer.innerHTML = `

            <div>
                <strong>
                    ${contest.criteria.creativity}%
                </strong>

                <span>
                    Creativity
                </span>
            </div>


            <div>
                <strong>
                    ${contest.criteria.technical}%
                </strong>

                <span>
                    Technical Quality
                </span>
            </div>


            <div>
                <strong>
                    ${contest.criteria.themeFit}%
                </strong>

                <span>
                    Theme Fit
                </span>
            </div>

        `;

    }

}

// =========================================================
// SUBMISSION PAGE
// =========================================================

const submissionForm = document.querySelector("#submissionForm");


if (submissionForm) {

    const contestSelect =
        document.querySelector("#contestSelect");

    const participantName =
        document.querySelector("#participantName");

    const photoTitle =
        document.querySelector("#photoTitle");

    const photoDescription =
        document.querySelector("#photoDescription");

    const photoInput =
        document.querySelector("#photo");

    const previewContainer =
        document.querySelector("#previewContainer");

    const imagePreview =
        document.querySelector("#imagePreview");

    const formMessage =
        document.querySelector("#formMessage");


    function loadContestOptions() {

    if (!contestSelect) {
        return;
    }

    const contests =
        JSON.parse(
            localStorage.getItem("contests")
        ) || [];

    const activeContests =
        contests.filter(function (contest) {

            return contest.status === "active";

        });

    contestSelect.innerHTML = `
        <option value="">
            Select a contest
        </option>
    `;

    activeContests.forEach(function (contest) {

        contestSelect.innerHTML += `
            <option value="${contest.id}">
                ${contest.title}
            </option>
        `;

    });


    // If opened from a contest details page,
    // automatically select that contest

    if (selectedContestId) {

        const matchingContest =
            activeContests.find(function (contest) {

                return contest.id === selectedContestId;

            });

        if (matchingContest) {

            contestSelect.value =
                selectedContestId;
            
            contestSelect.dispatchEvent(
                new Event("change")
            );

        }

    }

}

loadContestOptions();
// ==========================================
// UPDATE SELECTED CONTEST DISPLAY
// ==========================================

contestSelect.addEventListener(
    "change",
    function () {

        const chosenContestId =
            contestSelect.value;

        const contestName =
            document.querySelector(
                "#selectedContestName"
            );

        const criteriaContainer =
            document.querySelector(
                "#submissionCriteria"
            );


        // No contest selected

        if (!chosenContestId) {

            contestName.textContent =
                "No contest selected";

            criteriaContainer.innerHTML = `
                <p>
                    Please select a contest before submitting.
                </p>
            `;

            return;
        }


        // Get contests

        const contests =
            JSON.parse(
                localStorage.getItem("contests")
            ) || [];


        // Find selected contest

        const selectedContest =
            contests.find(function (contest) {

                return contest.id ===
                       chosenContestId;

            });


        if (!selectedContest) {
            return;
        }


        // Update contest name

        contestName.textContent =
            selectedContest.title;


        // Update judging criteria

        criteriaContainer.innerHTML = `

            <div>
                <strong>
                    ${selectedContest.criteria.creativity}%
                </strong>

                <span>
                    Creativity
                </span>
            </div>

            <div>
                <strong>
                    ${selectedContest.criteria.technical}%
                </strong>

                <span>
                    Technical Quality
                </span>
            </div>

            <div>
                <strong>
                    ${selectedContest.criteria.themeFit}%
                </strong>

                <span>
                    Theme Fit
                </span>
            </div>

        `;

    }
);

// =====================================================
// IMAGE PREVIEW
// =====================================================

photoInput.addEventListener("change", function () {

    const file = photoInput.files[0];

    // Nothing selected
    if (!file) {
        return;
    }


    // =====================================================
    // CHECK FILE TYPE
    // =====================================================

    if (!file.type.startsWith("image/")) {

        formMessage.textContent =
            "Please select a valid image file.";

        photoInput.value = "";

        return;
    }


    // =====================================================
    // CHECK FILE SIZE
    // Maximum 5 MB
    // =====================================================

    if (file.size > 5 * 1024 * 1024) {

        formMessage.textContent =
            "Image is too large. Please choose an image below 5 MB.";

        photoInput.value = "";

        return;
    }


    // =====================================================
    // READ IMAGE
    // =====================================================

    const reader = new FileReader();


    reader.onload = function (event) {

        // Put image into existing img element
        imagePreview.src = event.target.result;


        // Show the preview
        previewContainer.classList.add("active");


        // Hide the upload placeholder
        const uploadPlaceholder =
            document.querySelector("#uploadPlaceholder");

        if (uploadPlaceholder) {
            uploadPlaceholder.style.display = "none";
        }


        // Clear previous message
        formMessage.textContent = "";

    };


    reader.onerror = function () {

        formMessage.textContent =
            "Could not read the selected image.";

    };


    reader.readAsDataURL(file);

});

    

    // =====================================================
    // COMPRESS IMAGE
    // =====================================================

    function compressImage(file) {

        return new Promise(function (resolve, reject) {

            const reader = new FileReader();


            reader.onload = function (event) {

                const image = new Image();


                image.onload = function () {

                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;

                    let width = image.width;
                    let height = image.height;


                    // Resize large images

                    if (width > MAX_WIDTH || height > MAX_HEIGHT) {

                        const ratio = Math.min(
                            MAX_WIDTH / width,
                            MAX_HEIGHT / height
                        );

                        width =
                            Math.round(width * ratio);

                        height =
                            Math.round(height * ratio);
                    }


                    // Create canvas

                    const canvas =
                        document.createElement("canvas");


                    canvas.width = width;
                    canvas.height = height;


                    const context =
                        canvas.getContext("2d");


                    context.drawImage(
                        image,
                        0,
                        0,
                        width,
                        height
                    );


                    // Convert to compressed JPEG

                    const compressedImage =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.75
                        );


                    resolve(compressedImage);

                };


                image.onerror = function () {

                    reject(
                        new Error("Could not process image.")
                    );

                };


                image.src = event.target.result;

            };


            reader.onerror = function () {

                reject(
                    new Error("Could not read image.")
                );

            };


            reader.readAsDataURL(file);

        });

    }


    // =====================================================
    // SUBMIT PHOTOGRAPH
    // =====================================================

    submissionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const file =
                photoInput.files[0];


            // Check image

            if (!file) {

                formMessage.textContent =
                    "Please select a photograph.";

                return;
            }


            // Get form values

            const name =
                participantName.value.trim();

            const title =
                photoTitle.value.trim();

            const description =
                photoDescription.value.trim();


            if (!name || !title || !description) {

                formMessage.textContent =
                    "Please complete all required fields.";

                return;
            }


            // Show processing message

            formMessage.textContent =
                "Processing your photograph...";


            try {

                // Compress image

                const compressedImage =
                    await compressImage(file);


                // =================================================
                // CREATE ENTRY
                // =================================================

                const currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );

if (!currentUser || currentUser.role !== "participant") {

    window.location.href =
        "login.html";

    return;
}


// ==========================================
// CHECK SELECTED CONTEST
// ==========================================
const chosenContestId =
    contestSelect.value;


if (!chosenContestId) {

    formMessage.textContent =
        "Please select a contest before submitting.";

    return;
}


const contests =
    JSON.parse(
        localStorage.getItem("contests")
    ) || [];


const selectedContest =
    contests.find(function (contest) {

        return contest.id === chosenContestId;

    });


if (!selectedContest) {

    formMessage.textContent =
        "Selected contest could not be found.";

    return;
}


// ==========================================
// CREATE ENTRY
// ==========================================

const entry = {

    id: Date.now(),

    participantId:
        currentUser.id,

    participantName:
        currentUser.name,

    contestId:
        chosenContestId,

    title:
        photoTitle.value.trim(),

    description:
        photoDescription.value.trim(),

    image:
        compressedImage,

    createdAt:
        new Date().toISOString()

};
                

                // =================================================
                // GET EXISTING ENTRIES
                // =================================================

                let entries = [];

                try {

                    entries =
                        JSON.parse(
                            localStorage.getItem(
                                "photoEntries"
                            )
                        ) || [];

                } catch (error) {

                    entries = [];

                }


                // Add new entry

                entries.push(entry);


                // =================================================
                // SAVE ENTRY
                // =================================================

                try {

                    localStorage.setItem(
                        "photoEntries",
                        JSON.stringify(entries)
                    );

                } catch (storageError) {

                    console.error(
                        "Storage error:",
                        storageError
                    );


                    formMessage.textContent =
                        "This photograph is still too large for browser storage. Please choose a smaller image.";

                    return;

                }


                // =================================================
                // SUCCESS
                // =================================================

                formMessage.textContent =
                    "✓ Photograph submitted successfully!";


                // Reset form

                submissionForm.reset();


                // Reset preview

                previewContainer.innerHTML = `
                    <p>
                        Image preview will appear here
                    </p>
                `;


                // Redirect after success

                setTimeout(function () {

                    window.location.href =
                        "my-entries.html";

                }, 1000);


            } catch (error) {

                console.error(
                    "Image processing error:",
                    error
                );


                formMessage.textContent =
                    "Something went wrong while processing your photograph.";

            }

        }
    );

}

// ==========================================
// SYNC ENTRY JUDGING STATES
// ==========================================

function syncEntryJudgingStates() {

    let entries =
        JSON.parse(
            localStorage.getItem("photoEntries")
        ) || [];

    const judgeScores =
        JSON.parse(
            localStorage.getItem("judgeScores")
        ) || [];


    entries.forEach(function (entry) {

        const scoreCount =
            judgeScores.filter(function (score) {

                return String(score.entryId) ===
                       String(entry.id);

            }).length;


        entry.judgesCompleted =
            scoreCount;


        // ==========================================
        // RANKED
        // ==========================================

        if (entry.isRanked === true &&
            scoreCount >= 3) {

            entry.judgingStatus =
                "ranked";

        }


        // ==========================================
        // UNDER JUDGING
        // ==========================================

        else if (scoreCount > 0) {

            entry.judgingStatus =
                "judging";

            entry.isRanked =
                false;

        }


        // ==========================================
        // SUBMITTED
        // ==========================================

        else {

            entry.judgingStatus =
                "submitted";

            entry.isRanked =
                false;

        }

    });


    localStorage.setItem(
        "photoEntries",
        JSON.stringify(entries)
    );

}

// =========================================================
// MY ENTRIES PAGE
// =========================================================


function displayEntries() {

    syncEntryJudgingStates();

    const entriesContainer =
        document.querySelector("#entriesContainer");

    const noEntriesMessage =
        document.querySelector("#noEntriesMessage");


    if (!entriesContainer) {
        return;
    }


    // ==========================================
    // GET CURRENT LOGGED-IN PARTICIPANT
    // ==========================================

    const currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );


    if (!currentUser || currentUser.role !== "participant") {

        window.location.href =
            "login.html";

        return;
    }


    // ==========================================
    // GET ALL ENTRIES
    // ==========================================

    let allEntries = [];

    try {

        allEntries =
            JSON.parse(
                localStorage.getItem("photoEntries")
            ) || [];

    } catch (error) {

        allEntries = [];

    }


    // ==========================================
    // GET ONLY CURRENT USER'S ENTRIES
    // ==========================================

    const entries =
        allEntries.filter(function (entry) {

            return String(entry.participantId) ===
                   String(currentUser.id);

        });


    // ==========================================
    // NO ENTRIES
    // ==========================================

    if (entries.length === 0) {

        entriesContainer.innerHTML = "";

        noEntriesMessage.style.display =
            "block";

        return;
    }


    noEntriesMessage.style.display =
        "none";

    entriesContainer.innerHTML = "";



// ==========================================
// DISPLAY ENTRIES
// ==========================================

entries.forEach(function (entry) {

    const card =
        document.createElement("article");


    card.className =
        "entry-card";


    card.innerHTML = `

        <div class="entry-image-wrapper">

            <img
                src="${entry.image}"
                alt="${entry.title}"
                class="entry-image"
            >

            <span class="entry-status">

    ${
        entry.judgingStatus === "ranked"
            ? "Ranked"
            : entry.judgingStatus === "judging"
                ? "Under Judging"
                : "Submitted"
    }

</span>

        </div>


        <div class="entry-content">

            <p class="small-heading">
                PHOTO ENTRY
            </p>


            <h2>
                ${entry.title}
            </h2>


            <p class="entry-description">
                ${entry.description}
            </p>


            <p class="entry-participant">
                By ${entry.participantName}
            </p>


            <p class="entry-date">
                Submitted
                ${new Date(entry.createdAt)
                    .toLocaleDateString()}
            </p>


            <div class="entry-actions">

    ${
        entry.judgingStatus === "ranked"
        ? `

            <!-- =========================
                 FINAL RESULT
            ========================== -->

            <div class="final-result-box">

                <div class="result-main">

                    <div class="result-score">

                        <span class="result-label">
                            FINAL SCORE
                        </span>

                        <strong>
                            ${Number(
                                entry.finalScore
                            ).toFixed(2)}
                        </strong>

                        <span class="score-max">
                            / 10
                        </span>

                    </div>


                    <div class="result-rank">

                        <span>
                            RANK
                        </span>

                        <strong>
                            #${entry.rank}
                        </strong>

                    </div>

                </div>


                <div class="result-status">
                    ✓ Final Result
                </div>


                <a
                    href="result.html?id=${entry.id}"
                    class="result-btn"
                >
                    View Evaluation
                    <span>→</span>
                </a>

            </div>

        `

        : entry.judgingStatus === "judging"

        ? `

            <!-- =========================
                 UNDER JUDGING
            ========================== -->

            <div class="judging-status-box">

                <div class="judging-status-header">

                    <span class="status-lock">
                        🔒
                    </span>

                    <div>

                        <strong>
                            Under Judging
                        </strong>

                        <span>
                            Your entry is currently being evaluated.
                        </span>

                    </div>

                </div>


                <div class="judging-progress">

                    <div class="progress-text">

                        <span>
                            Judges completed
                        </span>

                        <strong>
                            ${entry.judgesCompleted || 0}/3
                        </strong>

                    </div>


                    <div class="progress-bar">

                        <div
                            style="
                                width:${(
                                    (entry.judgesCompleted || 0)
                                    / 3
                                    * 100
                                )}%;
                            "
                        ></div>

                    </div>

                </div>


                <p class="judging-note">
                    Editing and deletion are locked while
                    judging is in progress.
                </p>

            </div>

        `

        : `

            <!-- =========================
                 SUBMITTED
            ========================== -->

            <button
                class="entry-btn"
                onclick="editEntry(${entry.id})"
            >
                Edit
            </button>


            <button
                class="entry-btn delete-btn"
                onclick="deleteEntry(${entry.id})"
            >
                Delete
            </button>

        `
    }

</div>

        </div>

    `;


    entriesContainer.appendChild(card);

});

}
// =========================================================
// EDIT ENTRY
// =========================================================

function editEntry(entryId) {

    const currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );


    // User must be logged in as participant

    if (!currentUser || currentUser.role !== "participant") {

        window.location.href =
            "login.html";

        return;
    }


    // Get all entries

    const entries =
        JSON.parse(
            localStorage.getItem("photoEntries")
        ) || [];


    // Find selected entry

    const entry =
        entries.find(function (item) {

            return item.id === entryId;

        });


    // ==========================================
// ENTRY NOT FOUND
// ==========================================

if (!entry) {

    alert("Entry not found.");

    return;
}


// ==========================================
// LOCK ENTRY AFTER JUDGING STARTS
// ==========================================

if (
    entry.judgingStatus === "judging" ||
    entry.judgingStatus === "ranked"
) {

    alert(
        "This entry is locked because judging has started."
    );

    return;
}

    // Check ownership

    if (
        String(entry.participantId) !==
        String(currentUser.id)
    ) {

        alert(
            "You are not allowed to edit this entry."
        );

        return;
    }


    // Open edit page

    window.location.href =
        `edit-entry.html?id=${entryId}`;

}

// ==========================================
// DELETE ENTRY
// ==========================================

function deleteEntry(entryId) {

    const currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );


    // User must be logged in as participant

    if (!currentUser || currentUser.role !== "participant") {

        window.location.href =
            "login.html";

        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this photograph?"
        );


    if (!confirmDelete) {
        return;
    }


    let entries =
        JSON.parse(
            localStorage.getItem("photoEntries")
        ) || [];


    // Find the entry

    const entry =
        entries.find(function (item) {

            return item.id === entryId;

        });


   // ==========================================
// ENTRY NOT FOUND
// ==========================================

if (!entry) {

    alert("Entry not found.");

    return;
}


// ==========================================
// LOCK ENTRY AFTER JUDGING STARTS
// ==========================================

if (
    entry.judgingStatus === "judging" ||
    entry.judgingStatus === "ranked"
) {

    alert(
        "This entry is locked because judging has started."
    );

    return;
}


    // Check ownership

    if (
        String(entry.participantId) !==
        String(currentUser.id)
    ) {

        alert(
            "You are not allowed to delete this entry."
        );

        return;
    }


    // Delete only the user's entry

    entries =
        entries.filter(function (item) {

            return item.id !== entryId;

        });


    localStorage.setItem(
        "photoEntries",
        JSON.stringify(entries)
    );


    displayEntries();

}


// =========================================================
// EDIT PAGE
// =========================================================

function initializeEditPage() {

    const editForm =
        document.querySelector("#editForm");


    if (!editForm) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const entryId =
        Number(params.get("id"));


    let entries =
        JSON.parse(
            localStorage.getItem("photoEntries")
        ) || [];


    const entry =
        entries.find(function (item) {

            return item.id === entryId;

        });


    // ==========================================
    // CHECK LOGGED-IN USER
    // ==========================================

    const currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );


    const editMessage =
        document.querySelector("#editMessage");


    if (!currentUser ||
        currentUser.role !== "participant") {

        window.location.href =
            "login.html";

        return;
    }


    // ==========================================
    // CHECK ENTRY OWNERSHIP
    // ==========================================

    if (
        entry &&
        String(entry.participantId) !==
        String(currentUser.id)
    ) {

        editMessage.textContent =
            "You are not allowed to edit this entry.";

        editForm.style.display =
            "none";

        return;
    }


    // ==========================================
    // ENTRY NOT FOUND
    // ==========================================

    if (!entry) {

        editMessage.textContent =
            "Entry not found.";

        return;
    }


    // ==========================================
    // FILL FORM
    // ==========================================

    document.querySelector(
        "#editParticipantName"
    ).value =
        entry.participantName;


    document.querySelector(
        "#editPhotoTitle"
    ).value =
        entry.title;


    document.querySelector(
        "#editPhotoDescription"
    ).value =
        entry.description;


    document.querySelector(
        "#editImagePreview"
    ).innerHTML = `

        <img
            src="${entry.image}"
            class="image-preview"
            alt="${entry.title}"
        >

    `;


    // ==========================================
    // UPDATE ENTRY
    // ==========================================

    editForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const updatedTitle =
                document.querySelector(
                    "#editPhotoTitle"
                ).value.trim();


            const updatedDescription =
                document.querySelector(
                    "#editPhotoDescription"
                ).value.trim();


            if (!updatedTitle ||
                !updatedDescription) {

                editMessage.textContent =
                    "Please complete all fields.";

                return;
            }


            const entryIndex =
                entries.findIndex(
                    function (item) {

                        return item.id === entryId;

                    }
                );


            entries[entryIndex].title =
                updatedTitle;


            entries[entryIndex].description =
                updatedDescription;


            localStorage.setItem(
                "photoEntries",
                JSON.stringify(entries)
            );


            editMessage.textContent =
                "✓ Entry updated successfully!";


            setTimeout(function () {

                window.location.href =
                    "my-entries.html";

            }, 800);

        }
    );

}


// Initialize edit page
initializeEditPage();


// Run My Entries

displayEntries();

displaySelectedContest();