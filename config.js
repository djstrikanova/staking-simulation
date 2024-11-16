// Configuration constants
window.CONFIG = {
    MONTHS: 36,
    COLORS: {
        MIGRATION: 'rgb(75, 192, 192)',
        QUICK: 'rgb(255, 99, 132)',
        MONTHLY: 'rgb(255, 205, 86)',
        TOTAL: 'rgb(54, 162, 235)'
    },
    MAX_STAKE_AGE: 1000,
    DAYS_PER_MONTH: 30
};

// Input handling
window.getInputValues = function() {
    return {
        baseApy: parseFloat(document.getElementById('baseApy').value),
        bonusApy: parseFloat(document.getElementById('bonusApy').value),
        initialSupply: parseFloat(document.getElementById('initialSupply').value),
        migrationStake: parseFloat(document.getElementById('migrationStake').value),
        quickStake: parseFloat(document.getElementById('quickStake').value),
        monthlyNewStake: parseFloat(document.getElementById('monthlyNewStake').value),
        months: CONFIG.MONTHS
    };
};