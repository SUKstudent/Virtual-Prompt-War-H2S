// ZONES CONFIGURATION (12 zones)
const ZONES = [
    { id: 1, name: "Stage", type: "attraction", currentDensity: 45, currentWaitTime: 5 },
    { id: 2, name: "Seating Area", type: "seating", currentDensity: 45, currentWaitTime: 5 },
    { id: 3, name: "Gate A", type: "entry", currentDensity: 45, currentWaitTime: 5 },
    { id: 4, name: "Gate B", type: "entry", currentDensity: 45, currentWaitTime: 5 },
    { id: 5, name: "Gate C", type: "entry", currentDensity: 45, currentWaitTime: 5 },
    { id: 6, name: "Food Court", type: "service", currentDensity: 45, currentWaitTime: 5 },
    { id: 7, name: "Restrooms", type: "facility", currentDensity: 45, currentWaitTime: 5 },
    { id: 8, name: "Merchandise Zone", type: "service", currentDensity: 45, currentWaitTime: 5 },
    { id: 9, name: "Parking Area", type: "transit", currentDensity: 45, currentWaitTime: 5 },
    { id: 10, name: "Drop-off Zone", type: "transit", currentDensity: 45, currentWaitTime: 5 },
    { id: 11, name: "Medical Zone", type: "safety", currentDensity: 45, currentWaitTime: 5 },
    { id: 12, name: "Security Check", type: "safety", currentDensity: 45, currentWaitTime: 5 }
];

// Screen list for navigation (3 screens)
const SCREENS_LIST = ['dashboard', 'navigation', 'about'];
let currentScreenIndex = 0;
let lastEventLog = "📢 System initialized • All sensors online";
let updateInterval = null;
let eventLogInterval = null;

// Event log messages
const EVENT_MESSAGES = [
    "📡 Sensor network polling • All zones active",
    "🔄 Data sync in progress • Updating density maps",
    "🤖 AI model running • Predicting crowd patterns",
    "📍 Gate A flow increasing • +12 persons/min",
    "🎸 Stage crowd building • Next performance in 15min",
    "🍔 Food Court queue moving • +2 staff deployed",
    "🚪 Gate B holding • Reducing entry rate",
    "📊 Peak density forecast updated",
    "🚶 Pedestrian flow rate: 45 persons/min",
    "✅ All systems operational"
];

// GET STARTED FUNCTION
function getStarted() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainApp = document.getElementById('mainApp');
    
    welcomeScreen.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        mainApp.style.display = 'block';
        
        initializeZones();
        rebuildZonesGrid();
        updateDashboardStats();
        updateTimestamp();
        
        startStaggeredUpdates();
        startEventLogUpdates();
        
        const locationSelect = document.getElementById('userLocation');
        if (locationSelect) {
            locationSelect.addEventListener('change', updateNavigationPageSuggestion);
        }
        
        setInterval(updateTimestamp, 1000);
    }, 300);
}

const styleSheet = document.createElement('style');
styleSheet.textContent = `@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }`;
document.head.appendChild(styleSheet);

// INITIALIZATION
function initializeZones() {
    ZONES.forEach(zone => {
        zone.currentDensity = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
        zone.currentWaitTime = calculateWaitTime(zone.currentDensity, zone.type);
        zone.targetDensity = zone.currentDensity;
        zone.targetWaitTime = zone.currentWaitTime;
        zone.animating = false;
    });
}

function calculateWaitTime(density, zoneType) {
    let baseWait = 0;
    if (density < 30) baseWait = Math.floor(Math.random() * 3) + 1;
    else if (density < 50) baseWait = Math.floor(Math.random() * 5) + 3;
    else if (density < 70) baseWait = Math.floor(Math.random() * 7) + 8;
    else if (density < 85) baseWait = Math.floor(Math.random() * 10) + 15;
    else baseWait = Math.floor(Math.random() * 15) + 25;
    
    if (zoneType === "service") baseWait = Math.floor(baseWait * 1.3);
    if (zoneType === "entry") baseWait = Math.floor(baseWait * 1.2);
    return baseWait;
}

function generateTargetDensity(zone) {
    let base = Math.floor(Math.random() * (95 - 20 + 1)) + 20;
    if (zone.type === "entry") base += 5;
    if (zone.type === "attraction") base += 10;
    if (zone.type === "transit") base -= 5;
    return Math.min(95, Math.max(20, base));
}

function getColorClass(density) {
    if (density < 45) return 'green';
    if (density < 70) return 'yellow';
    return 'red';
}

