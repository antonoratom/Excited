document.addEventListener("DOMContentLoaded", () => {
  // Configuration
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
    originalPlanTypeValues: {},
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

    // Find plan-type element (sibling of parent container)
    findPlanTypeElement: (target) =>
      target.parentElement?.nextElementSibling?.hasAttribute("plan-type")
        ? target.parentElement.nextElementSibling
        : target.parentElement?.parentElement?.querySelector("[plan-type]") ??
          target
            .closest(".dynamic-price_wrap")
            ?.parentElement?.querySelector("[plan-type]"),
  };

  // Initialize
  const container = utils.$(config.selectors.container);
  const templateCollection = utils.$(config.selectors.templateCollection);
  if (!container) return;

  const templateItems = utils.$$(
    config.selectors.templateCollection + " [selected-currency]"
  );

  // Store original plan-type values
  const storeOriginalPlanTypeValues = () => {
    config.planAttributes.forEach((planAttr) => {
      utils.$$(`[${planAttr}="target"]`).forEach((target, index) => {
        const planTypeElement = utils.findPlanTypeElement(target);
        if (planTypeElement) {
          state.originalPlanTypeValues[`${planAttr}-${index}`] =
            utils.getElementValue(planTypeElement);
        }
      });
    });
  };

  // ===== SIMPLIFIED PLAN-TYPE UPDATE =====
  const updatePlanTypeElements = (isAnnual) => {
    config.planAttributes.forEach((planAttr) => {
      utils.$$(`[${planAttr}="target"]`).forEach((target, index) => {
        const planTypeElement = utils.findPlanTypeElement(target);
        if (!planTypeElement) return;

        planTypeElement.textContent = isAnnual
          ? "/year"
          : state.originalPlanTypeValues[`${planAttr}-${index}`] ??
            planTypeElement.textContent;
      });
    });
  };
  // ===== END =====

  // Initialize first radio and setup
  const initializeApp = () => {
    const firstRadio = utils.$('input[type="radio"]', container);
    if (firstRadio) {
      firstRadio.checked = true;
      updateTargets();
    }

    setTimeout(() => {
      storeOriginalPlanTypeValues();
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
    updatePlanSaving();

    setTimeout(() => {
      updateCounters();
      storeOriginalPlanTypeValues();
    }, 100);
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

      utils.$$(`[${planAttr}="target"]`).forEach((target, index) => {
        const currentValue = utils.parseNumeric(utils.getElementValue(target));
        animateCounter(
          target,
          currentValue || monthlyValue,
          annualValue,
          utils.getElementValue(target)
        );
      });
    });

    updatePlanTypeElements(true);
  };

  const switchToMonthlyPricing = () => {
    config.planAttributes.forEach((planAttr) => {
      const monthlyValue = state.originalMonthlyValues[planAttr];
      if (monthlyValue == null) return;

      utils.$$(`[${planAttr}="target"]`).forEach((target, index) => {
        const currentValue = utils.parseNumeric(utils.getElementValue(target));
        animateCounter(
          target,
          currentValue || 0,
          monthlyValue,
          monthlyValue.toString()
        );
      });
    });

    updatePlanTypeElements(false);
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
