// ==========================================
// PHOTO SUBMISSION + ENTRY MANAGEMENT
// ==========================================


// ==========================================
// GET FORM ELEMENTS
// ==========================================

const submissionForm = document.querySelector("#submissionForm");


// ==========================================
// CREATE / SUBMISSION CODE
// ==========================================

// Only run this code if we are on submit.html

if (submissionForm) {

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

    const formMessage =
        document.querySelector("#formMessage");


    // ==========================================
    // IMAGE PREVIEW
    // ==========================================

    photoInput.addEventListener("change", function () {

        const file = photoInput.files[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();


        reader.onload = function (event) {

            previewContainer.innerHTML = `
                <img
                    src="${event.target.result}"
                    class="image-preview"
                    alt="Selected photograph"
                >
            `;

        };


        reader.readAsDataURL(file);

    });


    // ==========================================
    // CREATE ENTRY
    // ==========================================

    submissionForm.addEventListener("submit", function (event) {

        // Prevent page refresh
        event.preventDefault();


        const file = photoInput.files[0];


        if (!file) {

            formMessage.textContent =
                "Please select a photograph.";

            return;
        }


        // Read image using FileReader

        const reader = new FileReader();


        reader.onload = function (event) {


            // ==========================================
            // CREATE ENTRY OBJECT
            // ==========================================

            const entry = {

                id: Date.now(),

                participantName:
                    participantName.value.trim(),

                title:
                    photoTitle.value.trim(),

                description:
                    photoDescription.value.trim(),

                image:
                    event.target.result,

                createdAt:
                    new Date().toISOString()

            };


            // ==========================================
            // GET EXISTING ENTRIES
            // ==========================================

            let entries =
                JSON.parse(
                    localStorage.getItem("photoEntries")
                ) || [];


            // ==========================================
            // ADD NEW ENTRY
            // ==========================================

            entries.push(entry);


            // ==========================================
            // SAVE TO LOCAL STORAGE
            // ==========================================

            localStorage.setItem(
                "photoEntries",
                JSON.stringify(entries)
            );


            // ==========================================
            // SUCCESS MESSAGE
            // ==========================================

            formMessage.textContent =
                "Photograph submitted successfully!";


            // Clear form

            submissionForm.reset();


            // Clear image preview

            previewContainer.innerHTML =
                "<p>Image preview will appear here</p>";

        };


        reader.readAsDataURL(file);

    });

}


// ==========================================
// READ ENTRIES
// ==========================================

function displayEntries() {

    const entriesContainer =
        document.querySelector("#entriesContainer");

    const noEntriesMessage =
        document.querySelector("#noEntriesMessage");


    // If this is not the My Entries page,
    // stop here.

    if (!entriesContainer) {
        return;
    }


    // Get entries from localStorage

    const entries =
        JSON.parse(
            localStorage.getItem("photoEntries")
        ) || [];


    // ==========================================
    // NO ENTRIES
    // ==========================================

    if (entries.length === 0) {

        entriesContainer.innerHTML = "";

        noEntriesMessage.style.display = "block";

        return;
    }


    // Hide "No entries" message

    noEntriesMessage.style.display = "none";


    // Clear container

    entriesContainer.innerHTML = "";


    // ==========================================
    // DISPLAY EACH ENTRY
    // ==========================================

    entries.forEach(function (entry) {

        const card =
            document.createElement("div");

        card.className = "entry-card";


        card.innerHTML = `

            <img
                src="${entry.image}"
                alt="${entry.title}"
            >

            <div class="entry-content">

                <h2>
                    ${entry.title}
                </h2>

                <p>
                    ${entry.description}
                </p>

                <p>
                    <strong>Participant:</strong>
                    ${entry.participantName}
                </p>

                <p class="entry-date">
                    Submitted:
                    ${new Date(entry.createdAt)
                        .toLocaleDateString()}
                </p>

                <div class="entry-actions">

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

                </div>

            </div>
        `;


        entriesContainer.appendChild(card);

    });

}


// ==========================================
// RUN READ FUNCTION
// ==========================================

displayEntries();

// ==========================================
// DELETE ENTRY
// ==========================================

function deleteEntry(entryId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this entry?"
    );

    // Stop if user clicks Cancel
    if (!confirmDelete) {
        return;
    }


    // Get existing entries
    let entries =
        JSON.parse(
            localStorage.getItem("photoEntries")
        ) || [];


    // Remove the selected entry
    entries = entries.filter(function (entry) {

        return entry.id !== entryId;

    });


    // Save updated array
    localStorage.setItem(
        "photoEntries",
        JSON.stringify(entries)
    );


    // Refresh the page display
    displayEntries();
}



// ==========================================
// OPEN EDIT PAGE
// ==========================================

function editEntry(entryId) {

    window.location.href =
        `edit-entry.html?id=${entryId}`;
}



// ==========================================
// EDIT ENTRY PAGE
// ==========================================

const editForm = document.querySelector("#editForm");

if (editForm) {

    const params =
        new URLSearchParams(window.location.search);

    const entryId =
        Number(params.get("id"));


    // Get all entries

    const entries =
        JSON.parse(
            localStorage.getItem("photoEntries")
        ) || [];


    // Find the selected entry

    const entry =
        entries.find(function (item) {

            return item.id === entryId;

        });


    // If entry doesn't exist

    if (!entry) {

        document.querySelector("#editMessage").textContent =
            "Entry not found.";

    } else {

        // Fill existing values

        document.querySelector(
            "#editParticipantName"
        ).value = entry.participantName;


        document.querySelector(
            "#editPhotoTitle"
        ).value = entry.title;


        document.querySelector(
            "#editPhotoDescription"
        ).value = entry.description;


        // Show current image

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


                // Get updated values

                const updatedTitle =
                    document.querySelector(
                        "#editPhotoTitle"
                    ).value.trim();


                const updatedDescription =
                    document.querySelector(
                        "#editPhotoDescription"
                    ).value.trim();


                // Find entry index

                const entryIndex =
                    entries.findIndex(function (item) {

                        return item.id === entryId;

                    });


                // Update values

                entries[entryIndex].title =
                    updatedTitle;

                entries[entryIndex].description =
                    updatedDescription;


                // Save updated entries

                localStorage.setItem(
                    "photoEntries",
                    JSON.stringify(entries)
                );


                // Success message

                document.querySelector(
                    "#editMessage"
                ).textContent =
                    "Entry updated successfully!";


                // Return to My Entries after a short delay

                setTimeout(function () {

                    window.location.href =
                        "my-entries.html";

                }, 1000);

            }
        );

    }

}