// ============================================
// XILO ROI CALCULATOR - CALCULATIONS
// ============================================

// -------------------- HARDCODED INPUT VALUES --------------------
// TODO: Later replace these with form input values
const INPUTS = {
    quotesPerYear: 2000,        // Number of quotes per year
    closingRatio: 15,          // Current closing ratio (%)
    averagePremium: 3000,      // Average premium ($)
    repCost: 40                // Rep cost per hour ($)
};

// -------------------- FIXED CONSTANTS --------------------
const FIXED = {
    timePerQuoteOld: 75,           // Minutes per quote (current manual process)
    timePerQuoteNew: 15,           // Minutes per quote (with XILO)
    timeSavedPerQuote: 60,         // Minutes saved per quote (75 - 15)
    efficiencyGainPercent: 80,     // Time efficiency gain (%)
    closingRatioBoost: 4,          // Closing ratio improvement (percentage points)
    agencyRevenuePercent: 10,      // Agency revenue as % of premium
    wastePercent: 80,              // Waste/Inefficiency percentage
    necessaryAdminPercent: 20,     // Necessary admin percentage
    processingPercent: 20,         // Processing percentage
    reclaimedCapacityPercent: 80,  // Reclaimed capacity percentage
    capacityIncrease: 73           // Overall capacity increase (%)
};

// -------------------- UTILITY FUNCTIONS --------------------

