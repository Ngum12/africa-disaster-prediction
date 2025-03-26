// Add to a new file: static/cosmic-prediction.js
document.addEventListener('DOMContentLoaded', function() {
  console.log('Cosmic Prediction script loaded');
  
  // Check if required elements exist
  const predictionSection = document.getElementById('prediction-section');
  const predictionForm = document.getElementById('prediction-form');
  
  if (!predictionSection) {
    console.error('Prediction section not found. Make sure you have an element with id "prediction-section"');
  }
  
  if (!predictionForm) {
    console.error('Prediction form not found. Make sure you have a form with id "prediction-form"');
  }
  
  // Initialize the cosmic background visualization
  initCosmicBackground();
  
  // Initialize sliders with visual feedback
  initializeSliders();
  
  // Set up counter buttons
  setupCounterButtons();
  
  // Handle form submission with animated transitions
  setupFormSubmission();
  
  // Connect close button for results
  document.getElementById('close-result-btn')?.addEventListener('click', function() {
    document.getElementById('prediction-result-wrapper').style.display = 'none';
  });
  
  // Handle live data button
  document.getElementById('live-data-btn')?.addEventListener('click', function() {
    populateLiveData();
    animateDataFill();
  });
});

function initializeSliders() {
  // Rainfall slider
  const rainfallSlider = document.getElementById('rainfall_mm');
  const rainfallDisplay = document.getElementById('rainfall_display');
  
  if (rainfallSlider && rainfallDisplay) {
    rainfallSlider.addEventListener('input', function() {
      rainfallDisplay.textContent = `${this.value}mm`;
    });
  }
  
  // Drought slider
  const droughtSlider = document.getElementById('drought_index');
  const droughtDisplay = document.getElementById('drought_display');
  
  if (droughtSlider && droughtDisplay) {
    droughtSlider.addEventListener('input', function() {
      droughtDisplay.textContent = this.value;
      
      // Update color gradient based on drought severity
      const value = parseFloat(this.value);
      let color;
      if (value < 0.3) {
        color = '#4caf50'; // Green - low drought
      } else if (value < 0.6) {
        color = '#ffeb3b'; // Yellow - moderate drought
      } else {
        color = '#f44336'; // Red - severe drought
      }
      
      droughtDisplay.style.color = color;
    });
  }
  
  // Temperature slider
  const tempSlider = document.getElementById('temp_celsius');
  const tempDisplay = document.getElementById('temp_display');
  
  if (tempSlider && tempDisplay) {
    tempSlider.addEventListener('input', function() {
      tempDisplay.textContent = `${this.value}°C`;
      
      // Update color based on temperature
      const value = parseFloat(this.value);
      let color;
      if (value < 15) {
        color = '#2196f3'; // Blue - cold
      } else if (value < 30) {
        color = '#ffeb3b'; // Yellow - moderate
      } else {
        color = '#f44336'; // Red - hot
      }
      
      tempDisplay.style.color = color;
    });
  }
  
  // Poverty slider
  const povertySlider = document.getElementById('poverty_rate');
  const povertyDisplay = document.getElementById('poverty_display');
  
  if (povertySlider && povertyDisplay) {
    povertySlider.addEventListener('input', function() {
      povertyDisplay.textContent = `${this.value}%`;
    });
  }
  
  // Literacy slider
  const literacySlider = document.getElementById('literacy_rate');
  const literacyDisplay = document.getElementById('literacy_display');
  
  if (literacySlider && literacyDisplay) {
    literacySlider.addEventListener('input', function() {
      literacyDisplay.textContent = `${this.value}%`;
    });
  }
  
  // Infrastructure slider
  const infrastructureSlider = document.getElementById('infrastructure_score');
  const infrastructureDisplay = document.getElementById('infrastructure_display');
  
  if (infrastructureSlider && infrastructureDisplay) {
    infrastructureSlider.addEventListener('input', function() {
      infrastructureDisplay.textContent = this.value;
    });
  }
}

function setupCounterButtons() {
  // Set up counter increase/decrease buttons
  document.querySelectorAll('.counter-btn').forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      
      if (input) {
        let value = parseInt(input.value) || 0;
        
        if (this.classList.contains('increase')) {
          value++;
        } else if (this.classList.contains('decrease') && value > 0) {
          value--;
        }
        
        input.value = value;
        
        // Trigger input event for any listeners
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
    });
  });
}

