// Initialize machine inputs
let machineCount = 3;
const inputContainer = document.getElementById("machineInputs");

// Function to render machine inputs
function renderMachineInputs() {
  inputContainer.innerHTML = ""; // Clear existing inputs
  for (let i = 0; i < machineCount; i++) {
    const machineDiv = document.createElement("div");
    machineDiv.className = "machine-input";

    const label = document.createElement("label");
    label.innerHTML = `Machine ${i + 1}: `;

    const input = document.createElement("input");
    input.type = "number";
    input.id = `machine${i}`;
    input.placeholder = i === 0 ? "Baseline (0%)" : "% relative to machine 1";
    input.value = i === 0 ? "0" : "";

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.className = "remove-machine";
    removeButton.onclick = () => removeMachine(i);

    machineDiv.appendChild(label);
    machineDiv.appendChild(input);
    if (i > 0) machineDiv.appendChild(removeButton); // Don't allow removing the baseline machine

    inputContainer.appendChild(machineDiv);
  }
}

// Function to add a new machine
function addMachine() {
  machineCount++;
  renderMachineInputs();
}

function ensureThreeMachines() {
  while (machineCount < 3) {
    addMachine();
  }
}

// Function to remove a machine
function removeMachine(index) {
  if (machineCount > 1) {
    machineCount--;
    renderMachineInputs();
  }
}

// Attach event listener to "Add Machine" button
document.getElementById("addMachineButton").addEventListener("click", addMachine);

// Initial render
renderMachineInputs();

// Debug mode toggle
document.getElementById("debugMode").addEventListener("change", function() {
  document.getElementById("debugInfo").style.display = this.checked ? "block" : "none";
});

