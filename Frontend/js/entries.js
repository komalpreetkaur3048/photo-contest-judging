/* =========================================================
   PHOTOJUDGE — PHOTO SUBMISSION & ENTRY MANAGEMENT
========================================================= */

// ==========================================
// URL PARAMETERS & CONTEST HELPERS
// ==========================================

const submitParams = new URLSearchParams(window.location.search);
const selectedContestId = submitParams.get("contestId");

// Cache for contests loaded from API
let loadedContests = [];

async function fetchContestsList() {
    if (loadedContests.length > 0) return loadedContests;

    try {
        if (window.PhotoJudgeAPI) {
            const res = await window.PhotoJudgeAPI.getContests();
            const list = res?.contests || res?.data?.contests || res;
            if (Array.isArray(list) && list.length > 0) {
                loadedContests = list.map(c => ({
                    ...c,
                    id: c.id || c.contestId || c._id
                }));
                localStorage.setItem("contests", JSON.stringify(loadedContests));
                return loadedContests;
            }
        }
    } catch (err) {
        console.warn("Could not load contests from API, falling back to local cache:", err);
    }

    try {
        loadedContests = JSON.parse(localStorage.getItem("contests")) || [];
    } catch (e) {
        loadedContests = [];
    }

    return loadedContests;
}

function findContestById(contests, targetId) {
    if (!targetId || !Array.isArray(contests)) return null;
    return contests.find(c => 
        String(c.id) === String(targetId) || 
        String(c._id) === String(targetId) || 
        String(c.contestId) === String(targetId)
    );
}

// ==========================================
// DISPLAY SELECTED CONTEST INFO IN HEADER
// ==========================================

async function displaySelectedContest() {
    const contestName = document.querySelector("#selectedContestName");
    const criteriaContainer = document.querySelector("#submissionCriteria");

    if (!contestName && !criteriaContainer) return;

    const contests = await fetchContestsList();
    const contest = findContestById(contests, selectedContestId);

    if (!contest) {
        if (contestName) contestName.textContent = "No contest selected";
        if (criteriaContainer) {
            criteriaContainer.innerHTML = `
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                    Please select a contest above to view evaluation criteria.
                </p>
            `;
        }
        return;
    }

    if (contestName) {
        contestName.textContent = contest.title;
    }

    if (criteriaContainer && contest.criteria) {
        criteriaContainer.innerHTML = `
            <div>
                <strong>${contest.criteria.creativity || 40}%</strong>
                <span>Creativity</span>
            </div>
            <div>
                <strong>${contest.criteria.technical || 30}%</strong>
                <span>Technical Quality</span>
            </div>
            <div>
                <strong>${contest.criteria.themeFit || contest.criteria.theme || 30}%</strong>
                <span>Theme Fit</span>
            </div>
        `;
    }
}

// =========================================================
// SUBMISSION PAGE LOGIC
// =========================================================

const submissionForm = document.querySelector("#submissionForm");