// SMOOTH TRANSITIONS
function smoothTransition(zoneId, targetDensity, targetWaitTime) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;
    
    zone.targetDensity = targetDensity;
    zone.targetWaitTime = targetWaitTime;
    
    if (!zone.animating) {
        zone.animating = true;
        animateZone(zoneId);
    }
}

function animateZone(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;
    
    let changed = false;
    
    if (zone.targetDensity !== undefined && zone.currentDensity !== zone.targetDensity) {
        const diff = zone.targetDensity - zone.currentDensity;
        const step = Math.min(Math.abs(diff), 3) * Math.sign(diff);
        zone.currentDensity = Math.round(zone.currentDensity + step);
        changed = true;
    }
    
    if (zone.targetWaitTime !== undefined && zone.currentWaitTime !== zone.targetWaitTime) {
        const diff = zone.targetWaitTime - zone.currentWaitTime;
        const step = Math.min(Math.abs(diff), 1) * Math.sign(diff);
        zone.currentWaitTime = Math.round((zone.currentWaitTime || 5) + step);
        changed = true;
    }
    
    if (changed) {
        updateSingleZoneUI(zoneId);
        setTimeout(() => animateZone(zoneId), 60);
    } else {
        zone.animating = false;
    }
}

// STAGGERED UPDATES (Every 2.5 seconds)
function startStaggeredUpdates() {
    if (updateInterval) clearInterval(updateInterval);
    
    updateInterval = setInterval(() => {
        const newTargets = ZONES.map(zone => ({
            zoneId: zone.id,
            targetDensity: generateTargetDensity(zone),
            targetWaitTime: calculateWaitTime(generateTargetDensity(zone), zone.type)
        }));
        
        newTargets.forEach((target, index) => {
            setTimeout(() => {
                smoothTransition(target.zoneId, target.targetDensity, target.targetWaitTime);
            }, index * 150);
        });
        
        setTimeout(() => {
            updateDashboardStats();
            updateNavigationPageSuggestion();
        }, ZONES.length * 150 + 500);
        
    }, 2500);
}

function startEventLogUpdates() {
    if (eventLogInterval) clearInterval(eventLogInterval);
    
    eventLogInterval = setInterval(() => {
        const randomMessage = EVENT_MESSAGES[Math.floor(Math.random() * EVENT_MESSAGES.length)];
        if (randomMessage !== lastEventLog) {
            lastEventLog = randomMessage;
            const eventLogEl = document.getElementById('eventLog');
            if (eventLogEl) {
                eventLogEl.innerHTML = `📢 ${randomMessage}`;
            }
        }
    }, 8000);
}

// NAVIGATION PAGE SUGGESTIONS (SPECIFIC)
function updateNavigationPageSuggestion() {
    const select = document.getElementById('userLocation');
    const suggestionDiv = document.getElementById('navPageSuggestion');
    
    if (!select || !suggestionDiv) return;
    
    const selectedLocation = select.value;
    
    if (!selectedLocation) {
        suggestionDiv.innerHTML = '🤖 Select your current location above for AI-powered navigation guidance';
        return;
    }
    
    const zone = ZONES.find(z => z.name === selectedLocation);
    if (!zone) return;
    
    const density = zone.currentDensity;
    const waitTime = zone.currentWaitTime;
    
    const lessCrowded = ZONES.filter(z => z.currentDensity < 50 && z.name !== selectedLocation);
    const quietGates = ZONES.filter(z => z.name.includes('Gate') && z.currentDensity < 50);
    
    if (density > 75) {
        let suggestionText = '';
        if (selectedLocation.includes('Gate')) {
            const gateLetter = selectedLocation.slice(-1);
            const altGate = quietGates.length > 0 ? quietGates[0].name : 'Gate C';
            suggestionText = `Gate ${gateLetter} is at ${density}% capacity. Try ${altGate} instead (only ${ZONES.find(z => z.name === altGate)?.currentDensity || 35}% full).`;
        } else if (selectedLocation === "Food Court") {
            suggestionText = `Food Court has ${waitTime} min wait. Try the food stall near ${lessCrowded[0]?.name || 'Gate B'} - only ${lessCrowded[0]?.currentDensity || 40}% crowded.`;
        } else if (selectedLocation === "Parking Area") {
            suggestionText = `Parking is ${density}% full. Overflow parking available at the North lot - 5 min walk.`;
        } else if (selectedLocation === "Stage") {
            suggestionText = `Stage area
