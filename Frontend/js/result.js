// =========================================================
// PHOTOJUDGE — EVALUATION RESULT PAGE
// =========================================================

const resultParams = new URLSearchParams(window.location.search);
const entryId = resultParams.get("id");
const resultContainer = document.querySelector("#resultContainer");

async function renderResultPage() {
    if (!resultContainer) return;

    if (!entryId) {
        resultContainer.innerHTML = `
            <section class="result-error">
                <h1>Result not found</h1>
                <p>No entry specified in URL.</p>
                <a href="my-entries.html" class="result-btn">Back to My Entries</a>
            </section>
        `;
        return;
    }

    resultContainer.innerHTML = `
        <div style="text-align: center; padding: 60px; color: var(--text-muted);">
            <p>Loading evaluation results...</p>
        </div>
    `;

    let data = null;

    // Fetch from MongoDB backend API
    if (window.PhotoJudgeAPI) {
        try {
            const apiRes = await window.PhotoJudgeAPI.getEntryResult(entryId);
            if (apiRes && apiRes.success) {
                data = apiRes;
            }
        } catch (e) {
            console.warn("Could not fetch result from API:", e);
        }
    }

    // Fallback to local storage if API didn't resolve
    if (!data) {
        const entries = JSON.parse(localStorage.getItem("photoEntries")) || [];
        const contests = JSON.parse(localStorage.getItem("contests")) || [];
        const judgeScores = JSON.parse(localStorage.getItem("judgeScores")) || [];

        const localEntry = entries.find(item => String(item.id || item._id) === String(entryId));
        if (localEntry) {
            const contest = contests.find(c => String(c.id) === String(localEntry.contestId));
            const scores = judgeScores.filter(s => String(s.entryId) === String(localEntry.id || localEntry._id));
            
            data = {
                success: true,
                entry: localEntry,
                contest: contest,
                scores: scores,
                finalScore: localEntry.finalScore || 0,
                scoresCount: scores.length
            };
        }
    }

    if (!data || !data.entry) {
        resultContainer.innerHTML = `
            <section class="result-error">
                <h1>Result not found</h1>
                <p>We couldn't find the requested evaluation.</p>
                <a href="my-entries.html" class="result-btn">Back to My Entries</a>
            </section>
        `;
        return;
    }

    const entry = data.entry;
    const contest = data.contest;
    const scores = data.scores || [];
    const weights = contest?.criteria || { creativity: 40, technical: 30, themeFit: 30 };

    // Calculate averages
    let cAvg = 0, tAvg = 0, thAvg = 0;
    if (scores.length > 0) {
        cAvg = scores.reduce((sum, s) => sum + Number(s.creativity || 0), 0) / scores.length;
        tAvg = scores.reduce((sum, s) => sum + Number(s.technical || 0), 0) / scores.length;
        thAvg = scores.reduce((sum, s) => sum + Number(s.theme || 0), 0) / scores.length;
    }

    const finalScore = data.finalScore !== undefined ? Number(data.finalScore).toFixed(2) : Number(entry.finalScore || 0).toFixed(2);
    const rankDisplay = entry.rank ? `#${entry.rank}` : "Official";

    resultContainer.innerHTML = `
        <section class="result-header">
            <p class="eyebrow">FINAL EVALUATION</p>
            <h1>${entry.title}</h1>
            <p class="result-contest">${contest?.title || "Photo Contest"}</p>
            <p class="result-participant">by <strong>${entry.participantName}</strong></p>
        </section>

        <!-- SCORE HERO -->
        <section class="result-score-card">
            <div class="result-rank-box">
                <span>FINAL STANDING</span>
                <strong>${rankDisplay}</strong>
            </div>

            <div class="main-score">
                <span>NORMALIZED SCORE</span>
                <strong>${finalScore}</strong>
                <small>/ 10</small>
            </div>

            <div class="judges-complete">
                <span>EVALUATIONS</span>
                <strong>${data.scoresCount || scores.length}/3 JURORS</strong>
            </div>
        </section>

        <!-- PHOTO SECTION -->
        <section class="result-photo-section">
            <div class="result-photo">
                <img src="${entry.image}" alt="${entry.title}">
            </div>

            <div class="result-story">
                <p class="eyebrow">ABOUT THE ENTRY</p>
                <h2>${entry.title}</h2>
                <p>${entry.description}</p>
                <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border);">
                    <p style="font-size: 0.85rem; color: var(--text-muted);">
                        Submitted on ${new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </section>

        <!-- SCORE BREAKDOWN -->
        <section class="evaluation-section">
            <div class="section-header">
                <p class="eyebrow">SCORE BREAKDOWN</p>
                <h2>Evaluation Dimensions</h2>
                <p>Calculated across independent weighted judging criteria.</p>
            </div>

            <div class="criteria-results">
                <div class="criteria-result">
                    <div class="criteria-top">
                        <div>
                            <strong>Creativity</strong>
                            <span>${weights.creativity || 40}% Weight</span>
                        </div>
                        <strong>${cAvg.toFixed(2)} / 10</strong>
                    </div>
                    <div class="result-progress">
                        <div style="width: ${cAvg * 10}%;"></div>
                    </div>
                </div>

                <div class="criteria-result">
                    <div class="criteria-top">
                        <div>
                            <strong>Technical Quality</strong>
                            <span>${weights.technical || 30}% Weight</span>
                        </div>
                        <strong>${tAvg.toFixed(2)} / 10</strong>
                    </div>
                    <div class="result-progress">
                        <div style="width: ${tAvg * 10}%;"></div>
                    </div>
                </div>

                <div class="criteria-result">
                    <div class="criteria-top">
                        <div>
                            <strong>Theme Fit</strong>
                            <span>${weights.themeFit || weights.theme || 30}% Weight</span>
                        </div>
                        <strong>${thAvg.toFixed(2)} / 10</strong>
                    </div>
                    <div class="result-progress">
                        <div style="width: ${thAvg * 10}%;"></div>
                    </div>
                </div>
            </div>

            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                <span style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Evaluated By Official Jury:</span>
                <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px;">
                    ${scores.map(function(s) {
                        return `<span style="padding: 5px 12px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; color: #334155; font-weight: 500;">✓ ${s.judgeName || "Official Juror"} (Score: ${Number(s.rawWeightedScore || s.weightedScore || 0).toFixed(2)})</span>`;
                    }).join("") || "<span style='color:#94a3b8; font-size:13px;'>Pending evaluations</span>"}
                </div>
            </div>
        </section>

        <!-- FAIRNESS INFO -->
        <section class="fairness-result">
            <div>
                <p class="eyebrow">FAIR EVALUATION</p>
                <h2>Your score is bias-normalized.</h2>
                <p>
                    PhotoJudge adjusts for differences in judge strictness before determining the final standing.
                </p>
            </div>
            <div class="fairness-badge">
                ✓
                <span>Normalized</span>
            </div>
        </section>

        <!-- ACTIONS -->
        <section class="result-actions">
            <a href="my-entries.html" class="secondary-result-btn">← My Entries</a>
            <a href="leaderboard.html" class="primary-result-btn">View Leaderboard →</a>
        </section>
    `;
}

// Initializer
document.addEventListener("DOMContentLoaded", renderResultPage);
renderResultPage();