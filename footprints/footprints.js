document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    tabLinks: document.querySelectorAll(".w-tab-link"),
    tabPanes: document.querySelectorAll(".w-tab-pane"),
    nextButton: document.querySelector("[form-next-button]"),
    prevButton: document.querySelector("[form-previous-button]"),
    currentStepName: document.querySelector("[current-step-name]"),
    totalSteps: document.querySelector("[total-steps]"),
    currentStep: document.querySelector("[current-step]"),
    dynamicTl: document.querySelector("[dynamic-tl]")
  };

  if (!Object.values(elements).every(el => el !== null)) return;

  const { tabLinks, tabPanes, nextButton, prevButton, currentStepName, totalSteps, currentStep, dynamicTl } = elements;
  const totalTabs = tabLinks.length;
  totalSteps.textContent = totalTabs;

  const getActiveTabIndex = () => Array.from(tabLinks).findIndex(link => link.classList.contains("w--current"));

  const updateDynamicData = (index) => {
    const activeLink = tabLinks[index];
    if (!activeLink) return;
    
    currentStepName.textContent = activeLink.textContent.trim();
    currentStep.textContent = index + 1;
    dynamicTl.style.width = `${(100 * (index + 1)) / totalTabs}%`;
  };

  const checkRequiredInputs = (index) => {
    const activePane = tabPanes[index];
    if (!activePane) return;

    const requiredInputs = activePane.querySelectorAll("input[required]");

    const validateInputs = () => {
      const allFilled = Array.from(requiredInputs).every(input => {
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

      nextButton.disabled = !allFilled;
      nextButton.classList.toggle("disabled", !allFilled);
      
      if (!allFilled) {
        nextButton.setAttribute("title", "Make sure all required inputs are filled with correct data");
      } else {
        nextButton.removeAttribute("title");
      }
    };

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
          validateInputs();
        });

        const observer = new MutationObserver(mutations => {
          if (mutations.some(m => ["value", "data-value"].includes(m.attributeName))) {
            validateInputs();
          }
        });

        observer.observe(input, {
          attributes: true,
          attributeFilter: ["value", "data-value"],
        });

        let lastValue = input.value;
        const pollInterval = setInterval(() => {
          if (input.value !== lastValue) {
            lastValue = input.value;
            validateInputs();
          }
          if (!document.contains(input)) clearInterval(pollInterval);
        }, 500);
      }

      events.forEach(event => input.addEventListener(event, validateInputs));
    });

    validateInputs();
    setTimeout(validateInputs, 100);
  };

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

  const activateTab = (index) => {
    tabLinks[index]?.click();
    updateDynamicData(index);
    checkRequiredInputs(index);
  };

  nextButton.addEventListener("click", () => {
    const currentIndex = getActiveTabIndex();
    if (currentIndex < totalTabs - 1) activateTab(currentIndex + 1);
  });

  prevButton.addEventListener("click", () => {
    const currentIndex = getActiveTabIndex();
    if (currentIndex > 0) activateTab(currentIndex - 1);
  });

  updateDynamicData(getActiveTabIndex());
  checkRequiredInputs(getActiveTabIndex());
  trackDropdownChanges();

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
});

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
    Object.assign(tagElement, {
      style: { display: "" },
      dataset: { value }
    });
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

document.readyState === "loading" ? 
  document.addEventListener("DOMContentLoaded", () => checkboxTagManager.init()) : 
  checkboxTagManager.init();


//MANAGEMENT OF GOAL INPUTS
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


//CLOSE FORM MANAGEMENT
const forModConfig = {
  animations: {
    close: { duration: 0.6, ease: "power2.out", x: 48 },
    fadeIn: { duration: 0.4, ease: "power2.out" },
    fadeOut: { duration: 0.3, ease: "power2.out" },
    open: { duration: 0.6, ease: "power2.out" }
  },
  nonEditableTypes: ['submit', 'button', 'reset', 'image'],
  selectors: {
    section: '.section.for-form',
    formContainer: '.form-container',
    closeModal: '.close-modal_wrap',
    modalItem: '.close-modal_item',
    triggers: '[close-modal-trigger]'
  }
};

const forModIsEditableInput = input => !forModConfig.nonEditableTypes.includes(input.type?.toLowerCase());

const forModIsInputFilled = input => 
  ['checkbox', 'radio'].includes(input.type) ? input.checked : input.value?.trim() !== '';

const forModHasFilledInputs = section => 
  [...section.querySelectorAll('input, textarea, select')]
    .filter(forModIsEditableInput)
    .some(forModIsInputFilled);

const forModResetFormInputs = section => {
  [...section.querySelectorAll('input, textarea, select')].forEach(input => {
    if (['checkbox', 'radio'].includes(input.type)) input.checked = false;
    else if (!['submit', 'button', 'reset'].includes(input.type)) input.value = '';
  });
  
  forModResetFinswetDropdowns(section);
};

const forModResetFinswetDropdowns = section => 
  section.querySelectorAll('[fs-selectcustom-element="option-reset"]').forEach(link => link.click());

