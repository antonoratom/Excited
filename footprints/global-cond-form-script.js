// ===================================
// GLOBAL CONDITIONAL FORM MANAGER
// Use this script globally across all conditional logic forms
// ===================================

class ConditionalFormManager {
  constructor(config = {}) {
    this.config = {
      tabLinksSelector: ".w-tab-link",
      tabPanesSelector: ".w-tab-pane",
      nextButtonAttr: "form-next-button",
      prevButtonAttr: "form-previous-button",
      currentStepNameAttr: "current-step-name",
      totalStepsAttr: "total-steps",
      currentStepAttr: "current-step",
      dynamicTlAttr: "dynamic-tl",
      ...config
    };

    this.elements = {};
    this.customValidator = null;
    this.onStepChange = null;
  }

  init() {
    this.cacheElements();
    
    if (!this.validateElements()) {
      console.warn("ConditionalFormManager: Required elements not found");
      return false;
    }

    this.setupEventListeners();
    this.updateUI(this.getActiveTabIndex());
    
    return true;
  }

  cacheElements() {
    this.elements = {
      tabLinks: document.querySelectorAll(this.config.tabLinksSelector),
      tabPanes: document.querySelectorAll(this.config.tabPanesSelector),
      nextButton: document.querySelector(`[${this.config.nextButtonAttr}]`),
      prevButton: document.querySelector(`[${this.config.prevButtonAttr}]`),
      currentStepName: document.querySelector(`[${this.config.currentStepNameAttr}]`),
      totalSteps: document.querySelector(`[${this.config.totalStepsAttr}]`),
      currentStep: document.querySelector(`[${this.config.currentStepAttr}]`),
      dynamicTl: document.querySelector(`[${this.config.dynamicTlAttr}]`)
    };

    this.totalTabs = this.elements.tabLinks.length;
  }

  validateElements() {
    return Object.values(this.elements).every(el => el !== null && el !== undefined);
  }

  setupEventListeners() {
    this.elements.nextButton.addEventListener("click", () => this.goToNextStep());
    this.elements.prevButton.addEventListener("click", () => this.goToPreviousStep());
  }

  getActiveTabIndex() {
    return Array.from(this.elements.tabLinks).findIndex(link => 
      link.classList.contains("w--current")
    );
  }

  activateTab(index) {
    if (index < 0 || index >= this.totalTabs) return;
    
    this.elements.tabLinks[index]?.click();
    this.updateUI(index);
    
    // Call custom validator if provided
    if (this.customValidator) {
      this.customValidator(index, this.elements.tabPanes[index], this.elements.nextButton);
    }
    
    // Call step change callback if provided
    if (this.onStepChange) {
      this.onStepChange(index, this.elements.tabPanes[index]);
    }
  }

  updateUI(index) {
    const activeLink = this.elements.tabLinks[index];
    if (!activeLink) return;

    // Update step name
    this.elements.currentStepName.textContent = activeLink.textContent.trim();
    
    // Update step counter
    this.elements.currentStep.textContent = index + 1;
    this.elements.totalSteps.textContent = this.totalTabs;
    
    // Update progress bar
    this.elements.dynamicTl.style.width = `${(100 * (index + 1)) / this.totalTabs}%`;
  }

  goToNextStep() {
    const currentIndex = this.getActiveTabIndex();
    if (currentIndex < this.totalTabs - 1) {
      this.activateTab(currentIndex + 1);
    }
  }

  goToPreviousStep() {
    const currentIndex = this.getActiveTabIndex();
    if (currentIndex > 0) {
      this.activateTab(currentIndex - 1);
    }
  }

  setCustomValidator(validatorFunction) {
    this.customValidator = validatorFunction;
  }

  setStepChangeCallback(callback) {
    this.onStepChange = callback;
  }

  enableNextButton() {
    this.elements.nextButton.disabled = false;
    this.elements.nextButton.classList.remove("disabled");
    this.elements.nextButton.removeAttribute("title");
    this.elements.nextButton.setAttribute("tabindex", "1");

  }

  disableNextButton(message = "Please complete all required fields") {
    this.elements.nextButton.disabled = true;
    this.elements.nextButton.classList.add("disabled");
    this.elements.nextButton.setAttribute("title", message);
    this.elements.nextButton.setAttribute("tabindex", "-1");
  }

  resetToFirstStep() {
    this.activateTab(0);
  }

  getCurrentStepIndex() {
    return this.getActiveTabIndex();
  }

  getCurrentPane() {
    return this.elements.tabPanes[this.getActiveTabIndex()];
  }
}

// ===================================
// FORM CLOSE/OPEN MODAL MANAGER
// ===================================

