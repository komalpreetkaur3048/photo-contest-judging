
import Entry from "../models/Entry.js";
import Score from "../models/Score.js";
import Contest from "../models/Contest.js";

const TOTAL_JUDGES_REQUIRED = 3;

// Calculate weighted score
function getWeightedScore(score, contestMap) {
    if (score.weightedScore !== undefined && score.weightedScore !== null) {
        return Number(score.weightedScore);
    }

    const contest = contestMap[score.contestId];
    let creativityWeight = 40;
    let technicalWeight = 30;
    let themeWeight = 30;

    if (contest && contest.criteria) {
        creativityWeight = contest.criteria.creativity || 40;
        technicalWeight = contest.criteria.technical || 30;
        themeWeight = contest.criteria.themeFit || contest.criteria.theme || 30;
    }

    const c = Number(score.creativity || 0);
    const t = Number(score.technical || 0);
    const h = Number(score.theme || 0);

    const total =
        c * creativityWeight / 100 +
        t * technicalWeight / 100 +
        h * themeWeight / 100;

    return Number(total.toFixed(2));
}


// Get leaderboard
export const getLeaderboard = async (req, res, next) => {
    try {
        const contestId = req.query.contestId;
        const entryFilter = {};

        if (contestId && contestId !== "all") {
            entryFilter.contestId = contestId;
        }

        const entries = await Entry.find(entryFilter);
        const allScores = await Score.find();
        const allContests = await Contest.find();

        // Store contests by ID
        const contestMap = {};

        for (let i = 0; i < allContests.length; i++) {
            const contest = allContests[i].toJSON();

            contestMap[contest.id] = contest;
            contestMap[allContests[i]._id.toString()] = contest;
        }

        if (entries.length === 0 || allScores.length === 0) {
            return res.status(200).json({
                success: true,
                totalEntries: entries.length,
                totalRanked: 0,
                totalJudges: 0,
                overallMean: 0,
                podium: [],
                rankings: []
            });
        }

        // Group scores by judge
        const judgeGroups = {};
        let totalWeightedSum = 0;

        for (let i = 0; i < allScores.length; i++) {
            const score = allScores[i];
            const judgeId = score.judgeId || "unknown";

            if (!judgeGroups[judgeId]) {
                judgeGroups[judgeId] = [];
            }

            const rawScore = getWeightedScore(score, contestMap);

            score._rawWeighted = rawScore;
            judgeGroups[judgeId].push(rawScore);
            totalWeightedSum += rawScore;
        }

        // Calculate each judge's average
        const judgeMeans = {};
        const judgeIds = Object.keys(judgeGroups);

        for (let i = 0; i < judgeIds.length; i++) {
            const judgeId = judgeIds[i];
            const scores = judgeGroups[judgeId];

            let sum = 0;

            for (let j = 0; j < scores.length; j++) {
                sum += scores[j];
            }

            judgeMeans[judgeId] = sum / scores.length;
        }

        // Calculate overall average
        const overallMean = totalWeightedSum / allScores.length;

        // Normalize each score
        const normalizedScores = {};

        for (let i = 0; i < allScores.length; i++) {
            const score = allScores[i];
            const judgeId = score.judgeId || "unknown";

            let judgeMean = judgeMeans[judgeId];

            if (judgeMean === undefined) {
                judgeMean = overallMean;
            }

            const normalized =
                score._rawWeighted - judgeMean + overallMean;

            normalizedScores[score._id.toString()] = normalized;
        }

        // Calculate each photograph's final score
        const rankings = [];

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];

            const entryScores = allScores.filter(
                (score) => score.entryId.toString() === entry._id.toString()
            );

            if (entryScores.length === 0) {
                continue;
            }

            let normalizedSum = 0;
            let rawSum = 0;

            for (let j = 0; j < entryScores.length; j++) {
                const score = entryScores[j];
                let normalized = normalizedScores[score._id.toString()];

                if (normalized === undefined) {
                    normalized = score.weightedScore || 0;
                }

                normalizedSum += normalized;
                rawSum += score.weightedScore || 0;
            }

            const finalScore = Number(
                (normalizedSum / entryScores.length).toFixed(2)
            );

            const rawAverage = Number(
                (rawSum / entryScores.length).toFixed(2)
            );

            const contest = contestMap[entry.contestId];
            const isRanked = entryScores.length >= TOTAL_JUDGES_REQUIRED;

            rankings.push({
                _id: entry._id,
                id: entry._id,
                entryId: entry._id,
                title: entry.title,
                description: entry.description,
                image: entry.image,
                participantId: entry.participantId,
                participantName: entry.participantName,
                contestId: entry.contestId,
                contestTitle: contest
                    ? contest.title
                    : (entry.contestId || "Photo Contest"),
                judgingStatus: isRanked ? "ranked" : "judging",
                isRanked: isRanked,
                scoresCount: entryScores.length,
                rawScore: rawAverage,
                finalScore: finalScore
            });
        }

        // Highest score first
        rankings.sort((a, b) => b.finalScore - a.finalScore);

        // Assign ranks
        for (let i = 0; i < rankings.length; i++) {
            rankings[i].rank = i + 1;
        }

        const podium = rankings.slice(0, 3);
        const totalJudges = Object.keys(judgeGroups).length;

        return res.status(200).json({
            success: true,
            totalEntries: entries.length,
            totalRanked: rankings.length,
            totalJudges: totalJudges,
            overallMean: Number(overallMean.toFixed(2)),
            podium: podium,
            rankings: rankings
        });
    } catch (error) {
        next(error);
    }
};


