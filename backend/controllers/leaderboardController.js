import Entry from "../models/Entry.js";
import Score from "../models/Score.js";
import Contest from "../models/Contest.js";

const TOTAL_JUDGES_REQUIRED = 3;

// Helper: Calculate raw weighted score
const getWeightedScore = (score, contestMap) => {
    if (score.weightedScore !== undefined && score.weightedScore !== null) {
        return Number(score.weightedScore);
    }

    const contest = contestMap[score.contestId] || {};
    const criteria = contest.criteria || { creativity: 40, technical: 30, themeFit: 30 };

    const wC = (criteria.creativity || 40) / 100;
    const wT = (criteria.technical || 30) / 100;
    const wTh = (criteria.themeFit || criteria.theme || 30) / 100;

    return Number(
        (Number(score.creativity || 0) * wC +
         Number(score.technical || 0) * wT +
         Number(score.theme || 0) * wTh).toFixed(2)
    );
};

// @desc    Calculate bias-normalized leaderboard rankings
// @route   GET /api/leaderboard
// @access  Public
export const getLeaderboard = async (req, res, next) => {
    try {
        const { contestId } = req.query;

        const entryFilter = {};
        if (contestId && contestId !== "all") {
            entryFilter.contestId = contestId;
        }

        const entries = await Entry.find(entryFilter);
        const allScores = await Score.find();
        const allContests = await Contest.find();

        const contestMap = {};
        allContests.forEach((c) => {
            const json = c.toJSON();
            contestMap[json.id] = json;
            contestMap[c._id.toString()] = json;
        });

        if (allScores.length === 0 || entries.length === 0) {
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

        // 1. Group scores by judge to compute mean per judge
        const judgeGroups = {};
        let totalWeightedSum = 0;

        allScores.forEach((score) => {
            const judgeId = score.judgeId || "unknown";
            if (!judgeGroups[judgeId]) {
                judgeGroups[judgeId] = [];
            }

            const rawWeighted = getWeightedScore(score, contestMap);
            score._rawWeighted = rawWeighted;

            judgeGroups[judgeId].push(rawWeighted);
            totalWeightedSum += rawWeighted;
        });

        // 2. Calculate Judge Means and Overall Population Mean
        const judgeMeans = {};
        Object.keys(judgeGroups).forEach((jId) => {
            const arr = judgeGroups[jId];
            const sum = arr.reduce((acc, v) => acc + v, 0);
            judgeMeans[jId] = sum / arr.length;
        });

        const overallMean = allScores.length ? (totalWeightedSum / allScores.length) : 0;

        // 3. Normalize: normalized = raw - judgeMean + overallMean
        const scoreNormalizedMap = {};
        allScores.forEach((score) => {
            const judgeId = score.judgeId || "unknown";
            const jMean = judgeMeans[judgeId] || overallMean;
            const normalized = score._rawWeighted - jMean + overallMean;
            scoreNormalizedMap[score._id.toString()] = normalized;
        });

        // 4. Calculate final score per entry
        const rankedEntries = [];

        entries.forEach((entry) => {
            const entryIdStr = entry._id.toString();
            const entryScores = allScores.filter((s) => String(s.entryId) === entryIdStr);

            // Entries with at least 1 evaluation can be scored; entries with full evaluations get official status
            if (entryScores.length > 0) {
                let normSum = 0;
                let rawSum = 0;

                entryScores.forEach((s) => {
                    const norm = scoreNormalizedMap[s._id.toString()] || s.weightedScore;
                    normSum += norm;
                    rawSum += (s.weightedScore || 0);
                });

                const finalNormalizedScore = Number((normSum / entryScores.length).toFixed(2));
                const rawAverage = Number((rawSum / entryScores.length).toFixed(2));

                const contest = contestMap[entry.contestId];

                rankedEntries.push({
                    _id: entry._id,
                    id: entry._id,
                    entryId: entry._id,
                    title: entry.title,
                    description: entry.description,
                    image: entry.image,
                    participantId: entry.participantId,
                    participantName: entry.participantName,
                    contestId: entry.contestId,
                    contestTitle: contest ? contest.title : (entry.contestId || "Photo Contest"),
                    judgingStatus: entryScores.length >= TOTAL_JUDGES_REQUIRED ? "ranked" : "judging",
                    isRanked: entryScores.length >= TOTAL_JUDGES_REQUIRED,
                    scoresCount: entryScores.length,
                    rawScore: rawAverage,
                    finalScore: finalNormalizedScore
                });
            }
        });

        // 5. Sort descending by normalized score
        rankedEntries.sort((a, b) => b.finalScore - a.finalScore);

        // Assign ordinal rankings (1, 2, 3...)
        rankedEntries.forEach((item, index) => {
            item.rank = index + 1;
        });

        const podium = rankedEntries.slice(0, 3);
        const uniqueJudges = Object.keys(judgeGroups).length;

        res.status(200).json({
            success: true,
            totalEntries: entries.length,
            totalRanked: rankedEntries.length,
            totalJudges: uniqueJudges,
            overallMean: Number(overallMean.toFixed(2)),
            podium,
            rankings: rankedEntries
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get detailed evaluation breakdown and normalization result for an entry
// @route   GET /api/leaderboard/result/:entryId
// @access  Public
export const getEntryResult = async (req, res, next) => {
    try {
        const { entryId } = req.params;

        const entry = await Entry.findById(entryId);
        if (!entry) {
            return res.status(404).json({ success: false, message: "Entry not found." });
        }

        const contest = await Contest.findOne({ id: entry.contestId });
        const allScores = await Score.find();
        const entryScores = allScores.filter((s) => String(s.entryId) === entry._id.toString());

        const contestMap = {};
        if (contest) {
            const json = contest.toJSON();
            contestMap[json.id] = json;
            contestMap[contest._id.toString()] = json;
        }

        // Judge groups for means
        const judgeGroups = {};
        let totalWeightedSum = 0;

        allScores.forEach((score) => {
            const judgeId = score.judgeId || "unknown";
            if (!judgeGroups[judgeId]) judgeGroups[judgeId] = [];

            const rawWeighted = getWeightedScore(score, contestMap);
            judgeGroups[judgeId].push(rawWeighted);
            totalWeightedSum += rawWeighted;
        });

        const overallMean = allScores.length ? (totalWeightedSum / allScores.length) : 0;

        const judgeMeans = {};
        Object.keys(judgeGroups).forEach((jId) => {
            const arr = judgeGroups[jId];
            judgeMeans[jId] = arr.reduce((acc, v) => acc + v, 0) / arr.length;
        });

        let normSum = 0;
        let rawSum = 0;

        const scoreBreakdown = entryScores.map((s) => {
            const raw = getWeightedScore(s, contestMap);
            const jMean = judgeMeans[s.judgeId] || overallMean;
            const norm = raw - jMean + overallMean;

            normSum += norm;
            rawSum += raw;

            return {
                judgeId: s.judgeId,
                judgeName: s.judgeName || "Official Juror",
                creativity: s.creativity,
                technical: s.technical,
                theme: s.theme,
                rawWeightedScore: raw,
                judgeMean: Number(jMean.toFixed(2)),
                normalizedScore: Number(norm.toFixed(2)),
                judgedAt: s.createdAt
            };
        });

        const finalScore = entryScores.length ? Number((normSum / entryScores.length).toFixed(2)) : 0;
        const rawAverage = entryScores.length ? Number((rawSum / entryScores.length).toFixed(2)) : 0;

        res.status(200).json({
            success: true,
            entry,
            contest: contest ? contest.toJSON() : null,
            scoresCount: entryScores.length,
            isFullyJudged: entryScores.length >= TOTAL_JUDGES_REQUIRED,
            overallMean: Number(overallMean.toFixed(2)),
            rawAverage,
            finalScore,
            scores: scoreBreakdown
        });
    } catch (error) {
        next(error);
    }
};
