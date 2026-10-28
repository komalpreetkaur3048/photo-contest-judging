// Comprehensive Route & API Testing Suite for PhotoJudge MVC Backend
const BASE_URL = "http://localhost:5001";

let passed = 0;
let failed = 0;

const assert = (condition, description) => {
    if (condition) {
        console.log(`  ✅ PASS: ${description}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${description}`);
        failed++;
    }
};

const apiCall = async (endpoint, options = {}) => {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });
        const data = await res.json().catch(() => null);
        return { status: res.status, ok: res.ok, data };
    } catch (err) {
        return { status: 0, ok: false, error: err.message };
    }
};

const runAllTests = async () => {
    console.log("==================================================");
    console.log("🧪 TESTING ALL PHOTOJUDGE BACKEND ROUTES & CONTROLLERS");
    console.log("==================================================\n");

    const timestamp = Date.now();
    const testParticipant = {
        name: `Test Participant ${timestamp}`,
        email: `participant_${timestamp}@test.com`,
        password: "password123",
        role: "participant"
    };

    const testJudge = {
        name: `Test Judge ${timestamp}`,
        email: `judge_${timestamp}@test.com`,
        password: "password123",
        role: "judge",
        judgeAccessKey: "JUDGE2026",
        specialization: "Nature & Wildlife"
    };

    let participantToken = "";
    let judgeToken = "";
    let participantId = "";
    let createdEntryId = "";
    let createdPhotoId = "";

    // ----------------------------------------------------
    // 1. HEALTH & STATIC SERVING
    // ----------------------------------------------------
    console.log("--- 1. Health & Server Status Routes ---");
    const health = await apiCall("/api");
    assert(health.status === 200 && health.data?.success === true, "GET /api returns 200 OK with success message");

    const htmlRes = await fetch(`${BASE_URL}/`);
    assert(htmlRes.status === 200 && htmlRes.headers.get("content-type")?.includes("text/html"), "GET / serves static index.html directly");

    // ----------------------------------------------------
    // 2. CONTESTS ROUTES
    // ----------------------------------------------------
    console.log("\n--- 2. Contests Routes (/api/contests) ---");
    const contests = await apiCall("/api/contests");
    assert(contests.status === 200 && Array.isArray(contests.data?.contests) && contests.data.contests.length >= 8, `GET /api/contests returns all contests (found: ${contests.data?.contests?.length})`);

    const activeContests = await apiCall("/api/contests?status=active");
    assert(activeContests.status === 200 && activeContests.data?.contests?.length > 0, "GET /api/contests?status=active filters by status");

    const singleContest = await apiCall("/api/contests/nature-2026");
    assert(singleContest.status === 200 && singleContest.data?.contest?.id === "nature-2026", "GET /api/contests/:id fetches contest by slug");

    // ----------------------------------------------------
    // 3. AUTHENTICATION & ACCESS GUARDS
    // ----------------------------------------------------
    console.log("\n--- 3. Authentication Routes (/api/auth) ---");

    // Register Participant
    const regPart = await apiCall("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(testParticipant)
    });
    assert(regPart.status === 201 && regPart.data?.token && regPart.data?.user?.role === "participant", "POST /api/auth/register creates a new participant account with JWT");
    participantToken = regPart.data?.token;
    participantId = regPart.data?.user?._id;

    // Reject Judge with Invalid Access Key
    const regBadJudge = await apiCall("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...testJudge, judgeAccessKey: "WRONG_KEY" })
    });
    assert(regBadJudge.status === 400 && regBadJudge.data?.success === false, "POST /api/auth/register blocks judge with invalid access key (400)");

    // Register Judge with Valid Access Key
    const regGoodJudge = await apiCall("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(testJudge)
    });
    assert(regGoodJudge.status === 201 && regGoodJudge.data?.token && regGoodJudge.data?.user?.role === "judge", "POST /api/auth/register creates an authorized judge account");
    judgeToken = regGoodJudge.data?.token;

    // Login with valid credentials
    const loginSuccess = await apiCall("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: testParticipant.email, password: testParticipant.password })
    });
    assert(loginSuccess.status === 200 && loginSuccess.data?.token, "POST /api/auth/login succeeds with valid credentials");

    // Login with invalid credentials
    const loginFail = await apiCall("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: testParticipant.email, password: "wrongpassword" })
    });
    assert(loginFail.status === 401 && loginFail.data?.success === false, "POST /api/auth/login rejects wrong password with 401 Unauthorized");

    // Protected /me route
    const meSuccess = await apiCall("/api/auth/me", {
        headers: { Authorization: `Bearer ${participantToken}` }
    });
    assert(meSuccess.status === 200 && meSuccess.data?.user?.email === testParticipant.email, "GET /api/auth/me returns authenticated user profile");

    const meUnauthorized = await apiCall("/api/auth/me");
    assert(meUnauthorized.status === 401, "GET /api/auth/me blocks requests without token (401)");

    // ----------------------------------------------------
    // 4. PHOTO ENTRIES ROUTES
    // ----------------------------------------------------
    console.log("\n--- 4. Photo Entries Routes (/api/entries) ---");

    // Submit an Entry as Participant
    const newEntry = {
        contestId: "nature-2026",
        title: "Morning Cascade",
        description: "Fresh waterfall at dawn in the northern highlands.",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=85"
    };

    const submitEntry = await apiCall("/api/entries", {
        method: "POST",
        headers: { Authorization: `Bearer ${participantToken}` },
        body: JSON.stringify(newEntry)
    });
    assert(submitEntry.status === 201 && submitEntry.data?.entry?._id, "POST /api/entries allows participant to submit photograph");
    createdEntryId = submitEntry.data?.entry?._id;

    // Submit without authentication
    const submitUnauth = await apiCall("/api/entries", {
        method: "POST",
        body: JSON.stringify(newEntry)
    });
    assert(submitUnauth.status === 401, "POST /api/entries rejects unauthenticated submission (401)");

    // Get All Entries
    const allEntries = await apiCall("/api/entries");
    assert(allEntries.status === 200 && Array.isArray(allEntries.data?.entries), `GET /api/entries lists all submissions (found: ${allEntries.data?.entries?.length})`);

    // Get My Entries
    const myEntries = await apiCall("/api/entries/my", {
        headers: { Authorization: `Bearer ${participantToken}` }
    });
    assert(myEntries.status === 200 && myEntries.data?.entries?.some(e => e._id === createdEntryId), "GET /api/entries/my returns submissions belonging to current participant");

    // Get Single Entry by ID
    const singleEntry = await apiCall(`/api/entries/${createdEntryId}`);
    assert(singleEntry.status === 200 && singleEntry.data?.entry?.title === newEntry.title, "GET /api/entries/:id retrieves entry details");

    // Update Entry
    const updateEntry = await apiCall(`/api/entries/${createdEntryId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${participantToken}` },
        body: JSON.stringify({
            title: "Morning Cascade (Updated)",
            description: "Updated description with camera details."
        })
    });
    assert(updateEntry.status === 200 && updateEntry.data?.entry?.title === "Morning Cascade (Updated)", "PUT /api/entries/:id updates entry title and description");

    // ----------------------------------------------------
    // 5. JUDGING & SCORES ROUTES
    // ----------------------------------------------------
    console.log("\n--- 5. Scoring & Judging Routes (/api/scores) ---");

    // Participant attempts to judge (Forbidden)
    const scoreAsParticipant = await apiCall("/api/scores", {
        method: "POST",
        headers: { Authorization: `Bearer ${participantToken}` },
        body: JSON.stringify({ entryId: createdEntryId, creativity: 8, technical: 9, theme: 8 })
    });
    assert(scoreAsParticipant.status === 403, "POST /api/scores rejects non-judges with 403 Forbidden");

    // Judge submits valid score
    const scoreAsJudge = await apiCall("/api/scores", {
        method: "POST",
        headers: { Authorization: `Bearer ${judgeToken}` },
        body: JSON.stringify({ entryId: createdEntryId, creativity: 8.5, technical: 9.0, theme: 8.0 })
    });
    assert(scoreAsJudge.status === 201 && scoreAsJudge.data?.score?.weightedScore > 0, `POST /api/scores accepts score from authorized judge (weighted: ${scoreAsJudge.data?.score?.weightedScore})`);

    // Duplicate scoring guard
    const duplicateScore = await apiCall("/api/scores", {
        method: "POST",
        headers: { Authorization: `Bearer ${judgeToken}` },
        body: JSON.stringify({ entryId: createdEntryId, creativity: 7, technical: 7, theme: 7 })
    });
    assert(duplicateScore.status === 400 && duplicateScore.data?.message?.includes("already scored"), "POST /api/scores blocks judge from scoring the same entry twice (400)");

    // Get scores for entry
    const scoresForEntry = await apiCall(`/api/scores/entry/${createdEntryId}`);
    assert(scoresForEntry.status === 200 && scoresForEntry.data?.scores?.length >= 1, "GET /api/scores/entry/:entryId returns all jury evaluations for a photo");

    // Get all scores
    const allScores = await apiCall("/api/scores");
    assert(allScores.status === 200 && Array.isArray(allScores.data?.scores), "GET /api/scores retrieves global scores");

    // Try editing entry after judging has started (Locking check)
    const editLockedEntry = await apiCall(`/api/entries/${createdEntryId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${participantToken}` },
        body: JSON.stringify({ title: "Trying to edit locked photo" })
    });
    assert(editLockedEntry.status === 400 && editLockedEntry.data?.message?.includes("locked"), "PUT /api/entries/:id locks entry from edits once judging starts");

    // ----------------------------------------------------
    // 6. EXPLORE GALLERY ROUTES
    // ----------------------------------------------------
    console.log("\n--- 6. Community Explore Routes (/api/explore) ---");

    // Get explore feed
    const exploreFeed = await apiCall("/api/explore");
    assert(exploreFeed.status === 200 && Array.isArray(exploreFeed.data?.photos), `GET /api/explore lists community photos (found: ${exploreFeed.data?.photos?.length})`);

    // Post to explore
    const postPhoto = await apiCall("/api/explore", {
        method: "POST",
        body: JSON.stringify({
            title: "Golden Hour Dunes",
            author: "Aman",
            category: "Nature",
            imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            description: "Sunset over the desert sands."
        })
    });
    assert(postPhoto.status === 201 && postPhoto.data?.photo?._id, "POST /api/explore creates a new community photo");
    createdPhotoId = postPhoto.data?.photo?._id;

    // Like explore photo
    if (createdPhotoId) {
        const likePhoto = await apiCall(`/api/explore/${createdPhotoId}/like`, { method: "PUT" });
        assert(likePhoto.status === 200 && likePhoto.data?.likes >= 1, "PUT /api/explore/:id/like increments photo likes counter");
    }

    // ----------------------------------------------------
    // 7. SUMMARY
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log("==================================================");

    if (failed === 0) {
        console.log("🎉 ALL ROUTES ARE FULLY FUNCTIONAL AND VERIFIED!\n");
    }
};

runAllTests();
