/* =========================================================
   PHOTOJUDGE — PHOTO SUBMISSION & ENTRY MANAGEMENT
========================================================= */

// ==========================================
// GET SELECTED CONTEST FROM URL
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
        document.querySelector("#selectedContestName");

    const criteriaContainer =
        document.querySelector("#submissionCriteria");

    if (!contest) {
        if (contestName) {
            contestName.textContent = "No contest selected";
        }
        if (criteriaContainer) {
            criteriaContainer.innerHTML = `
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                    Please select a contest above to view criteria.
                </p>
            `;
        }
        return;
    }

    if (contestName) {
        contestName.textContent = contest.title;
    }

    if (criteriaContainer) {
        criteriaContainer.innerHTML = `
            <div>
                <strong>${contest.criteria.creativity}%</strong>
                <span>Creativity</span>
            </div>
            <div>
                <strong>${contest.criteria.technical}%</strong>
                <span>Technical Quality</span>
            </div>
            <div>
                <strong>${contest.criteria.themeFit}%</strong>
                <span>Theme Fit</span>
            </div>
        `;
    }
}


// =========================================================
// SUBMISSION PAGE LOGIC
// =========================================================

const submissionForm =
    document.querySelector("#submissionForm");

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

    const uploadPlaceholder =
        document.querySelector("#uploadPlaceholder");

    const formMessage =
        document.querySelector("#formMessage");

    const titleCount =
        document.querySelector("#titleCount");

    const descriptionCount =
        document.querySelector("#descriptionCount");

    // Auto-fill logged-in participant name
    const currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );

    if (currentUser && participantName) {
        participantName.value = currentUser.name;
    }

    if (photoTitle && titleCount) {
        photoTitle.addEventListener("input", function () {
            titleCount.textContent = photoTitle.value.length;
        });
    }

    if (photoDescription && descriptionCount) {
        photoDescription.addEventListener("input", function () {
            descriptionCount.textContent = photoDescription.value.length;
        });
    }

    function loadContestOptions() {
        if (!contestSelect) return;

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
                Select an active contest
            </option>
        `;

        activeContests.forEach(function (contest) {
            contestSelect.innerHTML += `
                <option value="${contest.id}">
                    ${contest.title} (${contest.category})
                </option>
            `;
        });

        if (selectedContestId) {
            const matchingContest = activeContests.find(function (contest) {
                return contest.id === selectedContestId;
            });

            if (matchingContest) {
                contestSelect.value = selectedContestId;
                contestSelect.dispatchEvent(new Event("change"));
            }
        }
    }

    loadContestOptions();

    // On contest change, update criteria
    contestSelect.addEventListener("change", function () {
        const chosenContestId = contestSelect.value;
        const contestName = document.querySelector("#selectedContestName");
        const criteriaContainer = document.querySelector("#submissionCriteria");

        if (!chosenContestId) {
            if (contestName) contestName.textContent = "No contest selected";
            if (criteriaContainer) {
                criteriaContainer.innerHTML = `
                    <p style="color: var(--text-muted); font-size: 0.9rem;">
                        Please select a contest before submitting.
                    </p>
                `;
            }
            return;
        }

        const contests = JSON.parse(localStorage.getItem("contests")) || [];
        const selectedContest = contests.find(function (contest) {
            return contest.id === chosenContestId;
        });

        if (!selectedContest) return;

        if (contestName) contestName.textContent = selectedContest.title;
        if (criteriaContainer) {
            criteriaContainer.innerHTML = `
                <div>
                    <strong>${selectedContest.criteria.creativity}%</strong>
                    <span>Creativity</span>
                </div>
                <div>
                    <strong>${selectedContest.criteria.technical}%</strong>
                    <span>Technical Quality</span>
                </div>
                <div>
                    <strong>${selectedContest.criteria.themeFit}%</strong>
                    <span>Theme Fit</span>
                </div>
            `;
        }
    });

    // Image preview
    if (photoInput) {
        photoInput.addEventListener("change", function () {
            const file = photoInput.files[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                formMessage.textContent = "Please select a valid image file (JPG, PNG, WEBP).";
                formMessage.className = "form-message error";
                photoInput.value = "";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                formMessage.textContent = "Image is too large. Maximum allowed size is 5 MB.";
                formMessage.className = "form-message error";
                photoInput.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                if (imagePreview) {
                    imagePreview.src = event.target.result;
                }
                if (previewContainer) {
                    previewContainer.classList.add("active");
                }
                if (uploadPlaceholder) {
                    uploadPlaceholder.style.display = "none";
                }
                formMessage.textContent = "";
                formMessage.className = "form-message";
            };

            reader.onerror = function () {
                formMessage.textContent = "Could not read the selected image.";
                formMessage.className = "form-message error";
            };

            reader.readAsDataURL(file);
        });
    }

    // Compress Image helper
    function compressImage(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const image = new Image();

                image.onload = function () {
                    const MAX_WIDTH = 1000;
                    const MAX_HEIGHT = 1000;
                    let width = image.width;
                    let height = image.height;

                    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    const context = canvas.getContext("2d");
                    context.drawImage(image, 0, 0, width, height);

                    const compressedImage = canvas.toDataURL("image/jpeg", 0.70);
                    resolve(compressedImage);
                };

                image.onerror = function () {
                    reject(new Error("Could not process image."));
                };

                image.src = event.target.result;
            };

            reader.onerror = function () {
                reject(new Error("Could not read image."));
            };

            reader.readAsDataURL(file);
        });
    }

    // Submit handler
    submissionForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const file = photoInput ? photoInput.files[0] : null;
        if (!file) {
            formMessage.textContent = "Please select a photograph to submit.";
            formMessage.className = "form-message error";
            return;
        }

        const name = participantName ? participantName.value.trim() : "";
        const title = photoTitle ? photoTitle.value.trim() : "";
        const description = photoDescription ? photoDescription.value.trim() : "";
        const chosenContestId = contestSelect ? contestSelect.value : "";

        if (!name || !title || !description || !chosenContestId) {
            formMessage.textContent = "Please fill in all required fields and select a contest.";
            formMessage.className = "form-message error";
            return;
        }

        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user || user.role !== "participant") {
            window.location.href = "login.html";
            return;
        }

        const contests = JSON.parse(localStorage.getItem("contests")) || [];
        const selectedContest = contests.find(function (c) {
            return c.id === chosenContestId;
        });

        if (!selectedContest) {
            formMessage.textContent = "Selected contest could not be found.";
            formMessage.className = "form-message error";
            return;
        }

        let existingPhotoEntries = [];
        try {
            existingPhotoEntries = JSON.parse(localStorage.getItem("photoEntries")) || [];
        } catch (e) {
            existingPhotoEntries = [];
        }

        const userContestEntries = existingPhotoEntries.filter(function (e) {
            return String(e.participantId) === String(user.id) && String(e.contestId) === String(chosenContestId);
        });

        const maxAllowed = selectedContest.maxSubmissions || 3;
        if (userContestEntries.length >= maxAllowed) {
            formMessage.textContent = `You have reached the maximum limit of ${maxAllowed} submissions for this contest.`;
            formMessage.className = "form-message error";
            return;
        }

        formMessage.textContent = "Optimizing and saving your photograph...";
        formMessage.className = "form-message";

        try {
            const compressedImage = await compressImage(file);

            const entry = {
                id: Date.now(),
                participantId: user.id,
                participantName: user.name || name,
                contestId: chosenContestId,
                title: title,
                description: description,
                image: compressedImage,
                createdAt: new Date().toISOString(),
                judgingStatus: "submitted",
                judgesCompleted: 0,
                isRanked: false
            };

            existingPhotoEntries.push(entry);
            localStorage.setItem("photoEntries", JSON.stringify(existingPhotoEntries));

            formMessage.textContent = "✓ Photograph submitted successfully! Redirecting...";
            formMessage.className = "form-message success";

            submissionForm.reset();

            // Safe preview reset without destroying child img element
            if (imagePreview) imagePreview.src = "";
            if (previewContainer) previewContainer.classList.remove("active");
            if (uploadPlaceholder) uploadPlaceholder.style.display = "block";

            setTimeout(function () {
                window.location.href = "my-entries.html";
            }, 1000);
        } catch (error) {
            console.error("Submission error:", error);
            formMessage.textContent = "Error saving photograph. Storage might be full.";
            formMessage.className = "form-message error";
        }
    });
}


// ==========================================
// SYNC ENTRY JUDGING STATES
// ==========================================

function syncEntryJudgingStates() {
    let entries = JSON.parse(localStorage.getItem("photoEntries")) || [];
    const judgeScores = JSON.parse(localStorage.getItem("judgeScores")) || [];

    entries.forEach(function (entry) {
        const scores = judgeScores.filter(function (score) {
            return String(score.entryId) === String(entry.id);
        });

        entry.judgesCompleted = scores.length;

        if (scores.length >= 3) {
            entry.judgingStatus = "ranked";
            entry.isRanked = true;

            // Provide fallback score if leaderboard hasn't computed normalized score yet
            if (entry.finalScore === undefined || entry.finalScore === null || isNaN(entry.finalScore)) {
                const totalWeighted = scores.reduce(function (sum, s) {
                    return sum + Number(s.weightedScore || 0);
                }, 0);
                entry.finalScore = Number((totalWeighted / scores.length).toFixed(2));
            }
        } else if (scores.length > 0) {
            entry.judgingStatus = "judging";
            entry.isRanked = false;
        } else {
            entry.judgingStatus = "submitted";
            entry.isRanked = false;
        }
    });

    localStorage.setItem("photoEntries", JSON.stringify(entries));
    return entries;
}


// =========================================================
// MY ENTRIES PAGE
// =========================================================

function displayEntries() {
    const entriesContainer = document.querySelector("#entriesContainer");
    const noEntriesMessage = document.querySelector("#noEntriesMessage");

    if (!entriesContainer) return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "participant") {
        window.location.href = "login.html";
        return;
    }

    const allEntries = syncEntryJudgingStates();
    const contests = JSON.parse(localStorage.getItem("contests")) || [];

    const entries = allEntries.filter(function (entry) {
        return String(entry.participantId) === String(currentUser.id);
    });

    if (entries.length === 0) {
        entriesContainer.innerHTML = "";
        if (noEntriesMessage) noEntriesMessage.style.display = "block";
        return;
    }

    if (noEntriesMessage) noEntriesMessage.style.display = "none";
    entriesContainer.innerHTML = "";

    entries.forEach(function (entry, index) {
        const parentContest = contests.find(function (c) {
            return String(c.id) === String(entry.contestId);
        });

        const contestTitle = parentContest ? parentContest.title : "Photo Contest";
        const finalScoreDisplay = (entry.finalScore && !isNaN(entry.finalScore))
            ? Number(entry.finalScore).toFixed(2)
            : "—";

        const rankDisplay = entry.rank ? `#${entry.rank}` : "Ranked";

        const card = document.createElement("article");
        card.className = "entry-card";

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
                <p class="small-heading" style="color: var(--accent-gold-dark);">
                    ${contestTitle.toUpperCase()}
                </p>

                <h2>
                    ${entry.title}
                </h2>

                <p class="entry-description">
                    ${entry.description}
                </p>

                <p class="entry-participant">
                    By <strong>${entry.participantName}</strong>
                </p>

                <p class="entry-date">
                    Submitted ${new Date(entry.createdAt).toLocaleDateString()}
                </p>

                <div class="entry-actions">
                    ${
                        entry.judgingStatus === "ranked"
                            ? `
                            <div class="final-result-box">
                                <div class="result-main">
                                    <div class="result-score">
                                        <span class="result-label">FINAL SCORE</span>
                                        <strong>${finalScoreDisplay}</strong>
                                        <span class="score-max">/ 10</span>
                                    </div>
                                    <div class="result-rank">
                                        <span>RANK</span>
                                        <strong>${rankDisplay}</strong>
                                    </div>
                                </div>
                                <div class="result-status">
                                    ✓ Evaluation Complete
                                </div>
                                <a href="result.html?id=${entry.id}" class="result-btn">
                                    View Detailed Evaluation →
                                </a>
                            </div>
                            `
                            : entry.judgingStatus === "judging"
                            ? `
                            <div class="judging-status-box">
                                <div class="judging-status-header">
                                    <span class="status-lock">🔒</span>
                                    <div>
                                        <strong>Under Judging</strong>
                                        <span>Your entry is currently being evaluated.</span>
                                    </div>
                                </div>
                                <div class="judging-progress">
                                    <div class="progress-text">
                                        <span>Judges completed</span>
                                        <strong>${entry.judgesCompleted || 1}/3</strong>
                                    </div>
                                    <div class="progress-bar">
                                        <div style="width: ${((entry.judgesCompleted || 1) / 3) * 100}%;"></div>
                                    </div>
                                </div>
                                <p class="judging-note">
                                    Editing and deletion are locked while judging is in progress.
                                </p>
                            </div>
                            `
                            : `
                            <button class="entry-btn" onclick="editEntry(${entry.id})">
                                Edit Details
                            </button>
                            <button class="entry-btn delete-btn" onclick="deleteEntry(${entry.id})">
                                Delete Entry
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
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "participant") {
        window.location.href = "login.html";
        return;
    }

    const entries = JSON.parse(localStorage.getItem("photoEntries")) || [];
    const entry = entries.find(function (item) {
        return item.id === entryId;
    });

    if (!entry) {
        alert("Entry not found.");
        return;
    }

    if (entry.judgingStatus === "judging" || entry.judgingStatus === "ranked" || (entry.judgesCompleted && entry.judgesCompleted > 0)) {
        alert("This entry is locked because judging has started.");
        return;
    }

    if (String(entry.participantId) !== String(currentUser.id)) {
        alert("You are not authorized to edit this entry.");
        return;
    }

    window.location.href = `edit-entry.html?id=${entryId}`;
}


// ==========================================
// DELETE ENTRY
// ==========================================

function deleteEntry(entryId) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "participant") {
        window.location.href = "login.html";
        return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this photograph submission?");
    if (!confirmDelete) return;

    let entries = JSON.parse(localStorage.getItem("photoEntries")) || [];
    const entry = entries.find(function (item) {
        return item.id === entryId;
    });

    if (!entry) {
        alert("Entry not found.");
        return;
    }

    if (entry.judgingStatus === "judging" || entry.judgingStatus === "ranked" || (entry.judgesCompleted && entry.judgesCompleted > 0)) {
        alert("This entry is locked because judging has started.");
        return;
    }

    if (String(entry.participantId) !== String(currentUser.id)) {
        alert("You are not authorized to delete this entry.");
        return;
    }

    entries = entries.filter(function (item) {
        return item.id !== entryId;
    });

    localStorage.setItem("photoEntries", JSON.stringify(entries));
    displayEntries();
}


// =========================================================
// EDIT PAGE INITIALIZATION
// =========================================================

function initializeEditPage() {
    const editForm = document.querySelector("#editForm");
    if (!editForm) return;

    const params = new URLSearchParams(window.location.search);
    const entryId = Number(params.get("id"));

    const entries = JSON.parse(localStorage.getItem("photoEntries")) || [];
    const entry = entries.find(function (item) {
        return item.id === entryId;
    });

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const editMessage = document.querySelector("#editMessage");

    if (!currentUser || currentUser.role !== "participant") {
        window.location.href = "login.html";
        return;
    }

    if (!entry) {
        if (editMessage) editMessage.textContent = "Entry not found.";
        return;
    }

    if (String(entry.participantId) !== String(currentUser.id)) {
        if (editMessage) editMessage.textContent = "You are not authorized to edit this entry.";
        editForm.style.display = "none";
        return;
    }

    if (entry.judgingStatus === "judging" || entry.judgingStatus === "ranked" || (entry.judgesCompleted && entry.judgesCompleted > 0)) {
        if (editMessage) editMessage.textContent = "This entry is locked because judging has started.";
        editForm.style.display = "none";
        return;
    }

    const participantNameInput = document.querySelector("#editParticipantName");
    const photoTitleInput = document.querySelector("#editPhotoTitle");
    const photoDescriptionInput = document.querySelector("#editPhotoDescription");
    const editImagePreview = document.querySelector("#editImagePreview");

    if (participantNameInput) participantNameInput.value = entry.participantName;
    if (photoTitleInput) photoTitleInput.value = entry.title;
    if (photoDescriptionInput) photoDescriptionInput.value = entry.description;

    if (editImagePreview) {
        editImagePreview.style.display = "block";
        editImagePreview.style.position = "relative";
        editImagePreview.style.height = "240px";
        editImagePreview.style.borderRadius = "var(--radius-md)";
        editImagePreview.style.overflow = "hidden";
        editImagePreview.innerHTML = `
            <img src="${entry.image}" class="image-preview" style="width:100%;height:100%;object-fit:cover;" alt="${entry.title}">
        `;
    }

    editForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const updatedTitle = photoTitleInput ? photoTitleInput.value.trim() : "";
        const updatedDescription = photoDescriptionInput ? photoDescriptionInput.value.trim() : "";

        if (!updatedTitle || !updatedDescription) {
            if (editMessage) {
                editMessage.textContent = "Please complete all fields.";
                editMessage.className = "form-message error";
            }
            return;
        }

        const entryIndex = entries.findIndex(function (item) {
            return item.id === entryId;
        });

        entries[entryIndex].title = updatedTitle;
        entries[entryIndex].description = updatedDescription;

        localStorage.setItem("photoEntries", JSON.stringify(entries));

        if (editMessage) {
            editMessage.textContent = "✓ Entry updated successfully!";
            editMessage.className = "form-message success";
        }

        setTimeout(function () {
            window.location.href = "my-entries.html";
        }, 800);
    });
}

// Run initializers
initializeEditPage();
displayEntries();
displaySelectedContest();