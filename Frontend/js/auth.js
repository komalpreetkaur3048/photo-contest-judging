/* =========================================================
   PHOTOJUDGE — AUTHENTICATION & GLOBAL NAVIGATION
========================================================= */

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
        window.location.pathname.includes("/pages/") ||
        window.location.pathname.includes("\\pages\\") ||
        window.location.pathname.endsWith("/pages") ||
        window.location.href.includes("/pages/");

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

    // Common Contests Dropdown HTML
    const contestsDropdownHTML = `
        <li class="nav-dropdown">
            <a href="${pagePath("contests.html")}" class="dropdown-trigger">
                Contests ▾
            </a>
            <ul class="contest-dropdown">
                <li>
                    <a href="${pagePath("contests.html")}">
                        🏆 All Contests
                    </a>
                </li>
                <li>
                    <a href="${pagePath("contests.html?status=active")}">
                        🟢 Active Contests
                    </a>
                </li>
                <li>
                    <a href="${pagePath("contests.html?status=upcoming")}">
                        ⏳ Upcoming Contests
                    </a>
                </li>
                <li>
                    <a href="${pagePath("contests.html?status=completed")}">
                        🏁 Completed Contests
                    </a>
                </li>
            </ul>
        </li>
    `;

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

            ${contestsDropdownHTML}

            <li>
                <a href="${pagePath("explore.html")}">
                    Explore
                </a>
            </li>

            <li>
                <a href="${pagePath("leaderboard.html")}">
                    Leaderboard
                </a>
            </li>

            <li class="nav-auth-actions">
                <a href="${pagePath("login.html")}" class="nav-login-btn">
                    Login
                </a>
                <a href="${pagePath("register.html")}" class="nav-register-btn">
                    Register →
                </a>
            </li>
        `;

    }

    // ==========================================
    // PARTICIPANT
    // ==========================================

    else if (currentUser.role === "participant") {

        const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "P";

        mainNav.innerHTML = `
            <li>
                <a href="${homePath}">
                    Home
                </a>
            </li>

            ${contestsDropdownHTML}

            <li>
                <a href="${pagePath("explore.html")}">
                    Explore
                </a>
            </li>

            <li>
                <a href="${pagePath("participant-dashboard.html")}">
                    Dashboard
                </a>
            </li>

            <li>
                <a href="${pagePath("my-entries.html")}">
                    My Entries
                </a>
            </li>

            <li>
                <a href="${pagePath("submit.html")}" class="nav-submit">
                    + Submit Photo
                </a>
            </li>

            <li>
                <a href="${pagePath("leaderboard.html")}">
                    Leaderboard
                </a>
            </li>

            <li class="nav-profile-item">
                <div class="user-profile-badge">
                    <div class="user-avatar" title="${currentUser.name}">
                        ${initial}
                    </div>
                    <div class="user-meta">
                        <span class="user-name">${currentUser.name}</span>
                        <span class="user-role-tag participant-tag">Participant</span>
                    </div>
                    <button type="button" class="nav-logout-btn" id="homeLogoutBtn" title="Log Out">
                        Sign Out
                    </button>
                </div>
            </li>
        `;

    }

    // ==========================================
    // JUDGE
    // ==========================================

    else if (currentUser.role === "judge") {

        const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "J";

        mainNav.innerHTML = `
            <li>
                <a href="${homePath}">
                    Home
                </a>
            </li>

            ${contestsDropdownHTML}

            <li>
                <a href="${pagePath("explore.html")}">
                    Explore
                </a>
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

            <li class="nav-profile-item">
                <div class="user-profile-badge judge-badge">
                    <div class="user-avatar judge-avatar" title="${currentUser.name}">
                        ${initial}
                    </div>
                    <div class="user-meta">
                        <span class="user-name">${currentUser.name}</span>
                        <span class="user-role-tag juror-tag">Official Juror</span>
                    </div>
                    <button type="button" class="nav-logout-btn" id="homeLogoutBtn" title="Log Out">
                        Sign Out
                    </button>
                </div>
            </li>
        `;

    }

    // ==========================================
    // HIGHLIGHT CURRENT ACTIVE LINK
    // ==========================================

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "index.html";

    document
        .querySelectorAll("#mainNav a")
        .forEach(function (link) {
            const href = link.getAttribute("href");
            if (!href) return;

            const linkPage =
                href.split("?")[0]
                    .split("/")
                    .pop();

            if (linkPage && linkPage === currentPage) {
                link.classList.add("active");
            }
        });

    // ==========================================
    // UNIFIED LOGOUT HANDLERS
    // ==========================================

    const logoutButtons = document.querySelectorAll("#homeLogoutBtn, #logoutBtn");

    logoutButtons.forEach(function (btn) {
        btn.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("currentUser");
            window.location.href = homePath;
        });
    });
}


// ==========================================
// SEED DEFAULT JUDGES (IF NOT PRESENT)
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
            role: "judge",
            specialization: "Senior Wildlife & Landscape Juror"
        },
        {
            id: "judge2",
            name: "Judge 2",
            email: "judge2@photojudge.com",
            password: "judge123",
            role: "judge",
            specialization: "Visual Storytelling & Composition Critic"
        },
        {
            id: "judge3",
            name: "Judge 3",
            email: "judge3@photojudge.com",
            password: "judge123",
            role: "judge",
            specialization: "Fine Art Photography Juror"
        }
    ];

    defaultJudges.forEach(function (judge) {
        const exists = users.some(function (user) {
            return user.id === judge.id || user.email === judge.email;
        });

        if (!exists) {
            users.push(judge);
        }
    });

    localStorage.setItem("users", JSON.stringify(users));
}

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

// ==========================================
// REGISTER FORM LOGIC
// ==========================================

const registerForm =
    document.querySelector("#registerForm");

if (registerForm) {
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

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.querySelector("#registerName")?.value.trim();
        const email = document.querySelector("#registerEmail")?.value.trim().toLowerCase();
        const password = document.querySelector("#registerPassword")?.value;
        const confirmPassword = document.querySelector("#confirmPassword")?.value;
        const selectedRoleRadio = document.querySelector('input[name="registerRole"]:checked');
        const selectedRole = selectedRoleRadio ? selectedRoleRadio.value : "participant";
        const message = document.querySelector("#registerMessage");

        if (password.length < 6) {
            if (message) {
                message.textContent = "Password must contain at least 6 characters.";
                message.style.color = "#dc2626";
            }
            return;
        }

        if (password !== confirmPassword) {
            if (message) {
                message.textContent = "Passwords do not match.";
                message.style.color = "#dc2626";
            }
            return;
        }

        let judgeSpecialization = "";
        let judgeBio = "";
        let enteredKey = "";

        if (selectedRole === "judge") {
            const accessKeyInput = document.querySelector("#judgeAccessKey");
            enteredKey = accessKeyInput ? accessKeyInput.value.trim() : "";

            if (!enteredKey) {
                if (message) {
                    message.textContent = "Please enter your Judge Access Key or Invite Code.";
                    message.style.color = "#dc2626";
                }
                return;
            }

            judgeSpecialization =
                document.querySelector("#judgeSpecialization")?.value.trim() ||
                "Official Contest Judge";

            judgeBio =
                document.querySelector("#judgeBio")?.value.trim() ||
                "";
        }

        // Call Backend API if available
        let backendSuccess = false;
        if (typeof AuthAPI !== "undefined") {
            const apiRes = await AuthAPI.register({
                name,
                email,
                password,
                role: selectedRole,
                judgeAccessKey: enteredKey,
                specialization: judgeSpecialization,
                bio: judgeBio
            });

            if (apiRes && apiRes.ok) {
                backendSuccess = true;
                if (apiRes.data.token) {
                    localStorage.setItem("token", apiRes.data.token);
                }
            } else if (apiRes && apiRes.status > 0) {
                // Backend responded with an error (e.g. Email exists, invalid key)
                if (message) {
                    message.textContent = apiRes.data.message || "Registration failed.";
                    message.style.color = "#dc2626";
                }
                return;
            }
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const existingUser = users.find(function (user) {
            return user.email === email;
        });

        if (!backendSuccess && existingUser) {
            if (message) {
                message.textContent = "An account with this email already exists.";
                message.style.color = "#dc2626";
            }
            return;
        }

        const hashedPassword = await hashString(password);

        const user = {
            id: selectedRole === "judge" ? ("judge_" + Date.now()) : Date.now(),
            name: name,
            email: email,
            password: hashedPassword,
            role: selectedRole,
            specialization: selectedRole === "judge" ? judgeSpecialization : undefined,
            bio: selectedRole === "judge" ? judgeBio : undefined
        };

        if (!existingUser) {
            users.push(user);
            localStorage.setItem("users", JSON.stringify(users));
        }

        if (message) {
            message.textContent = selectedRole === "judge"
                ? "✓ Judge account verified and created successfully!"
                : "✓ Account created successfully!";
            message.style.color = "#16a34a";
        }

        registerForm.reset();

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1200);
    });
}


// ==========================================
// LOGIN FORM LOGIC
// ==========================================

const loginForm =
    document.querySelector("#loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.querySelector("#loginEmail")?.value.trim().toLowerCase();
        const password = document.querySelector("#loginPassword")?.value;
        const message = document.querySelector("#loginMessage");

        // Try Backend Login First
        if (typeof AuthAPI !== "undefined") {
            const apiRes = await AuthAPI.login(email, password);

            if (apiRes && apiRes.ok && apiRes.data.user) {
                localStorage.setItem("token", apiRes.data.token);
                const loggedInUser = {
                    ...apiRes.data.user,
                    id: apiRes.data.user._id // ensures compatibility with frontend expecting user.id
                };
                localStorage.setItem("currentUser", JSON.stringify(loggedInUser));

                if (message) {
                    message.textContent = "✓ Login successful!";
                    message.style.color = "#16a34a";
                }

                setTimeout(function () {
                    if (loggedInUser.role === "participant") {
                        window.location.href = "participant-dashboard.html";
                    } else if (loggedInUser.role === "judge") {
                        window.location.href = "judge.html";
                    } else {
                        window.location.href = "participant-dashboard.html";
                    }
                }, 700);
                return;
            } else if (apiRes && apiRes.status === 401) {
                if (message) {
                    message.textContent = apiRes.data.message || "Invalid email or password.";
                    message.style.color = "#dc2626";
                }
                return;
            }
        }

        // Fallback to local storage if backend is offline
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const hashedPassword = await hashString(password);

        const user = users.find(function (existingUser) {
            return (
                existingUser.email === email &&
                (existingUser.password === hashedPassword || existingUser.password === password)
            );
        });

        if (!user) {
            if (message) {
                message.textContent = "Invalid email or password.";
                message.style.color = "#dc2626";
            }
            return;
        }

        localStorage.setItem("currentUser", JSON.stringify(user));

        if (message) {
            message.textContent = "✓ Login successful!";
            message.style.color = "#16a34a";
        }

        setTimeout(function () {
            if (user.role === "participant") {
                window.location.href = "participant-dashboard.html";
            } else if (user.role === "judge") {
                window.location.href = "judge.html";
            } else {
                window.location.href = "participant-dashboard.html";
            }
        }, 700);
    });
}


// ==========================================
// PARTICIPANT DASHBOARD USER NAME FILL
// ==========================================

const userNameElement =
    document.querySelector("#userName");

if (userNameElement) {
    const currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );

    if (currentUser) {
        userNameElement.textContent = currentUser.name;
    } else {
        window.location.href = "login.html";
    }
}