const forModClearFileUploads = section => {
  section.querySelectorAll('.w-file-upload').forEach(uploadComponent => {
    const successElement = uploadComponent.querySelector('.w-file-upload-success');
    
    if (successElement && getComputedStyle(successElement).display !== 'none') {
      const removeLink = successElement.querySelector('.w-file-remove-link');
      removeLink?.click();
      
      setTimeout(() => {
        ['default', 'uploading', 'error', 'success'].forEach(state => {
          const el = uploadComponent.querySelector(`.w-file-upload-${state}`);
          if (el) el.style.display = state === 'default' ? '' : 'none';
        });
        
        const fileInput = uploadComponent.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.value = '';
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 100);
    }
  });
};

const forModResetTabNavigation = () => {
  const tabLinks = document.querySelectorAll(".w-tab-link");
  const currentStepName = document.querySelector("[current-step-name]");
  const currentStep = document.querySelector("[current-step]");
  const dynamicTl = document.querySelector("[dynamic-tl]");
  
  if (!tabLinks.length || !currentStepName || !currentStep || !dynamicTl) return;
  
  const firstTab = tabLinks[0];
  firstTab?.click();
  
  if (firstTab) {
    currentStepName.textContent = firstTab.textContent.trim();
    currentStep.textContent = '1';
    dynamicTl.style.width = `${100 / tabLinks.length}%`;
  }
};

const forModClickFirstTabLink = element => {
  const tablist = element.closest('[role="tablist"]') || document.querySelector('[role="tablist"]');
  tablist?.querySelector('a, [role="tab"]')?.click();
};

const forModAnimateClose = section => {
  const formContainer = section.querySelector(forModConfig.selectors.formContainer);
  if (!formContainer) return;

  gsap.timeline()
    .to(formContainer, { ...forModConfig.animations.close, opacity: 0 })
    .to(section, { opacity: 0, duration: forModConfig.animations.close.duration, ease: forModConfig.animations.close.ease }, 0)
    .set(section, { display: "none" });
};

const forModAnimateOpen = section => {
  const formContainer = section.querySelector(forModConfig.selectors.formContainer);
  if (!formContainer) return;

  gsap.timeline()
    .set(section, { display: "flex" })
    .set(formContainer, { x: forModConfig.animations.close.x, opacity: 0 })
    .set(section, { opacity: 0 })
    .to(formContainer, { x: 0, opacity: 1, ...forModConfig.animations.open })
    .to(section, { opacity: 1, duration: forModConfig.animations.open.duration, ease: forModConfig.animations.open.ease }, 0);
};

const forModShowConfirmation = section => {
  const modal = section.querySelector(forModConfig.selectors.closeModal);
  const modalItem = modal?.querySelector(forModConfig.selectors.modalItem);
  if (!modal || !modalItem) return;

  gsap.timeline()
    .set(modal, { display: "flex", opacity: 0 })
    .set(modalItem, { y: 24, opacity: 0 })
    .to(modal, { ...forModConfig.animations.fadeIn, opacity: 1 }, 0)
    .to(modalItem, { ...forModConfig.animations.fadeIn, y: 0, opacity: 1 }, 0);
};

const forModHideConfirmation = modal => {
  const modalItem = modal.querySelector(forModConfig.selectors.modalItem);
  
  gsap.timeline()
    .to(modal, { ...forModConfig.animations.fadeOut, opacity: 0 }, 0)
    .to(modalItem, { ...forModConfig.animations.fadeOut, y: 24, opacity: 0 }, 0)
    .set(modal, { display: "none" });
};

const forModCloseClearModal = (section, confirmModal) => {
  if (confirmModal && getComputedStyle(confirmModal).display !== 'none') {
    forModHideConfirmation(confirmModal);
  }
  
  forModResetFormInputs(section);
  forModClearFileUploads(section);
  forModResetTabNavigation();
  
  setTimeout(() => forModAnimateClose(section), confirmModal ? 100 : 0);
  setTimeout(() => forModClickFirstTabLink(section), 200);
};

const forModHandleClick = e => {
  const handlers = [
    {
      selector: '[close-modal-trigger]',
      action: trigger => {
        const section = trigger.closest(forModConfig.selectors.section);
        section && (forModHasFilledInputs(section) ? forModShowConfirmation(section) : forModAnimateClose(section));
      }
    },
    {
      selector: '[data-confirm-close]',
      action: button => {
        const section = button.closest(forModConfig.selectors.section);
        section && forModAnimateClose(section);
      }
    },
    {
      selector: '[data-cancel-close], [cancel-closing-modal]',
      action: button => {
        const modal = button.closest(forModConfig.selectors.closeModal);
        modal && forModHideConfirmation(modal);
      }
    },
    {
      selector: '[close-clear-modal]',
      action: button => {
        const section = button.closest(forModConfig.selectors.section);
        if (section) {
          const confirmModal = section.querySelector(forModConfig.selectors.closeModal);
          forModCloseClearModal(section, confirmModal);
        }
      }
    },
    {
      selector: '[media-plan-builder="open"]',
      action: button => {
        const section = button.closest(forModConfig.selectors.section) || 
                       document.querySelector(forModConfig.selectors.section);
        section && forModAnimateOpen(section);
      }
    }
  ];

  for (const { selector, action } of handlers) {
    const element = e.target.closest(selector);
    if (element) {
      e.preventDefault();
      action(element);
      break;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', forModHandleClick);
});
