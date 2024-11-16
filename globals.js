// Global state variables
window.simulationData = null;
window.stakingChart = null;
window.percentageChart = null;
window.currentChartType = 'amounts';

// Global utility functions
window.formatNumber = function(number) {
    return Math.round(number).toLocaleString();
};

window.formatPercentage = function(number, decimals = 1) {
    return number.toFixed(decimals) + '%';
};

window.calculateApy = function(baseApy, stakeAge, bonusApy) {
    return baseApy + (stakeAge / CONFIG.MAX_STAKE_AGE) * bonusApy;
};

window.calculateMonthlyReward = function(amount, apy) {
    return amount * (apy / 100 / 12);
};