class ExplainableAI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.featureImportance = {};
    this.localExplanations = {};
    this.confidenceScores = {};
    this.decisionBoundaries = {};
  }
  
  async initialize() {
    if (!this.container) return false;
    
    this.container.innerHTML = `
      <div class="explainable-ai-container">
        <div class="explanation-header">
          <h3>AI Prediction Explanation</h3>
          <p>Understanding why the model made this prediction</p>
        </div>
        
        <div class="feature-importance-panel">
          <h4>Key Factors Influencing This Prediction</h4>
          <div id="feature-importance-chart" class="ai-chart"></div>
        </div>
        
        <div class="explanation-grid">
          <div class="counterfactual-panel">
            <h4>What Would Change the Prediction?</h4>
            <div id="counterfactual-analysis" class="counterfactual-content">
              Loading counterfactual analysis...
            </div>
          </div>
          
          <div class="similar-cases-panel">
            <h4>Similar Historical Cases</h4>
            <div id="similar-cases" class="cases-content">
              Loading similar cases...
            </div>
          </div>
        </div>
        
        <div class="causal-panel">
          <h4>Causal Relationship Analysis</h4>
          <div id="causal-diagram" class="causal-content">
            <div class="causal-placeholder">Generating causal diagram...</div>
          </div>
        </div>
      </div>
    `;
    
    // Initialize visualizations
    await this.loadExplanationData();
    this.renderFeatureImportance();
    this.renderCounterfactuals();
    this.renderSimilarCases();
    this.renderCausalDiagram();
    
    return true;
  }
  
  async loadExplanationData() {
    try {
      // In production, fetch from endpoint
      this.featureImportance = {
        "drought_index": 0.28,
        "past_conflicts_3mo": 0.24,
        "infrastructure_score": 0.17,
        "rainfall_mm": 0.13,
        "temp_celsius": 0.08,
        "poverty_rate": 0.06,
        "literacy_rate": 0.04
      };
      
      this.localExplanations = {
        "drought_index": {
          value: 0.72,
          contribution: "+0.18",
          direction: "increases risk",
          threshold: 0.5,
          comparative: "21% higher than regional average"
        },
        "past_conflicts_3mo": {
          value: 8,
          contribution: "+0.15",
          direction: "increases risk",
          threshold: 5,
          comparative: "3 incidents above stability threshold"
        },
        "infrastructure_score": {
          value: 42,
          contribution: "+0.11",
          direction: "increases risk",
          threshold: 60,
          comparative: "18 points below resilience threshold"
        }
      };
      
      this.counterfactuals = [
        {
          factor: "drought_index",
          current: 0.72,
          required: "< 0.45",
          change: "-0.27",
          description: "Improving water access could reduce risk"
        },
        {
          factor: "past_conflicts_3mo",
          current: 8,
          required: "≤ 3",
          change: "-5",
          description: "Reducing recent tensions would significantly lower risk"
        }
      ];
      
      this.similarCases = [
        {
          region: "Northern Kenya",
          similarity: 0.92,
          outcome: "Conflict",
          date: "2022-08-15",
          keyFactors: ["drought_index: 0.68", "past_conflicts_3mo: 7"]
        },
        {
          region: "Central Mali",
          similarity: 0.87,
          outcome: "Conflict",
          date: "2022-05-03",
          keyFactors: ["drought_index: 0.75", "infrastructure_score: 38"]
        },
        {
          region: "Eastern Ethiopia",
          similarity: 0.85,
          outcome: "No Conflict",
          date: "2022-09-22",
          keyFactors: ["drought_index: 0.67", "past_conflicts_3mo: 2"]
        }
      ];
      
    } catch (error) {
      console.error("Error loading explanation data:", error);
    }
  }
  
  renderFeatureImportance() {
    const chartContainer = document.getElementById('feature-importance-chart');
    if (!chartContainer || !window.Plotly) return;
    
    // Convert data to arrays for plotting
    const features = Object.keys(this.featureImportance);
    const values = Object.values(this.featureImportance);
    
    // Sort by importance
    const combined = features.map((feature, i) => ({ feature, value: values[i] }));
    combined.sort((a, b) => b.value - a.value);
    
    const sortedFeatures = combined.map(item => this.formatFeatureName(item.feature));
    const sortedValues = combined.map(item => item.value);
    
    // Color by importance
    const colors = sortedValues.map(value => 
      value > 0.2 ? '#f44336' :  // High importance - red
      value > 0.1 ? '#ff9800' :  // Medium importance - orange
      '#2196f3'                  // Lower importance - blue
    );
    
    const data = [{
      type: 'bar',
      x: sortedValues,
      y: sortedFeatures,
      orientation: 'h',
      marker: {
        color: colors
      }
    }];
    
    const layout = {
      margin: { l: 150, r: 20, t: 20, b: 40 },
      xaxis: {
        title: 'Relative Importance',
        range: [0, Math.max(...sortedValues) * 1.1]
      },
      height: 300
    };
    
    Plotly.newPlot('feature-importance-chart', data, layout, { displayModeBar: false });
  }
  
  formatFeatureName(name) {
    // Convert snake_case to Title Case with spaces
    return name.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  renderCounterfactuals() {
    const container = document.getElementById('counterfactual-analysis');
    if (!container) return;
    
    let html = '<div class="counterfactual-items">';
    
    this.counterfactuals.forEach(item => {
      html += `
        <div class="counterfactual-item">
          <div class="cf-factor">${this.formatFeatureName(item.factor)}</div>
          <div class="cf-change">
            <span class="cf-current">${item.current}</span>
            <span class="cf-arrow">→</span>
            <span class="cf-required">${item.required}</span>
          </div>
          <div class="cf-description">${item.description}</div>
        </div>
      `;
    });
    
    html += '</div>';
    html += `
      <div class="counterfactual-note">
        These changes would likely reverse the prediction from "Conflict Likely" to "No Conflict Expected"
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  renderSimilarCases() {
    const container = document.getElementById('similar-cases');
    if (!container) return;
    
    let html = '<div class="similar-cases-list">';
    
    this.similarCases.forEach(item => {
      const outcomeClass = item.outcome === 'Conflict' ? 'outcome-conflict' : 'outcome-safe';
      
      html += `
        <div class="similar-case-item">
          <div class="case-header">
            <span class="case-region">${item.region}</span>
            <span class="case-similarity">${Math.round(item.similarity * 100)}% match</span>
          </div>
          <div class="case-details">
            <span class="case-date">${item.date}</span>
            <span class="case-outcome ${outcomeClass}">${item.outcome}</span>
          </div>
          <div class="case-factors">
            <span class="case-factors-label">Key factors:</span>
            ${item.keyFactors.map(factor => `<span class="case-factor">${factor}</span>`).join('')}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
  }
  
  renderCausalDiagram() {
    const container = document.getElementById('causal-diagram');
    if (!container) return;
    
    // In a real implementation, this would create an interactive D3.js causal diagram
    // For demo purposes, we'll use a placeholder SVG diagram
    
    container.innerHTML = `
      <svg width="100%" height="220" class="causal-diagram-svg">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" 
                  orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#666" />
          </marker>
        </defs>
        
        <!-- Nodes -->
        <circle cx="100" cy="60" r="40" class="causal-node drought-node" />
        <text x="100" y="65" text-anchor="middle" class="node-label">Drought</text>
        
        <circle cx="250" cy="60" r="40" class="causal-node resource-node" />
        <text x="250" y="65" text-anchor="middle" class="node-label">Resource<tspan x="250" dy="15">Scarcity</tspan></text>
        
        <circle cx="400" cy="60" r="40" class="causal-node migration-node" />
        <text x="400" y="65" text-anchor="middle" class="node-label">Migration</text>
        
        <circle cx="175" cy="160" r="40" class="causal-node tension-node" />
        <text x="175" y="165" text-anchor="middle" class="node-label">Ethnic<tspan x="175" dy="15">Tensions</tspan></text>
        
        <circle cx="325" cy="160" r="40" class="causal-node conflict-node" />
        <text x="325" y="165" text-anchor="middle" class="node-label">Conflict</text>
        
        <!-- Edges -->
        <line x1="140" y1="60" x2="210" y2="60" stroke="#666" stroke-width="2" marker-end="url(#arrow)" />
        <line x1="290" y1="60" x2="360" y2="60" stroke="#666" stroke-width="2" marker-end="url(#arrow)" />
        <line x1="115" y1="95" x2="155" y2="125" stroke="#666" stroke-width="2" marker-end="url(#arrow)" />
        <line x1="250" y1="100" x2="205" y2="130" stroke="#666" stroke-width="2" marker-end="url(#arrow)" />
        <line x1="380" y1="95" x2="345" y2="125" stroke="#666" stroke-width="2" marker-end="url(#arrow)" />
        <line x1="215" y1="160" x2="285" y2="160" stroke="#666" stroke-width="2" marker-end="url(#arrow)" />
        
        <!-- Correlation strengths -->
        <text x="175" y="45" text-anchor="middle" class="correlation-label">0.72</text>
        <text x="325" y="45" text-anchor="middle" class="correlation-label">0.56</text>
        <text x="150" y="115" text-anchor="middle" class="correlation-label">0.48</text>
        <text x="235" y="125" text-anchor="middle" class="correlation-label">0.63</text>
        <text x="350" y="115" text-anchor="middle" class="correlation-label">0.51</text>
        <text x="250" y="145" text-anchor="middle" class="correlation-label">0.77</text>
      </svg>
    `;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  const explainableAI = new ExplainableAI('explainable-ai-container');
  explainableAI.initialize();
});