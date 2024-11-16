// Main simulation function
window.runSimulation = function() {
    const params = window.getInputValues();
    window.simulationData = [];
    let currentMonth = 0;
    let currentSupply = params.initialSupply;
    
    // Initialize cohorts
    let migrationStakers = initializeStaker(
        params.initialSupply * (params.migrationStake / 100),
        CONFIG.MAX_STAKE_AGE
    );
    
    let quickStakers = initializeStaker(
        params.initialSupply * (params.quickStake / 100),
        0
    );
    
    let monthlyStakers = [];

    // First month should just record initial state without rewards
    window.simulationData.push(createMonthData(
        0,
        migrationStakers,
        quickStakers,
        0, // monthly staker total
        migrationStakers.amount + quickStakers.amount, // total staked
        currentSupply,
        0, // no rewards in first month
        0,
        0,
        0
    ));

    // Start actual simulation from month 1
    currentMonth = 1;
    while (currentMonth <= params.months) {
        const monthData = calculateMonthlyData(
            currentMonth,
            currentSupply,
            migrationStakers,
            quickStakers,
            monthlyStakers,
            params
        );
        
        currentSupply = monthData.newSupply;
        window.simulationData.push(monthData.data);
        currentMonth++;
    }

    updateSummary(migrationStakers, quickStakers, monthlyStakers, currentSupply);
    updateCharts();
    document.getElementById('exportBtn').disabled = false;
    document.getElementById('summaryContainer').style.display = 'block';
};

window.calculateMonthlyData = function(currentMonth, currentSupply, migrationStakers, quickStakers, monthlyStakers, params) {
    // Calculate APY and rewards for migration stakers
    const migrationApy = calculateApy(params.baseApy, migrationStakers.stakeAge, params.bonusApy);
    const migrationRewards = calculateMonthlyReward(migrationStakers.amount, migrationApy);
    migrationStakers.totalRewards += migrationRewards;
    migrationStakers.monthlyRewards.push(migrationRewards);

    // Calculate APY and rewards for quick stakers
    const quickApy = calculateApy(params.baseApy, quickStakers.stakeAge, params.bonusApy);
    const quickRewards = calculateMonthlyReward(quickStakers.amount, quickApy);
    quickStakers.totalRewards += quickRewards;
    quickStakers.monthlyRewards.push(quickRewards);
    
    // Process monthly stakers and get their rewards
    const currentMonthlyRewards = processMonthlyStakers(monthlyStakers, params);

    // Add new monthly stakers if not first month
    if (currentMonth > 0) {
        monthlyStakers.push(initializeStaker(
            params.initialSupply * (params.monthlyNewStake / 100),
            0
        ));
    }

    // Compound all rewards
    compoundRewards(migrationStakers, quickStakers, monthlyStakers, migrationRewards, quickRewards, params);

    // Calculate total rewards and new supply
    const totalMonthlyRewards = migrationRewards + quickRewards + currentMonthlyRewards;
    const newSupply = currentSupply + totalMonthlyRewards;

    // Age all stakes
    ageStakes(migrationStakers, quickStakers, monthlyStakers);

    // Calculate totals and percentages
    const monthlyStakerTotal = monthlyStakers.reduce((sum, staker) => sum + staker.amount, 0);
    const totalStaked = migrationStakers.amount + quickStakers.amount + monthlyStakerTotal;
    
    // Calculate inflation rates
    let annualInflation = 0;
    if (currentMonth >= 12) {
        const yearAgoSupply = window.simulationData[currentMonth - 12].currentSupply;
        annualInflation = calculateInflation(newSupply, yearAgoSupply);
    }

    // Create and return the month's data
    const monthData = createMonthData(
        currentMonth,
        migrationStakers,
        quickStakers,
        monthlyStakerTotal,
        totalStaked,
        newSupply,
        migrationRewards,
        quickRewards,
        currentMonthlyRewards,
        annualInflation
    );

    return {
        newSupply: newSupply,
        data: monthData
    };
};