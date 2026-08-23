// ==========================================
// DYNAMIC NAVBAR FOR ALL PAGES
// ==========================================

const mainNav =
    document.querySelector("#mainNav");


if (mainNav) {

    const currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );


    // Check whether current page is inside /pages/
    const isInsidePages =
        window.location.pathname.includes("/pages/");


    // Helper for page links
    const pagePath = function (file) {

        return isInsidePages
            ? file
            : `pages/${file}`;

    };


    const homePath =
        isInsidePages
            ? "../index.html"
            : "index.html";


    // ==========================================
    // LOGGED OUT
    // ==========================================

    if (!currentUser) {

        mainNav.innerHTML = `

            <li>
                <a href="${homePath}">
                    Home
                </a>
            </li>

            <li class="nav-dropdown">

    <a href="${pagePath("contests.html")}">
        Contests ▾
    </a>

    <ul class="contest-dropdown">
        <li>
        <a href="${pagePath("contests.html")}">
            All Contests
        </a>
        </li>
        <li>
            <a href="${pagePath("contests.html?status=active")}">
                Active Contests
            </a>
        </li>

        <li>
            <a href="${pagePath("contests.html?status=upcoming")}">
                Upcoming Contests
            </a>
        </li>

        <li>
            <a href="${pagePath("contests.html?status=completed")}">
                Completed Contests
            </a>
        </li>

    </ul>

</li>

            <li>
                <a href="${pagePath("leaderboard.html")}">
                    Leaderboard
                </a>
            </li>

            <li>
                <a href="${pagePath("login.html")}">
                    Login
                </a>
            </li>

            <li>
                <a href="${pagePath("register.html")}">
                    Register
                </a>
            </li>

        `;

    }


    // ==========================================
    // PARTICIPANT
    // ==========================================

    else if (currentUser.role === "participant") {

        mainNav.innerHTML = `

            <li>
                <a href="${homePath}">
                    Home
                </a>
            </li>

            <li class="nav-dropdown">

    <a href="${pagePath("contests.html")}">
        Contests ▾
    </a>

    <ul class="contest-dropdown">
        <li>
        <a href="${pagePath("contests.html")}">
            All Contests
        </a>
        </li>
        
        <li>
            <a href="${pagePath("contests.html?status=active")}">
                Active Contests
            </a>
        </li>

        <li>
            <a href="${pagePath("contests.html?status=upcoming")}">
                Upcoming Contests
            </a>
        </li>

        <li>
            <a href="${pagePath("contests.html?status=completed")}">
                Completed Contests
            </a>
        </li>

    </ul>

</li>

            <li>
                <a href="${pagePath("participant-dashboard.html")}">
                    Dashboard
                </a>
            </li>

            <li>
    <a
        href="${pagePath("submit.html")}"
        class="nav-submit"
    >
        Submit →
    </a>
</li>

            <li>
                <a href="${pagePath("leaderboard.html")}">
                    Leaderboard
                </a>
            </li>

            <li>
                <a href="#" id="homeLogoutBtn">
                    Logout
                </a>
            </li>

        `;

    }



    // ==========================================
    // JUDGE
    // ==========================================

    else if (currentUser.role === "judge") {

        mainNav.innerHTML = `

            <li>
                <a href="${homePath}">
                    Home
                </a>
            </li>

            <li class="nav-dropdown">

    <a href="${pagePath("contests.html")}">
        Contests ▾
    </a>

    <ul class="contest-dropdown">
         <li>
        <a href="${pagePath("contests.html")}">
            All Contests
        </a>
        </li>
        <li>
            <a href="${pagePath("contests.html?status=active")}">
                Active Contests
            </a>
        </li>


        <li>
            <a href="${pagePath("contests.html?status=upcoming")}">
                Upcoming Contests
            </a>
        </li>

        <li>
            <a href="${pagePath("contests.html?status=completed")}">
                Completed Contests
            </a>
        </li>

    </ul>

</li>

            <li>
                <a href="${pagePath("judge.html")}">
                    Judge Dashboard
                </a>
            </li>

            <li>
                <a href="${pagePath("leaderboard.html")}">
                    Leaderboard
                </a>
            </li>

            <li>
                <a href="#" id="homeLogoutBtn">
                    Logout
                </a>
            </li>

        `;

    }

    // ==========================================
