// ==========================================
// PHOTO CONTEST DATA
// ==========================================

const contests = [

    // ==========================================
    // 1. NATURE
    // ==========================================

    {
        id: "nature-2026",

        title: "Nature Through My Lens",

        category: "Nature",

        description:
            "Capture the beauty, emotion, and diversity of nature through your lens.",

        deadline: "2026-08-30",

        status: "active",

        maxSubmissions: 3,

        criteria: {
            creativity: 40,
            technical: 30,
            themeFit: 30
        }
    },


    // ==========================================
    // 2. WILDLIFE
    // ==========================================

    {
        id: "wildlife-2026",

        title: "Wildlife Wonders",

        category: "Wildlife",

        description:
            "Showcase the beauty, behavior, and spirit of wildlife through photography.",

        deadline: "2026-09-10",

        status: "upcoming",

        maxSubmissions: 3,

        criteria: {
            creativity: 30,
            technical: 40,
            themeFit: 30
        }
    },


    // ==========================================
    // 3. TRAVEL
    // ==========================================

    {
        id: "travel-2026",

        title: "Travel Moments",

        category: "Travel",

        description:
            "Capture memorable places, cultures, landscapes, and experiences from your journeys.",

        deadline: "2026-09-20",

        status: "upcoming",

        maxSubmissions: 3,

        criteria: {
            creativity: 40,
            technical: 30,
            themeFit: 30
        }
    },


    // ==========================================
    // 4. URBAN
    // ==========================================

    {
        id: "urban-stories-2026",

        title: "Urban Stories",

        category: "Architecture & Urban",

        description:
            "Tell compelling stories through city streets, architecture, people, and urban life.",

        deadline: "2026-09-30",

        status: "upcoming",

        maxSubmissions: 3,

        criteria: {
            creativity: 35,
            technical: 35,
            themeFit: 30
        }
    },


    // ==========================================
    // 5. PORTRAITS
    // ==========================================

    {
        id: "portraits-2026",

        title: "Portraits & People",

        category: "Portrait",

        description:
            "Capture personality, emotion, identity, and human connection through portraits.",

        deadline: "2026-10-10",

        status: "upcoming",

        maxSubmissions: 3,

        criteria: {
            creativity: 40,
            technical: 30,
            themeFit: 30
        }
    },


    // ==========================================
    // 6. NIGHT PHOTOGRAPHY
    // ==========================================

    {
        id: "night-light-2026",

        title: "Night & Light",

        category: "Night Photography",

        description:
            "Explore the atmosphere, mood, colors, and stories that come alive after dark.",

        deadline: "2026-10-20",

        status: "upcoming",

        maxSubmissions: 3,

        criteria: {
            creativity: 30,
            technical: 45,
            themeFit: 25
        }
    },


    // ==========================================
    // 7. MINIMALISM
    // ==========================================

    {
        id: "minimalism-2026",

        title: "Minimalism",

        category: "Minimal & Artistic",

        description:
            "Find beauty in simplicity through clean compositions, negative space, and minimal details.",

        deadline: "2026-10-30",

        status: "upcoming",

        maxSubmissions: 3,

        criteria: {
            creativity: 45,
            technical: 25,
            themeFit: 30
        }
    },


    // ==========================================
    // 8. SEASONS
    // ==========================================

    {
        id: "seasons-2026",

        title: "Seasons in Focus",

        category: "Seasonal",

        description:
            "Capture the colors, atmosphere, and changing character of the seasons.",

        deadline: "2026-11-10",

        status: "upcoming",

        maxSubmissions: 3,

        criteria: {
            creativity: 35,
            technical: 30,
            themeFit: 35
        }
    }

];




// ==========================================
// SAVE CONTESTS
// ==========================================

function initializeContests() {

    const existingContests =
        localStorage.getItem("contests");


    if (!existingContests) {

        localStorage.setItem(
            "contests",
            JSON.stringify(contests)
        );

    }

}


// Initialize
initializeContests();





// ==========================================
// DISPLAY CONTESTS
// ==========================================