// Format number with commas (e.g., 1000 -> 1,000)
function formatNumber(num, decimals = 0) {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update DOM element with calculated value
function updateOutput(attribute, value, format = 'number', decimals = 0) {
    const elements = document.querySelectorAll(`[calculator-output="${attribute}"]`);
    elements.forEach(el => {
        if (format === 'number') {
            el.textContent = formatNumber(value, decimals);
        } else {
            el.textContent = value;
        }

    if (attribute === 'closing-ratio' || attribute === 'closing-ratio-improved') {
      const wrap = el.closest('.roi_calc_result_sec-tl_wrap');
      const timelineLine = wrap ? wrap.querySelector('.roi_calc_result_sec-tl-line') : null;
      const numericValue = Number(value);

      if (timelineLine && Number.isFinite(numericValue)) {
        timelineLine.style.width = `${numericValue}%`;
      }
    }
    });
}

// Update capacity chart bar heights based on relative share
function updateCapacityChartHeights(quotesPerYear, newLeadsCapacity) {
    const totalCapacity = quotesPerYear + newLeadsCapacity;
    if (totalCapacity <= 0) return;

    const noXiloPercent = (quotesPerYear / totalCapacity) * 100;
    const withXiloPercent = (newLeadsCapacity / totalCapacity) * 100;

    document.querySelectorAll('[chart-capacity="no-xilo"]').forEach(bar => {
        bar.style.height = `${noXiloPercent}%`;
    });

    document.querySelectorAll('[chart-capacity="with-xilo"]').forEach(bar => {
        bar.style.height = `${withXiloPercent}%`;
    });
}

// -------------------- CALCULATIONS --------------------

function calculateROI() {
    const { quotesPerYear, closingRatio, averagePremium, repCost } = INPUTS;

    // ========== SECTION 1: COST INEFFICIENCY (CURRENT) ==========

    const annualWasteDollars = (quotesPerYear * FIXED.timePerQuoteOld * repCost) / 60;
    const monthlyWasteDollars = annualWasteDollars / 12;
    const unitCostPerQuote = (FIXED.timePerQuoteOld * repCost) / 60;

    updateOutput('quotes-per-year', quotesPerYear);
    updateOutput('time-per-quote-old', FIXED.timePerQuoteOld);
    updateOutput('rep-cost', repCost);
    updateOutput('annual-waste-dollars', annualWasteDollars);
    updateOutput('monthly-waste-dollars', monthlyWasteDollars);
    updateOutput('unit-cost-per-quote', unitCostPerQuote);

    // ========== SECTION 2: COST EFFICIENCY (WITH XILO) ==========

    const costWithXilo = (quotesPerYear * FIXED.timePerQuoteNew * repCost) / 60;
    const annualSavingsDollars = annualWasteDollars - costWithXilo;
    const monthlySavingsDollars = annualSavingsDollars / 12;
    const unitCostPerQuoteNew = (FIXED.timePerQuoteNew * repCost) / 60;

    updateOutput('time-per-quote-new', FIXED.timePerQuoteNew);
    updateOutput('annual-savings-dollars', annualSavingsDollars);
    updateOutput('monthly-savings-dollars', monthlySavingsDollars);
    updateOutput('unit-cost-per-quote-new', unitCostPerQuoteNew);


    // ========== SECTION 3: TIME INEFFICIENCY (CURRENT) ==========

    const totalMinutesOld = quotesPerYear * FIXED.timePerQuoteOld;
    const annualHoursWasted = totalMinutesOld / 60;
    const monthlyHoursWasted = annualHoursWasted / 12;

    updateOutput('total-minutes-old', totalMinutesOld);
    updateOutput('annual-hours-wasted', annualHoursWasted);
    updateOutput('monthly-hours-wasted', monthlyHoursWasted, 'number', 0);

    // ========== SECTION 4: TIME EFFICIENCY (WITH XILO) ==========

    const totalMinutesNew = quotesPerYear * FIXED.timePerQuoteNew;
    const annualHoursSaved = (totalMinutesOld - totalMinutesNew) / 60;
    const monthlyHoursSaved = annualHoursSaved / 12;

    updateOutput('time-per-quote-hours-new', FIXED.timePerQuoteNew);
    updateOutput('total-minutes-new', totalMinutesNew);
    updateOutput('annual-hours-saved', annualHoursSaved);
    updateOutput('time-improvement-percent', FIXED.efficiencyGainPercent);
    updateOutput('time-improvement', FIXED.timeSavedPerQuote);

    // ========== SECTION 5: REVENUE LOSS (CURRENT) ==========

    const closedLeadsCurrent = quotesPerYear * (closingRatio / 100);
    const unconvertedLeads = quotesPerYear - closedLeadsCurrent;
    const premiumLost = unconvertedLeads * averagePremium;
    const revenueLost = premiumLost / 10;

    updateOutput('closing-ratio', closingRatio);
    updateOutput('closed-leads-current', closedLeadsCurrent);
    updateOutput('unconverted-leads', unconvertedLeads);
    updateOutput('premium-lost', premiumLost);
    updateOutput('revenue-lost', revenueLost);

    // ========== SECTION 6: REVENUE INCREASE (WITH XILO) ==========

    const closingRatioImproved = closingRatio + FIXED.closingRatioBoost;
    const closedLeadsImproved = quotesPerYear * (closingRatioImproved / 100);
    const additionalClosedLeads = closedLeadsImproved - closedLeadsCurrent;
    const additionalPremium = additionalClosedLeads * averagePremium;

    // Monthly Premium = Premium value of REMAINING unconverted leads
    const monthlyPremium = (quotesPerYear - closedLeadsImproved) * averagePremium;

    updateOutput('closing-ratio-improved', closingRatioImproved);
    updateOutput('closing-ratio-boost', FIXED.closingRatioBoost);
    updateOutput('closed-leads-improved', closedLeadsImproved);
    updateOutput('additional-closed-leads', additionalClosedLeads);
    updateOutput(
        'additional-premium',
        (premiumLost - monthlyPremium) * (FIXED.agencyRevenuePercent / 100)
    );
    updateOutput('monthly-premium', monthlyPremium / 1000, 'number', 0);
    updateOutput('agency-revenue-percentage', FIXED.agencyRevenuePercent);


    // ========== SECTION 7: TOTAL IMPACT ==========

    const newLeadsCapacity = quotesPerYear * (FIXED.capacityIncrease / 100);
    const newLeadsPerMonth = newLeadsCapacity / 12;
    const premiumHandled = newLeadsCapacity * averagePremium;
    const totalRevenueGenerated = premiumHandled * (FIXED.agencyRevenuePercent / 100);

    updateOutput('total-revenue-generated', totalRevenueGenerated);
    updateOutput('total-revenue-generated-rounded', totalRevenueGenerated / 1000, 'number', 0);
    updateOutput('efficiency-increase', FIXED.capacityIncrease);
    updateOutput('hours-recovered-annual', annualHoursSaved);
    updateOutput('new-leads-capacity', newLeadsCapacity);
    updateOutput('new-leads-per-month', newLeadsPerMonth, 'number', 1);
    updateOutput('average-premium-display', averagePremium);
    updateOutput('premium-handled', premiumHandled / 1000, 'number', 1); // Display in K
    updateCapacityChartHeights(quotesPerYear, newLeadsCapacity);

    // ========== FIXED PERCENTAGES (FOR BAR CHARTS) ==========

    // These are displayed in the UI but don't need calculation
    // Just hardcoded for reference if needed
    console.log('✅ All calculations completed successfully!');
    console.log('📊 Key Metrics:', {
        annualWaste: `$${formatNumber(annualWasteDollars)}`,
        annualSavings: `$${formatNumber(annualSavingsDollars)}`,
        hoursRecovered: formatNumber(annualHoursSaved),
        additionalRevenue: `$${formatNumber(totalRevenueGenerated)}`,
        newCapacity: formatNumber(newLeadsCapacity)
    });
}

// -------------------- INITIALIZE --------------------

// Run calculations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 XILO ROI Calculator initialized');
    calculateROI();
});
