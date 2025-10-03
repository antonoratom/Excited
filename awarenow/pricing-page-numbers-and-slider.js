class SmoothSlider {
  constructor(container) {
    this.container = container;
    this.elements = this.cacheElements();
    
    this.config = {
      maxSteps: 5,
      animation: { duration: 0.5, ease: "power2.out" },
      stepRanges: [
        { value: '5000-target', display: '5,000', range: [5000, 0] },
        { value: '5000-10000-target', display: '5,000-10,000', range: [5000, 10000] },
        { value: '10000-20000-target', display: '10,000-20,000', range: [10000, 20000] },
        { value: '20000-30000-target', display: '20,000-30,000', range: [20000, 30000] },
        { value: '30000-40000-target', display: '30,000-40,000', range: [30000, 40000] },
        { value: '40000plus-target', display: '40,000+', range: [40000, 0], plus: true }
      ],
      pricingTriggers: {
        0: { platform: 'aware-platform', capture: 'aware-capture' },
        1: { platform: 'aware-platform-5-10', capture: 'aware-capture-5-10' },
        2: { platform: 'aware-platform-10-20', capture: 'aware-capture-10-20' },
        3: { platform: 'aware-platform-20-30', capture: 'aware-capture-20-30' },
        4: { platform: 'aware-platform-30-40', capture: 'aware-capture-30-40' },
        5: { platform: 'aware-platform-40-', capture: 'aware-capture-40-' }
      },
      pricingSelectors: [
        'aware-platform-monthly-slider',
        'aware-platform-annual-slider', 
        'aware-capture-monthly-slider',
        'aware-capture-annual-slider'
      ]
    };
    
    this.state = {
      currentStep: 0,
      isDragging: false,
      trackRect: null,
      animation: null,
      isInitialized: false
    };

    this.utils = {
      $(selector, context = document) { return context.querySelector(selector); },
      $$(selector, context = document) { return Array.from(context.querySelectorAll(selector)); },
      
      parseNumeric: (text) => {
        if (!text) return null;
        const num = parseFloat(text.toString().replace(/[$,\s€£¥]/g, ''));
        return isNaN(num) ? null : num;
      },
      
      formatNumber: (value, originalFormat) => {
        const patterns = {
          hasCommas: originalFormat?.includes(','),
          currency: originalFormat?.match(/[$€£¥]/)?.[0] || '',
          decimals: originalFormat?.match(/\.(\\d+)/)?.[1]?.length || (value % 1 !== 0 ? 2 : 0)
        };
        
        let formatted = value.toFixed(patterns.decimals);
        
        if (patterns.hasCommas && value >= 1000) {
          const [whole, decimal] = formatted.split('.');
          formatted = [whole.replace(/\B(?=(\d{3})+(?!\d))/g, ','), decimal].filter(Boolean).join('.');
        }
        
        return patterns.currency + formatted;
      },
      
      // NEW: Format pricing numbers without decimals, always with thousand separators
      formatPricingNumber: (value, originalFormat) => {
        const currency = originalFormat?.match(/[$€£¥]/)?.[0] || '';
        const rounded = Math.round(value);
        const formatted = rounded.toLocaleString('en-US');
        return currency + formatted;
      },
      
      getElementValue: (element) => element?.textContent?.trim() || element?.value?.trim() || element?.innerText?.trim() || '',
      
      getVisibleTemplate: () => {
        const templateItems = this.utils.$$('.currencies-template_cl [selected-currency]');
        return templateItems.find(item => 
          ['flex', 'block'].some(display => 
            window.getComputedStyle(item).display === display || item.style.display === display
          )
        );
      }
    };

    this.init();
  }

  cacheElements() {
    return {
      track: this.container.querySelector('.slider-track'),
      fill: this.container.querySelector('.slider-fill'),
      handle: this.container.querySelector('.slider-handle'),
      steps: [...this.container.querySelectorAll('.step')],
      get target() {
        return document.querySelector('[city-residents="number-target"]');
      }
    };
  }

  init() {
    this.setupSteps();
    this.bindEvents();
    this.setupCurrencyIntegration();
    this.updateSlider(0, false);
    
    setTimeout(() => {
      this.initializePricingTargets();
      this.state.isInitialized = true;
    }, 200);
  }

  setupCurrencyIntegration() {
    document.addEventListener('change', (e) => {
      if (e.target.type === 'radio' && e.target.closest('.currency-dropdown_cl')) {
        setTimeout(() => this.updatePricingTargets(true), 150);
      }
    });

    const observer = new MutationObserver(() => {
      if (this.state.isInitialized) {
        setTimeout(() => this.updatePricingTargets(true), 100);
      }
    });

    const templateCollection = this.utils.$('.currencies-template_cl');
    if (templateCollection) {
      observer.observe(templateCollection, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
    }

    const currencyCheckbox = this.utils.$('.currency-select-checkbox');
    if (currencyCheckbox) {
      currencyCheckbox.addEventListener('change', () => {
        setTimeout(() => this.updatePricingTargets(true), 100);
      });
    }
  }

  setupSteps() {
    this.elements.steps.forEach((step, i) => {
      const position = (i / this.config.maxSteps) * 100;
      Object.assign(step, {
        style: { left: `${position}%`, position: 'absolute', transform: 'translateX(-50%)' },
        dataset: { step: i, range: this.config.stepRanges[i]?.range.join('-') || '' }
      });
    });
  }

  bindEvents() {
    const handlers = {
      handle: {
        mousedown: e => this.startDrag(e.clientX),
        touchstart: e => this.startDrag(e.touches[0].clientX)
      },
      document: {
        mousemove: e => this.state.isDragging && this.drag(e.clientX),
        touchmove: e => this.state.isDragging && this.drag(e.touches[0].clientX, e),
        mouseup: () => this.endDrag(),
        touchend: () => this.endDrag()
      },
      track: {
        click: e => !this.state.isDragging && this.jumpToPosition(e)
      }
    };

    Object.entries(handlers).forEach(([target, events]) => {
      const element = target === 'document' ? document : this.elements[target];
      Object.entries(events).forEach(([event, handler]) => 
        element?.addEventListener(event, handler)
      );
    });
  }

  startDrag(clientX) {
    Object.assign(this.state, {
      isDragging: true,
      trackRect: this.elements.track.getBoundingClientRect()
    });
    this.toggleDragClass(true);
  }

  drag(clientX, event) {
    event?.preventDefault();
    const percentage = this.getPercentage(clientX);
    this.updateVisuals(percentage);
    this.updateStepIndicators(this.findNearestStep(percentage));
  }

  endDrag() {
    if (!this.state.isDragging) return;
    this.state.isDragging = false;
    this.toggleDragClass(false);
    this.snapToNearestStep();
  }

  jumpToPosition(e) {
    const rect = this.elements.track.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    this.updateSlider(this.findNearestStep(percentage));
  }

  getPercentage(clientX) {
    const { trackRect } = this.state;
    if (!trackRect) return 0;
    const x = clientX - trackRect.left;
    return Math.max(0, Math.min(100, (x / trackRect.width) * 100));
  }

  findNearestStep(percentage) {
    return [...Array(this.config.maxSteps + 1)].map((_, i) => ({
      step: i,
      distance: Math.abs(percentage - (i / this.config.maxSteps) * 100)
    })).sort((a, b) => a.distance - b.distance)[0].step;
  }

  snapToNearestStep() {
    const percentage = parseFloat(this.elements.handle.style.left) || 0;
    this.updateSlider(this.findNearestStep(percentage));
  }

  updateSlider(step, animate = true) {
    if (step < 0 || step > this.config.maxSteps) return;

    this.state.currentStep = step;
    const percentage = (step / this.config.maxSteps) * 100;
    
    this.updateVisuals(percentage);
    this.updateStepIndicators(step);
    this.updateValue(step, animate);
    
    if (this.state.isInitialized) {
      this.updatePricingTargets(animate);
    }
    
    this.emit('cityResidentsChanged', this.config.stepRanges[step]);
  }

  updateVisuals(percentage) {
    Object.assign(this.elements.handle.style, { left: `${percentage}%` });
    Object.assign(this.elements.fill.style, { width: `${percentage}%` });
  }

  updateStepIndicators(activeStep) {
    this.elements.steps.forEach((step, i) => 
      step.classList.toggle('active', i <= activeStep)
    );
  }

  updateValue(step, animate = true) {
    const target = this.elements.target;
    if (!target) return;

    const stepData = this.config.stepRanges[step];
    const isInput = target.tagName === 'INPUT';

    if (!animate) {
      this.setTargetValue(target, stepData, isInput);
      return;
    }

    this.animateValue(target, stepData, isInput);
  }

  getCurrentPricingValues() {
    const visibleTemplate = this.utils.getVisibleTemplate();
    if (!visibleTemplate) return { platformValue: null, captureValue: null };

    const currentStep = this.state.currentStep;
    const triggers = this.config.pricingTriggers[currentStep];
    
    if (!triggers) return { platformValue: null, captureValue: null };

    const platformTrigger = this.utils.$(`[${triggers.platform}="trigger"]`, visibleTemplate);
    const captureTrigger = this.utils.$(`[${triggers.capture}="trigger"]`, visibleTemplate);

    const platformValue = this.utils.parseNumeric(this.utils.getElementValue(platformTrigger));
    const captureValue = this.utils.parseNumeric(this.utils.getElementValue(captureTrigger));

    console.log(`Step ${currentStep}: Using triggers [${triggers.platform}] = ${platformValue}, [${triggers.capture}] = ${captureValue}`);

    return { platformValue, captureValue };
  }

  initializePricingTargets() {
    const visibleTemplate = this.utils.getVisibleTemplate();
    if (!visibleTemplate) {
      setTimeout(() => this.initializePricingTargets(), 300);
      return;
    }

    console.log('Initializing pricing targets for step:', this.state.currentStep);
    
    if (this.state.currentStep === 5) {
      this.setPricingTargetValues('aware-platform-monthly-slider', 'Custom');
      this.setPricingTargetValues('aware-platform-annual-slider', 'Custom');
      this.setPricingTargetValues('aware-capture-monthly-slider', 'Custom');
      this.setPricingTargetValues('aware-capture-annual-slider', 'Custom');
      return;
    }

    const { platformValue, captureValue } = this.getCurrentPricingValues();

    if (platformValue !== null) {
      this.setPricingTargetValues('aware-platform-monthly-slider', platformValue);
      this.setPricingTargetValues('aware-platform-annual-slider', platformValue * 12);
    }

    if (captureValue !== null) {
      this.setPricingTargetValues('aware-capture-monthly-slider', captureValue);
      this.setPricingTargetValues('aware-capture-annual-slider', captureValue * 12);
    }
  }

  setPricingTargetValues(attribute, value) {
    const targets = this.utils.$$(`[${attribute}="target"]`);
    
    targets.forEach(target => {
      let displayValue;
      
      if (typeof value === 'string' && value === 'Custom') {
        displayValue = 'Custom';
      } else {
        const existingValue = this.utils.getElementValue(target);
        const currency = existingValue?.match(/[$€£¥]/)?.[0] || '';
        displayValue = this.utils.formatPricingNumber(value, existingValue || currency + '0');
      }
      
      target.textContent = displayValue;
      console.log(`Set ${attribute}: ${displayValue}`);
    });
  }

  updatePricingTargets(animate = true) {
    setTimeout(() => {
      const visibleTemplate = this.utils.getVisibleTemplate();
      if (!visibleTemplate) return;

      if (this.state.currentStep === 5) {
        this.updatePricingTarget('aware-platform-monthly-slider', 'Custom', animate);
        this.updatePricingTarget('aware-platform-annual-slider', 'Custom', animate);
        this.updatePricingTarget('aware-capture-monthly-slider', 'Custom', animate);
        this.updatePricingTarget('aware-capture-annual-slider', 'Custom', animate);
        return;
      }

      const { platformValue, captureValue } = this.getCurrentPricingValues();

      console.log('Updating pricing targets - Platform:', platformValue, 'Capture:', captureValue);

      if (platformValue !== null) {
        this.updatePricingTarget('aware-platform-monthly-slider', platformValue, animate);
        this.updatePricingTarget('aware-platform-annual-slider', platformValue * 12, animate);
      }

      if (captureValue !== null) {
        this.updatePricingTarget('aware-capture-monthly-slider', captureValue, animate);
        this.updatePricingTarget('aware-capture-annual-slider', captureValue * 12, animate);
      }
    }, 50);
  }

  updatePricingTarget(attribute, newValue, animate = true) {
    const targets = this.utils.$$(`[${attribute}="target"]`);
    
    targets.forEach(target => {
      const currentText = this.utils.getElementValue(target);
      
      if (newValue === 'Custom') {
        if (currentText !== 'Custom') {
          if (animate) {
            this.animateTextChange(target, 'Custom');
          } else {
            target.textContent = 'Custom';
          }
        }
        return;
      }

      const currentValue = this.utils.parseNumeric(currentText);
      const originalFormat = currentText;

      if (currentText === 'Custom' && typeof newValue === 'number') {
        if (animate) {
          this.animateCounter(target, 0, newValue, originalFormat || '$0', true);
        } else {
          target.textContent = this.utils.formatPricingNumber(newValue, originalFormat || '$0');
        }
        return;
      }

      if (Math.abs(currentValue - newValue) > 0.01) {
        if (animate) {
          this.animateCounter(target, currentValue || 0, newValue, originalFormat, true);
        } else {
          target.textContent = this.utils.formatPricingNumber(newValue, originalFormat);
        }
      }
    });
  }

  animateTextChange(element, newText) {
    if (typeof gsap === 'undefined') {
      element.textContent = newText;
      return;
    }

    gsap.to(element, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
      onComplete: () => {
        element.textContent = newText;
        gsap.to(element, {
          opacity: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      }
    });
  }

  animateCounter(element, fromValue, toValue, originalFormat, isPricing = false) {
    if (typeof gsap === 'undefined') {
      const formatted = isPricing ? 
        this.utils.formatPricingNumber(toValue, originalFormat) : 
        this.utils.formatNumber(toValue, originalFormat);
      element.textContent = formatted;
      return;
    }

    const counterObj = { value: fromValue };
    gsap.to(counterObj, {
      value: toValue,
      duration: 0.4,
      ease: "power2.out",
      onUpdate: () => {
        const formatted = isPricing ? 
          this.utils.formatPricingNumber(counterObj.value, originalFormat) : 
          this.utils.formatNumber(counterObj.value, originalFormat);
        element.textContent = formatted;
      },
      onComplete: () => {
        const formatted = isPricing ? 
          this.utils.formatPricingNumber(toValue, originalFormat) : 
          this.utils.formatNumber(toValue, originalFormat);
        element.textContent = formatted;
      }
    });
  }

  animateValue(target, stepData, isInput) {
    this.state.animation?.kill();

    const current = this.parseValue(target.textContent || target.value);
    const targetRange = stepData.range;
    
    const values = { start: current[0], end: current[1] || 0 };

    this.state.animation = gsap.to(values, {
      start: targetRange[0],
      end: targetRange[1],
      ...this.config.animation,
      onUpdate: () => {
        const text = this.formatDisplay(values, stepData);
        isInput ? (target.value = stepData.value) : (target.textContent = text);
      },
      onComplete: () => {
        this.setTargetValue(target, stepData, isInput);
        this.state.animation = null;
      }
    });
  }

  formatDisplay({ start, end }, stepData) {
    const format = n => Math.round(n).toLocaleString('en-US');
    
    if (stepData.plus) return `${format(start)}+`;
    if (end > 100) return `${format(start)}-${format(end)}`;
    return format(start);
  }

  parseValue(text) {
    const numbers = text.match(/\d+/g)?.map(n => parseInt(n.replace(/,/g, ''))) || [0];
    return [numbers[0], numbers[1] || 0];
  }

  setTargetValue(target, stepData, isInput) {
    const value = isInput ? stepData.value : stepData.display;
    isInput ? (target.value = value) : (target.textContent = value);
    Object.assign(target.dataset, { 
      currentValue: stepData.value, 
      currentStep: this.state.currentStep 
    });
  }

  toggleDragClass(isDragging) {
    ['handle', 'fill'].forEach(el => 
      this.elements[el]?.classList.toggle('dragging', isDragging)
    );
  }

  emit(event, data) {
    this.container.dispatchEvent(new CustomEvent(event, { 
      detail: { ...data, step: this.state.currentStep }
    }));
  }

  setStep(step, animate = true) {
    this.updateSlider(step, animate);
  }

  getStep() {
    return this.state.currentStep;
  }

  refreshPricingTargets() {
    this.updatePricingTargets(true);
  }

  destroy() {
    this.state.animation?.kill();
  }
}


// Initialize with proper timing
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const sliderContainer = document.querySelector(".slider-container");
    if (sliderContainer) {
      window.citySlider = new SmoothSlider(sliderContainer);

      sliderContainer.addEventListener("cityResidentsChanged", (e) => {
        console.log("Slider changed to step:", e.detail.step);
      });
    }
  }, 100);

  const config = {
    counterDuration: 0.4,
    counterAttributes: [
      "aware-platform",
      "aware-capture",
      "first-tier-plan",
      "second-tier-plan",
      "third-tier-plan",
      "fourth-tier-plan",
    ],
    planAttributes: [
      "first-tier-plan",
      "second-tier-plan",
      "third-tier-plan",
      "fourth-tier-plan",
    ],
    selectors: {
      container: ".currency-dropdown_cl",
      templateCollection: ".currencies-template_cl",
      currencyCheckbox: ".currency-select-checkbox",
      pricingTabs: "[pricing-tabs]",
      monthlyTab: '[data-w-tab="Monthly"]',
      annualTab: '[data-w-tab="Annual"]',
      currentTab: "[data-w-tab].w--current",
    },
  };

  // State management
  const state = {
    originalMonthlyValues: {},
    currentSavingPercentage: 0,
  };

  // Utility functions
  const utils = {
    $(selector, context = document) {
      return context.querySelector(selector);
    },
    $$(selector, context = document) {
      return Array.from(context.querySelectorAll(selector));
    },

    parseNumeric: (text) => {
      if (!text) return null;
      const num = parseFloat(text.toString().replace(/[$,\s€£¥]/g, ""));
      return isNaN(num) ? null : num;
    },

    formatNumber: (value, originalFormat) => {
      const patterns = {
        hasCommas: originalFormat?.includes(","),
        currency: originalFormat?.match(/[$€£¥]/)?.[0] || "",
        decimals:
          originalFormat?.match(/\.(\d+)/)?.[1]?.length ||
          (value % 1 !== 0 ? 2 : 0),
      };

      let formatted = value.toFixed(patterns.decimals);

      if (patterns.hasCommas && value >= 1000) {
        const [whole, decimal] = formatted.split(".");
        formatted = [whole.replace(/\B(?=(\d{3})+(?!\d))/g, ","), decimal]
          .filter(Boolean)
          .join(".");
      }

      return patterns.currency + formatted;
    },

    getElementValue: (element) =>
      element?.textContent?.trim() ||
      element?.value?.trim() ||
      element?.innerText?.trim() ||
      "",

    isAnnualActive: () =>
      utils
        .$(config.selectors.currentTab, utils.$(config.selectors.pricingTabs))
        ?.getAttribute("data-w-tab") === "Annual",

    getVisibleTemplate: () =>
      templateItems.find((item) =>
        ["flex", "block"].some(
          (display) =>
            window.getComputedStyle(item).display === display ||
            item.style.display === display
        )
      ),
  };

  // Initialize
  const container = utils.$(config.selectors.container);
  const templateCollection = utils.$(config.selectors.templateCollection);
  if (!container) return;

  const templateItems = utils.$$(
    config.selectors.templateCollection + " [selected-currency]"
  );

  // Initialize first radio and setup
  const initializeApp = () => {
    const firstRadio = utils.$('input[type="radio"]', container);
    if (firstRadio) {
      firstRadio.checked = true;
      updateTargets();
    }

    setTimeout(() => {
      setupEventListeners();
    }, 10);
  };

  // Event listeners
  const setupEventListeners = () => {
    // Radio button changes
    ["change", "input"].forEach((event) => {
      document.addEventListener(event, (e) => {
        if (
          e.target.type === "radio" &&
          e.target.closest(config.selectors.container)
        ) {
          handleRadioChange();
        }
      });
    });

    // Tab listeners
    const pricingTabs = utils.$(config.selectors.pricingTabs);
    if (pricingTabs) {
      [config.selectors.monthlyTab, config.selectors.annualTab].forEach(
        (selector) => {
          const tab = utils.$(selector, pricingTabs);
          if (tab) {
            tab.addEventListener("click", () =>
              setTimeout(handleTabSwitch, 100)
            );
          }
        }
      );
    }
  };

  // Main update functions
  const handleRadioChange = () => {
    const currencyCheckbox = utils.$(config.selectors.currencyCheckbox);
    if (currencyCheckbox) {
      currencyCheckbox.checked = false;
      currencyCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
    }
    updateTargets();
  };

  const updatePlanSaving = () => {
    const visibleTemplate = utils.getVisibleTemplate();
    if (!visibleTemplate) return;

    const trigger = utils.$('[plan-saving="trigger"]', visibleTemplate);
    const triggerValue = utils.getElementValue(trigger);
    if (!triggerValue) return;

    const targets = utils.$$('[plan-saving="target"]');
    targets.forEach((target) => {
      const currentValue = utils.getElementValue(target);
      if (currentValue !== triggerValue) {
        target.textContent = triggerValue;
      }
    });
  };

  const updateTargets = () => {
    const checkedRadio = utils.$('input[type="radio"]:checked', container);
    if (!checkedRadio) return;

    // Update dropdown elements
    const radioContainer =
      checkedRadio.closest("label") || checkedRadio.parentElement;
    const updates = [
      {
        trigger: "drpdwn-label",
        target: "drpdwn-label",
        props: ["textContent", "value"],
      },
      {
        trigger: "drpdwn-icon",
        target: "drpdwn-icon",
        props: ["src", "innerHTML", "className"],
      },
    ];

    updates.forEach(({ trigger, target, props }) => {
      const triggerEl =
        utils.$(`[${trigger}="trigger"]`, radioContainer) ||
        utils.$(`[${trigger}="trigger"]`, container);
      const targetEl = utils.$(`[${target}="target"]`);
      if (triggerEl && targetEl) {
        props.forEach((prop) => {
          if (triggerEl[prop] !== undefined) targetEl[prop] = triggerEl[prop];
        });
      }
    });

    // Update template collection and dynamic data
    const targetLabel = utils.$('[drpdwn-label="target"]');
    updateTemplateCollection(utils.getElementValue(targetLabel));
    updateDynamicCurrency();
    updatePlanSaving(); // Add this line

    setTimeout(updateCounters, 100);
  };

  const updateTemplateCollection = (currency) => {
    if (!templateItems.length || !currency) return;

    templateItems.forEach((item) => {
      item.style.display =
        item.getAttribute("selected-currency") === currency ? "flex" : "none";
    });
  };

  const updateDynamicCurrency = () => {
    const visibleTemplate = utils.getVisibleTemplate();
    if (!visibleTemplate) return;

    const trigger = utils.$('[dynamic-currency="trigger"]', visibleTemplate);
    const triggerValue = utils.getElementValue(trigger);
    if (!triggerValue) return;

    utils.$$('[dynamic-currency="target"]').forEach((target) => {
      const currentValue = utils.getElementValue(target);
      if (currentValue !== triggerValue) {
        animateTextUpdate(target, triggerValue);
      }
    });
  };

  const updateCounters = () => {
    const visibleTemplate = utils.getVisibleTemplate();
    if (!visibleTemplate) return;

    // Process all counter attributes
    config.counterAttributes.forEach((attribute) => {
      const trigger = utils.$(`[${attribute}="trigger"]`, visibleTemplate);
      const triggerValue = utils.parseNumeric(utils.getElementValue(trigger));

      if (triggerValue === null) return;

      const targets = utils.$$(`[${attribute}="target"]`);
      targets.forEach((target) => {
        const currentValue = utils.parseNumeric(utils.getElementValue(target));

        // Store monthly values for plan attributes
        if (config.planAttributes.includes(attribute)) {
          state.originalMonthlyValues[attribute] = triggerValue;

          // Skip direct update if on annual plan
          if (utils.isAnnualActive()) return;
        }

        // Animate counter if values differ
        if (currentValue !== triggerValue) {
          animateCounter(
            target,
            currentValue || 0,
            triggerValue,
            utils.getElementValue(target)
          );
        }
      });
    });

    // Recalculate annual pricing if needed
    if (utils.isAnnualActive()) {
      setTimeout(switchToAnnualPricing, 100);
    }
  };

  // Tab switching functions
  const handleTabSwitch = () => {
    const currentTab = utils.$(
      config.selectors.currentTab,
      utils.$(config.selectors.pricingTabs)
    );
    if (!currentTab) return;

    const tabType = currentTab.getAttribute("data-w-tab");
    console.log(`Tab switched to: ${tabType}`);

    tabType === "Monthly" ? switchToMonthlyPricing() : switchToAnnualPricing();
  };

  const switchToAnnualPricing = () => {
    const savingPercentage = getSavingPercentage();
    if (savingPercentage === null) return;

    state.currentSavingPercentage = savingPercentage;

    config.planAttributes.forEach((planAttr) => {
      const monthlyValue = state.originalMonthlyValues[planAttr];
      if (monthlyValue == null) return;

      const annualValue = monthlyValue * (1 - savingPercentage / 100) * 12;

      utils.$$(`[${planAttr}="target"]`).forEach((target) => {
        const currentValue = utils.parseNumeric(utils.getElementValue(target));
        animateCounter(
          target,
          currentValue || monthlyValue,
          annualValue,
          utils.getElementValue(target)
        );
      });
    });
  };

  const switchToMonthlyPricing = () => {
    config.planAttributes.forEach((planAttr) => {
      const monthlyValue = state.originalMonthlyValues[planAttr];
      if (monthlyValue == null) return;

      utils.$$(`[${planAttr}="target"]`).forEach((target) => {
        const currentValue = utils.parseNumeric(utils.getElementValue(target));
        animateCounter(
          target,
          currentValue || 0,
          monthlyValue,
          monthlyValue.toString()
        );
      });
    });
  };

  const getSavingPercentage = () => {
    const visibleTemplate = utils.getVisibleTemplate();
    if (!visibleTemplate) return null;

    const savingTrigger = utils.$('[plan-saving="trigger"]', visibleTemplate);
    return utils.parseNumeric(utils.getElementValue(savingTrigger));
  };

  // Animation functions
  const animateCounter = (element, fromValue, toValue, originalFormat) => {
    if (typeof gsap === "undefined") {
      element.textContent = utils.formatNumber(toValue, originalFormat);
      return;
    }

    const counterObj = { value: fromValue };
    gsap.to(counterObj, {
      value: toValue,
      duration: config.counterDuration,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = utils.formatNumber(
          counterObj.value,
          originalFormat
        );
      },
      onComplete: () => {
        element.textContent = utils.formatNumber(toValue, originalFormat);
      },
    });
  };

  const animateTextUpdate = (element, newText) => {
    if (typeof gsap === "undefined") {
      element.textContent = newText;
      return;
    }

    // Ensure proper positioning
    if (window.getComputedStyle(element).position === "static") {
      element.style.position = "relative";
    }

    // Create or get wrapper
    let wrapper = element.parentElement;
    if (!wrapper.classList.contains("currency-animation-wrapper")) {
      wrapper = Object.assign(document.createElement("div"), {
        className: "currency-animation-wrapper",
      });

      Object.assign(wrapper.style, {
        position: "relative",
        display: "inline-block",
      });

      element.parentNode.insertBefore(wrapper, element);
      wrapper.appendChild(element);
    }

    // Create new element for transition
    const newElement = element.cloneNode(true);
    newElement.textContent = newText;
    Object.assign(newElement.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
    });

    gsap.set(newElement, { opacity: 0, scale: 0.5, y: 12 });
    wrapper.appendChild(newElement);

    // Animate transition
    const tl = gsap.timeline({
      onComplete: () => {
        element.textContent = newText;
        gsap.set(element, { opacity: 1, scale: 1, y: 0 });
        newElement.remove();
      },
    });

    tl.to(
      element,
      { opacity: 0, scale: 0.3, y: -12, duration: 0.3, ease: "power2.in" },
      0
    ).to(
      newElement,
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power2.out" },
      0.15
    );
  };

  // Initialize the application
  initializeApp();
});
