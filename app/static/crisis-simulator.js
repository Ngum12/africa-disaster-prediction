// Crisis Simulator - Groundbreaking feature for humanitarian planning
let simulationActive = false;
let simulationInterval;
let simulationCanvas;
let simulationContext;
let simulationData = {
  days: 0,
  population: 250000,
  displacedPopulation: 0,
  foodSupply: 100, // percentage
  waterAccess: 100, // percentage
  securityLevel: 100, // percentage
  environmentalFactors: {
    rainfall: 50, // mm per day average
    temperature: 28, // celsius
    droughtIndex: 0.2 // 0-1 scale
  },
  interventions: []
};

function initializeCrisisSimulator() {
  const simulatorContainer = document.getElementById('crisis-simulator');
  if (!simulatorContainer) return;
  
  // Create simulator UI
  simulatorContainer.innerHTML = `
    <h2>🚨 Environmental Crisis Simulator</h2>
    <p class="simulator-description">
      This advanced simulation tool predicts population displacement, resource depletion and humanitarian
      needs during environmental and conflict crises. Use it for emergency response planning and intervention strategy testing.
    </p>
    
    <div class="simulator-controls">
      <div class="control-group">
        <label for="initial-population">Initial Population:</label>
        <input type="number" id="initial-population" value="250000" min="1000" max="10000000">
      </div>
      
      <div class="control-group">
        <label for="drought-severity">Drought Severity:</label>
        <input type="range" id="drought-severity" min="0" max="1" step="0.1" value="0.2">
        <span class="range-value" id="drought-value">0.2</span>
      </div>
      
      <div class="control-group">
        <label for="conflict-probability">Conflict Probability:</label>
        <input type="range" id="conflict-probability" min="0" max="1" step="0.1" value="0.4">
        <span class="range-value" id="conflict-value">0.4</span>
      </div>
      
      <div class="control-buttons">
        <button id="start-simulation" class="btn primary">Start Simulation</button>
        <button id="reset-simulation" class="btn secondary" disabled>Reset</button>
      </div>
    </div>
    
    <div class="simulation-dashboard">
      <div class="simulation-metrics">
        <div class="sim-metric">
          <span class="metric-name">Day</span>
          <span id="sim-day" class="metric-value">0</span>
        </div>
        <div class="sim-metric">
          <span class="metric-name">Population</span>
          <span id="sim-population" class="metric-value">250,000</span>
        </div>
        <div class="sim-metric">
          <span class="metric-name">Displaced</span>
          <span id="sim-displaced" class="metric-value">0</span>
        </div>
        <div class="sim-metric">
          <span class="metric-name">Food Supply</span>
          <span id="sim-food" class="metric-value">100%</span>
        </div>
        <div class="sim-metric">
          <span class="metric-name">Water Access</span>
          <span id="sim-water" class="metric-value">100%</span>
        </div>
        <div class="sim-metric">
          <span class="metric-name">Security</span>
          <span id="sim-security" class="metric-value">100%</span>
        </div>
      </div>
      
      <div class="simulation-visualization">
        <canvas id="simulation-canvas" width="600" height="400"></canvas>
      </div>
      
      <div class="simulation-charts">
        <div id="population-chart" class="chart-container"></div>
        <div id="resources-chart" class="chart-container"></div>
      </div>
      
      <div class="intervention-panel">
        <h3>Crisis Interventions</h3>
        <div class="intervention-options">
          <button class="intervention-btn" data-type="food">Food Distribution</button>
          <button class="intervention-btn" data-type="water">Water Supply</button>
          <button class="intervention-btn" data-type="medical">Medical Aid</button>
          <button class="intervention-btn" data-type="security">Security Forces</button>
          <button class="intervention-btn" data-type="shelter">Emergency Shelter</button>
        </div>
        <div id="intervention-log" class="intervention-log"></div>
      </div>
    </div>
  `;
  
  // Initialize canvas
  simulationCanvas = document.getElementById('simulation-canvas');
  if (simulationCanvas) {
    simulationContext = simulationCanvas.getContext('2d');
    drawInitialVisualization();
  }
  
  // Initialize charts
  initializeSimulationCharts();
  
  // Add event listeners
  document.getElementById('start-simulation').addEventListener('click', toggleSimulation);
  document.getElementById('reset-simulation').addEventListener('click', resetSimulation);
  
  // Range input listeners
  document.getElementById('drought-severity').addEventListener('input', function() {
    document.getElementById('drought-value').textContent = this.value;
    simulationData.environmentalFactors.droughtIndex = parseFloat(this.value);
  });
  
  document.getElementById('conflict-probability').addEventListener('input', function() {
    document.getElementById('conflict-value').textContent = this.value;
  });
  
  // Intervention buttons
  document.querySelectorAll('.intervention-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!simulationActive) return;
      
      const interventionType = this.dataset.type;
      applyIntervention(interventionType);
    });
  });
}

