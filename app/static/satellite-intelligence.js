/**
 * Advanced Satellite Intelligence System
 * Combines multi-spectral satellite imagery with AI analysis for early warning
 */
class SatelliteIntelligenceSystem {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.layers = [];
    this.activeLayerIndex = 0;
    this.timeIndex = 6; // Default to current
    this.predictionOverlay = true;
    this.initialized = false;
    this.satelliteImages = {
      base: '/static/satellite_base.jpg',
      drought: '/static/drought_layer.png',
      vegetation: '/static/vegetation_layer.png',
      rainfall: '/static/rainfall_layer.png',
      temperature: '/static/temperature_layer.png',
      population: '/static/population_layer.png',
      infrastructure: '/static/infrastructure_layer.png'
    };
    
    // AI-predicted hotspots (would come from backend in real implementation)
    this.riskHotspots = [
      {region: "North Darfur", lat: 14.5, lng: 25.5, risk: 0.89, factors: ["Drought", "Resource Competition"]},
      {region: "Eastern Congo", lat: -1.5, lng: 29.5, risk: 0.82, factors: ["Conflict History", "Resource Control"]},
      {region: "Southern Somalia", lat: 2.5, lng: 43.5, risk: 0.76, factors: ["Drought", "Governance Gaps"]},
      {region: "Northern Nigeria", lat: 12.0, lng: 8.5, risk: 0.72, factors: ["Religious Tensions", "Water Scarcity"]},
      {region: "Central Mali", lat: 15.5, lng: -2.5, risk: 0.68, factors: ["Ethnic Conflict", "Climate Change"]}
    ];
    