if (submissionForm) {
    const contestSelect = document.querySelector("#contestSelect");
    const participantName = document.querySelector("#participantName");
    const photoTitle = document.querySelector("#photoTitle");
    const photoDescription = document.querySelector("#photoDescription");
    const photoInput = document.querySelector("#photo");
    const previewContainer = document.querySelector("#previewContainer");
    const imagePreview = document.querySelector("#imagePreview");
    const uploadPlaceholder = document.querySelector("#uploadPlaceholder");
    const formMessage = document.querySelector("#formMessage");
    const titleCount = document.querySelector("#titleCount");
    const descriptionCount = document.querySelector("#descriptionCount");

    // Auto-fill logged-in participant name
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && participantName) {
        participantName.value = currentUser.name || "";
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

    // Load active contests dynamically into select dropdown
    async function loadContestOptions() {
        if (!contestSelect) return;

        contestSelect.innerHTML = `<option value="">Loading active contests...</option>`;

        const contests = await fetchContestsList();
        
        // Filter active contests (or upcoming with open submissions)
        const activeContests = contests.filter(c => c.status === "active");

        contestSelect.innerHTML = `<option value="">Select an active contest</option>`;

        if (activeContests.length === 0) {
            contestSelect.innerHTML += `<option value="" disabled>No active contests currently open</option>`;
            return;
        }

        activeContests.forEach(function (contest) {
            const optionVal = contest.id || contest._id;
            contestSelect.innerHTML += `
                <option value="${optionVal}">
                    ${contest.title} (${contest.category || "General"})
                </option>
            `;
        });

        // Pre-select if URL parameter passed
        if (selectedContestId) {
            const matching = findContestById(activeContests, selectedContestId);
            if (matching) {
                const targetVal = matching.id || matching._id;
                contestSelect.value = targetVal;
                contestSelect.dispatchEvent(new Event("change"));
            }
        }
    }

    loadContestOptions();

    // On contest dropdown selection change, update criteria & title
    contestSelect.addEventListener("change", async function () {
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

        const contests = await fetchContestsList();
        const selectedContest = findContestById(contests, chosenContestId);

        if (!selectedContest) return;

        if (contestName) contestName.textContent = selectedContest.title;

        if (criteriaContainer && selectedContest.criteria) {
            criteriaContainer.innerHTML = `
                <div>
                    <strong>${selectedContest.criteria.creativity || 40}%</strong>
                    <span>Creativity</span>
                </div>
                <div>
                    <strong>${selectedContest.criteria.technical || 30}%</strong>
                    <span>Technical Quality</span>
                </div>
                <div>
                    <strong>${selectedContest.criteria.themeFit || selectedContest.criteria.theme || 30}%</strong>
                    <span>Theme Fit</span>
                </div>
            `;
        }
    });

    // Image preview handler
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

            if (file.size > 8 * 1024 * 1024) {
                formMessage.textContent = "Image is too large. Maximum allowed size is 8 MB.";
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

    // High quality canvas image compression helper
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

                    const compressedImage = canvas.toDataURL("image/jpeg", 0.75);
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

    // Submit form handler
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
            formMessage.textContent = "Please fill in all required fields and select an active contest.";
            formMessage.className = "form-message error";
            return;
        }

        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user || user.role !== "participant") {
            window.location.href = "login.html";
            return;
        }

        const contests = await fetchContestsList();
        const selectedContest = findContestById(contests, chosenContestId);

        if (!selectedContest) {
            formMessage.textContent = "Selected contest could not be found or has ended.";
            formMessage.className = "form-message error";
            return;
        }

        formMessage.textContent = "Optimizing and saving your photograph...";
        formMessage.className = "form-message";

        try {
            const compressedImage = await compressImage(file);

            const submissionPayload = {
                contestId: selectedContest.id || selectedContest._id || chosenContestId,
                title: title,
                description: description,
                image: compressedImage
            };

            let entryId = Date.now().toString();

            // Submit directly to MongoDB backend API
            if (window.PhotoJudgeAPI && localStorage.getItem("token")) {
                const apiRes = await window.PhotoJudgeAPI.submitEntry(submissionPayload);

                if (apiRes && apiRes.success && apiRes.entry) {
                    entryId = apiRes.entry._id || apiRes.entry.id;
                } else if (apiRes && apiRes.message) {
                    formMessage.textContent = apiRes.message;
                    formMessage.className = "form-message error";
                    return;
                }
            }

            // Sync with local photoEntries for instant offline cache
            let existingPhotoEntries = [];
            try {
                existingPhotoEntries = JSON.parse(localStorage.getItem("photoEntries")) || [];
            } catch (e) {
                existingPhotoEntries = [];
            }

            existingPhotoEntries.push({
                id: entryId,
                _id: entryId,
                participantId: user.id || user._id,
                participantName: user.name || name,
                contestId: submissionPayload.contestId,
                title: title,
                description: description,
                image: compressedImage,
                createdAt: new Date().toISOString(),
                judgingStatus: "submitted",
                judgesCompleted: 0,
                isRanked: false
            });

            localStorage.setItem("photoEntries", JSON.stringify(existingPhotoEntries));

            formMessage.textContent = "✓ Photograph submitted successfully! Redirecting to your gallery...";
            formMessage.className = "form-message success";

            submissionForm.reset();

            if (imagePreview) imagePreview.src = "";
            if (previewContainer) previewContainer.classList.remove("active");
            if (uploadPlaceholder) uploadPlaceholder.style.display = "block";

            setTimeout(function () {
                window.location.href = "my-entries.html";
            }, 1000);
        } catch (error) {
            console.error("Submission error:", error);
            formMessage.textContent = error.message || "Error submitting photograph. Please try again.";
            formMessage.className = "form-message error";
        }
    });
}

