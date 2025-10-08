// ===================================
// FORM-SPECIFIC VALIDATION & LOGIC
// Customize this script for each conditional form
// ===================================

document.addEventListener("DOMContentLoaded", () => {
  
  // Initialize the global form manager
  const formManager = new ConditionalFormManager();
  
  if (!formManager.init()) {
    console.error("Form manager failed to initialize");
    return;
  }

  // ===================================
  // CUSTOM VALIDATION LOGIC
  // ===================================
  
  const validateStep = (stepIndex, activePane, nextButton) => {
    if (!activePane) return;

    const requiredInputs = activePane.querySelectorAll("input[required]");

    const checkValidity = () => {
      const allFilled = Array.from(requiredInputs).every(input => {
        // Check if it's a datepicker
        const isDatepicker = 
          input.getAttribute("data-toggle") === "datepicker" ||
          input.classList.contains("datepicker") ||
          input.hasAttribute("data-datepicker") ||
          input.closest('[data-toggle="datepicker"]') ||
          input.closest(".datepicker-container");

        if (isDatepicker) {
          const hasValue = 
            input.value?.trim() &&
            input.value !== input.getAttribute("placeholder") &&
            input.value !== input.getAttribute("data-placeholder");

          const hiddenInput = input.parentElement.querySelector('input[type="hidden"]');
          const hasHiddenValue = hiddenInput?.value?.trim();

          return hasValue || hasHiddenValue;
        }

        return input.value.trim() && input.checkValidity();
      });

      if (allFilled) {
        formManager.enableNextButton();
      } else {
        formManager.disableNextButton("Make sure all required inputs are filled with correct data");
      }
    };

    // Attach event listeners to required inputs
    requiredInputs.forEach(input => {
      const events = ["input", "blur"];

      const isDatepicker = 
        input.getAttribute("data-toggle") === "datepicker" ||
        input.classList.contains("datepicker") ||
        input.hasAttribute("data-datepicker") ||
        input.closest('[data-toggle="datepicker"]') ||
        input.closest(".datepicker-container");

      if (isDatepicker) {
        events.push("change", "dateSelected", "dp.change", "changeDate", "hide");

        input.addEventListener("change", () => {
          input.value && input.setAttribute("value", input.value);
          checkValidity();
        });

        // Mutation observer for datepicker changes
        const observer = new MutationObserver(mutations => {
          if (mutations.some(m => ["value", "data-value"].includes(m.attributeName))) {
            checkValidity();
          }
        });

        observer.observe(input, {
          attributes: true,
          attributeFilter: ["value", "data-value"],
        });

        // Polling for datepicker value changes
        let lastValue = input.value;
        const pollInterval = setInterval(() => {
          if (input.value !== lastValue) {
            lastValue = input.value;
            checkValidity();
          }
          if (!document.contains(input)) clearInterval(pollInterval);
        }, 500);
      }

      events.forEach(event => input.addEventListener(event, checkValidity));
    });

    checkValidity();
    setTimeout(checkValidity, 100);
  };

  // Set the custom validator
  formManager.setCustomValidator(validateStep);

  // Trigger initial validation
  validateStep(
    formManager.getCurrentStepIndex(), 
    formManager.getCurrentPane(), 
    formManager.elements.nextButton
  );

  // ===================================
  // CUSTOM DROPDOWN TRACKING
  // ===================================
  
  const trackDropdownChanges = () => {
    document.querySelectorAll(".conditional-form_input-bl").forEach(container => {
      const placeholder = container.querySelector(".conditional-form_input-placeholder");
      const textInput = container.querySelector('input[type="text"]');
      const dropdown = container.querySelector(".conditional-form_select-dropdown");

      if (!placeholder || !textInput || !dropdown) return;

      const defaultText = placeholder.textContent.trim();

      const updateInput = () => {
        const currentText = placeholder.textContent.trim();
        textInput.value = currentText !== defaultText ? currentText : "";
        currentText !== defaultText ? 
          textInput.setAttribute("value", currentText) : 
          textInput.removeAttribute("value");
        textInput.dispatchEvent(new Event("input"));
      };

      dropdown.addEventListener("change", updateInput);
      updateInput();
    });
  };

  trackDropdownChanges();

  // ===================================
  // CUSTOM DROPDOWN WITH TAGS
  // ===================================

  const dropdownTrigger = document.querySelector(".custom-dropdown_trigger");
  const dropdownList = document.querySelector(".conditional-form_select-list.for-custom");
  const tagsContainer = document.querySelector(".tags-holder_wrap");

  const toggleDropdown = () => dropdownList?.classList.toggle("visible");

  const closeDropdown = (event) => {
    const clickedInside = [dropdownTrigger, dropdownList, tagsContainer]
      .filter(Boolean)
      .some(el => el.contains(event.target));

    if (!clickedInside) dropdownList?.classList.remove("visible");
  };

  dropdownTrigger?.addEventListener("click", toggleDropdown);
  document.addEventListener("click", closeDropdown);
  document.addEventListener("keydown", e => e.key === "Escape" && dropdownList?.classList.remove("visible"));
  tagsContainer?.addEventListener("click", e => e.stopPropagation());

  // ===================================
  // CHECKBOX TAG MANAGER
  // ===================================

  const checkboxTagManager = {
    checkedValues: new Set(),
    templateTag: null,

    init() {
      this.cacheTemplate();
      this.bindCheckboxEvents();
      this.initializeTagsContainer();
    },

    cacheTemplate() {
      this.templateTag = document.querySelector(".tags-holder_item");
      if (this.templateTag) {
        Object.assign(this.templateTag.style, { display: "none" });
        this.templateTag.classList.add("template");
      }
    },

    bindCheckboxEvents() {
      document.querySelectorAll(".conditional-form_checkbox")
        .forEach(checkbox => checkbox.addEventListener("change", e => this.handleCheckboxChange(e.target)));
    },

    handleCheckboxChange(checkbox) {
      const { value } = checkbox;
      const text = this.getCheckboxText(checkbox);

      checkbox.checked ? 
        (this.checkedValues.add(value), this.addTag(value, text)) : 
        (this.checkedValues.delete(value), this.removeTag(value));

      this.updateTagsContainerVisibility();
    },

    getCheckboxText(checkbox) {
      const label = document.querySelector(`label[for="${checkbox.id}"]`);
      if (label) return label.textContent.trim();

      const nextSibling = checkbox.nextSibling;
      if (nextSibling?.nodeType === Node.TEXT_NODE) return nextSibling.textContent.trim();

      return checkbox.value || "Selected item";
    },

    addTag(value, text) {
      const tagsContainer = document.querySelector(".tags-holder_wrap");

      if (tagsContainer?.querySelector(`[data-value="${value}"]:not(.template)`)) return;

      const tagElement = this.templateTag.cloneNode(true);

      tagElement.style.display = "";
      tagElement.dataset.value = value;
      tagElement.classList.remove("template");

      const textElement = tagElement.querySelector(".tag-text, [class*='text']") || tagElement.firstElementChild;
      if (textElement) textElement.textContent = text;

      const closeButton = tagElement.querySelector(".tag-close, [class*='close'], button") || tagElement.lastElementChild;

      if (closeButton) {
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        newCloseButton.addEventListener("click", () => this.removeTagAndUncheck(value));
      }

      tagsContainer?.appendChild(tagElement);
    },

    removeTag(value) {
      document.querySelector(`.tags-holder_item[data-value="${value}"]:not(.template)`)?.remove();
    },

    removeTagAndUncheck(value) {
      const checkbox = document.querySelector(`.conditional-form_checkbox[value="${value}"]`);
      if (checkbox) checkbox.checked = false;

      this.checkedValues.delete(value);
      this.removeTag(value);
      this.updateTagsContainerVisibility();
    },

    updateTagsContainerVisibility() {
      const tagsContainer = document.querySelector(".tags-holder_wrap");
      const tagsPlaceholder = document.querySelector("[retailers-placeholder]");
      const hasValues = this.checkedValues.size > 0;

      if (tagsContainer) tagsContainer.style.display = hasValues ? "flex" : "none";
      if (tagsPlaceholder) tagsPlaceholder.style.display = hasValues ? "none" : "flex";
    },

    initializeTagsContainer() {
      const tagsContainer = document.querySelector(".tags-holder_wrap");
      if (tagsContainer) tagsContainer.style.display = "none";
    },

    getCheckedValues: () => Array.from(this.checkedValues),

    clearAll() {
      document.querySelectorAll(".conditional-form_checkbox:checked")
        .forEach(checkbox => checkbox.checked = false);

      this.checkedValues.clear();

      document.querySelectorAll(".tags-holder_item:not(.template)")
        .forEach(tag => tag.remove());

      this.updateTagsContainerVisibility();
    }
  };

  checkboxTagManager.init();

  // ===================================
  // GOAL INPUTS MANAGEMENT
  // (Very form-specific logic)
  // ===================================

  const triggerElement = document.querySelector("[reset-goal-trigger]");
  const conditionalDropdown = document.querySelector("[conditional-dropdown]");

  const VISIBILITY_RULES = {
    "Drive Awareness": [
      "Reach",
      "Impressions",
      "Viewability",
      "Brand Lift",
      "Ad Recall",
      "SOV (Share of Voice)",
      "Engagement",
    ],
    "Boost Sales": [
      "Foot Traffic",
      "Online-to-Offline Conversions",
      "Add to Cart Rate",
      "Coupon Redemption",
      "Sales Volume",
      "Sales Value",
      "Sales Uplift",
      "iROAS (Incremental Return on Ad Spend)",
      "Cost Per Purchase",
      "AOV (Average Order Value)",
      "Purchase Frequency Rate",
      "Purchase Recency Rate",
      "Repeat Purchase Rate",
    ],
    "Generate Leads": [
      "CTR (Click-Through Rate)",
      "CPC (Cost Per Click)",
      "CPA (Cost Per Acquisition)",
      "CPL (Cost Per Lead)",
      "Conversion Rate",
      "UAC (User Acquisition Cost)",
      "Lead Conversion",
      "LPTraffic (Landing Page Traffic)",
      "LPConversion (Landing Page Conversion Rate)",
      "Loyalty Signups",
    ],
  };

  if (triggerElement) {
    const getTriggerValue = () =>
      triggerElement.value || triggerElement.textContent || triggerElement.innerText;

    const toggleDropdownState = (disable) => {
      if (!conditionalDropdown) return;

      Object.assign(conditionalDropdown.style, {
        pointerEvents: disable ? "none" : "",
        opacity: disable ? "0.5" : ""
      });

      conditionalDropdown.toggleAttribute("disabled", disable);
      conditionalDropdown.setAttribute("aria-disabled", disable);

      conditionalDropdown
        .querySelectorAll("select, input, button")
        .forEach(el => el.disabled = disable);

      if (disable) {
        forceCloseDropdown();
        showAllDropdownItems();
      }
    };

    const forceCloseDropdown = () => {
      conditionalDropdown?.classList.remove("w--open");
      conditionalDropdown?.querySelectorAll(".w--open")
        .forEach(el => el.classList.remove("w--open"));
      conditionalDropdown?.querySelector(".w-dropdown-list")?.classList.remove("w--open");
    };

    const filterDropdownItems = (triggerValue) => {
      const allowedItems = VISIBILITY_RULES[triggerValue] || [];
      conditionalDropdown?.querySelectorAll("a.conditional-form_custom-select.w-dropdown-link")
        .forEach(item => {
          item.style.display = allowedItems.includes(item.textContent.trim()) ? "" : "none";
        });
    };

    const showAllDropdownItems = () =>
      conditionalDropdown?.querySelectorAll("a.conditional-form_custom-select.w-dropdown-link")
        .forEach(item => item.style.display = "");

    const resetDropdownValues = () => {
      conditionalDropdown?.querySelectorAll("select, input, button")
        .forEach(element => {
          if (element.tagName === "SELECT") element.selectedIndex = 0;
          else if (["checkbox", "radio"].includes(element.type)) element.checked = false;
          else element.value = "";
          element.dispatchEvent(new Event("change", { bubbles: true }));
        });
    };

    const handleTriggerChange = () => {
      const isEmpty = !getTriggerValue().trim();

      if (isEmpty) {
        forceCloseDropdown();
        resetDropdownValues();
        setTimeout(() => toggleDropdownState(true), 100);
      } else {
        document.querySelectorAll("[reset-goal-target]").forEach(btn => btn.click());
        setTimeout(() => {
          toggleDropdownState(false);
          setTimeout(() => filterDropdownItems(getTriggerValue()), 50);
        }, 50);
      }
    };

    const handleDropdownClick = (e) => {
      if (!getTriggerValue().trim()) {
        e.preventDefault();
        e.stopPropagation();
        forceCloseDropdown();
      }
    };

    const initialize = () => {
      new MutationObserver(handleTriggerChange).observe(triggerElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeOldValue: true,
      });

      if (["INPUT", "TEXTAREA", "SELECT"].includes(triggerElement.tagName)) {
        ["input", "change", "keyup", "paste", "cut"].forEach(event =>
          triggerElement.addEventListener(event, handleTriggerChange)
        );
      }

      conditionalDropdown?.addEventListener("click", handleDropdownClick, true);

      setTimeout(handleTriggerChange, 100);
    };

    initialize();
  }
});