function displayContests() {

    const contestsContainer =
        document.querySelector("#contestsContainer");

    // Stop if this element does not exist
    if (!contestsContainer) {
        return;
    }


    let savedContests =
    JSON.parse(
        localStorage.getItem("contests")
    ) || [];


// ==========================================
// FILTER BY STATUS
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const selectedStatus =
    params.get("status");


if (selectedStatus) {

    savedContests =
        savedContests.filter(function (contest) {

            return contest.status === selectedStatus;

        });

}

    // Clear container

    contestsContainer.innerHTML = "";


    // Display each contest

    savedContests.forEach(function (contest) {

        const card =
            document.createElement("article");

        card.className = "contest-card";


        card.innerHTML = `

            <div class="contest-card-content">

                <span class="contest-category">
                    ${contest.category}
                </span>

                <h2>
                    ${contest.title}
                </h2>

                <p>
                    ${contest.description}
                </p>


                <div class="contest-card-meta">

                    <div>
                        <strong>Status</strong>

                        <span>
                            ${contest.status}
                        </span>
                    </div>


                    <div>
                        <strong>Deadline</strong>

                        <span>
                            ${new Date(
                                contest.deadline
                            ).toLocaleDateString()}
                        </span>
                    </div>


                    <div>
                        <strong>Max Entries</strong>

                        <span>
                            ${contest.maxSubmissions}
                        </span>
                    </div>

                </div>


                <div class="contest-weights">

                    <p>
                        <strong>
                            Judging Weights
                        </strong>
                    </p>

                    <span>
                        Creativity:
                        ${contest.criteria.creativity}%
                    </span>

                    <span>
                        Technical:
                        ${contest.criteria.technical}%
                    </span>

                    <span>
                        Theme Fit:
                        ${contest.criteria.themeFit}%
                    </span>

                </div>


                <a
                    href="contest-details.html?id=${contest.id}"
                    class="contest-btn"
                >
                    View Contest →
                </a>

            </div>

        `;


        contestsContainer.appendChild(card);

    });

}


// ==========================================
// INITIALIZE CONTEST DISPLAY
// ==========================================

displayContests();






// ==========================================
// DISPLAY CONTEST DETAILS
// ==========================================

function displayContestDetails() {

    const container =
        document.querySelector("#contestDetailsContainer");

    if (!container) {
        return;
    }


    // Get contest ID from URL

    const params =
        new URLSearchParams(
            window.location.search
        );

    const contestId =
        params.get("id");


    // Get contests

    const contests =
        JSON.parse(
            localStorage.getItem("contests")
        ) || [];


    // Find selected contest

    const contest =
        contests.find(function (item) {

            return item.id === contestId;

        });


    // Contest not found

    if (!contest) {

        container.innerHTML = `
            <h1>Contest not found</h1>

            <p>
                The contest you are looking for does not exist.
            </p>

            <a href="contests.html">
                Back to Contests
            </a>
        `;

        return;
    }


    // Display contest

    container.innerHTML = `

        <div class="contest-detail-card">

            <p class="eyebrow">
                ${contest.category}
            </p>

            <h1>
                ${contest.title}
            </h1>

            <p class="contest-description">
                ${contest.description}
            </p>


            <div class="contest-detail-meta">

                <div>
                    <strong>Status</strong>
                    <span>
                        ${contest.status}
                    </span>
                </div>

                <div>
                    <strong>Deadline</strong>
                    <span>
                        ${new Date(
                            contest.deadline
                        ).toLocaleDateString()}
                    </span>
                </div>

                <div>
                    <strong>Maximum Entries</strong>
                    <span>
                        ${contest.maxSubmissions}
                    </span>
                </div>

                <div>
                    <strong>Judges</strong>
                    <span>
                        3 Judges
                    </span>
                </div>

            </div>


            <section class="contest-criteria">

                <h2>
                    Judging Criteria
                </h2>

                <div class="criteria-grid">

                    <div>
                        <strong>
                            Creativity
                        </strong>

                        <span>
                            ${contest.criteria.creativity}%
                        </span>
                    </div>

                    <div>
                        <strong>
                            Technical Quality
                        </strong>

                        <span>
                            ${contest.criteria.technical}%
                        </span>
                    </div>

                    <div>
                        <strong>
                            Theme Fit
                        </strong>

                        <span>
                            ${contest.criteria.themeFit}%
                        </span>
                    </div>

                </div>

            </section>


            <a
                href="submit.html?contestId=${encodeURIComponent(contest.id)}"
                class="contest-submit-btn"
            >
                Submit to This Contest →
            </a>

        </div>

    `;

}


// ==========================================
// INITIALIZE CONTEST DETAILS
// ==========================================

displayContestDetails();