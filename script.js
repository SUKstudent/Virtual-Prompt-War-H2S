// 12 Zones as specified
const ZONES = [
    "Stage",
    "Seating Area",
    "Gate A",
    "Gate B",
    "Gate C",
    "Food Court",
    "Restrooms",
    "Merchandise Zone",
    "Parking Area",
    "Drop-off Zone",
    "Medical Zone",
    "Security Check"
];

// AI: Generate realistic crowd density (20-95%)
function generateDensity() {
    return Math.floor(Math.random() * (95 - 20 + 1)) + 20;
}

// AI: Calculate wait time based on density
function calculateWaitTime(density) {
    if (density < 30) return Math.floor(Math.random() * 3) + 1; // 1-3 min
    if (density < 50) return Math.floor(Math.random() * 5) + 3; // 3-7 min
    if (density < 70) return Math.floor(Math.random() * 8) + 7; // 7-14 min
    if (density < 85) return Math.floor(Math.random() * 10) + 15; // 15-24 min
    return Math.floor(Math.random() * 15) + 25; // 25-39 min
}

// AI: Predict density in 10 minutes (using linear prediction)
function predictDensity(currentDensity) {
    // Simple AI prediction: trend + random factor
    let trend = 0;
    if (currentDensity > 80) trend = -3; // Will decrease (people leave)
    else if (currentDensity > 60) trend = 2; // Will increase
    else if (currentDensity > 40) trend = 5; // Rapid increase
    else trend = 8; // Fast increase (early arrival)
    
    let predicted = currentDensity + trend + (Math.random() * 6 - 3);
    predicted = Math.min(98, Math.max(15, predicted));
    return Math.round(predicted);
}

// Generate all zone data
function generateZoneData() {
    return ZONES.map(zone => {
        const density = generateDensity();
        return {
            name: zone,
            density: density,
            waitTime: calculateWaitTime(density),
            predictedDensity: predictDensity(density),
            status: density < 50 ? 'good' : (density < 75 ? 'moderate' : 'crowded')
        };
    });
}

// Generate AI alerts based on data
function generateAlerts(zonesData) {
    const alerts = [];
    const crowdedZones = zonesData.filter(z => z.density > 75);
    const moderateZones = zonesData.filter(z => z.density > 60 && z.density <= 75);
    
    // Critical alerts for overcrowded zones
    crowdedZones.forEach(zone => {
        alerts.push({
            type: 'critical',
            title: `⚠️ CRITICAL: ${zone.name}`,
            message: `Currently at ${zone.density}% capacity. Predicted to reach ${zone.predictedDensity}% in 10 minutes. Immediate action recommended.`
        });
    });
    
    // Suggestions for moderate zones
    moderateZones.forEach(zone => {
        const lessCrowded = zonesData.find(z => z.density < 45);
        if (lessCrowded) {
            alerts.push({
                type: 'suggestion',
                title: `💡 AI Suggestion: ${zone.name}`,
                message: `At ${zone.density}% capacity. Consider redirecting traffic toward ${lessCrowded.name} (${lessCrowded.density}% capacity).`
            });
        }
    });
    
    // Add general recommendation if no critical alerts
    if (crowdedZones.length === 0 && moderateZones.length === 0) {
        alerts.push({
            type: 'success',
            title: `✅ All zones operating normally`,
            message: `Crowd flow is balanced. Continue monitoring.`
        });
    }
    
    // Add peak time prediction
    const peakZone = zonesData.reduce((max, z) => z.density > max.density ? z : max, zonesData[0]);
    alerts.push({
        type: 'info',
        title: `📊 AI Prediction`,
        message: `Expected peak congestion at ${peakZone.name} in approximately 15-20 minutes. Prepare crowd diversion.`
    });
    
    return alerts.slice(0, 5); // Max 5 alerts
}