// =========================================================
// MY ENTRIES PAGE (STRICT COMPETITION RULES & LOCKS)
// =========================================================

async function displayEntries() {
    const entriesContainer = document.querySelector("#entriesContainer");
    const noEntriesMessage = document.querySelector("#noEntriesMessage");

    if (!entriesContainer) return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "participant") {
        window.location.href = "login.html";
        return;
    }

    entriesContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
            Loading your entries...
        </div>
    `;

    // 1. Fetch live contests
    const contests = await fetchContestsList();

    // 2. Fetch live entries from MongoDB backend API
    let entries = [];
    if (window.PhotoJudgeAPI && localStorage.getItem("token")) {
        try {
            const res = await window.PhotoJudgeAPI.getMyEntries();
            if (res && res.success && Array.isArray(res.entries)) {
                entries = res.entries;
                localStorage.setItem("photoEntries", JSON.stringify(entries));
            }
        } catch (e) {
            console.warn("Could not fetch entries from API, using local cache:", e);
        }
    }

    if (entries.length === 0) {
        try {
            const local = JSON.parse(localStorage.getItem("photoEntries")) || [];
            entries = local.filter(e => String(e.participantId) === String(currentUser.id || currentUser._id));
        } catch (e) {
            entries = [];
        }
    }

    if (entries.length === 0) {
        entriesContainer.innerHTML = "";
        if (noEntriesMessage) noEntriesMessage.style.display = "block";
        return;
    }

    if (noEntriesMessage) noEntriesMessage.style.display = "none";
    entriesContainer.innerHTML = "";

    entries.forEach(function (entry) {
        const entryIdStr = String(entry._id || entry.id);
        const parentContest = findContestById(contests, entry.contestId);

        const contestTitle = parentContest ? parentContest.title : "Photo Contest";
        
        // Competition state calculations
        const judgesCount = Number(entry.judgesCompleted || 0);
        const isRanked = entry.judgingStatus === "ranked" || entry.isRanked || judgesCount >= 3;
        const isUnderJudging = judgesCount > 0 || entry.judgingStatus === "judging";
        
        // Contest lifecycle checks
        const contestDeadlinePassed = parentContest && (
            parentContest.status === "completed" || 
            (parentContest.deadline && new Date(parentContest.deadline) < new Date())
        );

        const finalScoreDisplay = (entry.finalScore && !isNaN(entry.finalScore))
            ? Number(entry.finalScore).toFixed(2)
            : "—";

        const rankDisplay = entry.rank ? `#${entry.rank}` : "Ranked";

        const card = document.createElement("article");
        card.className = "entry-card";

        // Status badge display
        let statusBadgeText = "Submitted";
        if (isRanked) {
            statusBadgeText = "✓ Ranked";
        } else if (isUnderJudging) {
            statusBadgeText = "🔒 Under Judging";
        } else if (contestDeadlinePassed) {
            statusBadgeText = "🔒 Submissions Closed";
        }

        // Action block adhering to photo competition rules:
        // - Ranked: evaluation complete -> View Results
        // - Judging started or deadline passed: LOCKED -> No editing/deleting allowed!
        // - Active before judging: Can edit or withdraw
        let actionMarkup = "";

        if (isRanked) {
            actionMarkup = `
                <div class="final-result-box">
                    <div class="result-main">
                        <div class="result-score">
                            <span class="result-label">FINAL NORMALIZED SCORE</span>
                            <strong>${finalScoreDisplay}</strong>
                            <span class="score-max">/ 10</span>
                        </div>
                        <div class="result-rank">
                            <span>RANK</span>
                            <strong>${rankDisplay}</strong>
                        </div>
                    </div>
                    <div class="result-status">
                        ✓ Evaluation Complete & Normalized
                    </div>
                    <a href="result.html?id=${entryIdStr}" class="result-btn">
                        View Detailed Evaluation →
                    </a>
                </div>
            `;
        } else if (isUnderJudging) {
            actionMarkup = `
                <div class="judging-status-box">
                    <div class="judging-status-header">
                        <span class="status-lock">🔒</span>
                        <div>
                            <strong>Evaluation in Progress</strong>
                            <span>Jury members are currently scoring your photograph.</span>
                        </div>
                    </div>
                    <div class="judging-progress">
                        <div class="progress-text">
                            <span>Evaluations Completed</span>
                            <strong>${judgesCount}/3 Judges</strong>
                        </div>
                        <div class="progress-bar">
                            <div style="width: ${(judgesCount / 3) * 100}%;"></div>
                        </div>
                    </div>
                    <p class="judging-note">
                        🔒 Editing and withdrawal are locked once evaluation begins to guarantee judging integrity.
                    </p>
                </div>
            `;
        } else if (contestDeadlinePassed) {
            actionMarkup = `
                <div class="judging-status-box">
                    <div class="judging-status-header">
                        <span class="status-lock">🔒</span>
                        <div>
                            <strong>Submissions Closed</strong>
                            <span>The competition deadline has passed. Awaiting final juror scores.</span>
                        </div>
                    </div>
                    <p class="judging-note">
                        Modifications are no longer permitted after the submission deadline.
                    </p>
                </div>
            `;
        } else {
            // Contest still active and 0 evaluations completed: Participant can edit or withdraw!
            actionMarkup = `
                <div class="active-entry-actions" style="display: flex; gap: 12px; margin-top: 14px;">
                    <button class="entry-btn" onclick="editEntry('${entryIdStr}')" style="flex: 1;">
                        ✏️ Edit Details
                    </button>
                    <button class="entry-btn delete-btn" onclick="deleteEntry('${entryIdStr}')" style="flex: 1;">
                        🗑️ Withdraw Entry
                    </button>
                </div>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 8px;">
                    You can edit or withdraw your photograph until juror evaluation begins.
                </p>
            `;
        }

        card.innerHTML = `
            <div class="entry-image-wrapper">
                <img
                    src="${entry.image}"
                    alt="${entry.title}"
                    class="entry-image"
                >
                <span class="entry-status">
                    ${statusBadgeText}
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
                    By <strong>${entry.participantName || currentUser.name}</strong>
                </p>

                <p class="entry-date">
                    Submitted ${new Date(entry.createdAt).toLocaleDateString()}
                </p>

                <div class="entry-actions">
                    ${actionMarkup}
                </div>
            </div>
        `;

        entriesContainer.appendChild(card);
    });
}

