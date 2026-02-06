document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.nexus-nav-item_bl.blue-pulse');
    let pulsing = true;
    let lastPulseEndTime = Date.now();
    let lastPulsedElement = null;
  
    // Function to pulse a single element
    function pulseElement(element) {
      if (!pulsing) return;
  
      const now = Date.now();
      const timeSinceLastPulse = now - lastPulseEndTime;
      const minDelay = 1000; // 1.5s minimum
      const maxDelay = 1500; // 3s maximum
      const randomDelay = minDelay + Math.random() * (maxDelay - minDelay);
      
      // If not enough time has passed, wait the remaining time
      const actualDelay = Math.max(0, randomDelay - timeSinceLastPulse);
  
      setTimeout(() => {
        if (!pulsing) return;
  
        // Add active class (appears in 0.4s via CSS transition)
        element.classList.add('active');
  
        // Total animation time: 0.4s appear + 1s visible + 0.7s disappear = 2.1s
        setTimeout(() => {
          if (!pulsing) return;
          element.classList.remove('active');
          
          // Update the last pulse end time and element
          lastPulseEndTime = Date.now();
          lastPulsedElement = element;
          
          // Schedule next random element after this one finishes
          scheduleNextPulse();
        }, 1400); // 1s visible + 0.4s appear (removal happens instantly, then 0.7s CSS transition)
      }, actualDelay);
    }
  
    // Function to schedule the next pulse for a random element
    function scheduleNextPulse() {
      if (!pulsing || elements.length === 0) return;
      
      let randomElement;
      
      // If there's only one element, use it
      if (elements.length === 1) {
        randomElement = elements[0];
      } else {
        // Pick a random element that's different from the last one
        do {
          const randomIndex = Math.floor(Math.random() * elements.length);
          randomElement = elements[randomIndex];
        } while (randomElement === lastPulsedElement);
      }
      
      pulseElement(randomElement);
    }
  
    // Start the pulsing sequence
    scheduleNextPulse();
  
    // Stop pulsing on hover of any element
    elements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        pulsing = false;
        // Remove blue-pulse class from all elements
        elements.forEach(el => {
          el.classList.remove('blue-pulse', 'active');
        });
      });
    });
});
