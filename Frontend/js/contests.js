/* =========================================================
   PHOTOJUDGE — CONTESTS REGISTRY & DETAILS
========================================================= */


// ==========================================
// PHOTO CONTEST DATA
// ==========================================

const contests = [

    {
        id: "nature-2026",

        title: "Nature Through My Lens",

        category: "Nature",

        description:
            "Capture the raw beauty, subtle emotion, and breathtaking diversity of nature through your lens.",

        deadline: "2026-08-30",

        status: "active",

        maxSubmissions: 3,

        image:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=85",

        criteria: {
            creativity: 40,
            technical: 30,
            themeFit: 30
        }
    },


    {
        id: "wildlife-2026",

        title: "Wildlife Wonders",

        category: "Wildlife",

        description:
            "Showcase the behavior, habitats, and spirit of animals in their natural environment.",

        deadline: "2026-09-10",

        status: "upcoming",

        maxSubmissions: 3,

        image:
            "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1600&q=85",

        criteria: {
            creativity: 30,
            technical: 40,
            themeFit: 30
        }
    },


    {
        id: "travel-2026",

        title: "Travel & Culture",

        category: "Travel",

        description:
            "Document iconic places, vibrant cultural traditions, landscapes, and journey experiences.",

        deadline: "2026-09-20",

        status: "upcoming",

        maxSubmissions: 3,

        image:
            "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=85",

        criteria: {
            creativity: 40,
            technical: 30,
            themeFit: 30
        }
    },


    {
        id: "urban-stories-2026",

        title: "Urban Stories & Architecture",

        category: "Architecture & Urban",

        description:
            "Tell stories through architectural lines, dynamic city streets, shadows, and urban life.",

        deadline: "2026-09-30",

        status: "upcoming",

        maxSubmissions: 3,

        image:
            "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=85",

        criteria: {
            creativity: 35,
            technical: 35,
            themeFit: 30
        }
    },


    {
        id: "portraits-2026",

        title: "Portraits & Soul",

        category: "Portrait",

        description:
            "Capture personality, candid emotion, human identity, and authentic character.",

        deadline: "2026-10-10",

        status: "upcoming",

        maxSubmissions: 3,

        image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1600&q=85",

        criteria: {
            creativity: 40,
            technical: 30,
            themeFit: 30
        }
    },


    {
        id: "night-light-2026",

        title: "Night & Light Play",

        category: "Night Photography",

        description:
            "Explore the mood, neon reflections, long exposures, and atmosphere after dark.",

        deadline: "2026-10-20",

        status: "upcoming",

        maxSubmissions: 3,

        image:
            "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=85",

        criteria: {
            creativity: 30,
            technical: 45,
            themeFit: 25
        }
    },


    {
        id: "minimalism-2026",

        title: "Minimalist Compositions",

        category: "Minimal & Artistic",

        description:
            "Find elegance in simplicity through negative space, clean geometric forms, and color balance.",

        deadline: "2026-10-30",

        status: "upcoming",

        maxSubmissions: 3,

        image:
            "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1600&q=85",

        criteria: {
            creativity: 45,
            technical: 25,
            themeFit: 30
        }
    },


    {
        id: "seasons-2026",

        title: "Seasons in Focus",

        category: "Seasonal",

        description:
            "Celebrate the changing light, vibrant colors, weather, and mood of seasonal transitions.",

        deadline: "2026-11-10",

        status: "upcoming",

        maxSubmissions: 3,

        image:
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85",

        criteria: {
            creativity: 35,
            technical: 30,
            themeFit: 35
        }
    }

];


// ==========================================
// SEED DEFAULT CONTESTS
// ==========================================

function initializeContests() {

    const existingContests =
        localStorage.getItem("contests");


    if (!existingContests) {

        localStorage.setItem(
            "contests",
            JSON.stringify(contests)
        );

        return;
    }


    /*
       Older localStorage records may not have
       the new image property.

       This keeps the user's existing contest
       information but adds the new images.
    */

    try {

        const saved =
            JSON.parse(existingContests);


        const merged =
            saved.map(function (savedContest) {

                const defaultContest =
                    contests.find(function (item) {

                        return item.id === savedContest.id;

                    });


                return defaultContest

                    ? {
                        ...defaultContest,
                        ...savedContest,
                        image:
                            savedContest.image ||
                            defaultContest.image
                    }

                    : savedContest;

            });


        localStorage.setItem(
            "contests",
            JSON.stringify(merged)
        );


    } catch (error) {

        localStorage.setItem(
            "contests",
            JSON.stringify(contests)
        );

    }

}


initializeContests();


// ==========================================
// THEME CAROUSEL
// ==========================================