    // Initialize time series forecasting data
    this.timeSeriesData = this.generateTimeSeriesData();
  }
  
  init() {
    if (!this.container) return false;
    
    this.container.innerHTML = `
      <div class="satellite-controls">
        <div class="layer-selector">
          <h4>Intelligence Layers</h4>
          <div class="layer-buttons">
            <button class="layer-btn active" data-layer="composite">AI Composite</button>
            <button class="layer-btn" data-layer="drought">Drought Risk</button>
            <button class="layer-btn" data-layer="vegetation">Vegetation</button>
            <button class="layer-btn" data-layer="rainfall">Rainfall</button>
            <button class="layer-btn" data-layer="conflict">Conflict Risk</button>
          </div>
        </div>
        <div class="time-controls">
          <h4>Temporal Analysis</h4>
          <div class="timeline-slider">
            <span>Past</span>
            <input type="range" min="0" max="12" value="6" id="time-slider">
            <span>Future</span>
          </div>
          <div class="time-indicator">Current</div>
        </div>
        <div class="prediction-controls">
          <label class="toggle-container">
            <input type="checkbox" id="prediction-toggle" checked>
            <span class="toggle-switch"></span>
            <span class="toggle-label">AI Risk Prediction</span>
          </label>
        </div>
      </div>
      
      <div class="satellite-view-container">
        <div class="satellite-view">
          <canvas id="satellite-canvas" width="800" height="600"></canvas>
          <div class="hotspot-markers" id="hotspot-markers"></div>
          <div class="zoom-controls">
            <button id="zoom-in">+</button>
            <button id="zoom-out">−</button>
            <button id="reset-view">↺</button>
          </div>
        </div>
        <div class="satellite-info-panel">
          <div class="region-analysis" id="region-analysis">
            <h4>Select a region for detailed analysis</h4>
            <p>Click on any highlighted area to see detailed risk assessment and causal factors.</p>
          </div>
          <div class="satellite-metrics">
            <div class="metric">
              <span class="metric-label">Drought Index:</span>
              <span class="metric-value" id="live-drought-index">0.65</span>
            </div>
            <div class="metric">
              <span class="metric-label">Precipitation:</span>
              <span class="metric-value" id="live-precipitation">32mm</span>
            </div>
            <div class="metric">
              <span class="metric-label">Temperature:</span>
              <span class="metric-value" id="live-temperature">29.3°C</span>
            </div>
          </div>
          <div class="forecast-preview">
            <h4>30-Day Trend Forecast</h4>
            <div id="forecast-chart" class="mini-chart"></div>
          </div>
        </div>
      </div>
    `;
    
    // Set up interactions
    this.setupEventListeners();
    
    // Initialize canvas
    this.canvas = document.getElementById('satellite-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Render initial view
    this.loadSatelliteImages().then(() => {
      this.renderView();
      this.renderHotspots();
      this.renderForecastChart();
      this.initialized = true;
      
      // Start data update cycle
      this.startLiveUpdates();
    });
    
    return true;
  }
  
  async loadSatelliteImages() {
    const imagePromises = [];
    this.images = {};
    
    // Create a promise for each image to load
    for (const [key, url] of Object.entries(this.satelliteImages)) {
      imagePromises.push(
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            this.images[key] = img;
            resolve();
          };
          img.onerror = () => {
            // Create a colored placeholder on error
            this.createPlaceholderImage(key);
            resolve();
          };
          // For demonstration, create placeholders instead of loading real images
          this.createPlaceholderImage(key);
          resolve();
          // In production, uncomment the line below to load real images
          // img.src = url;
        })
      );
    }
    
    // Wait for all images to load
    return Promise.all(imagePromises);
  }
  
  createPlaceholderImage(type) {
    // Create canvas placeholder images with different colors
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // Fill base with continent outline
    if (type === 'base') {
      ctx.fillStyle = '#1a2639';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw a simplified Africa outline
      ctx.beginPath();
      ctx.moveTo(400, 100);
      ctx.bezierCurveTo(300, 150, 350, 200, 300, 300);
      ctx.bezierCurveTo(300, 400, 250, 500, 350, 550);
      ctx.bezierCurveTo(450, 580, 550, 500, 600, 450);
      ctx.bezierCurveTo(650, 400, 600, 300, 650, 200);
      ctx.bezierCurveTo(600, 150, 500, 100, 400, 100);
      ctx.fillStyle = '#2c3e50';
      ctx.fill();
      
      // Add some detail to base map
      ctx.strokeStyle = '#34495e';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add some country borders
      ctx.beginPath();
      ctx.moveTo(400, 200);
      ctx.lineTo(500, 250);
      ctx.moveTo(450, 300);
      ctx.lineTo(350, 350);
      ctx.moveTo(500, 350);
      ctx.lineTo(600, 400);
      ctx.strokeStyle = '#4c5c6d';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // Use a transparent base for overlay layers
      ctx.globalAlpha = 0.6;
      
      // Different colors for different layer types
      let gradient;
      switch(type) {
        case 'drought':
          gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, 'rgba(255, 255, 0, 0.1)');
          gradient.addColorStop(0.4, 'rgba(255, 165, 0, 0.4)');
          gradient.addColorStop(0.8, 'rgba(255, 0, 0, 0.5)');
          ctx.fillStyle = gradient;
          break;
        case 'vegetation':
          gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, 'rgba(0, 100, 0, 0.1)');
          gradient.addColorStop(0.5, 'rgba(0, 200, 0, 0.3)');
          gradient.addColorStop(1, 'rgba(200, 255, 200, 0.5)');
          ctx.fillStyle = gradient;
          break;
        case 'rainfall':
          gradient = ctx.createRadialGradient(400, 300, 100, 400, 300, 500);
          gradient.addColorStop(0, 'rgba(0, 0, 255, 0.1)');
          gradient.addColorStop(0.6, 'rgba(0, 100, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(100, 200, 255, 0.4)');
          ctx.fillStyle = gradient;
          break;
        case 'temperature':
          gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, 'rgba(255, 0, 0, 0.5)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 0, 255, 0.2)');
          ctx.fillStyle = gradient;
          break;
        case 'population':
          // Create a dotted pattern for population density
          for (let i = 0; i < 2000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 2 + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
          }
          break;
        case 'infrastructure':
          // Draw some lines for infrastructure
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 2;
          for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
          }
          break;
        default:
          ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
      }
      
      if (type !== 'infrastructure' && type !== 'population') {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Add some random patterns to make it look like data
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 100 + 50;
        
        const grd = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grd.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Convert the canvas to an image
    const img = new Image();
    img.src = canvas.toDataURL();
    this.images[type] = img;
  }
  
  renderView() {
    if (!this.ctx || !this.canvas) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw base satellite image
    if (this.images.base) {
      this.ctx.drawImage(this.images.base, 0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Get active layer
    const activeLayerBtn = document.querySelector('.layer-btn.active');
    if (!activeLayerBtn) return;
    
    const activeLayer = activeLayerBtn.dataset.layer;
    
    // Draw appropriate layer based on selection
    if (activeLayer === 'composite') {
      // For composite view, blend multiple layers
      if (this.images.drought) {
        this.ctx.globalAlpha = 0.4;
        this.ctx.drawImage(this.images.drought, 0, 0, this.canvas.width, this.canvas.height);
      }
      if (this.images.rainfall) {
        this.ctx.globalAlpha = 0.3;
        this.ctx.drawImage(this.images.rainfall, 0, 0, this.canvas.width, this.canvas.height);
      }
      if (this.images.temperature) {
        this.ctx.globalAlpha = 0.2;
        this.ctx.drawImage(this.images.temperature, 0, 0, this.canvas.width, this.canvas.height);
      }
      this.ctx.globalAlpha = 1.0;
    } else if (activeLayer === 'drought' && this.images.drought) {
      this.ctx.globalAlpha = 0.7;
      this.ctx.drawImage(this.images.drought, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1.0;
    } else if (activeLayer === 'vegetation' && this.images.vegetation) {
      this.ctx.globalAlpha = 0.7;
      this.ctx.drawImage(this.images.vegetation, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1.0;
    } else if (activeLayer === 'rainfall' && this.images.rainfall) {
      this.ctx.globalAlpha = 0.7;
      this.ctx.drawImage(this.images.rainfall, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1.0;
    } else if (activeLayer === 'conflict') {
      // For conflict risk, create a special heat map
      this.renderConflictRiskLayer();
    }
  }
  
  renderConflictRiskLayer() {
    if (!this.ctx) return;
    
    this.ctx.globalAlpha = 0.6;
    
    // Draw risk areas with gradient
    for (const hotspot of this.riskHotspots) {
      const x = this.longitudeToX(hotspot.lng);
      const y = this.latitudeToY(hotspot.lat);
      const radius = 50 + hotspot.risk * 50; // Size based on risk
      
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${hotspot.risk})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1.0;
  }
  
  renderHotspots() {
    const markersContainer = document.getElementById('hotspot-markers');
    if (!markersContainer || !this.predictionOverlay) {
      return;
    }
    
    // Clear existing markers
    markersContainer.innerHTML = '';
    
    // Add markers for each hotspot
    this.riskHotspots.forEach((hotspot, index) => {
      const marker = document.createElement('div');
      marker.className = 'hotspot-marker';
      marker.dataset.index = index;
      
      // Position the marker
      const x = this.longitudeToX(hotspot.lng);
      const y = this.latitudeToY(hotspot.lat);
      
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      
      // Color based on risk level
      const hue = 120 - (hotspot.risk * 120); // 120=green (low risk), 0=red (high risk)
      marker.style.backgroundColor = `hsla(${hue}, 100%, 50%, 0.7)`;
      
      // Pulse animation based on risk
      marker.style.animation = `pulse ${1 + (1 - hotspot.risk)}s infinite`;
      
      // Add marker to container
      markersContainer.appendChild(marker);
      
      // Add click event for detailed analysis
      marker.addEventListener('click', () => this.showRegionAnalysis(hotspot));
    });
  }
  
  showRegionAnalysis(hotspot) {
    const analysisPanel = document.getElementById('region-analysis');
    if (!analysisPanel) return;
    
    // Create risk indicator color
    const hue = 120 - (hotspot.risk * 120); // 120=green (low risk), 0=red (high risk)
    const riskColor = `hsl(${hue}, 80%, 50%)`;
    
    // Format factors list
    const factorsList = hotspot.factors.map(factor => 
      `<li>${factor}</li>`
    ).join('');
    
    // Generate a dynamic temporal forecast
    const forecasts = this.generateRegionalForecast(hotspot);
    
    // Update analysis panel content
    analysisPanel.innerHTML = `
      <h4>${hotspot.region}</h4>
      <div class="risk-indicator">
        <div class="risk-label">Risk Level:</div>
        <div class="risk-meter" style="background: linear-gradient(to right, green, yellow, red);">
          <div class="risk-marker" style="left: ${hotspot.risk * 100}%; background-color: ${riskColor};"></div>
        </div>
        <div class="risk-value">${Math.round(hotspot.risk * 100)}%</div>
      </div>
      
      <div class="risk-details">
        <div class="risk-factors">
          <h5>Key Risk Factors:</h5>
          <ul>${factorsList}</ul>
        </div>
        
        <div class="risk-forecast">
          <h5>30-Day Risk Forecast:</h5>
          <div class="forecast-trend ${forecasts.trend}">
            <span class="trend-arrow">${forecasts.trend === 'increasing' ? '↑' : forecasts.trend === 'decreasing' ? '↓' : '→'}</span>
            <span class="trend-label">${forecasts.trend.charAt(0).toUpperCase() + forecasts.trend.slice(1)} Risk</span>
          </div>
          <div class="forecast-description">${forecasts.description}</div>
        </div>
      </div>
      
      <div class="action-recommendations">
        <h5>Recommended Actions:</h5>
        <ul>
          <li>Early warning alerts to ${forecasts.recommendations[0]}</li>
          <li>Resource mobilization for ${forecasts.recommendations[1]}</li>
          <li>Coordination with ${forecasts.recommendations[2]}</li>
        </ul>
      </div>
      
      <div class="analysis-image">
        <div class="time-comparison">
          <div class="image-comparison-slider">
            <img src="/static/before_${hotspot.region.toLowerCase().replace(/\s+/g, '_')}.jpg" class="comparison-image" alt="Before">
            <img src="/static/after_${hotspot.region.toLowerCase().replace(/\s+/g, '_')}.jpg" class="comparison-image" alt="After">
          </div>
          <div class="slider-caption">Drag slider to compare satellite imagery: before vs predicted</div>
        </div>
      </div>
    `;
    
    // In a real implementation, you would load actual before/after images
    // For now, we're just showing a placeholder message
    const analysisImage = analysisPanel.querySelector('.analysis-image');
    analysisImage.innerHTML = '<div class="placeholder-message">Historical vs Predictive Satellite Imagery Comparison</div>';
  }
  
  generateRegionalForecast(hotspot) {
    // Create dynamic forecasts based on the hotspot
    const trends = ['increasing', 'stable', 'decreasing'];
    const trend = hotspot.risk > 0.7 ? 'increasing' : 
                  hotspot.risk < 0.4 ? 'decreasing' : 'stable';
    
    let description = "";
    let recommendations = [];
    
    if (trend === 'increasing') {
      description = `Forecasting heightened conflict risk in the next 30 days due to ${hotspot.factors[0].toLowerCase()} and seasonal patterns.`;
      recommendations = [
        'local communities',
        'humanitarian preparedness',
        'regional security forces'
      ];
    } else if (trend === 'stable') {
      description = `Conditions likely to remain similar with ongoing tensions related to ${hotspot.factors[0].toLowerCase()}.`;
      recommendations = [
        'monitoring teams',
        'community resilience',
        'development partners'
      ];
    } else {
      description = `Projected improvement in conditions assuming ${hotspot.factors[0].toLowerCase()} factors continue to ease.`;
      recommendations = [
        'recovery planning',
        'infrastructure rehabilitation',
        'peacebuilding initiatives'
      ];
    }
    
    return {
      trend,
      description,
      recommendations
    };
  }
  
  longitudeToX(longitude) {
    // Simple conversion from longitude to X coordinate on canvas
    // This would be replaced with actual geospatial mapping in production
    const minLong = -18; // Approximate westernmost point of Africa
    const maxLong = 52; // Approximate easternmost point of Africa
    const canvasWidth = this.canvas ? this.canvas.width : 800;
    
    return ((longitude - minLong) / (maxLong - minLong)) * canvasWidth;
  }
  
  latitudeToY(latitude) {
    // Simple conversion from latitude to Y coordinate on canvas
    // This would be replaced with actual geospatial mapping in production
    const minLat = -35; // Approximate southernmost point of Africa
    const maxLat = 38; // Approximate northernmost point of Africa
    const canvasHeight = this.canvas ? this.canvas.height : 600;
    
    return ((maxLat - latitude) / (maxLat - minLat)) * canvasHeight;
  }
  
  generateTimeSeriesData() {
    // Generate mock time series data for forecasting
    const days = 60; // 30 days past, 30 days forecast
    const conflictRisk = [];
    const rainfall = [];
    const temperature = [];
    
    // Past data: actual observations (more regular)
    for (let i = 0; i < 30; i++) {
      // Some seasonal pattern with small random variations
      const day = i;
      const seasonalFactor = Math.sin((day / 60) * Math.PI) * 0.2;
      
      conflictRisk.push(0.4 + seasonalFactor + (Math.random() * 0.1 - 0.05));
      rainfall.push(50 + seasonalFactor * 200 + (Math.random() * 10 - 5));
      temperature.push(25 + seasonalFactor * 10 + (Math.random() * 2 - 1));
    }
    
    // Future data: forecasts (more uncertainty)
    for (let i = 30; i < days; i++) {
      const day = i;
      const seasonalFactor = Math.sin((day / 60) * Math.PI) * 0.3;
      const trend = 0.1; // Increasing trend in the future
      
      // Add increasing uncertainty for points further in the future
      const uncertainty = (i - 29) / 30 * 0.2;
      
      conflictRisk.push(0.4 + seasonalFactor + trend + (Math.random() * uncertainty * 2 - uncertainty));
      rainfall.push(50 + seasonalFactor * 200 - trend * 100 + (Math.random() * uncertainty * 40 - uncertainty * 20));
      temperature.push(25 + seasonalFactor * 10 + trend * 5 + (Math.random() * uncertainty * 4 - uncertainty * 2));
    }
    
    return {
      days: Array.from({length: days}, (_, i) => i - 29), // -29 to +30 days
      conflictRisk,
      rainfall,
      temperature
    };
  }
  
  renderForecastChart() {
    const chartContainer = document.getElementById('forecast-chart');
    if (!chartContainer || !window.Plotly) return;
    
    // Prepare the data from our time series
    const pastDays = this.timeSeriesData.days.slice(0, 30);
    const futureDays = this.timeSeriesData.days.slice(30);
    
    const pastRisk = this.timeSeriesData.conflictRisk.slice(0, 30);
    const futureRisk = this.timeSeriesData.conflictRisk.slice(30);
    
    // Create traces for past (solid line) and future (dashed line) data
    const traces = [
      {
        x: pastDays,
        y: pastRisk,
        type: 'scatter',
        mode: 'lines',
        name: 'Historical',
        line: {
          color: '#2196F3',
          width: 2
        }
      },
      {
        x: futureDays,
        y: futureRisk,
        type: 'scatter',
        mode: 'lines',
        name: 'Forecast',
        line: {
          color: '#2196F3',
          width: 2,
          dash: 'dash'
        }
      }
    ];
    
    // Add uncertainty cone for the forecast
    const upperBound = futureRisk.map(val => val + (val * 0.2));
    const lowerBound = futureRisk.map(val => Math.max(0, val - (val * 0.2)));
    
    traces.push({
      x: futureDays.concat(futureDays.slice().reverse()),
      y: upperBound.concat(lowerBound.slice().reverse()),
      fill: 'toself',
      fillcolor: 'rgba(33, 150, 243, 0.2)',
      line: {width: 0},
      hoverinfo: 'skip',
      showlegend: false
    });
    
    const layout = {
      title: {
        text: 'Conflict Risk Forecast',
        font: {
          size: 16
        }
      },
      margin: {
        l: 40,
        r: 20,
        t: 30,
        b: 30
      },
      xaxis: {
        title: 'Days (Relative to Today)',
        showgrid: false,
        zeroline: true,
        zerolinecolor: '#969696',
        zerolinewidth: 1
      },
      yaxis: {
        title: 'Risk Index',
        range: [0, 1],
        showgrid: true,
        gridcolor: '#e1e1e1',
        gridwidth: 1
      },
      shapes: [{
        type: 'line',
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 1,
        yref: 'paper',
        line: {
          color: '#969696',
          width: 1,
          dash: 'dot'
        }
      }],
      annotations: [{
        x: 0,
        y: 1,
        yref: 'paper',
        text: 'Today',
        showarrow: true,
        arrowhead: 0,
        arrowcolor: '#969696',
        arrowsize: 0.8,
        arrowwidth: 1,
        ax: 0,
        ay: -20
      }],
      legend: {
        orientation: 'h',
        y: -0.2
      }
    };
    
    Plotly.newPlot(chartContainer, traces, layout, {
      displayModeBar: false,
      responsive: true
    });
  }
  
  setupEventListeners() {
    // Layer selector buttons
    document.querySelectorAll('.layer-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        document.querySelectorAll('.layer-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.renderView();
      });
    });
    
    // Time slider
    const timeSlider = document.getElementById('time-slider');
    const timeIndicator = document.querySelector('.time-indicator');
    if (timeSlider && timeIndicator) {
      timeSlider.addEventListener('input', (e) => {
        this.timeIndex = parseInt(e.target.value);
        
        // Update time indicator text
        if (this.timeIndex < 6) {
          const daysAgo = (6 - this.timeIndex) * 5;
          timeIndicator.textContent = `${daysAgo} days ago`;
        } else if (this.timeIndex > 6) {
          const daysAhead = (this.timeIndex - 6) * 5;
          timeIndicator.textContent = `${daysAhead} days ahead (forecast)`;
        } else {
          timeIndicator.textContent = `Current`;
        }
        
        // This would update the visualization based on the time point
        this.renderTimeBasedView();
      });
    }
    
    // Toggle prediction overlay
    const predictionToggle = document.getElementById('prediction-toggle');
    if (predictionToggle) {
      predictionToggle.addEventListener('change', (e) => {
        this.predictionOverlay = e.target.checked;
        this.renderHotspots();
      });
    }
    
    // Zoom controls
    document.getElementById('zoom-in')?.addEventListener('click', () => this.handleZoom(1.2));
    document.getElementById('zoom-out')?.addEventListener('click', () => this.handleZoom(0.8));
    document.getElementById('reset-view')?.addEventListener('click', () => this.resetView());
    
    // Canvas drag interaction for panning
    if (this.canvas) {
      let isDragging = false;
      let startX, startY;
      let offsetX = 0, offsetY = 0;
      
      this.canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        this.canvas.style.cursor = 'grabbing';
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        this.canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
        this.canvas.style.cursor = 'grab';
      });
    }
  }
  
  renderTimeBasedView() {
    // In a real implementation, this would show different satellite data based on the time point
    // For this demo, we'll just adjust the opacity of layers to simulate temporal changes
    this.renderView();
    
    // Update the time-sensitive metrics
    this.updateLiveMetrics();
  }
  
  handleZoom(factor) {
    if (!this.canvas) return;
    
    // Get current scale
    const currentTransform = this.canvas.style.transform || '';
    const scaleMatch = currentTransform.match(/scale\(([0-9.]+)\)/);
    let currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    
    // Apply new scale
    const newScale = Math.max(0.5, Math.min(3, currentScale * factor));
    
    // Update transform with new scale
    if (currentTransform.includes('scale')) {
      this.canvas.style.transform = currentTransform.replace(
        /scale\([0-9.]+\)/, `scale(${newScale})`
      );
    } else {
      this.canvas.style.transform = `${currentTransform} scale(${newScale})`;
    }
  }
  
  resetView() {
    if (!this.canvas) return;
    this.canvas.style.transform = '';
  }
  
  startLiveUpdates() {
    // Update live metrics periodically
    setInterval(() => this.updateLiveMetrics(), 5000);
    
    // Simulate satellite data updates
    setInterval(() => {
      // In a real implementation, this would fetch fresh satellite data
      // For demo, just make small adjustments to the rendered view
      this.renderView();
    }, 30000);
  }
  
  updateLiveMetrics() {
    // Update the live environmental metrics with simulated data
    const timeOffset = this.timeIndex - 6; // 0 is current, negative is past, positive is future
    
    // Get metrics elements
    const droughtIndex = document.getElementById('live-drought-index');
    const precipitation = document.getElementById('live-precipitation');
    const temperature = document.getElementById('live-temperature');
    
    // Calculate values based on time offset from our time series data
    const dataIndex = Math.min(this.timeSeriesData.days.length - 1, Math.max(0, 30 + timeOffset));
    
    if (droughtIndex) {
      const value = 0.5 + (this.timeSeriesData.conflictRisk[dataIndex] - 0.4) * 2;
      droughtIndex.textContent = value.toFixed(2);
    }
    
    if (precipitation) {
      const value = Math.round(this.timeSeriesData.rainfall[dataIndex]);
      precipitation.textContent = `${value}mm`;
    }
    
    if (temperature) {
      const value = this.timeSeriesData.temperature[dataIndex];
      temperature.textContent = `${value.toFixed(1)}°C`;
    }
  }
}

// Initialize satellite intelligence system when document is ready
document.addEventListener('DOMContentLoaded', function() {
  const satelliteSystem = new SatelliteIntelligenceSystem('satellite-feed');
  
  // Try to initialize immediately, and also after a delay in case the DOM isn't ready
  if (!satelliteSystem.init()) {
    setTimeout(() => satelliteSystem.init(), 1000);
  }
});