// =========================================================
// EDIT ENTRY (STRING ID SAFE)
// =========================================================

async function editEntry(entryId) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "participant") {
        window.location.href = "login.html";
        return;
    }

    let entries = [];
    try {
        entries = JSON.parse(localStorage.getItem("photoEntries")) || [];
    } catch (e) {
        entries = [];
    }

    const entry = entries.find(item => String(item.id || item._id) === String(entryId));

    if (entry) {
        if (entry.judgingStatus === "judging" || entry.judgingStatus === "ranked" || (entry.judgesCompleted && entry.judgesCompleted > 0)) {
            alert("This entry is locked because judging has already begun.");
            return;
        }
    }

    window.location.href = `edit-entry.html?id=${encodeURIComponent(entryId)}`;
}

// =========================================================
// DELETE / WITHDRAW ENTRY (STRING ID SAFE)
// =========================================================

async function deleteEntry(entryId) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "participant") {
        window.location.href = "login.html";
        return;
    }

    const confirmDelete = confirm("Are you sure you want to withdraw and delete this photograph submission?");
    if (!confirmDelete) return;

    try {
        if (window.EntriesAPI && localStorage.getItem("token")) {
            const apiRes = await window.EntriesAPI.delete(entryId);
            if (apiRes && apiRes.data && !apiRes.data.success && apiRes.data.message) {
                alert(apiRes.data.message);
                return;
            }
        }

        let entries = JSON.parse(localStorage.getItem("photoEntries")) || [];
        entries = entries.filter(item => String(item.id || item._id) !== String(entryId));
        localStorage.setItem("photoEntries", JSON.stringify(entries));

        displayEntries();
    } catch (err) {
        console.error("Error withdrawing entry:", err);
        alert("Failed to delete entry. Please check connection and try again.");
    }
}

