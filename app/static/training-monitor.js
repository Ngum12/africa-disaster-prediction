// Advanced Training Monitoring System
let trainingSocket;
let learningCurvesChart;

// Initialize websocket connection to training backend
function initializeTrainingMonitor() {
  // Close existing connection if any
  if (trainingSocket) {
    trainingSocket.close();
  }
  
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${window.location.host}/ws/training`;
  
  trainingSocket = new WebSocket(wsUrl);
  
  trainingSocket.onopen = function(e) {
    console.log("Training WebSocket connection established");
    document.getElementById('training-connection-status').textContent = 'Connected';
    document.getElementById('training-connection-status').className = 'connection-status connected';
  };
  
  trainingSocket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    updateTrainingUI(data);
  };
  
  trainingSocket.onclose = function(event) {
    if (event.wasClean) {
      console.log(`Training WebSocket connection closed cleanly, code=${event.code}, reason=${event.reason}`);
    } else {
      console.error('Training WebSocket connection died');
    }
    document.getElementById('training-connection-status').textContent = 'Disconnected';
    document.getElementById('training-connection-status').className = 'connection-status disconnected';
    
    // Try to reconnect after 5 seconds
    setTimeout(initializeTrainingMonitor, 5000);
  };
  
  trainingSocket.onerror = function(error) {
    console.error(`Training WebSocket error: ${error.message}`);
    document.getElementById('training-connection-status').textContent = 'Error';
    document.getElementById('training-connection-status').className = 'connection-status error';
  };
}

// Update the UI based on training status
function updateTrainingUI(data) {
  // Update progress bar
  const progressBar = document.getElementById('progress-bar');
  const progressPercent = document.getElementById('progress-percent');
  
  if (progressBar && progressPercent) {
    progressBar.style.width = `${data.progress}%`;
    progressPercent.textContent = `${data.progress}%`;
  }
  
  // Update training status indicator
  const statusElement = document.getElementById('training-status-indicator');
  if (statusElement) {
    statusElement.className = `status-indicator ${data.status}`;
    statusElement.textContent = data.status.charAt(0).toUpperCase() + data.status.slice(1);
  }
  
  // Update epoch counter
  const epochCounter = document.getElementById('epoch-counter');
  if (epochCounter && data.total_epochs > 0) {
    epochCounter.textContent = `Epoch ${data.current_epoch}/${data.total_epochs}`;
  }
  
  // Update training log
  const trainingLog = document.getElementById('training-log');
  if (trainingLog && data.log_messages) {
    trainingLog.innerHTML = data.log_messages.map(msg => `<div>${msg}</div>`).join('');
    trainingLog.scrollTop = trainingLog.scrollHeight;
  }
  
  // Update learning curves chart if available
  if (data.learning_curves && Object.keys(data.learning_curves).length > 0) {
    updateLearningCurvesChart(data.learning_curves);
  }
  
  // If training is complete, update metrics
  if (data.status === 'complete' && data.metrics) {
    updateModelMetrics(data.metrics);
  }
  
  // Show/hide appropriate UI elements based on status
  const trainingProgress = document.getElementById('training-progress');
  if (trainingProgress) {
    trainingProgress.style.display = data.status !== 'idle' ? 'block' : 'none';
  }
  
  const learningCurvesContainer = document.getElementById('learning-curves-container');
  if (learningCurvesContainer) {
    learningCurvesContainer.style.display = data.status === 'training' || data.status === 'complete' ? 'block' : 'none';
  }
}

// Initialize and update learning curves chart
function updateLearningCurvesChart(learningCurves) {
  const chartContainer = document.getElementById('learning-curves-chart');
  if (!chartContainer || !window.Plotly) return;
  
  const epochs = Array.from({length: learningCurves.training_loss.length}, (_, i) => i + 1);
  
  const traces = [
    {
      x: epochs,
      y: learningCurves.training_loss,
      type: 'scatter',
      mode: 'lines',
      name: 'Training Loss',
      line: { color: '#f44336' }
    },
    {
      x: epochs,
      y: learningCurves.validation_loss,
      type: 'scatter',
      mode: 'lines',
      name: 'Validation Loss',
      line: { color: '#ff9800' }
    },
    {
      x: epochs,
      y: learningCurves.training_accuracy,
      type: 'scatter',
      mode: 'lines',
      name: 'Training Accuracy',
      yaxis: 'y2',
      line: { color: '#2196f3' }
    },
    {
      x: epochs,
      y: learningCurves.validation_accuracy,
      type: 'scatter',
      mode: 'lines',
      name: 'Validation Accuracy',
      yaxis: 'y2',
      line: { color: '#4caf50' }
    }
  ];
  
  const layout = {
    title: 'Learning Curves',
    xaxis: { title: 'Epoch' },
    yaxis: { 
      title: 'Loss',
      side: 'left'
    },
    yaxis2: {
      title: 'Accuracy',
      overlaying: 'y',
      side: 'right',
      range: [0, 1]
    },
    legend: { x: 0, y: 1 }
  };
  
  if (learningCurvesChart) {
    // Update existing chart
    Plotly.react('learning-curves-chart', traces, layout);
  } else {
    // Create new chart
    Plotly.newPlot('learning-curves-chart', traces, layout);
    learningCurvesChart = true;
  }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeTrainingMonitor();
  
  // Add listener for retraining form
  const retrainForm = document.getElementById('retrain-form');
  if (retrainForm) {
    retrainForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Show training progress section
      const trainingProgress = document.getElementById('training-progress');
      if (trainingProgress) {
        trainingProgress.style.display = 'block';
      }
      
      // Collect training parameters
      const trainingParams = {
        data_source: document.getElementById('training-data')?.value || 'default',
        n_estimators: parseInt(document.getElementById('n-estimators')?.value || 100),
        max_depth: document.getElementById('max-depth')?.value || 'None',
        test_size: parseFloat(document.getElementById('test-size')?.value || 0.2)
      };
      
      if (document.getElementById('training-params-input')) {
        document.getElementById('training-params-input').value = JSON.stringify(trainingParams);
      }
      
      // Submit the form
      const formData = new FormData(this);
      
      fetch('/retrain', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .catch(error => {
        console.error('Error:', error);
      });
    });
  }
});