// HIGHLIGHT CURRENT PAGE
// ==========================================

const currentPage =
    window.location.pathname
        .split("/")
        .pop();


document
    .querySelectorAll("#mainNav a")
    .forEach(function (link) {

        const linkPage =
            link.getAttribute("href")
                ?.split("?")[0]
                .split("/")
                .pop();


        if (
            linkPage &&
            linkPage === currentPage
        ) {

            link.classList.add("active");

        }

    });


    // ==========================================
    // LOGOUT
    // ==========================================

    const homeLogoutBtn =
        document.querySelector("#homeLogoutBtn");


    if (homeLogoutBtn) {

        homeLogoutBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                localStorage.removeItem(
                    "currentUser"
                );

                window.location.href =
                    homePath;

            }
        );

    }

}






// ==========================================
// CREATE DEFAULT JUDGES
// ==========================================

function initializeJudges() {

    let users =
        JSON.parse(
            localStorage.getItem("users")
        ) || [];


    const defaultJudges = [

        {
            id: "judge1",
            name: "Judge 1",
            email: "judge1@photojudge.com",
            password: "judge123",
            role: "judge"
        },

        {
            id: "judge2",
            name: "Judge 2",
            email: "judge2@photojudge.com",
            password: "judge123",
            role: "judge"
        },

        {
            id: "judge3",
            name: "Judge 3",
            email: "judge3@photojudge.com",
            password: "judge123",
            role: "judge"
        }

    ];


    defaultJudges.forEach(function (judge) {

        const exists =
            users.some(function (user) {

                return user.id === judge.id;

            });


        if (!exists) {

            users.push(judge);

        }

    });


    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

}


// Initialize the three judges
initializeJudges();





// ==========================================
// CRYPTO HASHING UTILITY
// ==========================================

async function hashString(str) {
    if (!str) return "";
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(function (b) {
            return b.toString(16).padStart(2, "0");
        }).join("");
    } catch (e) {
        return str;
    }
}

const JUDGE_SECRET_KEY = "JUDGE2026";


// ==========================================
// REGISTER
// ==========================================

const registerForm =
    document.querySelector("#registerForm");