function initializeThemeCarousel() {

    const track =
        document.querySelector(
            "#themeCarouselTrack"
        );


    const progress =
        document.querySelector(
            "#carouselProgress"
        );


    if (!track || !progress) {

        return;

    }


    /*
       First 6 contests are used in the
       large visual carousel.
    */

    const carouselContests =
        contests.slice(0, 6);


    let currentIndex = 0;

    let autoPlay;


    // ------------------------------------------
    // CREATE SLIDES
    // ------------------------------------------

    track.innerHTML =
        carouselContests.map(function (
            contest,
            index
        ) {

            return `

                <article
                    class="theme-slide ${
                        index === 0
                            ? "active"
                            : ""
                    }"
                >

                    <img
                        src="${contest.image}"
                        alt="${contest.title} theme photography"
                        loading="${
                            index === 0
                                ? "eager"
                                : "lazy"
                        }"
                    >


                    <div class="theme-slide-content">

                        <span
                            class="theme-slide-category"
                        >
                            ${contest.category}
                        </span>


                        <h2
                            class="theme-slide-title"
                        >
                            ${contest.title}
                        </h2>


                        <p
                            class="theme-slide-description"
                        >
                            ${contest.description}
                        </p>

                    </div>

                </article>

            `;

        }).join("");


    // ------------------------------------------
    // CREATE DOTS
    // ------------------------------------------

    progress.innerHTML =
        carouselContests.map(function (
            _,
            index
        ) {

            return `

                <button
                    type="button"
                    class="carousel-dot ${
                        index === 0
                            ? "active"
                            : ""
                    }"
                    data-slide="${index}"
                    aria-label="Show contest theme ${
                        index + 1
                    }"
                ></button>

            `;

        }).join("");


    const slides =
        track.querySelectorAll(
            ".theme-slide"
        );


    const dots =
        progress.querySelectorAll(
            ".carousel-dot"
        );


    // ------------------------------------------
    // SHOW SLIDE
    // ------------------------------------------

    function showSlide(index) {

        currentIndex =
            (
                index +
                carouselContests.length
            ) %
            carouselContests.length;


        track.style.transform =
            `translateX(-${
                currentIndex * 100
            }%)`;


        slides.forEach(
            function (
                slide,
                slideIndex
            ) {

                slide.classList.toggle(
                    "active",
                    slideIndex === currentIndex
                );

            }
        );


        dots.forEach(
            function (
                dot,
                dotIndex
            ) {

                dot.classList.toggle(
                    "active",
                    dotIndex === currentIndex
                );

            }
        );

    }


    // ------------------------------------------
    // AUTO PLAY
    // ------------------------------------------

    function startAutoPlay() {

        clearInterval(autoPlay);


        autoPlay =
            setInterval(
                function () {

                    showSlide(
                        currentIndex + 1
                    );

                },
                5200
            );

    }


    // ------------------------------------------
    // PREVIOUS / NEXT
    // ------------------------------------------

    const previous =
        document.querySelector(
            "#carouselPrev"
        );


    const next =
        document.querySelector(
            "#carouselNext"
        );


    if (previous) {

        previous.addEventListener(
            "click",
            function () {

                showSlide(
                    currentIndex - 1
                );

                startAutoPlay();

            }
        );

    }


    if (next) {

        next.addEventListener(
            "click",
            function () {

                showSlide(
                    currentIndex + 1
                );

                startAutoPlay();

            }
        );

    }


    // ------------------------------------------
    // DOT NAVIGATION
    // ------------------------------------------

    dots.forEach(
        function (dot) {

            dot.addEventListener(
                "click",
                function () {

                    showSlide(
                        Number(
                            dot.dataset.slide
                        )
                    );

                    startAutoPlay();

                }
            );

        }
    );


    // ------------------------------------------
    // PAUSE WHEN HOVERING
    // ------------------------------------------

    const carousel =
        document.querySelector(
            ".theme-carousel"
        );


    if (carousel) {

        carousel.addEventListener(
            "mouseenter",
            function () {

                clearInterval(
                    autoPlay
                );

            }
        );


        carousel.addEventListener(
            "mouseleave",
            startAutoPlay
        );

    }


    startAutoPlay();

}


// ==========================================
// DISPLAY CONTESTS
// ==========================================