function toggleSimulation() {
  const startButton = document.getElementById('start-simulation');
  const resetButton = document.getElementById('reset-simulation');
  
  if (!simulationActive) {
    // Start simulation
    simulationActive = true;
    startButton.textContent = 'Pause Simulation';
    resetButton.disabled = true;
    
    // Get initial values
    simulationData.population = parseInt(document.getElementById('initial-population').value);
    simulationData.environmentalFactors.droughtIndex = parseFloat(document.getElementById('drought-severity').value);
    
    // Run simulation
    simulationInterval = setInterval(runSimulationStep, 1000);
  } else {
    // Pause simulation
    simulationActive = false;
    startButton.textContent = 'Resume Simulation';
    resetButton.disabled = false;
    clearInterval(simulationInterval);
  }
}

function resetSimulation() {
  // Reset to initial state
  simulationData = {
    days: 0,
    population: parseInt(document.getElementById('initial-population').value),
    displacedPopulation: 0,
    foodSupply: 100,
    waterAccess: 100,
    securityLevel: 100,
    environmentalFactors: {
      rainfall: 50,
      temperature: 28,
      droughtIndex: parseFloat(document.getElementById('drought-severity').value)
    },
    interventions: []
  };
  
  // Reset UI
  document.getElementById('start-simulation').textContent = 'Start Simulation';
  updateSimulationUI();
  drawInitialVisualization();
  
  // Clear charts
  initializeSimulationCharts();
  
  // Clear intervention log
  document.getElementById('intervention-log').innerHTML = '';
}

