// UI update functions
window.updateSummary = function(migrationStakers, quickStakers, monthlyStakers, currentSupply) {
    const monthlyTotal = monthlyStakers.reduce((sum, staker) => sum + staker.amount, 0);
    const monthlyRewards = monthlyStakers.reduce((sum, staker) => sum + staker.totalRewards, 0);
    
    // Update total supply information
    const initialSupply = window.getInputValues().initialSupply;
    const supplyGrowth = ((currentSupply - initialSupply) / initialSupply * 100).toFixed(2);
    
    updateSupplyInfo(currentSupply, supplyGrowth);
    updateInflationInfo();
    updateCohortInfo(migrationStakers, quickStakers, monthlyTotal, monthlyRewards, currentSupply);
    updateTotalInfo(migrationStakers, quickStakers, monthlyTotal, monthlyRewards, currentSupply);
};

function updateSupplyInfo(currentSupply, supplyGrowth) {
    document.getElementById('totalSupplyValue').textContent = 
        `${formatNumber(currentSupply)} EFX`;
    document.getElementById('totalSupplyGrowth').textContent = 
        `+${supplyGrowth}% from initial supply`;
}

function updateInflationInfo() {
    const currentMonth = window.simulationData.length - 1;
    const currentData = window.simulationData[currentMonth];
    
    if (currentMonth >= 12) {
        const annualInflation = currentData.annualInflation;
        const previousMonth = window.simulationData[currentMonth - 1];
        const monthlyInflation = calculateInflation(
            currentData.currentSupply,
            previousMonth.currentSupply
        );
        
        document.getElementById('annualInflationValue').textContent = 
            `${formatPercentage(annualInflation)}`;
        document.getElementById('monthlyInflationValue').textContent = 
            `${formatPercentage(monthlyInflation)} monthly rate`;
    } else {
        document.getElementById('annualInflationValue').textContent = 'Calculating...';
        document.getElementById('monthlyInflationValue').textContent = 
            'Need 12 months of data';
    }
}

function updateCohortInfo(migrationStakers, quickStakers, monthlyTotal, monthlyRewards, currentSupply) {
    // Migration cohort
    updateSummaryElement('migrationTotal', 
        migrationStakers.amount, 
        currentSupply
    );
    updateSummaryElement('migrationRewards', 
        migrationStakers.totalRewards
    );
    
    // Quick stakers
    updateSummaryElement('quickTotal', 
        quickStakers.amount, 
        currentSupply
    );
    updateSummaryElement('quickRewards', 
        quickStakers.totalRewards
    );
    
    // Monthly stakers
    updateSummaryElement('monthlyTotal', 
        monthlyTotal, 
        currentSupply
    );
    updateSummaryElement('monthlyRewards', 
        monthlyRewards
    );
}

function updateTotalInfo(migrationStakers, quickStakers, monthlyTotal, monthlyRewards, currentSupply) {
    const totalStaked = migrationStakers.amount + quickStakers.amount + monthlyTotal;
    const totalRewards = migrationStakers.totalRewards + quickStakers.totalRewards + monthlyRewards;
    
    updateSummaryElement('totalStaked', 
        totalStaked, 
        currentSupply
    );
    updateSummaryElement('totalRewards', 
        totalRewards
    );
}

window.updateSummaryElement = function(elementId, amount, supply = null) {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (supply) {
        const percentage = (amount / supply) * 100;
        element.textContent = `${formatNumber(amount)} EFX (${formatPercentage(percentage)})`;
    } else {
        element.textContent = `+${formatNumber(amount)} EFX Rewards`;
    }
};

// Error handling
window.handleError = function(error) {
    console.error('Simulation error:', error);
    alert('An error occurred during simulation. Please check the console for details.');
};

// Input validation
window.validateInputs = function() {
    const inputs = getInputValues();
    
    if (inputs.baseApy < 0 || inputs.bonusApy < 0) {
        throw new Error('APY values cannot be negative');
    }
    
    if (inputs.initialSupply <= 0) {
        throw new Error('Initial supply must be greater than 0');
    }
    
    const totalInitialStake = inputs.migrationStake + inputs.quickStake;
    if (totalInitialStake > 100) {
        throw new Error('Total initial stake cannot exceed 100%');
    }
    
    if (inputs.monthlyNewStake < 0) {
        throw new Error('Monthly new stake cannot be negative');
    }
    
    return inputs;
};

// Initialize the UI
window.initializeUI = function() {
    document.getElementById('exportBtn').disabled = true;
    document.getElementById('summaryContainer').style.display = 'none';
};

// Add event listener for page load
window.addEventListener('load', initializeUI);