if (registerForm) {

    // Toggle Role UI
    const roleRadios =
        document.querySelectorAll('input[name="registerRole"]');

    const judgeFields =
        document.querySelector("#judgeFieldsContainer");

    const rolePartOption =
        document.querySelector("#roleParticipantOption");

    const roleJudgeOption =
        document.querySelector("#roleJudgeOption");

    roleRadios.forEach(function (radio) {
        radio.addEventListener("change", function () {
            if (radio.value === "judge") {
                if (judgeFields) judgeFields.style.display = "block";
                if (roleJudgeOption) roleJudgeOption.classList.add("active");
                if (rolePartOption) rolePartOption.classList.remove("active");
            } else {
                if (judgeFields) judgeFields.style.display = "none";
                if (rolePartOption) rolePartOption.classList.add("active");
                if (roleJudgeOption) roleJudgeOption.classList.remove("active");
            }
        });
    });


    registerForm.addEventListener(
        "submit",
        async function (event) {

            // Stop normal form submission
            event.preventDefault();


            // Get values
            const name =
                document
                    .querySelector("#registerName")
                    .value
                    .trim();

            const email =
                document
                    .querySelector("#registerEmail")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .querySelector("#registerPassword")
                    .value;

            const confirmPassword =
                document
                    .querySelector("#confirmPassword")
                    .value;

            const selectedRoleRadio =
                document.querySelector('input[name="registerRole"]:checked');

            const selectedRole =
                selectedRoleRadio ? selectedRoleRadio.value : "participant";

            const message =
                document
                    .querySelector("#registerMessage");


            // ==========================================
            // VALIDATION
            // ==========================================

            if (password.length < 6) {

                message.textContent =
                    "Password must contain at least 6 characters.";
                message.style.color = "#dc2626";

                return;
            }


            if (password !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";
                message.style.color = "#dc2626";

                return;
            }


            // ==========================================
            // JUDGE KEY VALIDATION
            // ==========================================

            let judgeSpecialization = "";
            let judgeBio = "";

            if (selectedRole === "judge") {
                const accessKeyInput =
                    document.querySelector("#judgeAccessKey");
                const enteredKey =
                    accessKeyInput ? accessKeyInput.value.trim() : "";

                if (!enteredKey || enteredKey.toUpperCase() !== JUDGE_SECRET_KEY) {
                    message.textContent =
                        "Invalid Judge Access Key. Only authorized judges can create an account.";
                    message.style.color = "#dc2626";
                    return;
                }

                judgeSpecialization =
                    document.querySelector("#judgeSpecialization")?.value.trim() ||
                    "Official Contest Judge";

                judgeBio =
                    document.querySelector("#judgeBio")?.value.trim() ||
                    "";
            }


            // ==========================================
            // GET EXISTING USERS
            // ==========================================

            let users =
                JSON.parse(
                    localStorage.getItem("users")
                ) || [];


            // ==========================================
            // CHECK DUPLICATE EMAIL
            // ==========================================

            const existingUser =
                users.find(function (user) {

                    return user.email === email;

                });


            if (existingUser) {

                message.textContent =
                    "An account with this email already exists.";
                message.style.color = "#dc2626";

                return;
            }


            // ==========================================
            // CREATE USER (WITH HASHED PASSWORD)
            // ==========================================

            const hashedPassword =
                await hashString(password);

            const user = {

                id: selectedRole === "judge" ? ("judge_" + Date.now()) : Date.now(),

                name: name,

                email: email,

                password: hashedPassword,

                role: selectedRole,

                specialization: selectedRole === "judge" ? judgeSpecialization : undefined,

                bio: selectedRole === "judge" ? judgeBio : undefined

            };


            // Add user

            users.push(user);


            // Save users

            localStorage.setItem(
                "users",
                JSON.stringify(users)
            );


            // Success message

            message.textContent =
                selectedRole === "judge"
                    ? "✓ Judge account verified and created successfully!"
                    : "✓ Account created successfully!";
            message.style.color = "#16a34a";


            // Clear form

            registerForm.reset();


            // Redirect to login

            setTimeout(function () {

                window.location.href =
                    "login.html";

            }, 1200);

        }
    );

}


// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.querySelector("#loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            // Prevent normal form submission
            event.preventDefault();


            // Get login values

            const email =
                document
                    .querySelector("#loginEmail")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .querySelector("#loginPassword")
                    .value;


            const message =
                document
                    .querySelector("#loginMessage");


            // ==========================================
            // GET REGISTERED USERS
            // ==========================================

            const users =
                JSON.parse(
                    localStorage.getItem("users")
                ) || [];


            // ==========================================
            // FIND USER
            // ==========================================

            const hashedPassword =
                await hashString(password);

            const user =
                users.find(function (existingUser) {

                    return (
                        existingUser.email === email &&
                        (existingUser.password === hashedPassword || existingUser.password === password)
                    );

                });


            // ==========================================
            // INVALID LOGIN
            // ==========================================

            if (!user) {

                message.textContent =
                    "Invalid email or password.";
                message.style.color = "#dc2626";

                return;
            }


            // ==========================================
            // SAVE CURRENT USER
            // ==========================================

            localStorage.setItem(
                "currentUser",
                JSON.stringify(user)
            );


            // ==========================================
            // SUCCESS
            // ==========================================

            message.textContent =
                "✓ Login successful!";
            message.style.color = "#16a34a";


            // ==========================================
            // REDIRECT BASED ON ROLE
            // ==========================================

            setTimeout(function () {

                if (user.role === "participant") {

                    window.location.href =
                        "participant-dashboard.html";

                } else if (user.role === "judge") {

                    window.location.href =
                        "judge.html";

                }

            }, 700);

        }
    );

}








// ==========================================
// PARTICIPANT DASHBOARD
// ==========================================

const userNameElement =
    document.querySelector("#userName");


if (userNameElement) {

    const currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );


    if (currentUser) {

        userNameElement.textContent =
            currentUser.name;

    } else {

        // No logged-in user
        window.location.href =
            "login.html";

    }

}




// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.querySelector("#logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            localStorage.removeItem(
                "currentUser"
            );

            window.location.href =
                "../index.html";

        }
    );

}