function runSimulationStep() {
  // Increment day counter
  simulationData.days++;
  
  // Calculate environmental impacts
  const droughtImpact = simulationData.environmentalFactors.droughtIndex * 0.5;
  const conflictProbability = parseFloat(document.getElementById('conflict-probability').value);
  
  // Random events
  const randomEventOccurs = Math.random() < 0.1; // 10% chance of random event
  
  // Update resources based on drought
  simulationData.waterAccess = Math.max(0, simulationData.waterAccess - (droughtImpact * 2));
  simulationData.foodSupply = Math.max(0, simulationData.foodSupply - droughtImpact);
  
  // Check for conflict
  if (Math.random() < conflictProbability * (1 - simulationData.securityLevel/100) * 0.1) {
    // Conflict event
    simulationData.securityLevel = Math.max(0, simulationData.securityLevel - 15);
    addToInterventionLog("⚠️ Conflict outbreak reported");
  }
  
  // Random environmental events
  if (randomEventOccurs) {
    const eventType = Math.floor(Math.random() * 3);
    switch(eventType) {
      case 0:
        // Heavy rainfall - temporary water access increase
        simulationData.waterAccess = Math.min(100, simulationData.waterAccess + 10);
        addToInterventionLog("🌧️ Heavy rainfall improved water access");
        break;
      case 1:
        // Supply convoy - food increase
        simulationData.foodSupply = Math.min(100, simulationData.foodSupply + 5);
        addToInterventionLog("🚚 Emergency supplies arrived");
        break;
      case 2:
        // Disease outbreak - population impact
        const diseaseMagnitude = Math.floor(simulationData.population * 0.002);
        simulationData.population -= diseaseMagnitude;
        addToInterventionLog(`🏥 Disease outbreak affected ${diseaseMagnitude.toLocaleString()} people`);
        break;
    }
  }
  
  // Calculate displacement based on conditions
  const displacementFactor = 
    (100 - simulationData.foodSupply) * 0.0002 + 
    (100 - simulationData.waterAccess) * 0.0003 + 
    (100 - simulationData.securityLevel) * 0.0004;
  
  const newDisplacement = Math.floor(simulationData.population * displacementFactor);
  simulationData.displacedPopulation += newDisplacement;
  simulationData.population -= newDisplacement;
  
  // Natural recovery - very slow
  simulationData.foodSupply = Math.min(100, simulationData.foodSupply + 0.1);
  simulationData.waterAccess = Math.min(100, simulationData.waterAccess + 0.05);
  simulationData.securityLevel = Math.min(100, simulationData.securityLevel + 0.02);
  
  // Apply active interventions
  simulationData.interventions.forEach(intervention => {
    if (intervention.duration > 0) {
      intervention.duration--;
      
      switch(intervention.type) {
        case 'food':
          simulationData.foodSupply = Math.min(100, simulationData.foodSupply + 1);
          break;
        case 'water':
          simulationData.waterAccess = Math.min(100, simulationData.waterAccess + 1.5);
          break;
        case 'security':
          simulationData.securityLevel = Math.min(100, simulationData.securityLevel + 0.8);
          break;
        case 'medical':
          // Reduced displacement
          const returnees = Math.floor(simulationData.displacedPopulation * 0.01);
          simulationData.displacedPopulation -= returnees;
          simulationData.population += returnees;
          break;
        case 'shelter':
          // Improved conditions generally
          simulationData.foodSupply = Math.min(100, simulationData.foodSupply + 0.2);
          simulationData.waterAccess = Math.min(100, simulationData.waterAccess + 0.2);
          simulationData.securityLevel = Math.min(100, simulationData.securityLevel + 0.1);
          break;
      }
      
      // Remove expired interventions
      if (intervention.duration === 0) {
        addToInterventionLog(`${intervention.name} program has ended`);
      }
    }
  });
  
  // Filter out expired interventions
  simulationData.interventions = simulationData.interventions.filter(i => i.duration > 0);
  
  // Update UI
  updateSimulationUI();
  
  // Check for simulation end conditions
  if (simulationData.population <= 0 || simulationData.days >= 365) {
    clearInterval(simulationInterval);
    simulationActive = false;
    document.getElementById('start-simulation').textContent = 'Start Simulation';
    document.getElementById('reset-simulation').disabled = false;
    
    if (simulationData.population <= 0) {
      addToInterventionLog("⚠️ CRITICAL: All population has been displaced");
    } else {
      addToInterventionLog("ℹ️ Simulation completed: 1 year period ended");
    }
  }
}

function updateSimulationUI() {
  // Update metrics
  document.getElementById('sim-day').textContent = simulationData.days;
  document.getElementById('sim-population').textContent = simulationData.population.toLocaleString();
  document.getElementById('sim-displaced').textContent = simulationData.displacedPopulation.toLocaleString();
  document.getElementById('sim-food').textContent = `${Math.round(simulationData.foodSupply)}%`;
  document.getElementById('sim-water').textContent = `${Math.round(simulationData.waterAccess)}%`;
  document.getElementById('sim-security').textContent = `${Math.round(simulationData.securityLevel)}%`;
  
  // Update visualizations
  updateVisualization();
  updateSimulationCharts();
}