// Update the entire UI
function updateDashboard() {
    const zonesData = generateZoneData();
    
    // Calculate stats
    const densities = zonesData.map(z => z.density);
    const avgDensity = Math.round(densities.reduce((a,b) => a+b, 0) / densities.length);
    const crowdedZonesCount = zonesData.filter(z => z.density > 70).length;
    const peakWait = Math.max(...zonesData.map(z => z.waitTime));
    
    // Update stat cards
    document.getElementById('avgDensity').innerHTML = avgDensity + '<span class="stat-unit">%</span>';
    document.getElementById('crowdedZones').innerHTML = crowdedZonesCount;
    document.getElementById('peakWait').innerHTML = peakWait + '<span class="stat-unit">min</span>';
    
    // Update zones grid
    const zonesGrid = document.getElementById('zonesGrid');
    zonesGrid.innerHTML = '';
    
    zonesData.forEach(zone => {
        let densityClass = 'density-low';
        if (zone.density > 70) densityClass = 'density-high';
        else if (zone.density > 45) densityClass = 'density-medium';
        
        // Get emoji for zone
        let emoji = '📍';
        if (zone.name.includes('Gate')) emoji = '🚪';
        else if (zone.name === 'Stage') emoji = '🎸';
        else if (zone.name === 'Food Court') emoji = '🍔';
        else if (zone.name === 'Restrooms') emoji = '🚻';
        else if (zone.name === 'Merchandise Zone') emoji = '👕';
        else if (zone.name === 'Parking Area') emoji = '🅿️';
        else if (zone.name === 'Medical Zone') emoji = '🏥';
        else if (zone.name === 'Security Check') emoji = '🛡️';
        
        const zoneCard = document.createElement('div');
        zoneCard.className = `zone-card ${densityClass}`;
        zoneCard.innerHTML = `
            <div class="zone-info">
                <span class="zone-name">${emoji} ${zone.name}</span>
                <span class="zone-prediction">AI predicts: ${zone.predictedDensity}% in 10 min</span>
            </div>
            <div class="zone-stats">
                <div class="zone-density">${zone.density}%</div>
                <div class="zone-wait">⏱ ${zone.waitTime} min wait</div>
            </div>
        `;
        zonesGrid.appendChild(zoneCard);
    });
    
    // Update alerts
    const alerts = generateAlerts(zonesData);
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        let alertClass = 'alert-card';
        if (alert.type === 'suggestion') alertClass += ' alert-suggestion';
        if (alert.type === 'success') alertClass += ' alert-success';
        alertDiv.className = alertClass;
        alertDiv.innerHTML = `
            <div class="alert-title">${alert.title}</div>
            <div class="alert-message">${alert.message}</div>
        `;
        alertsContainer.appendChild(alertDiv);
    });
    
    // Store current data for navigation
    window.currentZonesData = zonesData;
}

// Navigation handler
function setupNavigation() {
    const select = document.getElementById('userLocation');
    const suggestionDiv = document.getElementById('navigationSuggestion');
    
    select.addEventListener('change', function() {
        const location = this.value;
        if (!location || !window.currentZonesData) {
            suggestionDiv.innerHTML = 'Select a location to get AI-powered navigation assistance';
            return;
        }
        
        const zoneData = window.currentZonesData.find(z => z.name === location);
        if (!zoneData) {
            suggestionDiv.innerHTML = 'Location data not available. Please refresh.';
            return;
        }
        
        if (zoneData.density > 70) {
            // Find less crowded alternatives
            const alternatives = window.currentZonesData
                .filter(z => z.density < 50 && z.name !== location)
                .sort((a,b) => a.density - b.density)
                .slice(0, 2);
            
            if (alternatives.length > 0) {
                suggestionDiv.innerHTML = `
                    🚶 <strong>High congestion detected at ${location}</strong><br>
                    Current density: ${zoneData.density}% • Wait time: ${zoneData.waitTime} minutes<br><br>
                    🤖 <strong>AI Recommendation:</strong> Consider moving toward:<br>
                    • ${alternatives[0].name} (${alternatives[0].density}% density, ${alternatives[0].waitTime} min wait)<br>
                    ${alternatives[1] ? `• ${alternatives[1].name} (${alternatives[1].density}% density, ${alternatives[1].waitTime} min wait)` : ''}
                `;
            } else {
                suggestionDiv.innerHTML = `
                    🚶 <strong>High congestion at ${location}</strong><br>
                    Density: ${zoneData.density}% • Wait time: ${zoneData.waitTime} minutes<br><br>
                    ⚠️ All zones are moderately crowded. Consider waiting 10-15 minutes.
                `;
            }
        } else {
            suggestionDiv.innerHTML = `
                ✅ <strong>${location} is currently manageable</strong><br>
                Current density: ${zoneData.density}% • Estimated wait: ${zoneData.waitTime} minutes<br><br>
                💡 AI predicts ${zoneData.predictedDensity}% density in 10 minutes. Enjoy the event!
            `;
        }
    });
}

// Refresh all data
function refreshData() {
    updateDashboard();
    // Reset navigation suggestion
    const select = document.getElementById('userLocation');
    if (select.value) {
        // Trigger navigation update
        const event = new Event('change');
        select.dispatchEvent(event);
    }
}

// Initialize
updateDashboard();
setupNavigation();

// Auto-refresh every 10 seconds (simulates real-time data)
setInterval(() => {
    updateDashboard();
    // Also update navigation if a location is selected
    const select = document.getElementById('userLocation');
    if (select.value) {
        const event = new Event('change');
        select.dispatchEvent(event);
    }
}, 10000);