// Get detailed result for one photograph
export const getEntryResult = async (req, res, next) => {
    try {
        const entryId = req.params.entryId;

        const entry = await Entry.findById(entryId);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Entry not found."
            });
        }

        const contest = await Contest.findOne({
            id: entry.contestId
        });

        const allScores = await Score.find();

        const entryScores = allScores.filter(
            (score) => score.entryId.toString() === entry._id.toString()
        );

        // Store the contest details
        const contestMap = {};

        if (contest) {
            const contestData = contest.toJSON();
            contestMap[contestData.id] = contestData;
            contestMap[contest._id.toString()] = contestData;
        }

        // Group all scores by judge
        const judgeGroups = {};
        let totalWeightedSum = 0;

        for (let i = 0; i < allScores.length; i++) {
            const score = allScores[i];
            const judgeId = score.judgeId || "unknown";

            if (!judgeGroups[judgeId]) {
                judgeGroups[judgeId] = [];
            }

            const rawScore = getWeightedScore(score, contestMap);

            judgeGroups[judgeId].push(rawScore);
            totalWeightedSum += rawScore;
        }

        let overallMean = 0;

        if (allScores.length > 0) {
            overallMean = totalWeightedSum / allScores.length;
        }

        // Calculate each judge's average
        const judgeMeans = {};
        const judgeIds = Object.keys(judgeGroups);

        for (let i = 0; i < judgeIds.length; i++) {
            const judgeId = judgeIds[i];
            const scores = judgeGroups[judgeId];

            let sum = 0;

            for (let j = 0; j < scores.length; j++) {
                sum += scores[j];
            }

            judgeMeans[judgeId] = sum / scores.length;
        }

        // Calculate each judge's score for this photograph
        let normalizedSum = 0;
        let rawSum = 0;
        const scoreBreakdown = [];

        for (let i = 0; i < entryScores.length; i++) {
            const score = entryScores[i];
            const rawScore = getWeightedScore(score, contestMap);
            const judgeId = score.judgeId || "unknown";

            let judgeMean = judgeMeans[judgeId];

            if (judgeMean === undefined) {
                judgeMean = overallMean;
            }

            const normalizedScore =
                rawScore - judgeMean + overallMean;

            normalizedSum += normalizedScore;
            rawSum += rawScore;

            scoreBreakdown.push({
                judgeId: score.judgeId,
                judgeName: score.judgeName || "Official Juror",
                creativity: score.creativity,
                technical: score.technical,
                theme: score.theme,
                rawWeightedScore: rawScore,
                judgeMean: Number(judgeMean.toFixed(2)),
                normalizedScore: Number(normalizedScore.toFixed(2)),
                judgedAt: score.createdAt
            });
        }

        let finalScore = 0;
        let rawAverage = 0;

        if (entryScores.length > 0) {
            finalScore = Number(
                (normalizedSum / entryScores.length).toFixed(2)
            );

            rawAverage = Number(
                (rawSum / entryScores.length).toFixed(2)
            );
        }

        return res.status(200).json({
            success: true,
            entry: entry,
            contest: contest ? contest.toJSON() : null,
            scoresCount: entryScores.length,
            isFullyJudged: entryScores.length >= TOTAL_JUDGES_REQUIRED,
            overallMean: Number(overallMean.toFixed(2)),
            rawAverage: rawAverage,
            finalScore: finalScore,
            scores: scoreBreakdown
        });
    } catch (error) {
        next(error);
    }
};