// Tab functionality
function openTab(evt, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  
  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Load example 1
function loadExample1() {
  ensureThreeMachines(); // Ensure at least 3 machines
  document.getElementById("machine0").value = "0";
  document.getElementById("machine1").value = "75";
  document.getElementById("machine2").value = "-30";
  for (let i = 3; i < machineCount; i++) {
    document.getElementById(`machine${i}`).value = "";
  }
  document.getElementById("totalTime").value = "600";
  
  // Switch to calculator tab
  const calculatorTab = document.querySelector('.tablinks');
  calculatorTab.click();
  
  // Calculate results
  calculateOptimalSplit();
}

// Load example 2
function loadExample2() {
  ensureThreeMachines(); // Ensure at least 3 machines
  document.getElementById("machine0").value = "0";
  document.getElementById("machine1").value = "0";
  document.getElementById("machine2").value = "50";
  for (let i = 3; i < machineCount; i++) {
    document.getElementById(`machine${i}`).value = "";
  }
  document.getElementById("totalTime").value = "600";
  
  // Switch to calculator tab
  const calculatorTab = document.querySelector('.tablinks');
  calculatorTab.click();
  
  // Calculate results
  calculateOptimalSplit();
}

// Load example 3
function loadExample3() {
  ensureThreeMachines(); // Ensure at least 3 machines
  document.getElementById("machine0").value = "0";
  document.getElementById("machine1").value = "0";
  document.getElementById("machine2").value = "-50";
  for (let i = 3; i < machineCount; i++) {
    document.getElementById(`machine${i}`).value = "";
  }
  document.getElementById("totalTime").value = "600";
  
  // Switch to calculator tab
  const calculatorTab = document.querySelector('.tablinks');
  calculatorTab.click();
  
  // Calculate results
  calculateOptimalSplit();
}

// Helper function to calculate GCD
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Helper function to calculate LCM
function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

// Helper function to calculate LCM of an array of numbers
function calculateLeastCommonMultiple(numbers) {
  return numbers.reduce((acc, num) => lcm(acc, num), 1);
}

// Fallback model for when no solution is found within maxChunks
// Fallback model for when no solution is found within maxChunks
function useFallbackModel(baseTime, speeds, normalizedSpeeds, machineNames, resultBox, debugMode) {
    const debugInfo = document.getElementById("debugInfo");
    if (debugMode) {
      debugInfo.textContent += "\n\nSwitching to fallback model...\n";
    }
    
    const maxFallbackChunks = 200;
    let best = null;
    
    // Try different total chunk counts
    for (let totalChunks = speeds.length; totalChunks <= maxFallbackChunks; totalChunks++) {
      // For the specific case of (0,5,7) and similar inputs
      if (speeds.length === 3) {
        // Calculate initial distribution based on speeds
        const speedSum = normalizedSpeeds.reduce((a, b) => a + b, 0);
        const initialDistribution = normalizedSpeeds.map(speed => 
          Math.max(1, Math.round(totalChunks * speed / speedSum))
        );
        
        // Adjust to ensure sum equals totalChunks
        let sum = initialDistribution.reduce((a, b) => a + b, 0);
        let diff = totalChunks - sum;
        
        // Adjust chunks to match totalChunks
        let idx = 0;
        while (diff !== 0) {
          initialDistribution[idx % speeds.length] += diff > 0 ? 1 : -1;
          diff += diff > 0 ? -1 : 1;
          idx++;
        }
        
        // Calculate completion times
        const times = initialDistribution.map((chunks, i) => 
          chunks * (baseTime / totalChunks) / normalizedSpeeds[i]
        );
        
        // Calculate wait time
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        const waitTime = maxTime - minTime;
        
        if (!best || waitTime < best.waitTime) {
          best = {
            totalChunks,
            distribution: initialDistribution,
            times,
            waitTime,
            percentages: initialDistribution.map(c => (c / totalChunks * 100).toFixed(1) + "%")
          };
          
          if (debugMode) {
            debugInfo.textContent += `  Fallback found: Wait time = ${waitTime.toFixed(4)}, Distribution = ${initialDistribution.join("-")}\n`;
          }
          
          // If we have a decent solution, stop searching
          if (waitTime < 1) {
            break;
          }
        }
      } else {
        // For other number of machines, use a more general approach
        
        // Calculate initial distribution based on machine speeds
        const speedSum = normalizedSpeeds.reduce((a, b) => a + b, 0);
        const initialDistribution = normalizedSpeeds.map(speed => 
          Math.max(1, Math.round(totalChunks * speed / speedSum))
        );
        
        // Adjust to ensure sum equals totalChunks
        let sum = initialDistribution.reduce((a, b) => a + b, 0);
        let diff = totalChunks - sum;
        
        // Adjust chunks to match totalChunks
        while (diff !== 0) {
          if (diff > 0) {
            // Add chunks to fastest machines first
            const fastestIdx = normalizedSpeeds.indexOf(Math.max(...normalizedSpeeds));
            initialDistribution[fastestIdx]++;
            diff--;
          } else {
            // Remove chunks from slowest machines first
            const slowestIdx = normalizedSpeeds.indexOf(Math.min(...normalizedSpeeds));
            if (initialDistribution[slowestIdx] > 1) {
              initialDistribution[slowestIdx]--;
              diff++;
            } else {
              // If we can't reduce chunks from slowest machine, find next slowest
              let tempSpeeds = [...normalizedSpeeds];
              tempSpeeds[slowestIdx] = Infinity;
              const nextSlowestIdx = tempSpeeds.indexOf(Math.min(...tempSpeeds));
              if (initialDistribution[nextSlowestIdx] > 1) {
                initialDistribution[nextSlowestIdx]--;
                diff++;
              } else {
                // If we can't reduce any further, just break
                break;
              }
            }
          }
        }
        
        // Calculate completion times
        const times = initialDistribution.map((chunks, i) => 
          chunks * (baseTime / totalChunks) / normalizedSpeeds[i]
        );
        
        // Calculate wait time
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        const waitTime = maxTime - minTime;
        
        if (!best || waitTime < best.waitTime) {
          best = {
            totalChunks,
            distribution: initialDistribution,
            times,
            waitTime,
            percentages: initialDistribution.map(c => (c / totalChunks * 100).toFixed(1) + "%")
          };
          
          if (debugMode) {
            debugInfo.textContent += `  Fallback found: Wait time = ${waitTime.toFixed(4)}, Distribution = ${initialDistribution.join("-")}\n`;
          }
          
          // If we have a decent solution, stop searching
          if (waitTime < 1) {
            break;
          }
        }
      }
      
      // For smaller chunk counts, also try exhaustive search
      if (totalChunks <= 32 && speeds.length <= 5) {
        const distributions = generateAllDistributions(totalChunks, speeds.length);
        
        for (const dist of distributions) {
          const times = dist.map((chunks, i) => 
            chunks * (baseTime / totalChunks) / normalizedSpeeds[i]
          );
          
          const maxTime = Math.max(...times);
          const minTime = Math.min(...times);
          const waitTime = maxTime - minTime;
          
          if (!best || waitTime < best.waitTime) {
            best = {
              totalChunks,
              distribution: dist,
              times,
              waitTime,
              percentages: dist.map(c => (c / totalChunks * 100).toFixed(1) + "%")
            };
            
            if (debugMode) {
              debugInfo.textContent += `  Exhaustive search found: Wait time = ${waitTime.toFixed(4)}, Distribution = ${dist.join("-")}\n`;
            }
          }
        }
        
        // If we found a very good solution, we can stop
        if (best && best.waitTime < 1) {
          break;
        }
      }
    }
  
    if (!best) {
      resultBox.value = "No solution found with fallback algorithm within 200 chunks.";
      return null;
    }
  
    if (debugMode) {
      debugInfo.textContent += `\nBest fallback solution found: Wait time = ${best.waitTime.toFixed(2)} minutes\n`;
    }
    
    return best;
  }

  // Helper function to generate all possible distributions of chunks
function generateAllDistributions(totalChunks, numMachines) {
    const result = [];
    
    function generate(current, remaining, idx) {
      if (idx === numMachines - 1) {
        result.push([...current, remaining]);
        return;
      }
      
      for (let i = 0; i <= remaining; i++) {
        current.push(i);
        generate(current, remaining - i, idx + 1);
        current.pop();
      }
    }
    
    generate([], totalChunks, 0);
    return result;
  }

// Algorithm for optimal split calculation
function calculateOptimalSplit() {
  const baseTime = parseFloat(document.getElementById("totalTime").value);
  const maxChunks = parseInt(document.getElementById("maxChunks").value);
  const maxWaitTime = parseFloat(document.getElementById("maxWaitTime").value);
  const enforceNonZero = document.getElementById("enforceNonZero").checked;
  const debugMode = document.getElementById("debugMode").checked;
  
  if (isNaN(baseTime) || baseTime <= 0) {
    alert("Please enter a valid time value greater than 0.");
    return;
  }
  
  if (isNaN(maxChunks) || maxChunks <= 0 || maxChunks > 1000) {
    alert("Please enter a valid chunk count between 1 and 1000.");
    return;
  }
  
  if (isNaN(maxWaitTime) || maxWaitTime < 0) {
    alert("Please enter a valid maximum wait time (>= 0).");
    return;
  }
  
  let speeds = [];
  let machineNames = [];
  let debugInfo = "Debug Information:\n\n";
  
  for (let i = 0; i < machineCount; i++) {
    const val = parseFloat(document.getElementById(`machine${i}`).value);
    if (isNaN(val)) continue; // machine excluded
    if (val <= -100) {
      alert(`Machine ${i+1} cannot be more than 100% slower (value <= -100%)`);
      return;
    }
    
    const relativeSpeed = 1 + (val / 100);
    speeds.push(relativeSpeed);
    machineNames.push(`Machine ${i + 1}`);
  }
  
  if (speeds.length < 2) {
    alert("Please provide data for at least two machines.");
    return;
  }
  
  const baseSpeed = speeds[0];
  const normalizedSpeeds = speeds.map(s => s / baseSpeed);
  
  debugInfo += `Machine count: ${speeds.length}\n`;
  debugInfo += `Relative speeds: ${speeds.join(", ")}\n`;
  debugInfo += `Normalized speeds: ${normalizedSpeeds.join(", ")}\n`;
  debugInfo += `Base time: ${baseTime} minutes\n`;
  debugInfo += `Max chunks: ${maxChunks}\n`;
  debugInfo += `Max wait time: ${maxWaitTime} minutes\n`;
  debugInfo += `Enforce non-zero: ${enforceNonZero}\n\n`;
  
  let best = null;
  const resultBox = document.getElementById("result");
  resultBox.value = "Calculating...";
  
  // Set up debug info display
  document.getElementById("debugInfo").textContent = debugInfo;
  
  // Function to generate all possible distributions
  function generateDistributions(totalChunks, machines, callback) {
    // Prepare an array to track the best distribution found
    let bestDistribution = null;
    let bestWaitTime = Infinity;
    
    function helper(current, remaining, index) {
      // If we've already found a solution better than maxWaitTime, we can return
      if (bestWaitTime <= maxWaitTime && totalChunks > machines * 2) {
        return true;
      }
      
      // If we're at the last machine, assign all remaining chunks to it
      if (index === machines - 1) {
        current.push(remaining);
        
        // Skip if enforceNonZero is true and any machine has 0 chunks
        if (enforceNonZero && current.includes(0)) {
          current.pop();
          return false;
        }
        
        // Calculate times for this distribution
        const times = current.map((chunks, i) => {
          return chunks * (baseTime / totalChunks) / normalizedSpeeds[i];
        });
        
        // Calculate wait time (difference between max and min non-zero time)
        const nonZeroTimes = times.filter((t, i) => current[i] > 0);
        const maxTime = Math.max(...nonZeroTimes);
        const minTime = Math.min(...nonZeroTimes);
        const waitTime = maxTime - minTime;
        
        // Update best if this is better
        if (waitTime < bestWaitTime) {
          bestWaitTime = waitTime;
          bestDistribution = [...current];
          
          // Call the callback with this distribution
          callback(bestDistribution, times, waitTime, totalChunks);
        }
        
        current.pop();
        return bestWaitTime <= maxWaitTime;
      }
      
      // Try different chunk counts for the current machine
      const minChunks = enforceNonZero ? 1 : 0;
      const maxChunksForThisMachine = remaining - (enforceNonZero ? (machines - index - 1) : 0);
      
      for (let i = minChunks; i <= maxChunksForThisMachine; i++) {
        current.push(i);
        const shouldBreak = helper(current, remaining - i, index + 1);
        current.pop();
        
        if (shouldBreak) return true;
      }
      
      return false;
    }
    
    // Start the recursive helper
    return helper([], totalChunks, 0);
  }
  
  // Start searching from a reasonable starting point
  setTimeout(() => {
    // Calculate a good starting point for chunks based on machine speeds
    let minChunksToConsider = speeds.length;
    
    // For the example case (0, 0, 50) we want at least enough chunks to proportionally distribute
    // Let's calculate a minimum number of chunks based on speed ratios
    const speedSum = normalizedSpeeds.reduce((sum, speed) => sum + speed, 0);
    const lcmValue = calculateLeastCommonMultiple(normalizedSpeeds.map(speed => Math.round(speed * 100)));
    minChunksToConsider = Math.max(minChunksToConsider, Math.ceil(lcmValue / 100));
    
    if (enforceNonZero) {
      minChunksToConsider = Math.max(minChunksToConsider, speeds.length);
    }
    
    debugInfo += `Starting search from ${minChunksToConsider} chunks\n\n`;
    
    let foundExactSolution = false;
    for (let totalChunks = minChunksToConsider; totalChunks <= maxChunks; totalChunks++) {
      debugInfo += `Trying ${totalChunks} chunks...\n`;
      
      const foundSolution = generateDistributions(totalChunks, speeds.length, (distribution, times, waitTime, chunks) => {
        // Update our best solution
        if (!best || waitTime < best.waitTime) {
          best = {
            totalChunks: chunks,
            distribution,
            times,
            waitTime,
            percentages: distribution.map(c => (c / chunks * 100).toFixed(1) + "%")
          };
          
          debugInfo += `  New best: Wait time = ${waitTime.toFixed(4)}, Distribution = ${distribution.join("-")}\n`;
        }
      });
      
      // If we found a good enough solution, break out
      if (foundSolution || (best && best.waitTime <= maxWaitTime && totalChunks >= speeds.length * 2)) {
        foundExactSolution = true;
        debugInfo += `Found solution within wait time threshold (${maxWaitTime} minutes)\n`;
        break;
      }
    }
    
    if (!foundExactSolution && best) {
      debugInfo += `Couldn't find solution within threshold. Best wait time: ${best.waitTime.toFixed(4)} minutes\n`;
    }
    
    // Display the debug info
    document.getElementById("debugInfo").textContent = debugInfo;
    
    // If no good solution found, try the fallback algorithm
    if (!best) {
      document.getElementById("debugInfo").textContent += "\nTrying fallback algorithm...\n";
      best = useFallbackModel(baseTime, speeds, normalizedSpeeds, machineNames, resultBox, debugMode);
      
      if (!best) {
        resultBox.value = `No optimal solution found within ${maxChunks} chunks.\nFallback algorithm also failed to find a solution.`;
        document.getElementById("visualization").innerHTML = "";
        return;
      }
    }
    
    // Format the output
    let output = `OPTIMAL WORK DISTRIBUTION\n`;
    output += `=========================\n\n`;
    output += `Total chunks: ${best.totalChunks}\n`;
    output += `Maximum completion time: ${Math.max(...best.times.filter((t, i) => best.distribution[i] > 0)).toFixed(2)} minutes\n`;
    output += `Wait time (difference between fastest and slowest): ${best.waitTime.toFixed(2)} minutes\n\n`;
    
    output += `DISTRIBUTION SUMMARY\n`;
    output += `===================\n`;
    best.distribution.forEach((chunks, i) => {
      const percentage = (chunks / best.totalChunks * 100).toFixed(1);
      output += `${machineNames[i]}: ${chunks} chunks (${percentage}% of total work)\n`;
    });
    
    output += `\nDETAILED RESULTS\n`;
    output += `===============\n`;
    best.distribution.forEach((chunks, i) => {
      output += `${machineNames[i]}:\n`;
      output += `  Speed: ${normalizedSpeeds[i].toFixed(2)}x base machine\n`;
      output += `  Chunks assigned: ${chunks} (${best.percentages[i]} of total work)\n`;
      
      if (chunks > 0) {
        output += `  Estimated completion time: ${best.times[i].toFixed(2)} minutes\n`;
        const speedup = baseTime / best.times[i];
        output += `  Speedup compared to base machine alone: ${speedup.toFixed(2)}x\n`;
      } else {
        output += `  No work assigned\n`;
      }
      output += `\n`;
    });
    
    // If there are machines with zero work, explain why
    const zeroWorkMachines = best.distribution.filter(chunks => chunks === 0).length;
    if (zeroWorkMachines > 0 && !enforceNonZero) {
      output += `NOTE: ${zeroWorkMachines} machine(s) were assigned no work. This is mathematically optimal but you can\nforce all machines to get work by enabling "Ensure all machines get work" in Advanced Settings.\n`;
    }
    
    resultBox.value = output;
    
    // Create visual representation
    createVisualization(best, machineNames, normalizedSpeeds);
  }, 10); // Small timeout to not block the UI
}

function createVisualization(result, machineNames, normalizedSpeeds) {
  const visContainer = document.getElementById("visualization");
  visContainer.innerHTML = "<h3>Visual Comparison</h3>";
  
  // Filter out machines with zero work for visualization
  const nonZeroMachineIndices = result.distribution.map((chunks, i) => ({chunks, i}))
                                .filter(item => item.chunks > 0)
                                .map(item => item.i);
  
  const maxTime = Math.max(...result.times.filter((_, i) => nonZeroMachineIndices.includes(i)));
  
  nonZeroMachineIndices.forEach(i => {
    const machineBar = document.createElement("div");
    machineBar.className = "machine-bar";
    
    const machineProgress = document.createElement("div");
    machineProgress.className = "machine-progress";
    machineProgress.style.width = `${(result.times[i] / maxTime) * 100}%`;
    machineProgress.textContent = `${machineNames[i]}: ${result.times[i].toFixed(2)} min`;
    
    machineBar.appendChild(machineProgress);
    visContainer.appendChild(machineBar);
  });
  
  // Add a comparison to a naive equal distribution
  visContainer.innerHTML += "<h3>Comparison: Optimized vs. Equal Distribution</h3>";
  
  // Create equal distribution (only for non-zero machines)
  const activeIndices = result.distribution.map((chunks, i) => i).filter(i => result.distribution[i] > 0);
  const equalChunks = result.totalChunks / activeIndices.length;
  
  const equalTimes = activeIndices.map(i => {
    const partTime = document.getElementById("totalTime").value / normalizedSpeeds[i];
    return equalChunks * (1 / result.totalChunks) * partTime;
  });
  
  const maxEqualTime = Math.max(...equalTimes);
  
  visContainer.innerHTML += "<p><strong>Optimized Distribution</strong></p>";
  
  activeIndices.forEach((i, index) => {
    const machineBar = document.createElement("div");
    machineBar.className = "machine-bar";
    
    const machineProgress = document.createElement("div");
    machineProgress.className = "machine-progress";
    machineProgress.style.width = `${(result.times[i] / maxEqualTime) * 100}%`;
    machineProgress.textContent = `${machineNames[i]}: ${result.times[i].toFixed(2)} min (${result.percentages[i]})`;

    machineBar.appendChild(machineProgress);
    visContainer.appendChild(machineBar);
  });

  visContainer.innerHTML += "<p><strong>Equal Distribution</strong></p>";

  activeIndices.forEach((i, index) => {
    const machineBar = document.createElement("div");
    machineBar.className = "machine-bar";

    const machineProgress = document.createElement("div");
    machineProgress.className = "machine-progress";
    machineProgress.style.width = `${(equalTimes[index] / maxEqualTime) * 100}%`;
    machineProgress.style.backgroundColor = "#ff9800";
    machineProgress.textContent = `${machineNames[i]}: ${equalTimes[index].toFixed(2)} min (equal time-based estimate)`;

    machineBar.appendChild(machineProgress);
    visContainer.appendChild(machineBar);
  });

  // Add efficiency comparison
  const optimizedTotal = Math.max(...result.times.filter((_, i) => result.distribution[i] > 0));
  const equalTotal = Math.max(...equalTimes);
  const improvement = ((equalTotal - optimizedTotal) / equalTotal * 100).toFixed(2);

  const efficiencyInfo = document.createElement("div");
  efficiencyInfo.innerHTML = `
    <p>
      <strong>Efficiency improvement: ${improvement}%</strong><br>
      Equal distribution completion time: ${equalTotal.toFixed(2)} minutes<br>
      Optimized distribution completion time: ${optimizedTotal.toFixed(2)} minutes<br>
      Time saved: ${(equalTotal - optimizedTotal).toFixed(2)} minutes
    </p>
  `;
  visContainer.appendChild(efficiencyInfo);
}