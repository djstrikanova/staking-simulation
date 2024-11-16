// Core calculation functions
window.processMonthlyStakers = function(monthlyStakers, params) {
    let currentMonthlyRewards = 0;
    monthlyStakers.forEach(staker => {
        const stakerApy = calculateApy(params.baseApy, staker.stakeAge, params.bonusApy);
        const rewards = calculateMonthlyReward(staker.amount, stakerApy);
        currentMonthlyRewards += rewards;
        staker.totalRewards += rewards;
        staker.monthlyRewards.push(rewards);
    });
    return currentMonthlyRewards;
};

window.compoundRewards = function(migrationStakers, quickStakers, monthlyStakers, migrationRewards, quickRewards, params) {
    migrationStakers.amount += migrationRewards;
    quickStakers.amount += quickRewards;
    monthlyStakers.forEach((staker) => {
        const stakerApy = calculateApy(params.baseApy, staker.stakeAge, params.bonusApy);
        const rewards = calculateMonthlyReward(staker.amount, stakerApy);
        staker.amount += rewards;
    });
};

window.ageStakes = function(migrationStakers, quickStakers, monthlyStakers) {
    migrationStakers.stakeAge = Math.min(migrationStakers.stakeAge + CONFIG.DAYS_PER_MONTH, CONFIG.MAX_STAKE_AGE);
    quickStakers.stakeAge = Math.min(quickStakers.stakeAge + CONFIG.DAYS_PER_MONTH, CONFIG.MAX_STAKE_AGE);
    monthlyStakers.forEach(staker => {
        staker.stakeAge = Math.min(staker.stakeAge + CONFIG.DAYS_PER_MONTH, CONFIG.MAX_STAKE_AGE);
    });
};

window.createMonthData = function(
    currentMonth,
    migrationStakers,
    quickStakers,
    monthlyStakerTotal,
    totalStaked,
    currentSupply,
    migrationRewards,
    quickRewards,
    currentMonthlyRewards,
    annualInflation
) {
    return {
        month: currentMonth,
        migrationStaked: Math.round(migrationStakers.amount),
        quickStaked: Math.round(quickStakers.amount),
        monthlyStaked: Math.round(monthlyStakerTotal),
        totalStaked: Math.round(totalStaked),
        currentSupply: Math.round(currentSupply),
        migrationPercentage: (migrationStakers.amount / currentSupply) * 100,
        quickStakePercentage: (quickStakers.amount / currentSupply) * 100,
        monthlyStakePercentage: (monthlyStakerTotal / currentSupply) * 100,
        totalStakePercentage: (totalStaked / currentSupply) * 100,
        migrationRewards: Math.round(migrationRewards),
        quickRewards: Math.round(quickRewards),
        monthlyRewards: Math.round(currentMonthlyRewards),
        totalRewards: Math.round(migrationRewards + quickRewards + currentMonthlyRewards),
        annualInflation: annualInflation
    };
};

window.initializeStaker = function(amount, initialAge = 0) {
    return {
        amount: amount,
        stakeAge: initialAge,
        totalRewards: 0,
        monthlyRewards: []
    };
};

window.calculateInflation = function(currentSupply, previousSupply) {
    return ((currentSupply - previousSupply) / previousSupply) * 100;
};

window.exportToCsv = function() {
    if (!window.simulationData) return;

    const headers = Object.keys(window.simulationData[0]).join(',');
    const rows = window.simulationData.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'staking_simulation.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};