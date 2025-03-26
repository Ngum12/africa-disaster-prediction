class AIEthicsMonitor {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.metrics = {};
    this.biasDetected = false;
    this.audits = [];
    this.recommendations = [];
  }
  
  initialize() {
    if (!this.container) return false;
    
    this.container.innerHTML = `
      <div class="ethics-monitor-container">
        <div class="ethics-header">
          <h3>AI Ethics & Fairness Monitor</h3>
          <div class="ethics-status ${this.biasDetected ? 'status-warning' : 'status-good'}">
            <span class="status-indicator"></span>
            <span class="status-text">${this.biasDetected ? 'Potential Bias Detected' : 'No Significant Bias Detected'}</span>
          </div>
        </div>
        
        <div class="ethics-metrics-container">
          <h4>Fairness Metrics</h4>
          <div class="ethics-metrics-grid" id="ethics-metrics-grid"></div>
        </div>
        
        <div class="bias-analysis-container">
          <h4>Regional Representation Analysis</h4>
          <div id="regional-representation-chart" class="ethics-chart"></div>
        </div>
        
        <div class="ethics-audit-container">
          <h4>Recent Ethics Audits</h4>
          <div id="ethics-audit-list" class="audit-list"></div>
        </div>
        
        <div class="ethics-recommendations-container">
          <h4>AI Ethics Recommendations</h4>
          <div id="ethics-recommendations" class="recommendations-list"></div>
        </div>
      </div>
    `;
    
    // Load data and render components
    this.loadEthicsData().then(() => {
      this.renderMetrics();
      this.renderRegionalRepresentation();
      this.renderAudits();
      this.renderRecommendations();
    });
    
    return true;
  }
  
  async loadEthicsData() {
    // In production, this would fetch from an API endpoint
    this.metrics = {
      "statistical_parity": {
        value: 0.92,
        threshold: 0.85,
        status: "good",
        description: "Predictions are similarly distributed across different regions"
      },
      "equal_opportunity": {
        value: 0.87,
        threshold: 0.85,
        status: "good",
        description: "True positive rates are balanced across different demographics"
      },
      "predictive_parity": {
        value: 0.79,
        threshold: 0.85,
        status: "warning",
        description: "Precision varies slightly across demographic groups"
      },
      "calibration": {
        value: 0.94,
        threshold: 0.85,
        status: "good",
        description: "Predictions are well-calibrated across all regions"
      }
    };
    
    this.regionalRepresentation = {
      regions: ["North Africa", "West Africa", "East Africa", "Central Africa", "Southern Africa"],
      trainingData: [22, 31, 25, 18, 4],
      predictions: [19, 33, 24, 17, 7],
      population: [15, 35, 25, 15, 10]
    };
    
    this.audits = [
      {
        date: "2024-03-20",
        type: "Automated Bias Scan",
        findings: "No significant bias detected",
        status: "passed"
      },
      {
        date: "2024-02-15",
        type: "External Ethics Review",
        findings: "Minor concerns about underrepresentation of Southern Africa",
        status: "passed with recommendations"
      },
      {
        date: "2024-01-10",
        type: "Adversarial Testing",
        findings: "Model robust against demographic adversarial examples",
        status: "passed"
      }
    ];
    
    this.recommendations = [
      {
        priority: "high",
        text: "Increase training data representation for Southern African regions"
      },
      {
        priority: "medium",
        text: "Implement regular monitoring for predictive parity across ethnic groups"
      },
      {
        priority: "medium",
        text: "Add transparency documentation about potential limitations in conflict predictions"
      }
    ];
    
    // Determine if bias is detected
    this.biasDetected = Object.values(this.metrics).some(metric => metric.status === "warning" || metric.status === "critical");
  }
  
  renderMetrics() {
    const container = document.getElementById('ethics-metrics-grid');
    if (!container) return;
    
    let html = '';
    
    Object.entries(this.metrics).forEach(([key, data]) => {
      const formattedName = key.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const percentValue = Math.round(data.value * 100);
      const thresholdPercent = Math.round(data.threshold * 100);
      
      html += `
        <div class="metric-card metric-${data.status}">
          <div class="metric-header">
            <h5>${formattedName}</h5>
            <span class="metric-status status-${data.status}"></span>
          </div>
          <div class="metric-value">${percentValue}%</div>
          <div class="metric-threshold">Threshold: ${thresholdPercent}%</div>
          <div class="metric-description">${data.description}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  renderRegionalRepresentation() {
    const chartContainer = document.getElementById('regional-representation-chart');
    if (!chartContainer || !window.Plotly) return;
    
    const regions = this.regionalRepresentation.regions;
    
    const data = [
      {
        x: regions,
        y: this.regionalRepresentation.trainingData,
        type: 'bar',
        name: 'Training Data',
        marker: {color: '#2196f3'}
      },
      {
        x: regions,
        y: this.regionalRepresentation.predictions,
        type: 'bar',
        name: 'Predictions',
        marker: {color: '#ff9800'}
      },
      {
        x: regions,
        y: this.regionalRepresentation.population,
        type: 'bar',
        name: 'Population',
        marker: {color: '#4caf50'}
      }
    ];
    
    const layout = {
      barmode: 'group',
      legend: {orientation: 'h', y: -0.2},
      yaxis: {title: 'Percentage (%)'},
      margin: {t: 20, r: 20, l: 50, b: 80},
      height: 300
    };
    
    Plotly.newPlot(chartContainer, data, layout, {displayModeBar: false, responsive: true});
  }
  
  renderAudits() {
    const container = document.getElementById('ethics-audit-list');
    if (!container) return;
    
    let html = '';
    
    this.audits.forEach(audit => {
      html += `
        <div class="audit-item">
          <div class="audit-header">
            <span class="audit-date">${audit.date}</span>
            <span class="audit-status status-${audit.status.replace(/\s+/g, '-')}">${audit.status}</span>
          </div>
          <div class="audit-type">${audit.type}</div>
          <div class="audit-findings">${audit.findings}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  renderRecommendations() {
    const container = document.getElementById('ethics-recommendations');
    if (!container) return;
    
    let html = '';
    
    this.recommendations.forEach(rec => {
      html += `
        <div class="recommendation-item priority-${rec.priority}">
          <span class="priority-indicator"></span>
          <span class="recommendation-text">${rec.text}</span>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  const ethicsMonitor = new AIEthicsMonitor('ethics-monitor-container');
  ethicsMonitor.initialize();
});