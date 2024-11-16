// Chart management and updates
window.updateCharts = function() {
    updateMainChart();
    if (window.currentChartType !== 'inflation') {
        updatePercentageChart();
    }
};

window.updateMainChart = function() {
    const ctx = document.getElementById('stakingChart').getContext('2d');
    if (window.stakingChart) {
        window.stakingChart.destroy();
    }

    const datasets = getDatasetsByType(window.currentChartType);
    window.stakingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: window.simulationData.map(d => `Month ${d.month}`),
            datasets: datasets
        },
        options: getChartOptions(
            getYAxisLabel(window.currentChartType),
            window.currentChartType === 'inflation'
        )
    });
};

window.updatePercentageChart = function() {
    const percentCtx = document.getElementById('percentageChart').getContext('2d');
    if (window.percentageChart) {
        window.percentageChart.destroy();
    }

    window.percentageChart = new Chart(percentCtx, {
        type: 'line',
        data: {
            labels: window.simulationData.map(d => `Month ${d.month}`),
            datasets: getPercentageDatasets()
        },
        options: getChartOptions('Percentage of Total Supply', true)
    });
};

function getDatasetsByType(chartType) {
    switch(chartType) {
        case 'amounts':
            return [
                createDataset('Migration Cohort', 'migrationStaked', CONFIG.COLORS.MIGRATION),
                createDataset('Quick Stakers', 'quickStaked', CONFIG.COLORS.QUICK),
                createDataset('Monthly Stakers', 'monthlyStaked', CONFIG.COLORS.MONTHLY),
                createDataset('Total Staked', 'totalStaked', CONFIG.COLORS.TOTAL, true)
            ];
        case 'rewards':
            return [
                createDataset('Migration Rewards', 'migrationRewards', CONFIG.COLORS.MIGRATION),
                createDataset('Quick Staker Rewards', 'quickRewards', CONFIG.COLORS.QUICK),
                createDataset('Monthly Staker Rewards', 'monthlyRewards', CONFIG.COLORS.MONTHLY),
                createDataset('Total Rewards', 'totalRewards', CONFIG.COLORS.TOTAL, true)
            ];
        case 'inflation':
            return [{
                label: 'Annual Inflation Rate',
                data: window.simulationData.map(d => d.annualInflation),
                borderColor: CONFIG.COLORS.TOTAL,
                tension: 0.1,
                fill: false,
                borderWidth: 2
            }];
    }
}

function getPercentageDatasets() {
    return [
        createDataset('Migration %', 'migrationPercentage', CONFIG.COLORS.MIGRATION),
        createDataset('Quick Stakers %', 'quickStakePercentage', CONFIG.COLORS.QUICK),
        createDataset('Monthly Stakers %', 'monthlyStakePercentage', CONFIG.COLORS.MONTHLY),
        createDataset('Total Staked %', 'totalStakePercentage', CONFIG.COLORS.TOTAL, true)
    ];
}

function createDataset(label, key, color, isTotal = false) {
    return {
        label: label,
        data: window.simulationData.map(d => d[key]),
        borderColor: color,
        tension: 0.1,
        fill: false,
        borderWidth: isTotal ? 2 : 1
    };
}

function getYAxisLabel(chartType) {
    switch(chartType) {
        case 'amounts':
            return 'Amount Staked (EFX)';
        case 'rewards':
            return 'Monthly Rewards (EFX)';
        case 'inflation':
            return 'Annual Inflation Rate (%)';
        default:
            return '';
    }
}

function getChartOptions(yAxisLabel, isPercentage = false) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (isPercentage) {
                            label += context.parsed.y.toFixed(1) + '%';
                        } else {
                            label += parseInt(context.parsed.y).toLocaleString() + ' EFX';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: yAxisLabel
                },
                ticks: {
                    callback: function(value) {
                        if (isPercentage) {
                            return value.toFixed(1) + '%';
                        }
                        return value.toLocaleString();
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Month'
                }
            }
        }
    };
}

window.switchChart = function(type) {
    window.currentChartType = type;
    updateCharts();
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');
};