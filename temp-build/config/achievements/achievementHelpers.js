"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAchievementsByCategory = getAchievementsByCategory;
exports.getCompletedAchievements = getCompletedAchievements;
exports.getAchievementCompletionRate = getAchievementCompletionRate;
exports.getVisibleAchievements = getVisibleAchievements;
exports.getSeriesProgress = getSeriesProgress;
// ===== ACHIEVEMENT HELPER FUNCTIONS =====
function getAchievementsByCategory(achievements, category) {
    return Object.values(achievements).filter(achievement => achievement.category === category);
}
function getCompletedAchievements(achievements) {
    return Object.values(achievements).filter(achievement => achievement.completed);
}
function getAchievementCompletionRate(achievements) {
    const total = Object.keys(achievements).length;
    const completed = getCompletedAchievements(achievements).length;
    return total > 0 ? (completed / total) * 100 : 0;
}
function getVisibleAchievements(achievements) {
    return Object.values(achievements).filter(achievement => !achievement.hidden);
}
function getSeriesProgress(achievements, series) {
    const seriesAchievements = series.achievements.map(id => achievements[id]).filter(Boolean);
    const completed = seriesAchievements.filter(achievement => achievement.completed).length;
    const total = seriesAchievements.length;
    return {
        completed,
        total,
        isComplete: completed === total
    };
}