const FormModalManager = {
  config: {
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
      modalItem: '.close-modal_item'
    }
  },

  isEditableInput(input) {
    return !this.config.nonEditableTypes.includes(input.type?.toLowerCase());
  },

  isInputFilled(input) {
    return ['checkbox', 'radio'].includes(input.type) ? input.checked : input.value?.trim() !== '';
  },

  hasFilledInputs(section) {
    return [...section.querySelectorAll('input, textarea, select')]
      .filter(input => this.isEditableInput(input))
      .some(input => this.isInputFilled(input));
  },

  resetFormInputs(section) {
    [...section.querySelectorAll('input, textarea, select')].forEach(input => {
      if (['checkbox', 'radio'].includes(input.type)) input.checked = false;
      else if (!['submit', 'button', 'reset'].includes(input.type)) input.value = '';
    });

    this.resetFinswetDropdowns(section);
  },

  resetFinswetDropdowns(section) {
    section.querySelectorAll('[fs-selectcustom-element="option-reset"]').forEach(link => link.click());
  },

  clearFileUploads(section) {
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
  },

  resetTabNavigation() {
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
  },

  clickFirstTabLink(element) {
    const tablist = element.closest('[role="tablist"]') || document.querySelector('[role="tablist"]');
    tablist?.querySelector('a, [role="tab"]')?.click();
  },

  animateClose(section) {
    const formContainer = section.querySelector(this.config.selectors.formContainer);
    if (!formContainer) return;

    gsap.timeline()
      .to(formContainer, { ...this.config.animations.close, opacity: 0 })
      .to(section, { opacity: 0, duration: this.config.animations.close.duration, ease: this.config.animations.close.ease }, 0)
      .set(section, { display: "none" });
  },

  animateOpen(section) {
    const formContainer = section.querySelector(this.config.selectors.formContainer);
    if (!formContainer) return;

    gsap.timeline()
      .set(section, { display: "flex" })
      .set(formContainer, { x: this.config.animations.close.x, opacity: 0 })
      .set(section, { opacity: 0 })
      .to(formContainer, { x: 0, opacity: 1, ...this.config.animations.open })
      .to(section, { opacity: 1, duration: this.config.animations.open.duration, ease: this.config.animations.open.ease }, 0);
  },

  showConfirmation(section) {
    const modal = section.querySelector(this.config.selectors.closeModal);
    const modalItem = modal?.querySelector(this.config.selectors.modalItem);
    if (!modal || !modalItem) return;

    gsap.timeline()
      .set(modal, { display: "flex", opacity: 0 })
      .set(modalItem, { y: 24, opacity: 0 })
      .to(modal, { ...this.config.animations.fadeIn, opacity: 1 }, 0)
      .to(modalItem, { ...this.config.animations.fadeIn, y: 0, opacity: 1 }, 0);
  },

  hideConfirmation(modal) {
    const modalItem = modal.querySelector(this.config.selectors.modalItem);

    gsap.timeline()
      .to(modal, { ...this.config.animations.fadeOut, opacity: 0 }, 0)
      .to(modalItem, { ...this.config.animations.fadeOut, y: 24, opacity: 0 }, 0)
      .set(modal, { display: "none" });
  },

  closeClearModal(section, confirmModal) {
    if (confirmModal && getComputedStyle(confirmModal).display !== 'none') {
      this.hideConfirmation(confirmModal);
    }

    this.resetFormInputs(section);
    this.clearFileUploads(section);
    this.resetTabNavigation();

    setTimeout(() => this.animateClose(section), confirmModal ? 100 : 0);
    setTimeout(() => this.clickFirstTabLink(section), 200);
  },

  handleClick(e) {
    const handlers = [
      {
        selector: '[close-modal-trigger]',
        action: trigger => {
          const section = trigger.closest(this.config.selectors.section);
          section && (this.hasFilledInputs(section) ? this.showConfirmation(section) : this.animateClose(section));
        }
      },
      {
        selector: '[data-confirm-close]',
        action: button => {
          const section = button.closest(this.config.selectors.section);
          section && this.animateClose(section);
        }
      },
      {
        selector: '[data-cancel-close], [cancel-closing-modal]',
        action: button => {
          const modal = button.closest(this.config.selectors.closeModal);
          modal && this.hideConfirmation(modal);
        }
      },
      {
        selector: '[close-clear-modal]',
        action: button => {
          const section = button.closest(this.config.selectors.section);
          if (section) {
            const confirmModal = section.querySelector(this.config.selectors.closeModal);
            this.closeClearModal(section, confirmModal);
          }
        }
      },
      {
        selector: '[media-plan-builder="open"]',
        action: button => {
          const section = button.closest(this.config.selectors.section) || 
                document.querySelector(this.config.selectors.section);
          section && this.animateOpen(section);
        }
      },
      {
        selector: '[business-case-generator="open"]',
        action: button => {
          const section = button.closest(this.config.selectors.section) || 
                document.querySelector(this.config.selectors.section);
          section && this.animateOpen(section);
        }
      }
    ];

    for (const { selector, action } of handlers) {
      const element = e.target.closest(selector);
      if (element) {
        e.preventDefault();
        action.call(this, element);
        break;
      }
    }
  },

  init() {
    document.addEventListener('click', (e) => this.handleClick(e));
  }
};

// Initialize Form Modal Manager
document.addEventListener('DOMContentLoaded', () => {
  FormModalManager.init();
  window.FormModalManager = FormModalManager; // Expose globally
});
