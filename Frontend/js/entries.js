// =========================================================
// PHOTOJUDGE — PHOTO SUBMISSION & ENTRY MANAGEMENT
// =========================================================


// =========================================================
// SUBMISSION PAGE
// =========================================================

const submissionForm = document.querySelector("#submissionForm");


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

    const imagePreview =
        document.querySelector("#imagePreview");

    const formMessage =
        document.querySelector("#formMessage");


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

                const entry = {

                    id: Date.now(),

                    participantName: name,

                    title: title,

                    description: description,

                    image: compressedImage,

                    createdAt:
                        new Date().toISOString(),

                    status: "Submitted",

                    scores: {
                        creativity: null,
                        technical: null,
                        theme: null
                    },

                    finalScore: null

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


// =========================================================
// MY ENTRIES PAGE
// =========================================================

function displayEntries() {

    const entriesContainer =
        document.querySelector("#entriesContainer");

    const noEntriesMessage =
        document.querySelector("#noEntriesMessage");


    // Not My Entries page

    if (!entriesContainer) {
        return;
    }


    let entries = [];


    try {

        entries =
            JSON.parse(
                localStorage.getItem("photoEntries")
            ) || [];

    } catch (error) {

        entries = [];

    }


    // =====================================================
    // NO ENTRIES
    // =====================================================

    if (entries.length === 0) {

        entriesContainer.innerHTML = "";

        noEntriesMessage.style.display =
            "block";

        return;
    }


    noEntriesMessage.style.display =
        "none";


    entriesContainer.innerHTML = "";


    // =====================================================
    // DISPLAY ENTRIES
    // =====================================================

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
                    ${entry.status || "Submitted"}
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


// Run My Entries

displayEntries();


// =========================================================
// DELETE ENTRY
// =========================================================

function deleteEntry(entryId) {

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


    entries =
        entries.filter(function (entry) {

            return entry.id !== entryId;

        });


    localStorage.setItem(
        "photoEntries",
        JSON.stringify(entries)
    );


    displayEntries();

}


// =========================================================
// EDIT ENTRY
// =========================================================

function editEntry(entryId) {

    window.location.href =
        `edit-entry.html?id=${entryId}`;

}


// =========================================================
// EDIT PAGE
// =========================================================

const editForm =
    document.querySelector("#editForm");


if (editForm) {

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


    const editMessage =
        document.querySelector("#editMessage");


    // =====================================================
    // ENTRY NOT FOUND
    // =====================================================

    if (!entry) {

        editMessage.textContent =
            "Entry not found.";

    }


    else {

        // Fill participant name

        document.querySelector(
            "#editParticipantName"
        ).value =
            entry.participantName;


        // Fill title

        document.querySelector(
            "#editPhotoTitle"
        ).value =
            entry.title;


        // Fill description

        document.querySelector(
            "#editPhotoDescription"
        ).value =
            entry.description;


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


        // =================================================
        // UPDATE ENTRY
        // =================================================

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

}