function drawInitialVisualization() {
  if (!simulationContext) return;
  
  simulationContext.fillStyle = '#f9f9f9';
  simulationContext.fillRect(0, 0, simulationCanvas.width, simulationCanvas.height);
  
  // Draw region outline
  simulationContext.strokeStyle = '#555';
  simulationContext.lineWidth = 2;
  simulationContext.beginPath();
  simulationContext.rect(50, 50, simulationCanvas.width - 100, simulationCanvas.height - 100);
  simulationContext.stroke();
  
  // Draw initial population
  drawPopulation(simulationData.population, 0);
}

function updateVisualization() {
  if (!simulationContext) return;
  
  // Clear canvas
  simulationContext.fillStyle = '#f9f9f9';
  simulationContext.fillRect(0, 0, simulationCanvas.width, simulationCanvas.height);
  
  // Draw region outline
  simulationContext.strokeStyle = '#555';
  simulationContext.lineWidth = 2;
  simulationContext.beginPath();
  simulationContext.rect(50, 50, simulationCanvas.width - 100, simulationCanvas.height - 100);
  simulationContext.stroke();
  
  // Draw water level
  const waterHeight = (simulationCanvas.height - 100) * (simulationData.waterAccess / 100);
  simulationContext.fillStyle = 'rgba(33, 150, 243, 0.3)';
  simulationContext.fillRect(50, simulationCanvas.height - 50 - waterHeight, simulationCanvas.width - 100, waterHeight);
  
  // Draw food level
  const foodWidth = (simulationCanvas.width - 100) * (simulationData.foodSupply / 100);
  simulationContext.fillStyle = 'rgba(76, 175, 80, 0.3)';
  simulationContext.fillRect(50, 50, foodWidth, 20);
  
  // Draw security level
  const securityWidth = (simulationCanvas.width - 100) * (simulationData.securityLevel / 100);
  simulationContext.fillStyle = 'rgba(244, 67, 54, 0.3)';
  simulationContext.fillRect(50, 80, securityWidth, 20);
  
  // Draw population
  drawPopulation(simulationData.population, simulationData.displacedPopulation);
}

function drawPopulation(population, displaced) {
  if (!simulationContext) return;
  
  const totalInitialPopulation = parseInt(document.getElementById('initial-population').value);
  const populationRatio = population / totalInitialPopulation;
  const displacedRatio = displaced / totalInitialPopulation;
  
  // Number of dots to represent population
  const maxDots = 500;
  const dots = Math.ceil(maxDots * populationRatio);
  const displacedDots = Math.ceil(maxDots * displacedRatio);
  
  // Draw remaining population
  simulationContext.fillStyle = 'rgba(33, 33, 33, 0.7)';
  for (let i = 0; i < dots; i++) {
    const x = 50 + Math.random() * (simulationCanvas.width - 100);
    const y = 110 + Math.random() * (simulationCanvas.height - 160);
    
    simulationContext.beginPath();
    simulationContext.arc(x, y, 2, 0, Math.PI * 2);
    simulationContext.fill();
  }
  
  // Draw displaced population outside the region
  simulationContext.fillStyle = 'rgba(244, 67, 54, 0.7)';
  for (let i = 0; i < displacedDots; i++) {
    // Position outside the main region
    let x, y;
    const side = Math.floor(Math.random() * 4);
    
    switch(side) {
      case 0: // top
        x = 50 + Math.random() * (simulationCanvas.width - 100);
        y = 10 + Math.random() * 30;
        break;
      case 1: // right
        x = simulationCanvas.width - 40 + Math.random() * 30;
        y = 50 + Math.random() * (simulationCanvas.height - 100);
        break;
      case 2: // bottom
        x = 50 + Math.random() * (simulationCanvas.width - 100);
        y = simulationCanvas.height - 40 + Math.random() * 30;
        break;
      case 3: // left
        x = 10 + Math.random() * 30;
        y = 50 + Math.random() * (simulationCanvas.height - 100);
        break;
    }
    
    simulationContext.beginPath();
    simulationContext.arc(x, y, 2, 0, Math.PI * 2);
    simulationContext.fill();
  }
}