function setupFormSubmission() {
  const form = document.getElementById('prediction-form');
  const resultWrapper = document.getElementById('prediction-result-wrapper');
  
  if (form && resultWrapper) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Activate cosmic background effect
      const cosmicBackground = document.querySelector('.cosmic-background');
      if (cosmicBackground) {
        cosmicBackground.classList.add('prediction-active');
      }
      
      // Show loading state
      const resultText = document.getElementById('prediction-result-text');
      const confidenceText = document.getElementById('prediction-confidence');
      
      if (resultText) resultText.textContent = "Analyzing data...";
      if (confidenceText) confidenceText.textContent = "Running neural calculations...";
      
      // Show the wrapper with animation
      resultWrapper.style.display = 'block';
      setTimeout(() => {
        resultWrapper.classList.add('active');
      }, 10);
      
      // Add data scanning animation
      const formInputs = form.querySelectorAll('input');
      formInputs.forEach((input, index) => {
        setTimeout(() => {
          input.classList.add('scanning');
          // Remove scanning class after animation completes
          setTimeout(() => {
            input.classList.remove('scanning');
          }, 800);
        }, index * 120);
      });
      
      // Simulate API call
      setTimeout(function() {
        // Generate a prediction result based on the input values
        const droughtValue = parseFloat(document.getElementById('drought_index').value) || 0;
        const conflictValue = parseInt(document.getElementById('past_conflicts_3mo').value) || 0;
        
        // Simple logic for demo purposes
        let risk = 0.3; // Base risk
        risk += droughtValue * 0.3; // Drought contribution
        risk += (conflictValue / 20) * 0.4; // Past conflicts contribution
        
        // Cap between 0 and 1
        risk = Math.max(0, Math.min(1, risk));
        
        // Update gauge visualization
        updateGauge(risk);
        
        // Update prediction text
        const resultText = risk > 0.66 ? "Conflict Likely" : 
                          risk > 0.33 ? "Moderate Risk" : 
                          "Low Risk";
        
        document.getElementById('prediction-result-text').textContent = resultText;
        document.getElementById('prediction-confidence').textContent = `Confidence: ${Math.round(risk * 100)}%`;
        
        // Update confidence interval
        const lowerBound = Math.max(0, risk - 0.08);
        const upperBound = Math.min(1, risk + 0.08);
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the cosmic background visualization
            initCosmicBackground();
            
            // Initialize sliders with visual feedback
            initializeSliders();
            
            // Set up counter buttons
            setupCounterButtons();
            
            // Handle form submission with animated transitions
            setupFormSubmission();
            
            // Connect close button for results
            document.getElementById('close-result-btn')?.addEventListener('click', function() {
              document.getElementById('prediction-result-wrapper').style.display = 'none';
              document.querySelector('.cosmic-background').classList.remove('prediction-active');
            });
            
            // Handle live data button
            document.getElementById('live-data-btn')?.addEventListener('click', function() {
              this.classList.add('loading');
              this.innerHTML = '<span class="spinner-icon"></span> Retrieving Data...';
              
              setTimeout(() => {
                populateLiveData();
                animateDataFill();
                this.classList.remove('loading');
                this.innerHTML = 'Live Data Loaded <span class="checkmark">✓</span>';
                
                // Reset button after 3 seconds
                setTimeout(() => {
                  this.innerHTML = 'Use Live Data';
                }, 3000);
              }, 1500);
            });
            
            // Initialize predictive heatmap
            initPredictiveHeatmap();
            
            // Init factor relationship visualization
            initFactorRelationships();
          });
          
          // Create cosmic background
          function initCosmicBackground() {
            const predictionSection = document.querySelector('#prediction-section');
            if (!predictionSection) {
              console.error('Prediction section not found');
              return;
            }
            
            // Check if cosmic background already exists
            if (predictionSection.querySelector('.cosmic-background')) {
              return;
            }
            
            const cosmicBackground = document.createElement('div');
            cosmicBackground.className = 'cosmic-background';
            
            // Create animated particles
            for (let i = 0; i < 80; i++) {
              const particle = document.createElement('div');
              particle.className = 'cosmic-particle';
              
              // Randomize particle properties
              const size = Math.random() * 6 + 2;
              particle.style.width = `${size}px`;
              particle.style.height = `${size}px`;
              
              // Position randomly
              particle.style.left = `${Math.random() * 100}%`;
              particle.style.top = `${Math.random() * 100}%`;
              
              // Random animation duration and delay
              const duration = Math.random() * 30 + 20;
              const delay = Math.random() * 15;
              particle.style.animation = `float ${duration}s ${delay}s infinite`;
              
              // Random opacity
              particle.style.opacity = (Math.random() * 0.6 + 0.2).toString();
              
              // Random particle color
              const hue = Math.random() > 0.7 ? 
                          Math.random() * 30 + 200 :  // Blue shades
                          Math.random() * 30 + 320;   // Purple shades
              particle.style.backgroundColor = `hsl(${hue}, 100%, 70%)`;
              
              cosmicBackground.appendChild(particle);
            }
            
            // Insert before the first child of the prediction section
            try {
              const formWrapper = predictionSection.querySelector('.prediction-form-wrapper');
              if (formWrapper) {
                formWrapper.insertBefore(cosmicBackground, formWrapper.firstChild);
              } else {
                predictionSection.insertBefore(cosmicBackground, predictionSection.firstChild);
              }
              console.log('Cosmic background initialized');
            } catch (e) {
              console.error('Error adding cosmic background:', e);
            }
          }
          
          function initializeSliders() {
            // Rainfall slider
            const rainfallSlider = document.getElementById('rainfall_mm');
            const rainfallDisplay = document.getElementById('rainfall_display');
            
            if (rainfallSlider && rainfallDisplay) {
              rainfallSlider.addEventListener('input', function() {
                rainfallDisplay.textContent = `${this.value}mm`;
                
                // Set data attribute for visualization
                this.setAttribute('data-value', this.value);
                updateSliderVisualization(this, 'rainfall');
              });
              // Initialize visualization
              updateSliderVisualization(rainfallSlider, 'rainfall');
            }
            
            // Drought slider
            const droughtSlider = document.getElementById('drought_index');
            const droughtDisplay = document.getElementById('drought_display');
            
            if (droughtSlider && droughtDisplay) {
              droughtSlider.addEventListener('input', function() {
                droughtDisplay.textContent = this.value;
                
                // Update color gradient based on drought severity
                const value = parseFloat(this.value);
                let color;
                if (value < 0.3) {
                  color = '#4caf50'; // Green - low drought
                } else if (value < 0.6) {
                  color = '#ffeb3b'; // Yellow - moderate drought
                } else {
                  color = '#f44336'; // Red - severe drought
                }
                
                droughtDisplay.style.color = color;
                this.setAttribute('data-value', this.value);
                updateSliderVisualization(this, 'drought');
                
                // Update the dynamic atmosphere
                updateAtmosphericEffect(value);
              });
              // Initialize visualization
              updateSliderVisualization(droughtSlider, 'drought');
            }
            
            // Temperature slider
            const tempSlider = document.getElementById('temp_celsius');
            const tempDisplay = document.getElementById('temp_display');
            
            if (tempSlider && tempDisplay) {
              tempSlider.addEventListener('input', function() {
                tempDisplay.textContent = `${this.value}°C`;
                
                // Update color based on temperature
                const value = parseFloat(this.value);
                let color;
                if (value < 15) {
                  color = '#2196f3'; // Blue - cold
                } else if (value < 30) {
                  color = '#ffeb3b'; // Yellow - moderate
                } else {
                  color = '#f44336'; // Red - hot
                }
                
                tempDisplay.style.color = color;
                this.setAttribute('data-value', this.value);
                updateSliderVisualization(this, 'temperature');
              });
              // Initialize visualization
              updateSliderVisualization(tempSlider, 'temperature');
            }
            
            // Poverty slider
            const povertySlider = document.getElementById('poverty_rate');
            const povertyDisplay = document.getElementById('poverty_display');
            
            if (povertySlider && povertyDisplay) {
              povertySlider.addEventListener('input', function() {
                povertyDisplay.textContent = `${this.value}%`;
                this.setAttribute('data-value', this.value);
                updateSliderVisualization(this, 'poverty');
              });
              // Initialize visualization
              updateSliderVisualization(povertySlider, 'poverty');
            }
            
            // Literacy slider
            const literacySlider = document.getElementById('literacy_rate');
            const literacyDisplay = document.getElementById('literacy_display');
            
            if (literacySlider && literacyDisplay) {
              literacySlider.addEventListener('input', function() {
                literacyDisplay.textContent = `${this.value}%`;
                this.setAttribute('data-value', this.value);
                updateSliderVisualization(this, 'literacy');
              });
              // Initialize visualization
              updateSliderVisualization(literacySlider, 'literacy');
            }
            
            // Infrastructure slider
            const infrastructureSlider = document.getElementById('infrastructure_score');
            const infrastructureDisplay = document.getElementById('infrastructure_display');
            
            if (infrastructureSlider && infrastructureDisplay) {
              infrastructureSlider.addEventListener('input', function() {
                infrastructureDisplay.textContent = this.value;
                this.setAttribute('data-value', this.value);
                updateSliderVisualization(this, 'infrastructure');
              });
              // Initialize visualization
              updateSliderVisualization(infrastructureSlider, 'infrastructure');
            }
            
            // Add dynamic slider tracks with interactive feedback
            document.querySelectorAll('input[type="range"]').forEach(slider => {
              const sliderContainer = slider.parentElement;
              if (!sliderContainer.querySelector('.slider-track-container')) {
                const trackContainer = document.createElement('div');
                trackContainer.className = 'slider-track-container';
                
                const track = document.createElement('div');
                track.className = 'slider-track';
                
                const progress = document.createElement('div');
                progress.className = 'slider-progress';
                
                const bubbles = document.createElement('div');
                bubbles.className = 'slider-bubbles';
                
                // Create bubbles
                for (let i = 0; i < 8; i++) {
                  const bubble = document.createElement('div');
                  bubble.className = 'track-bubble';
                  bubbles.appendChild(bubble);
                }
                
                trackContainer.appendChild(track);
                trackContainer.appendChild(progress);
                trackContainer.appendChild(bubbles);
                
                // Insert after the slider
                slider.parentNode.insertBefore(trackContainer, slider.nextSibling);
                
                // Update progress initially
                updateSliderProgress(slider);
                
                // Listen for changes
                slider.addEventListener('input', function() {
                  updateSliderProgress(this);
                });
              }
            });
          }
          
          function updateSliderProgress(slider) {
            const progress = slider.nextSibling.querySelector('.slider-progress');
            const min = parseFloat(slider.min) || 0;
            const max = parseFloat(slider.max) || 100;
            const value = parseFloat(slider.value) || 0;
            
            const percentage = ((value - min) / (max - min)) * 100;
            progress.style.width = `${percentage}%`;
            
            // Update bubble animation based on value
            const bubbles = slider.nextSibling.querySelectorAll('.track-bubble');
            bubbles.forEach((bubble, index) => {
              const bubblePosition = (index / (bubbles.length - 1)) * 100;
              if (bubblePosition <= percentage) {
                bubble.classList.add('active');
                
                // Add popping animation occasionally for active bubbles
                if (Math.random() > 0.7) {
                  bubble.classList.add('pop');
                  setTimeout(() => {
                    bubble.classList.remove('pop');
                  }, 700);
                }
              } else {
                bubble.classList.remove('active');
              }
            });
          }
          
          function updateSliderVisualization(slider, type) {
            if (!slider) return;
            
            const container = slider.closest('.input-row');
            if (!container) return;
            
            const value = parseFloat(slider.value);
            const min = parseFloat(slider.min) || 0;
            const max = parseFloat(slider.max) || 100;
            const normalizedValue = (value - min) / (max - min); // 0 to 1
            
            // Find or create visualization element
            let vizElement = container.querySelector('.slider-visualization');
            if (!vizElement) {
              vizElement = document.createElement('div');
              vizElement.className = 'slider-visualization';
              container.appendChild(vizElement);
            }
            
            // Type-specific visualizations
            switch(type) {
              case 'rainfall':
                // Rain drop visualization
                vizElement.innerHTML = '';
                vizElement.className = 'slider-visualization rainfall-viz';
                
                const dropCount = Math.round(normalizedValue * 20) + 5;
                for (let i = 0; i < dropCount; i++) {
                  const drop = document.createElement('div');
                  drop.className = 'rain-drop';
                  
                  // Randomize drop properties
                  drop.style.left = `${Math.random() * 100}%`;
                  drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
                  drop.style.animationDelay = `${Math.random() * 2}s`;
                  drop.style.opacity = Math.random() * 0.7 + 0.3;
                  
                  vizElement.appendChild(drop);
                }
                break;
                
              case 'drought':
                // Cracked earth visualization
                vizElement.className = 'slider-visualization drought-viz';
                
                // Intensity of cracks based on drought value
                const crackIntensity = Math.max(0.1, normalizedValue);
                vizElement.style.setProperty('--crack-opacity', crackIntensity);
                break;
                
              case 'temperature':
                // Heat wave visualization
                vizElement.className = 'slider-visualization temperature-viz';
                
                // Color and intensity based on temperature
                const tempHue = 60 - normalizedValue * 60; // 60 (yellow) to 0 (red)
                vizElement.style.setProperty('--temp-hue', tempHue);
                vizElement.style.setProperty('--temp-intensity', normalizedValue);
                break;
                
              case 'poverty':
                // Economic inequality visualization
                vizElement.className = 'slider-visualization poverty-viz';
                vizElement.innerHTML = '';
                
                // Create bars representing economic distribution
                const barCount = 10;
                for (let i = 0; i < barCount; i++) {
                  const bar = document.createElement('div');
                  bar.className = 'poverty-bar';
                  
                  // Height based on inequality distribution
                  let height;
                  if (normalizedValue < 0.3) {
                    // More equal distribution
                    height = 0.5 + Math.random() * 0.5;
                  } else if (normalizedValue < 0.7) {
                    // Moderate inequality
                    height = i < barCount/2 ? 
                            0.8 + Math.random() * 0.2 : 
                            0.3 + Math.random() * 0.3;
                  } else {
                    // High inequality
                    height = i < barCount/3 ? 
                            0.9 + Math.random() * 0.1 : 
                            0.1 + Math.random() * 0.2;
                  }
                  
                  bar.style.height = `${height * 100}%`;
                  vizElement.appendChild(bar);
                }
                break;
                
              case 'literacy':
                // Book/education visualization
                vizElement.className = 'slider-visualization literacy-viz';
                vizElement.innerHTML = '';
                
                // Create stylized books representing literacy
                const bookCount = Math.round(normalizedValue * 10) + 2;
                for (let i = 0; i < bookCount; i++) {
                  const book = document.createElement('div');
                  book.className = 'literacy-book';
                  book.style.height = `${60 + Math.random() * 40}%`;
                  book.style.width = `${8 + Math.random() * 10}px`;
                  
                  // Random book colors
                  const hue = Math.random() * 360;
                  book.style.backgroundColor = `hsl(${hue}, 70%, 40%)`;
                  
                  vizElement.appendChild(book);
                }
                break;
                
              case 'infrastructure':
                // Building/road visualization
                vizElement.className = 'slider-visualization infrastructure-viz';
                vizElement.innerHTML = '';
                
                // Create a skyline based on infrastructure score
                const buildingCount = Math.round(normalizedValue * 8) + 2;
                for (let i = 0; i < buildingCount; i++) {
                  const building = document.createElement('div');
                  building.className = 'infrastructure-building';
                  
                  // Building height based on infrastructure value
                  const height = (0.3 + Math.random() * 0.7) * normalizedValue * 100;
                  building.style.height = `${height}%`;
                  building.style.left = `${(i / buildingCount) * 100}%`;
                  
                  // Create windows
                  const windowCount = Math.round((height / 100) * 8) + 1;
                  for (let j = 0; j < windowCount; j++) {
                    const windowEl = document.createElement('div');
                    windowEl.className = 'building-window';
                    // Random lit windows
                    if (Math.random() > 0.4) {
                      windowEl.classList.add('lit');
                    }
                    building.appendChild(windowEl);
                  }
                  
                  vizElement.appendChild(building);
                }
                break;
            }
          }
          
          function updateAtmosphericEffect(droughtValue) {
            const cosmicBackground = document.querySelector('.cosmic-background');
            if (!cosmicBackground) return;
            
            // Adjust the atmospheric effect based on drought severity
            if (droughtValue > 0.7) {
              cosmicBackground.classList.add('severe-condition');
              cosmicBackground.classList.remove('moderate-condition');
              cosmicBackground.classList.remove('normal-condition');
            } else if (droughtValue > 0.4) {
              cosmicBackground.classList.add('moderate-condition');
              cosmicBackground.classList.remove('severe-condition');
              cosmicBackground.classList.remove('normal-condition');
            } else {
              cosmicBackground.classList.add('normal-condition');
              cosmicBackground.classList.remove('severe-condition');
              cosmicBackground.classList.remove('moderate-condition');
            }
          }
          
          function setupCounterButtons() {
            // Set up counter increase/decrease buttons
            document.querySelectorAll('.counter-btn').forEach(button => {
              button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const input = document.getElementById(targetId);
                
                if (input) {
                  let value = parseInt(input.value) || 0;
                  
                  if (this.classList.contains('increase')) {
                    value++;
                    // Add pop animation to button
                    this.classList.add('pop-animation');
                  } else if (this.classList.contains('decrease') && value > 0) {
                    value--;
                    // Add shake animation if reaching zero
                    if (value === 0) {
                      this.classList.add('shake-animation');
                    }
                  }
                  
                  // Remove animations after they complete
                  setTimeout(() => {
                    this.classList.remove('pop-animation');
                    this.classList.remove('shake-animation');
                  }, 300);
                  
                  input.value = value;
                  
                  // Update conflict icons visualization
                  updateConflictIcons(targetId, value);
                  
                  // Trigger input event for any listeners
                  const event = new Event('input', { bubbles: true });
                  input.dispatchEvent(event);
                }
              });
            });
            
            // Initialize conflict icons for existing values
            const conflictInput = document.getElementById('past_conflicts_3mo');
            if (conflictInput) {
              updateConflictIcons('past_conflicts_3mo', conflictInput.value);
            }
          }
          
          function updateConflictIcons(inputId, value) {
            if (inputId !== 'past_conflicts_3mo') return;
            
            const container = document.getElementById('conflict-visualization');
            if (!container) return;
            
            // Clear existing icons
            container.innerHTML = '';
            
            // Create conflict icons
            for (let i = 0; i < value; i++) {
              const icon = document.createElement('div');
              icon.className = 'conflict-icon';
              
              // Add slight randomization for visual interest
              const rotation = Math.random() * 20 - 10;
              icon.style.transform = `rotate(${rotation}deg)`;
              
              // Add with animation
              setTimeout(() => {
                container.appendChild(icon);
                setTimeout(() => {
                  icon.classList.add('show');
                }, 10);
              }, i * 100);
            }
          }
          
          function setupFormSubmission() {
            const form = document.getElementById('prediction-form');
            const resultWrapper = document.getElementById('prediction-result-wrapper');
            
            if (form && resultWrapper) {
              form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Activate cosmic background effect
                document.querySelector('.cosmic-background').classList.add('prediction-active');
                
                // Show loading state
                document.getElementById('prediction-result-text').textContent = "Analyzing data...";
                document.getElementById('prediction-confidence').textContent = "Running neural calculations...";
                
                // Show the wrapper with animation
                resultWrapper.style.display = 'block';
                setTimeout(() => {
                  resultWrapper.classList.add('active');
                }, 10);
                
                // Add data scanning animation
                const formInputs = form.querySelectorAll('input');
                formInputs.forEach((input, index) => {
                  setTimeout(() => {
                    input.classList.add('scanning');
                    // Remove scanning class after animation completes
                    setTimeout(() => {
                      input.classList.remove('scanning');
                    }, 800);
                  }, index * 120);
                });
                
                // Simulate API call with progressive loading steps
                showPredictionProgress([
                  "Initializing neural network...",
                  "Processing environmental factors...",
                  "Analyzing socioeconomic variables...",
                  "Integrating historical conflict data...",
                  "Running multivariate prediction model...",
                  "Calculating confidence intervals..."
                ]);
                
                // Complete prediction after simulated processing time
                setTimeout(function() {
                  // Generate a prediction result based on the input values
                  const droughtValue = parseFloat(document.getElementById('drought_index').value) || 0;
                  const conflictValue = parseInt(document.getElementById('past_conflicts_3mo').value) || 0;
                  const rainfallValue = parseFloat(document.getElementById('rainfall_mm').value) || 50;
                  const tempValue = parseFloat(document.getElementById('temp_celsius').value) || 25;
                  const povertyValue = parseFloat(document.getElementById('poverty_rate').value) || 30;
                  const literacyValue = parseFloat(document.getElementById('literacy_rate').value) || 50;
                  const infrastructureValue = parseFloat(document.getElementById('infrastructure_score').value) || 50;
                  
                  // More sophisticated prediction algorithm
                  let risk = 0.2; // Base risk
                  
                  // Environmental factors (40% weight)
                  const environmentalRisk = (
                    (droughtValue * 2) + 
                    ((100 - rainfallValue) / 100) + 
                    ((tempValue - 20) / 30)
                  ) / 4;
                  
                  // Socioeconomic factors (30% weight)
                  const socioeconomicRisk = (
                    (povertyValue / 100) + 
                    ((100 - literacyValue) / 100) + 
                    ((100 - infrastructureValue) / 100)
                  ) / 3;
                  
                  // Historical conflict (30% weight)
                  const historicalRisk = Math.min(1, conflictValue / 10);
                  
                  // Calculate weighted risk
                  risk = (
                    (environmentalRisk * 0.4) + 
                    (socioeconomicRisk * 0.3) + 
                    (historicalRisk * 0.3)
                  );
                  
                  // Adjustment for interaction effects
                  if (droughtValue > 0.6 && povertyValue > 50) {
                    risk += 0.1; // Compound effect of drought and poverty
                  }
                  
                  if (conflictValue > 5 && infrastructureValue < 40) {
                    risk += 0.1; // Compound effect of conflict history and poor infrastructure
                  }
                  
                  // Cap between 0 and 1
                  risk = Math.max(0, Math.min(1, risk));
                  
                  // Update gauge visualization with animation
                  updateGauge(risk);
                  
                  // Update prediction text
                  const resultText = risk > 0.66 ? "Conflict Likely" : 
                                    risk > 0.33 ? "Moderate Risk" : 
                                    "Low Risk";
                  
                  document.getElementById('prediction-result-text').textContent = resultText;
                  document.getElementById('prediction-confidence').textContent = `Confidence: ${Math.round(risk * 100)}%`;
                  
                  // Update confidence interval
                  const lowerBound = Math.max(0, risk - 0.08);
                  const upperBound = Math.min(1, risk + 0.08);
                  document.getElementById('confidence-interval').textContent = 
                    `${Math.round(lowerBound * 100)}% - ${Math.round(upperBound * 100)}%`;
                  
                  // Generate factor contribution analysis
                  generateFactorContribution({
                    drought: droughtValue * 0.4,
                    rainfall: (100 - rainfallValue) / 100 * 0.2,
                    temperature: ((tempValue - 20) / 30) * 0.2,
                    poverty: (povertyValue / 100) * 0.3,
                    literacy: ((100 - literacyValue) / 100) * 0.2,
                    infrastructure: ((100 - infrastructureValue) / 100) * 0.2,
                    conflict_history: historicalRisk * 0.4
                  });
                  
                  // Update recommendation text based on risk level
                  updateRecommendationText(risk, {
                    drought: droughtValue,
                    conflict: conflictValue
                  });
                }, 3500); // Simulate processing time
              });
            }
          }
          
          function showPredictionProgress(steps) {
            let currentStep = 0;
            const progressElement = document.getElementById('prediction-confidence');
            
            if (!progressElement) return;
            
            // Show progress steps with timed intervals
            const progressInterval = setInterval(() => {
              if (currentStep < steps.length) {
                progressElement.textContent = steps[currentStep];
                currentStep++;
              } else {
                clearInterval(progressInterval);
              }
            }, 500);
          }
          
          function updateGauge(risk) {
            const gauge = document.getElementById('gauge-needle');
            const riskLevelText = document.getElementById('risk-level-text');
            
            if (!gauge) return;
            
            // Calculate rotation angle (0 = -90 degrees, 1 = 90 degrees)
            const rotation = (risk * 180) - 90;
            
            // Smooth animation of gauge needle
            gauge.style.transform = `rotate(${rotation}deg)`;
            
            // Set gauge color based on risk
            let gaugeColor;
            let riskText;
            
            if (risk < 0.33) {
              gaugeColor = '#4caf50'; // Green
              riskText = 'Low Risk';
            } else if (risk < 0.66) {
              gaugeColor = '#ff9800'; // Orange
              riskText = 'Moderate Risk';
            } else {
              gaugeColor = '#f44336'; // Red
              riskText = 'High Risk';
            }
            
            // Update gauge color
            gauge.style.backgroundColor = gaugeColor;
            
            // Add pulse effect to the gauge
            gauge.classList.add('pulse');
            setTimeout(() => {
              gauge.classList.remove('pulse');
            }, 1000);
            
            // Update risk level text with animation
            if (riskLevelText) {
              riskLevelText.textContent = riskText;
              riskLevelText.style.color = gaugeColor;
              riskLevelText.classList.add('pulse-text');
              setTimeout(() => {
                riskLevelText.classList.remove('pulse-text');
              }, 1000);
            }
            
            // Animate gauge value
            animateGaugeValue(risk);
          }
          
          function animateGaugeValue(targetRisk) {
            const valueDisplay = document.getElementById('gauge-value');
            if (!valueDisplay) return;
            
            let currentValue = 0;
            const duration = 2000; // 2 seconds
            const interval = 20; // update every 20ms
            const steps = duration / interval;
            const increment = targetRisk / steps;
            
            const animation = setInterval(() => {
              currentValue += increment;
              if (currentValue >= targetRisk) {
                currentValue = targetRisk;
                clearInterval(animation);
              }
              valueDisplay.textContent = `${Math.round(currentValue * 100)}%`;
            }, interval);
          }
          
          function generateFactorContribution(factors) {
            const container = document.getElementById('factor-contribution');
            if (!container) return;
            
            container.innerHTML = '';
            
            // Sort factors by contribution
            const sortedFactors = Object.entries(factors)
              .sort((a, b) => b[1] - a[1])
              .filter(factor => factor[1] > 0.05); // Only show significant factors
            
            // Generate factor bars
            sortedFactors.forEach(([factor, value], index) => {
              const factorRow = document.createElement('div');
              factorRow.className = 'factor-row';
              
              // Format factor name
              const formattedName = factor
                .replace(/_/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
              
              // Calculate percentage contribution
              const totalContribution = sortedFactors.reduce((sum, curr) => sum + curr[1], 0);
              const percentage = (value / totalContribution) * 100;
              
              // Choose color based on factor type
              let color;
              if (factor.includes('drought') || factor.includes('rainfall') || factor.includes('temperature')) {
                color = '#2196f3'; // Blue for environmental
              } else if (factor.includes('poverty') || factor.includes('literacy') || factor.includes('infrastructure')) {
                color = '#9c27b0'; // Purple for socioeconomic
              } else {
                color = '#f44336'; // Red for conflict
              }
              
              factorRow.innerHTML = `
                <div class="factor-name">${formattedName}</div>
                <div class="factor-bar-container">
                  <div class="factor-bar" style="width: ${percentage}%; background-color: ${color};">
                    <span class="factor-percentage">${Math.round(percentage)}%</span>
                  </div>
                </div>
              `;
              
              // Add with animation delay
              setTimeout(() => {
                container.appendChild(factorRow);
                
                // Animate bar filling
                setTimeout(() => {
                  factorRow.classList.add('show');
                }, 50);
              }, index * 200);
            });
          }
          
          function updateRecommendationText(risk, factors) {
            const recommendationsContainer = document.getElementById('prediction-recommendations');
            if (!recommendationsContainer) return;
            
            let recommendations = [];
            
            // Generate recommendations based on risk level and factors
            if (risk > 0.66) {
              // High risk recommendations
              recommendations.push("Activate emergency response protocol");
              
              if (factors.drought > 0.7) {
                recommendations.push("Establish drought relief coordination centers");
                recommendations.push("Deploy water resource management teams");
              }
              
              if (factors.conflict > 5) {
                recommendations.push("Implement conflict early warning monitoring");
                recommendations.push("Establish humanitarian corridors for vulnerable populations");
              }
              
              recommendations.push("Coordinate with regional peacekeeping forces");
              
            } else if (risk > 0.33) {
              // Moderate risk recommendations
              recommendations.push("Increase monitoring frequency in affected regions");
              
              if (factors.drought > 0.5) {
                recommendations.push("Strengthen water conservation initiatives");
              }
              
              if (factors.conflict > 3) {
                recommendations.push("Establish community conflict resolution mechanisms");
              }
              
              recommendations.push("Prepare resource mobilization contingency plans");
              
            } else {
              // Low risk recommendations
              recommendations.push("Maintain regular monitoring protocols");
              recommendations.push("Review preventative measures and resilience strategies");
              
              if (factors.drought > 0.3) {
                recommendations.push("Continue climate adaptation planning");
              }
            }
            
            // Add recommendations to container with animation
            recommendationsContainer.innerHTML = "";
            
            recommendations.forEach((recommendation, index) => {
              const recItem = document.createElement('div');
              recItem.className = 'recommendation-item';
              recItem.textContent = recommendation;
              
              // Add with animation
              setTimeout(() => {
                recommendationsContainer.appendChild(recItem);
                
                // Animate appearance
                setTimeout(() => {
                  recItem.classList.add('show');
                }, 50);
              }, index * 300);
            });
          }
          
          function populateLiveData() {
            // Simulate fetching live data
            const liveData = {
              rainfall_mm: Math.round(Math.random() * 80) + 20,
              drought_index: (Math.random() * 0.7 + 0.2).toFixed(2),
              temp_celsius: Math.round(Math.random() * 15) + 20,
              poverty_rate: Math.round(Math.random() * 30) + 30,
              literacy_rate: Math.round(Math.random() * 40) + 40,
              infrastructure_score: Math.round(Math.random() * 50) + 30,
              past_conflicts_3mo: Math.round(Math.random() * 8)
            };
            
            // Populate form with live data
            Object.entries(liveData).forEach(([id, value]) => {
              const input = document.getElementById(id);
              if (input) {
                input.value = value;
                
                // Trigger input event to update displays
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);
              }
            });
            
            // Update conflict visualization
            updateConflictIcons('past_conflicts_3mo', liveData.past_conflicts_3mo);
          }
          
          function animateDataFill() {
            const inputs = document.querySelectorAll('#prediction-form input');
            inputs.forEach(input => {
              input.classList.add('data-filled');
              setTimeout(() => {
                input.classList.remove('data-filled');
              }, 1000);
            });
          }
          
          function initPredictiveHeatmap() {
            const container = document.getElementById('prediction-heatmap');
            if (!container) return;
            
            // Create Africa map outline
            const mapSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            mapSvg.setAttribute("viewBox", "0 0 100 100");
            mapSvg.classList.add("africa-map-svg");
            
            // Simplified Africa continent path
            const africaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            africaPath.setAttribute("d", "M55,10 C50,12 45,15 42,20 C38,25 35,30 33,35 C30,40 25,45 22,50 C20,55 15,60 13,65 C12,70 15,75 18,80 C22,85 30,87 35,88 C40,89 45,90 50,90 C55,90 60,88 65,85 C70,82 75,78 78,75 C82,70 85,65 87,60 C89,55 90,50 88,45 C85,40 80,35 78,30 C75,25 72,20 70,15 C67,12 60,10 55,10 Z");
            africaPath.classList.add("africa-outline");
            
            mapSvg.appendChild(africaPath);
            
            // Create heatmap points for risk areas
            const hotspots = [
              {x: 55, y: 25, intensity: 0.9},  // Horn of Africa
              {x: 45, y: 45, intensity: 0.7},  // Central Africa
              {x: 30, y: 35, intensity: 0.8},  // West Africa
              {x: 55, y: 75, intensity: 0.5},  // Southern Africa
              {x: 65, y: 20, intensity: 0.6}   // East Africa
            ];
            
            hotspots.forEach(spot => {
              // Create multiple gradient circles for each hotspot
              for (let i = 0; i < 3; i++) {
                const radius = 10 + (i * 8);
                const opacity = 0.8 - (i * 0.25);
                
                const hotspotCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                hotspotCircle.setAttribute("cx", spot.x);
                hotspotCircle.setAttribute("cy", spot.y);
                hotspotCircle.setAttribute("r", radius);
                
                // Color based on intensity
                const hue = 60 - (spot.intensity * 60); // 60 (yellow) to 0 (red)
                hotspotCircle.style.fill = `hsla(${hue}, 100%, 50%, ${opacity * spot.intensity})`;
                
                // Add pulsing animation
                if (i === 0) {
                  hotspotCircle.classList.add("pulsing-hotspot");
                  hotspotCircle.style.animationDuration = `${3 + Math.random() * 2}s`;
                }
                
                mapSvg.appendChild(hotspotCircle);
              }
              
              // Add hotspot label
              const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
              label.setAttribute("x", spot.x);
              label.setAttribute("y", spot.y - 15);
              label.setAttribute("text-anchor", "middle");
              label.classList.add("hotspot-label");
              label.textContent = `${Math.round(spot.intensity * 100)}%`;
              mapSvg.appendChild(label);
            });
            
            container.appendChild(mapSvg);
          }
          
          function initFactorRelationships() {
            const container = document.getElementById('factor-relationships');
            if (!container) return;
            
            // Create an SVG for relationship visualization
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("viewBox", "0 0 300 200");
            svg.classList.add("relationship-svg");
            
            // Define nodes for factors
            const nodes = [
              {id: "drought", x: 60, y: 50, label: "Drought", color: "#f44336"},
              {id: "poverty", x: 150, y: 30, label: "Poverty", color: "#9c27b0"},
              {id: "conflict", x: 240, y: 50, label: "Conflict", color: "#ff9800"},
              {id: "resources", x: 150, y: 100, label: "Resources", color: "#4caf50"},
              {id: "governance", x: 150, y: 170, label: "Governance", color: "#2196f3"}
            ];
            
            // Define relationships between factors
            const relationships = [
              {source: "drought", target: "resources", strength: 0.8},
              {source: "resources", target: "poverty", strength: 0.7},
              {source: "poverty", target: "conflict", strength: 0.9},
              {source: "governance", target: "resources", strength: 0.6},
              {source: "governance", target: "conflict", strength: 0.7},
              {source: "drought", target: "conflict", strength: 0.5}
            ];
            
            // Draw connections first (so they're behind nodes)
            relationships.forEach(rel => {
              const source = nodes.find(n => n.id === rel.source);
              const target = nodes.find(n => n.id === rel.target);
              
              if (source && target) {
                // Draw connection line
                const connection = document.createElementNS("http://www.w3.org/2000/svg", "line");
                connection.setAttribute("x1", source.x);
                connection.setAttribute("y1", source.y);
                connection.setAttribute("x2", target.x);
                connection.setAttribute("y2", target.y);
                connection.classList.add("relationship-line");
                
                // Line thickness based on relationship strength
                connection.style.strokeWidth = `${rel.strength * 3}px`;
                
                // Line opacity also based on strength
                connection.style.opacity = 0.2 + (rel.strength * 0.5);
                
                svg.appendChild(connection);
                
                // Add strength label
                const labelX = (source.x + target.x) / 2;
                const labelY = (source.y + target.y) / 2 - 5;
                const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                label.setAttribute("x", labelX);
                label.setAttribute("y", labelY);
                label.setAttribute("text-anchor", "middle");
                label.classList.add("relationship-strength");
                label.textContent = `${Math.round(rel.strength * 100)}%`;
                svg.appendChild(label);
              }
            });
            
            // Draw nodes
            nodes.forEach(node => {
              // Create node circle
              const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              circle.setAttribute("cx", node.x);
              circle.setAttribute("cy", node.y);
              circle.setAttribute("r", 15);
              circle.classList.add("factor-node");
              circle.style.fill = node.color;
              svg.appendChild(circle);
              
              // Create node label
              const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
              label.setAttribute("x", node.x);
              label.setAttribute("y", node.y + 25);
              label.setAttribute("text-anchor", "middle");
              label.classList.add("factor-label");
              label.textContent = node.label;
              svg.appendChild(label);
            });
            
            container.appendChild(svg);
          }