// =========================================================
// EDIT PAGE INITIALIZATION
// =========================================================

async function initializeEditPage() {
    const editForm = document.querySelector("#editForm");
    if (!editForm) return;

    const params = new URLSearchParams(window.location.search);
    const entryId = params.get("id");

    if (!entryId) {
        alert("No entry specified.");
        window.location.href = "my-entries.html";
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const editMessage = document.querySelector("#editMessage");

    if (!currentUser || currentUser.role !== "participant") {
        window.location.href = "login.html";
        return;
    }

    let entry = null;

    // Fetch from backend API if available
    if (window.EntriesAPI) {
        try {
            const res = await window.EntriesAPI.getById(entryId);
            if (res && res.data && res.data.entry) {
                entry = res.data.entry;
            }
        } catch (e) {
            console.warn("Could not fetch entry from API:", e);
        }
    }

    if (!entry) {
        const entries = JSON.parse(localStorage.getItem("photoEntries")) || [];
        entry = entries.find(item => String(item.id || item._id) === String(entryId));
    }

    if (!entry) {
        if (editMessage) editMessage.textContent = "Entry not found.";
        return;
    }

    // Locking checks
    if (entry.judgingStatus === "judging" || entry.judgingStatus === "ranked" || (entry.judgesCompleted && entry.judgesCompleted > 0)) {
        if (editMessage) {
            editMessage.textContent = "🔒 This entry is locked because judging has already begun.";
            editMessage.className = "form-message error";
        }
        editForm.style.display = "none";
        return;
    }

    const participantNameInput = document.querySelector("#editParticipantName");
    const photoTitleInput = document.querySelector("#editPhotoTitle");
    const photoDescriptionInput = document.querySelector("#editPhotoDescription");
    const editImagePreview = document.querySelector("#editImagePreview");

    if (participantNameInput) participantNameInput.value = entry.participantName || currentUser.name;
    if (photoTitleInput) photoTitleInput.value = entry.title || "";
    if (photoDescriptionInput) photoDescriptionInput.value = entry.description || "";

    if (editImagePreview && entry.image) {
        editImagePreview.style.display = "block";
        editImagePreview.style.position = "relative";
        editImagePreview.style.height = "240px";
        editImagePreview.style.borderRadius = "var(--radius-md)";
        editImagePreview.style.overflow = "hidden";
        editImagePreview.innerHTML = `
            <img src="${entry.image}" class="image-preview" style="width:100%;height:100%;object-fit:cover;" alt="${entry.title}">
        `;
    }

    editForm.addEventListener("submit", async function (event) {
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

        try {
            if (window.EntriesAPI && localStorage.getItem("token")) {
                const apiRes = await window.EntriesAPI.update(entryId, {
                    title: updatedTitle,
                    description: updatedDescription
                });

                if (apiRes && apiRes.data && !apiRes.data.success) {
                    if (editMessage) {
                        editMessage.textContent = apiRes.data.message || "Failed to update entry.";
                        editMessage.className = "form-message error";
                    }
                    return;
                }
            }

            // Sync localStorage
            let entries = JSON.parse(localStorage.getItem("photoEntries")) || [];
            const entryIndex = entries.findIndex(item => String(item.id || item._id) === String(entryId));
            if (entryIndex !== -1) {
                entries[entryIndex].title = updatedTitle;
                entries[entryIndex].description = updatedDescription;
                localStorage.setItem("photoEntries", JSON.stringify(entries));
            }

            if (editMessage) {
                editMessage.textContent = "✓ Entry updated successfully!";
                editMessage.className = "form-message success";
            }

            setTimeout(function () {
                window.location.href = "my-entries.html";
            }, 800);
        } catch (err) {
            console.error("Update error:", err);
            if (editMessage) {
                editMessage.textContent = "Error saving changes. Please try again.";
                editMessage.className = "form-message error";
            }
        }
    });
}

// Global exposure for onclick handlers
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;

// Initialize components
document.addEventListener("DOMContentLoaded", function () {
    displaySelectedContest();
    displayEntries();
    initializeEditPage();
});

// Immediate execution fallback
displaySelectedContest();
displayEntries();
initializeEditPage();