function initializeSimulationCharts() {
  if (!window.Plotly) return;
  
  // Population chart
  const populationData = [{
    x: [0],
    y: [simulationData.population],
    type: 'scatter',
    mode: 'lines',
    name: 'Population',
    line: { color: '#2196f3' }
  }, {
    x: [0],
    y: [simulationData.displacedPopulation],
    type: 'scatter',
    mode: 'lines',
    name: 'Displaced',
    line: { color: '#f44336' }
  }];
  
  const populationLayout = {
    title: 'Population Trends',
    xaxis: { title: 'Days' },
    yaxis: { title: 'People' },
    height: 250,
    margin: { t: 30, b: 40, l: 60, r: 10 }
  };
  
  Plotly.newPlot('population-chart', populationData, populationLayout);
  
  // Resources chart
  const resourcesData = [{
    x: [0],
    y: [simulationData.foodSupply],
    type: 'scatter',
    mode: 'lines',
    name: 'Food',
    line: { color: '#4caf50' }
  }, {
    x: [0],
    y: [simulationData.waterAccess],
    type: 'scatter',
    mode: 'lines',
    name: 'Water',
    line: { color: '#2196f3' }
  }, {
    x: [0],
    y: [simulationData.securityLevel],
    type: 'scatter',
    mode: 'lines',
    name: 'Security',
    line: { color: '#ff9800' }
  }];
  
  const resourcesLayout = {
    title: 'Resource Levels',
    xaxis: { title: 'Days' },
    yaxis: { title: 'Level (%)', range: [0, 100] },
    height: 250,
    margin: { t: 30, b: 40, l: 60, r: 10 }
  };
  
  Plotly.newPlot('resources-chart', resourcesData, resourcesLayout);
}

function updateSimulationCharts() {
  if (!window.Plotly) return;
  
  // Update population chart
  Plotly.extendTraces('population-chart', {
    x: [[simulationData.days], [simulationData.days]],
    y: [[simulationData.population], [simulationData.displacedPopulation]]
  }, [0, 1]);
  
  // Update resources chart
  Plotly.extendTraces('resources-chart', {
    x: [[simulationData.days], [simulationData.days], [simulationData.days]],
    y: [[simulationData.foodSupply], [simulationData.waterAccess], [simulationData.securityLevel]]
  }, [0, 1, 2]);
  
  // Adjust x-axis range to show latest data
  if (simulationData.days > 30) {
    Plotly.relayout('population-chart', {
      'xaxis.range': [simulationData.days - 30, simulationData.days]
    });
    
    Plotly.relayout('resources-chart', {
      'xaxis.range': [simulationData.days - 30, simulationData.days]
    });
  }
}

function applyIntervention(type) {
  let name, duration, effectiveness;
  
  switch(type) {
    case 'food':
      name = "Food Distribution";
      duration = 14;
      effectiveness = "Improves food supply by 14%";
      break;
    case 'water':
      name = "Water Supply";
      duration = 10;
      effectiveness = "Improves water access by 15%";
      break;
    case 'medical':
      name = "Medical Aid";
      duration = 20;
      effectiveness = "Reduces displacement by 20%";
      break;
    case 'security':
      name = "Security Forces";
      duration = 30;
      effectiveness = "Improves security by 24%";
      break;
    case 'shelter':
      name = "Emergency Shelter";
      duration = 40;
      effectiveness = "Improves all metrics slightly";
      break;
  }
  
  // Add intervention
  simulationData.interventions.push({
    type,
    name,
    duration,
    effectiveness
  });
  
  // Log intervention
  addToInterventionLog(`💡 ${name} deployed (lasts ${duration} days)`);
}

function addToInterventionLog(message) {
  const log = document.getElementById('intervention-log');
  if (!log) return;
  
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-day">Day ${simulationData.days}:</span> ${message}`;
  
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initializeCrisisSimulator, 1000);
});