function displayContests(
    filterStatus
) {

    const contestsContainer =
        document.querySelector(
            "#contestsContainer"
        );


    if (!contestsContainer) {

        return;

    }


    let savedContests =
        JSON.parse(
            localStorage.getItem(
                "contests"
            )
        ) || contests;


    // ------------------------------------------
    // DETERMINE ACTIVE FILTER
    // ------------------------------------------

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const activeFilter =
        filterStatus !== undefined

            ? filterStatus

            : (
                urlParams.get("status") ||
                "all"
            );


    // ------------------------------------------
    // UPDATE FILTER BUTTONS
    // ------------------------------------------

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );


    filterButtons.forEach(
        function (btn) {

            const btnFilter =
                btn.getAttribute(
                    "data-filter"
                ) ||
                btn.textContent
                    .trim()
                    .toLowerCase();


            if (
                btnFilter === activeFilter ||

                (
                    activeFilter === "all" &&
                    btnFilter.includes("all")
                )
            ) {

                btn.classList.add(
                    "active"
                );

            } else {

                btn.classList.remove(
                    "active"
                );

            }

        }
    );


    // ------------------------------------------
    // FILTER CONTESTS
    // ------------------------------------------

    if (
        activeFilter &&
        activeFilter !== "all"
    ) {

        savedContests =
            savedContests.filter(
                function (contest) {

                    return (
                        contest.status ===
                        activeFilter
                    );

                }
            );

    }


    contestsContainer.innerHTML = "";


    // ------------------------------------------
    // NO RESULTS
    // ------------------------------------------

    if (
        savedContests.length === 0
    ) {

        contestsContainer.innerHTML = `

            <div
                style="
                    grid-column:1/-1;
                    padding:60px 20px;
                    text-align:center;
                    background:#fff;
                    border:1px dashed #cbd5e1;
                    border-radius:12px;
                "
            >

                <p
                    style="
                        font-size:1.1rem;
                        color:#61708a;
                        margin-bottom:12px;
                    "
                >
                    No contests found in this category.
                </p>


                <button
                    class="filter-btn active"
                    onclick="displayContests('all')"
                    style="cursor:pointer;"
                    type="button"
                >
                    View All Contests
                </button>

            </div>

        `;

        return;

    }


    // ------------------------------------------
    // CREATE CONTEST CARDS
    // ------------------------------------------

    savedContests.forEach(
        function (contest) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "contest-card";


            const statusBadgeClass =

                contest.status === "active"

                    ? "status-active"

                    : contest.status === "completed"

                    ? "status-completed"

                    : "status-upcoming";


            card.innerHTML = `

                <!-- THEMED IMAGE -->

                <div
                    class="contest-card-image"
                >

                    <img
                        src="${contest.image}"
                        alt="${contest.title} photography theme"
                        loading="lazy"
                    >


                    <span
                        class="contest-card-image-label"
                    >
                        ${contest.category}
                    </span>

                </div>


                <!-- CARD CONTENT -->

                <div
                    class="contest-card-content"
                >


                    <div
                        class="contest-card-top"
                    >

                        <span
                            class="contest-category"
                        >
                            ${contest.category}
                        </span>


                        <span
                            class="contest-status ${statusBadgeClass}"
                        >
                            ${contest.status}
                        </span>

                    </div>


                    <h2>
                        ${contest.title}
                    </h2>


                    <p>
                        ${contest.description}
                    </p>


                    <!-- EXISTING CARD DETAILS -->

                    <div
                        class="contest-card-meta"
                    >

                        <div>

                            <strong>
                                Status
                            </strong>

                            <span>
                                ${contest.status.toUpperCase()}
                            </span>

                        </div>


                        <div>

                            <strong>
                                Deadline
                            </strong>

                            <span>
                                ${
                                    new Date(
                                        contest.deadline
                                    ).toLocaleDateString()
                                }
                            </span>

                        </div>


                        <div>

                            <strong>
                                Max Entries
                            </strong>

                            <span>
                                ${contest.maxSubmissions}
                                Photos
                            </span>

                        </div>

                    </div>


                    <!-- JUDGING WEIGHTS -->

                    <div
                        class="contest-weights"
                    >

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


                    <!-- VIEW BUTTON -->

                    <a
                        href="contest-details.html?id=${encodeURIComponent(
                            contest.id
                        )}"
                        class="contest-btn"
                    >
                        View Contest & Criteria →
                    </a>


                </div>

            `;


            contestsContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// DISPLAY CONTEST DETAILS
// ==========================================

function displayContestDetails() {

    const container =
        document.querySelector(
            "#contestDetailsContainer"
        );


    if (!container) {

        return;

    }


    // ------------------------------------------
    // GET CONTEST ID FROM URL
    // ------------------------------------------

    const params =
        new URLSearchParams(
            window.location.search
        );


    const contestId =
        params.get("id");


    // ------------------------------------------
    // GET SAVED CONTESTS
    // ------------------------------------------

    const savedContests =
        JSON.parse(
            localStorage.getItem(
                "contests"
            )
        ) || contests;


    // ------------------------------------------
    // FIND CONTEST
    // ------------------------------------------

    const contest =
        savedContests.find(
            function (item) {

                return (
                    item.id === contestId
                );

            }
        );


    // ------------------------------------------
    // CONTEST NOT FOUND
    // ------------------------------------------

    if (!contest) {

        container.innerHTML = `

            <div
                class="contest-detail-card"
                style="text-align:center;"
            >

                <div
                    class="detail-content"
                >

                    <h1>
                        Contest Not Found
                    </h1>


                    <p
                        class="contest-description"
                    >
                        The contest you are looking for
                        does not exist or has been removed.
                    </p>


                    <a
                        href="contests.html"
                        class="contest-submit-btn"
                    >
                        Back to Contests
                    </a>

                </div>

            </div>

        `;

        return;

    }


    // ------------------------------------------
    // CURRENT USER
    // ------------------------------------------

    const currentUser =
        JSON.parse(
            localStorage.getItem(
                "currentUser"
            )
        );


    let actionBtnHTML;


    // ------------------------------------------
    // ACTIVE CONTEST ACTION
    // ------------------------------------------

    if (
        contest.status === "active"
    ) {


        if (
            currentUser &&
            currentUser.role === "judge"
        ) {

            actionBtnHTML = `

                <a
                    href="judge.html"
                    class="contest-submit-btn"
                >
                    Open Judge Dashboard →
                </a>

            `;

        } else {

            actionBtnHTML = `

                <a
                    href="submit.html?contestId=${encodeURIComponent(
                        contest.id
                    )}"
                    class="contest-submit-btn"
                >
                    Submit Photo to This Contest →
                </a>

            `;

        }


    } else {


        actionBtnHTML = `

            <div
                class="contest-submit-btn"
                style="
                    opacity:.65;
                    cursor:not-allowed;
                    text-align:center;
                "
            >
                Submissions Open Soon
                (${contest.status.toUpperCase()})
            </div>

        `;

    }


    // ------------------------------------------
    // BUILD CONTEST DETAILS PAGE
    // ------------------------------------------

    container.innerHTML = `

        <div
            class="contest-detail-card"
        >


            <!-- LARGE THEMED IMAGE -->

            <div
                class="detail-theme-image"
            >

                <img
                    src="${contest.image}"
                    alt="${contest.title} photography theme"
                >


                <div
                    class="detail-theme-caption"
                >

                    <small>
                        ${contest.category}
                        competition
                    </small>


                    <strong>
                        Explore the theme
                        through your lens
                    </strong>

                </div>

            </div>


            <!-- DETAIL CONTENT -->

            <div
                class="detail-content"
            >


                <span
                    class="eyebrow"
                    style="
                        color:var(
                            --accent-gold-dark,
                            #d97706
                        );
                        font-weight:800;
                    "
                >
                    ${contest.category.toUpperCase()}
                    COMPETITION
                </span>


                <h1>
                    ${contest.title}
                </h1>


                <p
                    class="contest-description"
                >
                    ${contest.description}
                </p>


                <!-- CONTEST INFORMATION -->

                <div
                    class="contest-detail-meta"
                >

                    <div>

                        <strong>
                            Status
                        </strong>

                        <span>
                            ${contest.status.toUpperCase()}
                        </span>

                    </div>


                    <div>

                        <strong>
                            Submission Deadline
                        </strong>

                        <span>
                            ${
                                new Date(
                                    contest.deadline
                                ).toLocaleDateString()
                            }
                        </span>

                    </div>


                    <div>

                        <strong>
                            Max Submissions
                        </strong>

                        <span>
                            ${contest.maxSubmissions}
                            per Photographer
                        </span>

                    </div>


                    <div>

                        <strong>
                            Evaluation Jury
                        </strong>

                        <span>
                            3 Professional Jurors
                        </span>

                    </div>

                </div>


                <!-- JUDGING CRITERIA -->

                <section
                    class="contest-criteria"
                >

                    <h2>
                        Weighted Judging Criteria
                    </h2>


                    <div
                        class="criteria-grid"
                    >


                        <div>

                            <strong>
                                ${contest.criteria.creativity}%
                            </strong>

                            <span>
                                Creativity &
                                Storytelling
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${contest.criteria.technical}%
                            </strong>

                            <span>
                                Technical Quality &
                                Composition
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${contest.criteria.themeFit}%
                            </strong>

                            <span>
                                Theme Fit &
                                Interpretation
                            </span>

                        </div>


                    </div>

                </section>


                <!-- ACTION BUTTON -->

                ${actionBtnHTML}


            </div>

        </div>

    `;

}


// ==========================================
// INITIALIZERS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        // Initialize carousel

        initializeThemeCarousel();


        // Display contest cards

        displayContests();


        // Display contest details

        displayContestDetails();


        // --------------------------------------
        // FILTER BUTTONS
        // --------------------------------------

        const filterButtons =
            document.querySelectorAll(
                ".filter-btn"
            );


        filterButtons.forEach(
            function (btn) {

                btn.addEventListener(
                    "click",
                    function () {

                        const filter =
                            btn.getAttribute(
                                "data-filter"
                            ) || "all";


                        displayContests(
                            filter
                        );

                    }
                );

            }
        );

    }
);