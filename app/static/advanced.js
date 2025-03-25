// Advanced visualization and interaction functions

// Initialize all advanced components
function initializeAdvancedComponents() {
    initializeSatelliteDataStream();
    initializeFederatedLearning();
    renderBayesianUncertainty();
    initializeExplainableAIDashboard();
    initializeInterventionSimulator();
  }
  
  // Real-time Satellite Data Integration
  function initializeSatelliteDataStream() {
    if (!document.getElementById('satellite-feed')) return;
    
    const satelliteOverlay = document.createElement('div');
    satelliteOverlay.className = 'satellite-overlay';
    document.getElementById('satellite-feed').appendChild(satelliteOverlay);
    
    // Simulated satellite data stream
    const updateInterval = setInterval(() => {
      fetch('/api/satellite-feed')
        .then(response => response.json())
        .then(data => {
          // Update heatmap overlay with latest satellite data
          updateSatelliteOverlay(data, satelliteOverlay);
          
          // Update the environmental metrics
          if (document.getElementById('live-drought-index')) {
            document.getElementById('live-drought-index').textContent = data.environmentalMetrics.drought_index;
          }
          if (document.getElementById('live-precipitation')) {
            document.getElementById('live-precipitation').textContent = `${data.environmentalMetrics.rainfall_mm}mm`;
          }
          if (document.getElementById('live-temperature')) {
            document.getElementById('live-temperature').textContent = `${data.environmentalMetrics.temperature}°C`;
          }
        })
        .catch(error => {
          console.error('Satellite data stream error:', error);
        });
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(updateInterval);
  }
  
  function updateSatelliteOverlay(data, overlay) {
    // Create a dynamic heatmap based on satellite data
    const canvas = document.createElement('canvas');
    canvas.width = overlay.clientWidth;
    canvas.height = overlay.clientHeight;
    const ctx = canvas.getContext('2d');
    
    // Render the latest satellite imagery with environmental indicators
    data.dataPoints.forEach(point => {
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, point.intensity * 50
      );
      gradient.addColorStop(0, `rgba(255, 0, 0, ${point.severity})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.intensity * 50, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Add timestamp overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.fillText(`Last update: ${new Date(data.timestamp).toLocaleString()}`, 10, 20);
    
    // Replace previous overlay
    overlay.innerHTML = '';
    overlay.appendChild(canvas);
  }
  
  // Federated Model Learning from Multiple Sources
  function initializeFederatedLearning() {
    const federatedStatus = document.getElementById('federated-status');
    if (!federatedStatus) return;
    
    federatedStatus.innerHTML = `
      <div class="node-container">
        <h4>Connected Data Nodes</h4>
        <div class="nodes">
          <div class="node active">
            <div class="node-icon">🏥</div>
            <div class="node-details">
              <span class="node-name">Health Ministry Node</span>
              <span class="node-status">Active</span>
            </div>
          </div>
          <div class="node active">
            <div class="node-icon">🌧️</div>
            <div class="node-details">
              <span class="node-name">Climate Data Node</span>
              <span class="node-status">Active</span>
            </div>
          </div>
          <div class="node pending">
            <div class="node-icon">👥</div>
            <div class="node-details">
              <span class="node-name">Population Data Node</span>
              <span class="node-status">Pending</span>
            </div>
          </div>
          <div class="node active">
            <div class="node-icon">🏙️</div>
            <div class="node-details">
              <span class="node-name">Infrastructure Node</span>
              <span class="node-status">Active</span>
            </div>
          </div>
        </div>
      </div>
      <div class="federated-metrics">
        <div class="metric-group">
          <h4>Federated Learning Status</h4>
          <div class="progress-indicator">
            <div class="progress-bar" style="width: 72%"></div>
          </div>
          <span class="progress-text">72% Model Consensus</span>
        </div>
        <div class="last-update">Last weight aggregation: 2 hours ago</div>
      </div>
    `;
    
    // Simulate nodes connecting/disconnecting
    setInterval(() => {
      const nodes = document.querySelectorAll('.node');
      if (nodes.length === 0) return;
      
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      
      randomNode.classList.toggle('active');
      randomNode.classList.toggle('pending');
      
      const statusSpan = randomNode.querySelector('.node-status');
      if (statusSpan) {
        statusSpan.textContent = randomNode.classList.contains('active') ? 'Active' : 'Pending';
      }
      
      // Update progress bar
      const progressBar = document.querySelector('.federated-metrics .progress-bar');
      if (progressBar) {
        const newProgress = 40 + Math.random() * 55;
        progressBar.style.width = `${newProgress}%`;
        
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
          progressText.textContent = `${Math.round(newProgress)}% Model Consensus`;
        }
      }
      
      // Update last aggregation time
      const lastUpdate = document.querySelector('.federated-metrics .last-update');
      if (lastUpdate) {
        const minutes = Math.floor(Math.random() * 120);
        lastUpdate.textContent = 
          `Last weight aggregation: ${minutes < 60 ? minutes + ' minutes ago' : Math.floor(minutes/60) + ' hours ago'}`;
      }
    }, 8000);
  }
  
  // Bayesian Uncertainty Visualization
  function renderBayesianUncertainty(predictions, uncertainties) {
    if (!window.Plotly || !document.getElementById('uncertainty-chart')) return;
    
    // Sample data if real data not available
    if (!predictions) {
      predictions = Array(10).fill(0).map((_, i) => i * 0.1);
      uncertainties = predictions.map(p => 0.05 + Math.random() * 0.15);
    }
    
    const trace = {
      x: predictions.map(p => p * 100), // Convert to percentage
      type: 'histogram',
      histfunc: 'count',
      name: 'Prediction Distribution',
      marker: {
        color: 'rgba(255, 120, 0, 0.7)',
        line: {
          color: 'rgba(255, 120, 0, 1)',
          width: 1
        }
      },
      error_x: {
        type: 'data',
        array: uncertainties.map(u => u * 100),
        visible: true,
        color: '#f44336',
        thickness: 1.5,
        width: 3
      }
    };
    
    const layout = {
      title: 'Prediction Uncertainty Distribution',
      xaxis: {
        title: 'Prediction Probability (%)',
        range: [0, 100]
      },
      yaxis: {
        title: 'Frequency'
      },
      shapes: [{
        type: 'line',
        x0: 50,
        y0: 0,
        x1: 50,
        y1: 1,
        yref: 'paper',
        line: {
          color: 'grey',
          width: 1,
          dash: 'dash'
        }
      }],
      annotations: [{
        x: 50,
        y: 1,
        yref: 'paper',
        text: 'Decision Boundary',
        showarrow: true,
        arrowhead: 2,
        ax: 0,
        ay: -30
      }]
    };
    
    Plotly.newPlot('uncertainty-chart', [trace], layout);
  }
  
  // Real-time Explainable AI Dashboard
  function initializeExplainableAIDashboard() {
    if (!document.getElementById('xai-dashboard')) return;
    
    // Shapley values visualization
    renderShapleyValues();
    
    // Counterfactual analysis
    renderCounterfactuals();
    
    // Concept activation visualization
    renderConceptActivation();
  }
  
  function renderShapleyValues() {
    if (!window.Plotly || !document.getElementById('shapley-values')) return;
    
    // Sample Shapley values for features
    const features = [
      'past_conflicts_3mo',
      'poverty_rate',
      'rainfall_mm',
      'total_events',
      'drought_index',
      'infrastructure_score',
      'literacy_rate',
      'temp_celsius'
    ];
    
    const values = [2.7, 1.8, -1.5, 1.2, 0.9, -0.7, -0.5, 0.3];
    const baseValue = 0.45;
    
    // Create waterfall chart
    const trace = {
      type: 'waterfall',
      orientation: 'h',
      measure: [
        'absolute', ...Array(features.length).fill('relative'), 'total'
      ],
      y: ['Base Value', ...features, 'Final Prediction'],
      x: [baseValue, ...values, null],
      connector: {
        line: {
          color: "rgb(63, 63, 63)"
        }
      },
      decreasing: {
        marker: {color: "#4CAF50"}
      },
      increasing: {
        marker: {color: "#F44336"}
      },
      totals: {
        marker: {color: "#2196F3"}
      }
    };
    
    const layout = {
      title: "SHAP Values: Feature Contributions",
      waterfallgap: 0.3,
      autosize: true,
      height: 500,
      xaxis: {
        title: "Impact on Prediction"
      }
    };
    
    Plotly.newPlot('shapley-values', [trace], layout);
  }
  
  function renderCounterfactuals() {
    if (!document.getElementById('counterfactuals')) return;
    
    const counterfactualsContainer = document.getElementById('counterfactuals');
    
    // Sample counterfactual scenarios
    const scenarios = [
      {
        id: 1,
        change: "If rainfall increased by 35mm",
        originalPrediction: "Conflict Likely (78%)",
        newPrediction: "No Conflict Expected (32%)",
        impact: -46
      },
      {
        id: 2,
        change: "If literacy rate improved by 15%",
        originalPrediction: "Conflict Likely (78%)",
        newPrediction: "Conflict Likely (65%)",
        impact: -13
      },
      {
        id: 3,
        change: "If infrastructure score improved by 2 points",
        originalPrediction: "Conflict Likely (78%)",
        newPrediction: "Uncertain (51%)",
        impact: -27
      }
    ];
    
    // Create HTML elements for counterfactuals
    counterfactualsContainer.innerHTML = `
      <h3>Counterfactual Analysis</h3>
      <p class="explanation">What would need to change to get a different prediction?</p>
      <div class="counterfactual-scenarios">
        ${scenarios.map(scenario => `
          <div class="counterfactual-card">
            <div class="counterfactual-header">
              <h4>Scenario ${scenario.id}</h4>
              <span class="impact-badge ${scenario.impact < 0 ? 'positive' : 'negative'}">
                ${scenario.impact < 0 ? '↓' : '↑'} ${Math.abs(scenario.impact)}%
              </span>
            </div>
            <div class="counterfactual-change">${scenario.change}</div>
            <div class="counterfactual-predictions">
              <div class="prediction-pair">
                <div class="prediction-label">Current:</div>
                <div class="prediction-value">${scenario.originalPrediction}</div>
              </div>
              <div class="arrow">→</div>
              <div class="prediction-pair">
                <div class="prediction-label">Would be:</div>
                <div class="prediction-value ${scenario.newPrediction.includes('No Conflict') ? 'safe' : (scenario.newPrediction.includes('Uncertain') ? 'uncertain' : 'danger')}">
                  ${scenario.newPrediction}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  function renderConceptActivation() {
    if (!window.Plotly || !document.getElementById('concept-activation')) return;
    
    // Sample concept activation data
    const concepts = [
      "Water Scarcity", "Economic Instability", 
      "Ethnic Tension", "Political Instability",
      "Resource Competition", "Population Displacement"
    ];
    
    const activations = [
      [0.8, 0.6, 0.9, 0.7, 0.5, 0.3], // High risk area
      [0.3, 0.2, 0.4, 0.3, 0.2, 0.1]  // Low risk area
    ];
    
    const trace1 = {
      type: 'scatterpolar',
      r: activations[0],
      theta: concepts,
      fill: 'toself',
      name: 'High Risk Area',
      line: {color: 'rgba(244, 67, 54, 0.8)'}
    };
    
    const trace2 = {
      type: 'scatterpolar',
      r: activations[1],
      theta: concepts,
      fill: 'toself',
      name: 'Low Risk Area',
      line: {color: 'rgba(76, 175, 80, 0.8)'}
    };
    
    const layout = {
      polar: {
        radialaxis: {
          visible: true,
          range: [0, 1]
        }
      },
      title: "Learned Concept Activations",
      showlegend: true
    };
    
    Plotly.newPlot('concept-activation', [trace1, trace2], layout);
  }
  
  // Interactive Intervention Simulator
  function initializeInterventionSimulator() {
    if (!document.getElementById('intervention-simulator')) return;
    
    const simulatorContainer = document.getElementById('intervention-simulator');
    
    // Sample intervention scenarios
    const interventions = [
      {
        id: 'water-access',
        name: 'Improve Water Access',
        description: 'Deploy water purification systems and drill wells',
        cost: '$1.2M',
        timeframe: '6 months',
        impact: 0.16
      },
      {
        id: 'education',
        name: 'Education Programs',
        description: 'Literacy and vocational training centers',
        cost: '$800K',
        timeframe: '12 months',
        impact: 0.09
      },
      {
        id: 'infrastructure',
        name: 'Road Infrastructure',
        description: 'Improve transportation network between communities',
        cost: '$3.5M',
        timeframe: '18 months',
        impact: 0.22
      },
      {
        id: 'healthcare',
        name: 'Mobile Healthcare',
        description: 'Deploy mobile health clinics with essential services',
        cost: '$1.8M',
        timeframe: '9 months',
        impact: 0.12
      }
    ];
    
    // Create intervention cards
    simulatorContainer.innerHTML = `
      <h2>🛠️ Intervention Impact Simulator</h2>
      <p class="simulator-description">
        Explore how different humanitarian interventions could affect conflict risk in this region.
        Select multiple interventions to see their combined impact.
      </p>
      
      <div class="interventions-container">
        ${interventions.map(int => `
          <div class="intervention-card" data-id="${int.id}" data-impact="${int.impact}">
            <div class="card-header">
              <h3>${int.name}</h3>
              <div class="impact-indicator">-${Math.round(int.impact * 100)}% risk</div>
            </div>
            <p class="intervention-description">${int.description}</p>
            <div class="intervention-meta">
              <span class="meta-item">Cost: ${int.cost}</span>
              <span class="meta-item">Time: ${int.timeframe}</span>
            </div>
            <button class="select-intervention">Select</button>
          </div>
        `).join('')}
      </div>
      
      <div class="simulation-results" style="display: none;">
        <h3>Intervention Impact Analysis</h3>
        <div class="impact-visualization">
          <div class="impact-gauge-container">
            <div id="impact-gauge" class="gauge-chart"></div>
          </div>
          <div class="selected-interventions">
            <h4>Selected Interventions</h4>
            <ul id="selected-list"></ul>
            <div class="total-investment">
              <span class="label">Total Investment:</span>
              <span id="total-cost" class="value">$0</span>
            </div>
            <div class="implementation-time">
              <span class="label">Implementation Timeline:</span>
              <span id="implementation-time" class="value">0 months</span>
            </div>
            <button id="reset-simulation" class="reset-btn">Reset Simulation</button>
          </div>
        </div>
      </div>
    `;
    
    // Initialize intervention selection
    setTimeout(() => {
      const interventionCards = document.querySelectorAll('.intervention-card');
      const selectedList = document.getElementById('selected-list');
      const totalCostElement = document.getElementById('total-cost');
      const implementationTimeElement = document.getElementById('implementation-time');
      const simulationResults = document.querySelector('.simulation-results');
      const resetButton = document.getElementById('reset-simulation');
      
      if (!selectedList || !totalCostElement || !implementationTimeElement || !simulationResults || !resetButton) {
        console.error('Some intervention simulator elements not found');
        return;
      }
      
      let selectedInterventions = [];
      let baseRisk = 0.78; // Starting risk level
      
      interventionCards.forEach(card => {
        const selectButton = card.querySelector('.select-intervention');
        if (!selectButton) return;
        
        selectButton.addEventListener('click', () => {
          const interventionId = card.dataset.id;
          const impact = parseFloat(card.dataset.impact);
          
          // Check if already selected
          if (selectedInterventions.find(i => i.id === interventionId)) {
            return;
          }
          
          // Get intervention details
          const intervention = interventions.find(i => i.id === interventionId);
          
          // Add to selected interventions
          selectedInterventions.push(intervention);
          
          // Update selected list
          selectedList.innerHTML = selectedInterventions.map(int => 
            `<li>${int.name} <span class="impact-value">-${Math.round(int.impact * 100)}%</span></li>`
          ).join('');
          
          // Update total cost
          const totalCost = selectedInterventions.reduce((sum, int) => {
            const costStr = int.cost.replace('$', '');
            const value = parseFloat(costStr);
            const multiplier = costStr.includes('M') ? 1000000 : 1000;
            return sum + (value * multiplier);
          }, 0);
          
          totalCostElement.textContent = totalCost >= 1000000 
            ? `$${(totalCost / 1000000).toFixed(1)}M` 
            : `$${(totalCost / 1000).toFixed(1)}K`;
          
          // Update implementation time (max of all selected)
          const implementationTime = Math.max(...selectedInterventions.map(
            int => parseInt(int.timeframe.split(' ')[0])
          ));
          implementationTimeElement.textContent = `${implementationTime} months`;
          
          // Show simulation results
          simulationResults.style.display = 'block';
          
          // Calculate cumulative impact
          // Using a diminishing returns model: 1 - (1-baseRisk) * product(1-impact)
          const cumulativeImpact = 1 - selectedInterventions.reduce((product, int) => 
            product * (1 - int.impact), 1);
          
          const newRisk = Math.max(0, baseRisk - cumulativeImpact);
          
          // Update gauge
          renderImpactGauge(baseRisk, newRisk);
          
          // Highlight selected card
          card.classList.add('selected');
          selectButton.disabled = true;
          selectButton.textContent = 'Selected';
        });
      });
      
      // Reset simulation
      resetButton.addEventListener('click', () => {
        selectedInterventions = [];
        selectedList.innerHTML = '';
        totalCostElement.textContent = '$0';
        implementationTimeElement.textContent = '0 months';
        
        // Reset gauge
        renderImpactGauge(baseRisk, baseRisk);
        
        // Reset card selection
        interventionCards.forEach(card => {
          card.classList.remove('selected');
          const btn = card.querySelector('.select-intervention');
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Select';
          }
        });
      });
      
      // Initial gauge render
      renderImpactGauge(baseRisk, baseRisk);
    }, 1000);
  }
  
  function renderImpactGauge(originalRisk, newRisk) {
    if (!window.Plotly || !document.getElementById('impact-gauge')) return;
    
    const data = [
      {
        type: 'indicator',
        mode: 'gauge+number+delta',
        value: newRisk * 100,
        title: { text: 'Conflict Risk', font: { size: 18 } },
        delta: { 
          reference: originalRisk * 100,
          valueformat: '.1f',
          decreasing: { color: '#4CAF50' }
        },
        gauge: {
          axis: { range: [0, 100], tickwidth: 1 },
          bar: { color: '#1976D2' },
          bgcolor: 'white',
          borderwidth: 2,
          bordercolor: 'gray',
          steps: [
            { range: [0, 30], color: '#4caf50' },
            { range: [30, 70], color: '#ff9800' },
            { range: [70, 100], color: '#f44336' }
          ],
          threshold: {
            line: { color: 'black', width: 4 },
            thickness: 0.75,
            value: originalRisk * 100
          }
        }
      }
    ];
    
    const layout = {
      height: 300,
      margin: { t: 25, r: 25, l: 25, b: 25 }
    };
    
    Plotly.newPlot('impact-gauge', data, layout);
  }
  
  // Initialize when document is ready
  document.addEventListener('DOMContentLoaded', initializeAdvancedComponents);