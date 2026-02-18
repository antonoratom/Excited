(() => {
    // Cache DOM elements
    const slider = document.getElementById('userSlider');
    const valueDisplay = document.getElementById('sliderValue');
    const userLabel = document.getElementById('userLabel');
    const sliderValueContainer = document.querySelector('.slider-value');
    const customThumb = document.getElementById('customThumb');
    const sliderPath = document.querySelector('.slider-path');
    const dots = document.querySelectorAll('.dot');
    const priceElements = document.querySelectorAll('[dynamic-price="target"]');
    const userPriceElements = document.querySelectorAll('[user-price]');
    const basicPlanElements = document.querySelectorAll('[basic-plan]');
    
    // Cache slider properties
    const THUMB_WIDTH = 24;
    const BASIC_PLAN_MAX = 10;
    let isDragging = false;
    
    // Store original prices
    const originalPrices = Array.from(priceElements).map(el => {
      const basePrice = parseFloat(el.getAttribute('data-base-price')) || 0;
      const hasBasicPlan = el.hasAttribute('basic-plan');
      
      console.log('Price element:', {
        dataBasePrice: el.getAttribute('data-base-price'),
        basePrice: basePrice,
        hasBasicPlan: hasBasicPlan,
        element: el
      });
      
      return {
        element: el,
        basePrice: basePrice,
        hasBasicPlan: hasBasicPlan
      };
    });
    
    // Extract clientX for mouse/touch events
    const getClientX = (e) => e.touches?.[0]?.clientX ?? e.clientX;
    
    // Calculate value from mouse position
    const getValueFromPosition = (clientX) => {
      const { left, width } = slider.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - left) / width));
      
      const { min, max, step } = slider;
      const rawValue = +min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      
      return Math.max(+min, Math.min(+max, steppedValue));
    };
    
    // Toggle transitions
    const setTransitions = (enabled) => {
      const transition = enabled ? '' : 'none';
      customThumb.style.transition = transition;
      sliderValueContainer.style.transition = transition;
      sliderPath.style.transition = transition;
    };
    
    // Update positions and filled path
    const updatePositions = (value) => {
      const percentage = (value - slider.min) / (slider.max - slider.min);
      const sliderWidth = slider.offsetWidth;
      const leftPosition = (THUMB_WIDTH / 2) + percentage * (sliderWidth - THUMB_WIDTH);
      
      customThumb.style.left = `${leftPosition - THUMB_WIDTH / 2}px`;
      sliderValueContainer.style.left = `${leftPosition}px`;
      sliderPath.style.width = `${leftPosition}px`;
    };
    
    // Update dots with progressive fill
    const updateDots = (value) => {
      dots.forEach(dot => {
        const dotValue = +dot.dataset.value;
        const isActive = dotValue === +value;
        const isFilled = +value >= dotValue;
        
        dot.classList.toggle('active', isActive);
        dot.classList.toggle('filled', isFilled);
      });
    };
    
    // Update dynamic prices
    const updatePrices = (value) => {
      const sliderValue = +value;
      
      originalPrices.forEach(({ element, basePrice, hasBasicPlan }) => {
        // For basic-plan elements, cap the multiplier at 10
        const effectiveValue = hasBasicPlan 
          ? Math.min(sliderValue, BASIC_PLAN_MAX)
          : sliderValue;
        
        const newPrice = basePrice * effectiveValue;
        const formatted = newPrice.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        
        console.log('Updating price:', {
          basePrice: basePrice,
          sliderValue: sliderValue,
          effectiveValue: effectiveValue,
          hasBasicPlan: hasBasicPlan,
          newPrice: newPrice,
          formatted: formatted
        });
        
        element.textContent = formatted;
      });
    };
    
    // Update basic-plan max state
    const updateBasicPlanMaxState = (value) => {
      const isOverMax = +value > BASIC_PLAN_MAX;
      basicPlanElements.forEach(el => {
        el.classList.toggle('reached-max', isOverMax);
      });
    };
    
    // Update user price class
    const updateUserPriceClass = (value) => {
      const isOne = +value === 1;
      userPriceElements.forEach(el => {
        el.classList.toggle('for-one', isOne);
      });
    };
    
    // Main update function
    const updateDisplay = (value) => {
      valueDisplay.textContent = value;
      userLabel.textContent = value === '1' ? 'user' : 'users';
      updateDots(value);
      updatePositions(+value);
      updatePrices(+value);
      updateUserPriceClass(value);
      updateBasicPlanMaxState(value);
    };
    
    // Drag handlers
    const startDrag = (e) => {
      isDragging = true;
      setTransitions(false);
      customThumb.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      
      const value = getValueFromPosition(getClientX(e));
      slider.value = value;
      updateDisplay(value);
      e.preventDefault();
    };
    
    const handleDrag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const value = getValueFromPosition(getClientX(e));
      slider.value = value;
      updateDisplay(value);
    };
    
    const stopDrag = () => {
      isDragging = false;
      setTransitions(true);
      customThumb.style.cursor = 'grab';
      document.body.style.userSelect = '';
    };
    
    // Event listeners
    const addDragListeners = (element) => {
      element.addEventListener('mousedown', startDrag);
      element.addEventListener('touchstart', startDrag, { passive: false });
    };
    
    addDragListeners(customThumb);
    addDragListeners(slider);
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
    
    slider.addEventListener('input', () => updateDisplay(slider.value));
    
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        slider.value = dot.dataset.value;
        updateDisplay(slider.value);
      });
    });
    
    window.addEventListener('resize', () => updateDisplay(slider.value));
    
    // Initialize
    const initialize = () => {
      slider.value = slider.value || slider.min;
      updateDisplay(slider.value);
    };
    
    document.readyState === 'loading' 
      ? document.addEventListener('DOMContentLoaded', initialize)
      : setTimeout(initialize, 100);
  })();
  