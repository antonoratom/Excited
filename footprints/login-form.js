document.addEventListener("DOMContentLoaded", () => {
  const loginFormRoot = document.querySelector("[for-login-form]");
  if (!loginFormRoot) return;

  const optionalStepEls = loginFormRoot.querySelectorAll("[optional-step]");
  // hide all optional steps by default
  optionalStepEls.forEach((el) => {
    el.style.display = "none";
  });

  const countryInput = loginFormRoot.querySelector("#CountryInput");
  const notAvailableClass = "not-available";

  // 🔹 Success blocks
  const demoSuccessEl = loginFormRoot.querySelector("[demo-success]");
  const realSuccessEl = loginFormRoot.querySelector("[real-success]");

  // 🔹 Email + dynamic email mirrors
  const emailInput = loginFormRoot.querySelector('input[type="email"]');
  const dynamicEmailSpans = loginFormRoot.querySelectorAll("[dynamic-email]");

  // 🔹 Role / other-role input
  const roleInput = loginFormRoot.querySelector("#role");
  const otherInput = loginFormRoot.querySelector("#other-input-visibility");

  const updateDynamicEmail = () => {
    if (!emailInput || !dynamicEmailSpans.length) return;
    const value = (emailInput.value || "").trim();
    dynamicEmailSpans.forEach((span) => {
      span.textContent = value;
    });
  };

  if (emailInput) {
    ["input", "change", "blur"].forEach((ev) =>
      emailInput.addEventListener(ev, updateDynamicEmail)
    );
    // Initial sync
    updateDynamicEmail();
  }

  // 🔹 Show / hide #other-input based on #role value
  const updateRoleOtherVisibility = () => {
    if (!roleInput || !otherInput) return;
    const value = (roleInput.value || "").trim();
    if (value === "Other") {
      otherInput.style.display = "flex";
    } else {
      otherInput.style.display = "none";
    }
  };

  if (roleInput && otherInput) {
    ["input", "change", "blur"].forEach((ev) =>
      roleInput.addEventListener(ev, updateRoleOtherVisibility)
    );
    // Initial state
    updateRoleOtherVisibility();
  }

  // 🔹 Retailers visible per country (easy to extend)
  const RETAILERS_BY_COUNTRY = {
    "🇵🇱 Poland": ["Eurocash"],
    "🇷🇴 Romania": ["Profi", "Carrefour", "Altex"],
  };

  // 🔹 Show/hide retailer checkboxes based on selected country (scoped to login form)
  const updateRetailerVisibility = (countryValue) => {
    const allowed = RETAILERS_BY_COUNTRY[countryValue] || null;

    loginFormRoot
      .querySelectorAll(".conditional-form_checkbox")
      .forEach((checkbox) => {
        const wrapper = checkbox.parentElement; // first-level parent
        if (!wrapper) return;

        const retailerName = (checkbox.value || "").trim();
        const shouldShow = !allowed || allowed.includes(retailerName);

        wrapper.style.display = shouldShow ? "" : "none";

        // If hidden and checked -> uncheck & sync
        if (!shouldShow && checkbox.checked) {
          checkbox.checked = false;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
  };

  // 🔹 Uncheck all retailer checkboxes on any country change (scoped to login form)
  const resetRetailerCheckboxes = () => {
    loginFormRoot
      .querySelectorAll(".conditional-form_checkbox")
      .forEach((checkbox) => {
        if (checkbox.checked) {
          checkbox.checked = false;
          checkbox.dispatchEvent(new Event("change", { bubbles: true })); // keeps tags in sync
        }
      });
  };

  // 🔹 COUNTRY INPUT LOGIC
  if (countryInput) {
    const handleCountryChange = () => {
      const enteredValue = countryInput.value.trim();

      // 1) .not-available logic
      if (
        enteredValue &&
        enteredValue !== "🇵🇱 Poland" &&
        enteredValue !== "🇷🇴 Romania" &&
        enteredValue.toLowerCase() !== "select country"
      ) {
        countryInput.classList.add(notAvailableClass);
      } else {
        countryInput.classList.remove(notAvailableClass);
      }

      // 2) Toggle success blocks
      const isRealCountry =
        enteredValue === "🇵🇱 Poland" || enteredValue === "🇷🇴 Romania";
      if (demoSuccessEl)
        demoSuccessEl.style.display = isRealCountry ? "none" : "";
      if (realSuccessEl)
        realSuccessEl.style.display = isRealCountry ? "" : "none";

      // 🔹 Optional steps visibility
      optionalStepEls.forEach((el) => {
        el.style.display = isRealCountry ? "" : "none";
      });

      // 3) ALWAYS reset all retailer checkboxes on ANY value change
      resetRetailerCheckboxes();

      // 4) Update visible retailers
      updateRetailerVisibility(enteredValue);
    };

    ["input", "change"].forEach((ev) =>
      countryInput.addEventListener(ev, handleCountryChange)
    );

    new MutationObserver(handleCountryChange).observe(countryInput, {
      attributes: true,
      attributeFilter: ["value"],
      childList: true,
      characterData: true,
      subtree: true,
    });

    handleCountryChange();
  }

  // 🔹 TABS / NAVIGATION / VALIDATION (scoped to login form)
  const createAccElements = {
    tabLinks: loginFormRoot.querySelectorAll(".w-tab-link"),
    tabPanes: loginFormRoot.querySelectorAll(".w-tab-pane"),
    nextButton: loginFormRoot.querySelector("[form-next-button]"),
    prevButton: loginFormRoot.querySelector("[form-previous-button]"),
    submitButtons: loginFormRoot.querySelectorAll(
      'input[type="submit"], button[type="submit"]'
    ),
  };

  if (!Object.values(createAccElements).every((el) => el !== null)) return;

  const {
    tabLinks: createAccTabLinks,
    tabPanes: createAccTabPanes,
    nextButton: createAccNextButton,
    prevButton: createAccPrevButton,
    submitButtons: createAccSubmitButtons,
  } = createAccElements;

  const createAccTotalTabs = createAccTabLinks.length;

  // Track indices of tabs that were skipped
  const skippedTabs = new Set();

  const createAccGetActiveTabIndex = () =>
    Array.from(createAccTabLinks).findIndex((link) =>
      link.classList.contains("w--current")
    );

  const createAccUpdateDynamicData = () => {};

  const createAccCheckRequiredInputs = (createAccIndex) => {
    const createAccActivePane = createAccTabPanes[createAccIndex];
    if (!createAccActivePane) return;

    const createAccRequiredInputs = createAccActivePane.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );

    const createAccValidateInputs = () => {
      const createAccAllFilled = Array.from(createAccRequiredInputs).every(
        (el) => {
          if (el.type === "checkbox" || el.type === "radio") {
            const group = createAccActivePane.querySelectorAll(
              `input[type="${el.type}"][name="${el.name}"][required]`
            );
            return Array.from(group).some((gEl) => gEl.checked);
          }

          const value = (el.value || "").trim();
          return value !== "" && el.checkValidity();
        }
      );

      const countryIsSelect =
        countryInput &&
        countryInput.value &&
        countryInput.value.trim().toLowerCase() === "select country";

      const canGoNext = createAccAllFilled && !countryIsSelect;

      if (createAccNextButton) {
        createAccNextButton.disabled = !canGoNext;
        createAccNextButton.classList.toggle("disabled", !canGoNext);
      }

      if (createAccSubmitButtons && createAccSubmitButtons.length) {
        createAccSubmitButtons.forEach((btn) => {
          btn.disabled = !canGoNext;
          btn.classList.toggle("disabled", !canGoNext);
        });
      }

      const titleText = !canGoNext
        ? countryIsSelect
          ? "Please select a country to continue"
          : "Make sure all required inputs are filled with correct data"
        : "";

      if (!canGoNext) {
        createAccNextButton?.setAttribute("title", titleText);
        createAccSubmitButtons?.forEach((btn) =>
          btn.setAttribute("title", titleText)
        );
      } else {
        createAccNextButton?.removeAttribute("title");
        createAccSubmitButtons?.forEach((btn) => btn.removeAttribute("title"));
      }
    };

    createAccRequiredInputs.forEach((createAccInput) => {
      const createAccEvents = ["input", "blur", "change"];
      createAccEvents.forEach((createAccEvent) =>
        createAccInput.addEventListener(createAccEvent, createAccValidateInputs)
      );
    });

    createAccValidateInputs();
    setTimeout(createAccValidateInputs, 100);
  };

  const createAccTrackDropdownChanges = () => {
    loginFormRoot
      .querySelectorAll(".conditional-form_input-bl")
      .forEach((createAccContainer) => {
        const createAccPlaceholder = createAccContainer.querySelector(
          ".conditional-form_input-placeholder"
        );
        const createAccTextInput =
          createAccContainer.querySelector('input[type="text"]');
        const createAccDropdown = createAccContainer.querySelector(
          ".conditional-form_select-dropdown"
        );

        if (!createAccPlaceholder || !createAccTextInput || !createAccDropdown)
          return;

        const createAccDefaultText = createAccPlaceholder.textContent.trim();

        const createAccUpdateInput = () => {
          const createAccCurrentText = createAccPlaceholder.textContent.trim();

          createAccTextInput.value =
            createAccCurrentText !== createAccDefaultText
              ? createAccCurrentText
              : "";

          if (createAccCurrentText !== createAccDefaultText) {
            createAccTextInput.setAttribute("value", createAccCurrentText);
          } else {
            createAccTextInput.removeAttribute("value");
          }

          createAccTextInput.dispatchEvent(new Event("input"));
        };

        createAccDropdown.addEventListener("change", createAccUpdateInput);
        createAccUpdateInput();
      });
  };

  const createAccActivateTab = (createAccIndex) => {
    createAccTabLinks[createAccIndex]?.click();
    createAccUpdateDynamicData(createAccIndex);
    createAccCheckRequiredInputs(createAccIndex);
  };

  // NEXT BUTTON: skip + remember skipped tab
  createAccNextButton.addEventListener("click", () => {
    const createAccCurrentIndex = createAccGetActiveTabIndex();
    if (createAccCurrentIndex === -1) return;

    const shouldSkipNext =
      countryInput && countryInput.classList.contains(notAvailableClass);

    let targetIndex = createAccCurrentIndex + 1;

    if (shouldSkipNext) {
      const skippedIndex = createAccCurrentIndex + 1;
      if (skippedIndex < createAccTotalTabs) {
        skippedTabs.add(skippedIndex);
      }
      targetIndex = createAccCurrentIndex + 2;
    }

    if (targetIndex >= createAccTotalTabs) {
      targetIndex = createAccTotalTabs - 1;
    }

    if (targetIndex > createAccCurrentIndex) {
      createAccActivateTab(targetIndex);
    }
  });

  // PREV BUTTON: never go back to a skipped tab
  createAccPrevButton.addEventListener("click", () => {
    const createAccCurrentIndex = createAccGetActiveTabIndex();
    if (createAccCurrentIndex <= 0) return;

    let targetIndex = createAccCurrentIndex - 1;

    while (targetIndex >= 0 && skippedTabs.has(targetIndex)) {
      targetIndex--;
    }

    if (targetIndex >= 0) {
      createAccActivateTab(targetIndex);
    }
  });

  createAccUpdateDynamicData(createAccGetActiveTabIndex());
  createAccCheckRequiredInputs(createAccGetActiveTabIndex());
  createAccTrackDropdownChanges();

  // 🔹 Custom dropdown UI (scoped to login form) - supports multiple dropdowns
  const createAccDropdownTriggers = loginFormRoot.querySelectorAll(
    ".custom-dropdown_trigger"
  );

  // Find country search input
  const createAccCountrySearchInput = loginFormRoot.querySelector("#CountrySearch");
  const createAccCountryPlaceholder = loginFormRoot.querySelector("[country-placeholder]");

  // Get visible country options (filtered)
  const createAccGetVisibleCountryOptions = (createAccDropdownList) => {
    if (!createAccDropdownList) return [];
    return Array.from(
      createAccDropdownList.querySelectorAll(
        "a.conditional-form_custom-select.w-dropdown-link"
      )
    ).filter((createAccOption) => {
      return (
        getComputedStyle(createAccOption).display !== "none" &&
        !createAccOption.classList.contains("template")
      );
    });
  };

  // Update country selection in both places
  const createAccUpdateCountrySelection = (createAccCountryText, createAccCountryValue) => {
    if (!createAccCountryText) return;
    
    // Update CountryInput with the selected country text
    if (countryInput) {
      // Set both the value property and HTML attribute
      countryInput.value = createAccCountryText;
      countryInput.setAttribute("value", createAccCountryText);
      
      // Trigger events to notify other listeners (this will trigger handleCountryChange)
      countryInput.dispatchEvent(new Event("input", { bubbles: true }));
      countryInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Update country placeholder
    if (createAccCountryPlaceholder) {
      createAccCountryPlaceholder.textContent = createAccCountryText;
      createAccCountryPlaceholder.style.color = "black";
    }
  };

  // Track highlighted index for keyboard navigation
  let createAccHighlightedIndex = -1;
  let createAccCurrentDropdownList = null;

  // Reset highlight
  const createAccResetHighlight = () => {
    createAccHighlightedIndex = -1;
    if (createAccCurrentDropdownList) {
      const createAccOptions = createAccGetVisibleCountryOptions(
        createAccCurrentDropdownList
      );
      createAccOptions.forEach((createAccOption) => {
        createAccOption.classList.remove("highlighted");
        createAccOption.style.backgroundColor = "";
      });
    }
  };

  // Reset all countries in a dropdown list (show all)
  const createAccResetAllCountries = (createAccDropdownList) => {
    if (!createAccDropdownList) return;
    const createAccCountryOptions = createAccDropdownList.querySelectorAll(
      "a.conditional-form_custom-select.w-dropdown-link"
    );
    createAccCountryOptions.forEach((createAccOption) => {
      createAccOption.style.display = "";
      createAccOption.classList.remove("highlighted");
      createAccOption.style.backgroundColor = "";
    });
  };

  // Filter country options based on search input
  const createAccFilterCountries = (searchText) => {
    if (!createAccCountrySearchInput) return;

    const createAccSearchValue = searchText.toLowerCase().trim();
    const createAccVisibleDropdowns = loginFormRoot.querySelectorAll(
      ".conditional-form_select-list.for-custom.visible"
    );

    createAccVisibleDropdowns.forEach((createAccDropdownList) => {
      const createAccCountryOptions = createAccDropdownList.querySelectorAll(
        "a.conditional-form_custom-select.w-dropdown-link"
      );

      createAccCountryOptions.forEach((createAccOption) => {
        const createAccOptionText = createAccOption.textContent
          .toLowerCase()
          .trim();
        const createAccMatches =
          !createAccSearchValue ||
          createAccOptionText.includes(createAccSearchValue);

        createAccOption.style.display = createAccMatches ? "" : "none";
        // Remove highlight when filtering
        createAccOption.classList.remove("highlighted");
        createAccOption.style.backgroundColor = "";
      });
    });

    // Reset highlight index when filtering
    createAccResetHighlight();
  };

  // Reset search input helper
  const createAccResetSearchInput = () => {
    if (createAccCountrySearchInput && createAccCountrySearchInput.value) {
      createAccCountrySearchInput.value = "";
    }
    // Reset all dropdown lists (both visible and hidden) to show all countries
    loginFormRoot
      .querySelectorAll(".conditional-form_select-list.for-custom")
      .forEach((createAccDropdownList) => {
        createAccResetAllCountries(createAccDropdownList);
      });
  };

  // Store dropdown configurations for each trigger
  const createAccDropdownConfigs = [];

  createAccDropdownTriggers.forEach((createAccDropdownTrigger) => {
    // Find associated dropdown list - look in the same container or nearby
    const createAccContainer = createAccDropdownTrigger.closest(
      ".conditional-form_input-bl, .w-tab-pane, [for-login-form]"
    );
    const createAccDropdownList =
      createAccContainer?.querySelector(
        ".conditional-form_select-list.for-custom"
      ) ||
      loginFormRoot.querySelector(
        ".conditional-form_select-list.for-custom"
      );

    // Find associated tags container - look in the same container or nearby
    const createAccTagsContainer =
      createAccContainer?.querySelector(".tags-holder_wrap") ||
      loginFormRoot.querySelector(".tags-holder_wrap");

    if (!createAccDropdownList) return;

    const createAccToggleDropdown = () => {
      const createAccIsVisible = createAccDropdownList.classList.contains(
        "visible"
      );
      createAccDropdownList.classList.toggle("visible");

      // Focus search input when dropdown becomes visible
      if (!createAccIsVisible && createAccCountrySearchInput) {
        createAccCurrentDropdownList = createAccDropdownList;
        createAccHighlightedIndex = -1; // Reset highlight index
        
        // Reset filter immediately to show all countries when opening
        // This ensures countries are visible even if search input was cleared
        const createAccSearchValue = createAccCountrySearchInput.value || "";
        if (!createAccSearchValue.trim()) {
          // Search is empty - explicitly show all countries
          createAccResetAllCountries(createAccDropdownList);
        }
        
        setTimeout(() => {
          createAccCountrySearchInput.focus();
          // Apply filter if there's a search value
          if (createAccSearchValue.trim()) {
            createAccFilterCountries(createAccSearchValue);
          } else {
            // Ensure all countries are visible (double-check)
            createAccResetAllCountries(createAccDropdownList);
          }
        }, 50);
      } else if (createAccIsVisible) {
        // Reset highlight when closing
        createAccResetHighlight();
        createAccCurrentDropdownList = null;
        // Reset search input when closing
        const createAccHasVisibleDropdown = loginFormRoot.querySelector(
          ".conditional-form_select-list.for-custom.visible"
        );
        if (!createAccHasVisibleDropdown) {
          createAccResetSearchInput();
        }
      }
    };

    createAccDropdownTrigger.addEventListener("click", createAccToggleDropdown);

    // Store config for document-level handlers
    createAccDropdownConfigs.push({
      trigger: createAccDropdownTrigger,
      dropdownList: createAccDropdownList,
      tagsContainer: createAccTagsContainer,
    });

    if (createAccTagsContainer) {
      createAccTagsContainer.addEventListener("click", (e) =>
        e.stopPropagation()
      );
    }
  });

  // Single document-level click handler for all dropdowns
  if (createAccDropdownConfigs.length > 0) {
    document.addEventListener("click", (createAccEvent) => {
      let createAccAnyDropdownClosed = false;
      createAccDropdownConfigs.forEach((config) => {
        const createAccClickedInside = [
          config.trigger,
          config.dropdownList,
          config.tagsContainer,
        ]
          .filter(Boolean)
          .some((createAccEl) => createAccEl.contains(createAccEvent.target));

        if (!createAccClickedInside && config.dropdownList.classList.contains("visible")) {
          config.dropdownList.classList.remove("visible");
          createAccResetHighlight();
          createAccAnyDropdownClosed = true;
        }
      });
      
      // Reset search if any dropdown was closed
      if (createAccAnyDropdownClosed) {
        // Check if no dropdowns are visible
        const createAccHasVisibleDropdown = loginFormRoot.querySelector(
          ".conditional-form_select-list.for-custom.visible"
        );
        if (!createAccHasVisibleDropdown) {
          createAccResetSearchInput();
        }
      }
    });

    // Single document-level Escape key handler
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        let createAccAnyDropdownClosed = false;
        createAccDropdownConfigs.forEach((config) => {
          if (config.dropdownList.classList.contains("visible")) {
            config.dropdownList.classList.remove("visible");
            createAccResetHighlight();
            createAccAnyDropdownClosed = true;
          }
        });
        
        // Reset search if any dropdown was closed
        if (createAccAnyDropdownClosed) {
          const createAccHasVisibleDropdown = loginFormRoot.querySelector(
            ".conditional-form_select-list.for-custom.visible"
          );
          if (!createAccHasVisibleDropdown) {
            createAccResetSearchInput();
          }
        }
      }
    });
  }

  // 🔹 Keyboard navigation and country selection
  const createAccHandleCountrySelection = (createAccCountryOption) => {
    if (!createAccCountryOption) return;

    // Get the full text content including emojis - try multiple methods
    const createAccCountryText = (
      createAccCountryOption.textContent || 
      createAccCountryOption.innerText || 
      createAccCountryOption.text ||
      ""
    ).trim();
    
    if (!createAccCountryText) return; // Don't proceed if no text found
    
    const createAccCountryValue = createAccCountryOption.getAttribute("data-value") || createAccCountryText;
    createAccUpdateCountrySelection(createAccCountryText, createAccCountryValue);

    // Close all dropdowns
    createAccDropdownConfigs.forEach((config) => {
      config.dropdownList.classList.remove("visible");
    });

    // Clear search
    if (createAccCountrySearchInput) {
      createAccCountrySearchInput.value = "";
      createAccFilterCountries("");
    }
  };

  // Update highlight for keyboard navigation
  const createAccUpdateHighlight = (createAccIndex, createAccOptions) => {
    // Remove previous highlight
    createAccOptions.forEach((createAccOption) => {
      createAccOption.classList.remove("highlighted");
      createAccOption.style.backgroundColor = "";
    });

    if (createAccIndex >= 0 && createAccIndex < createAccOptions.length) {
      const createAccHighlightedOption = createAccOptions[createAccIndex];
      createAccHighlightedOption.classList.add("highlighted");
      createAccHighlightedOption.style.backgroundColor = "#f0f0f0";

      // Scroll into view
      createAccHighlightedOption.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  // Keyboard navigation for country dropdown
  if (createAccCountrySearchInput) {
    const createAccHandleKeyboardNavigation = (e) => {
      // Only handle if a dropdown is visible
      const createAccVisibleDropdown = loginFormRoot.querySelector(
        ".conditional-form_select-list.for-custom.visible"
      );
      if (!createAccVisibleDropdown) return;

      createAccCurrentDropdownList = createAccVisibleDropdown;
      const createAccVisibleOptions = createAccGetVisibleCountryOptions(
        createAccCurrentDropdownList
      );

      if (createAccVisibleOptions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        // If nothing is highlighted, start at 0, otherwise move down
        if (createAccHighlightedIndex < 0) {
          createAccHighlightedIndex = 0;
        } else {
          createAccHighlightedIndex =
            createAccHighlightedIndex < createAccVisibleOptions.length - 1
              ? createAccHighlightedIndex + 1
              : 0;
        }
        createAccUpdateHighlight(createAccHighlightedIndex, createAccVisibleOptions);
        // Maintain focus on search input after highlight update
        setTimeout(() => {
          if (createAccCountrySearchInput) {
            createAccCountrySearchInput.focus();
          }
        }, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        // If nothing is highlighted, go to last item, otherwise move up
        if (createAccHighlightedIndex < 0) {
          createAccHighlightedIndex = createAccVisibleOptions.length - 1;
        } else {
          createAccHighlightedIndex =
            createAccHighlightedIndex > 0
              ? createAccHighlightedIndex - 1
              : createAccVisibleOptions.length - 1;
        }
        createAccUpdateHighlight(createAccHighlightedIndex, createAccVisibleOptions);
        // Maintain focus on search input after highlight update
        setTimeout(() => {
          if (createAccCountrySearchInput) {
            createAccCountrySearchInput.focus();
          }
        }, 0);
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (
          createAccHighlightedIndex >= 0 &&
          createAccHighlightedIndex < createAccVisibleOptions.length
        ) {
          createAccHandleCountrySelection(
            createAccVisibleOptions[createAccHighlightedIndex]
          );
          createAccHighlightedIndex = -1;
        }
      }
    };

    createAccCountrySearchInput.addEventListener(
      "keydown",
      createAccHandleKeyboardNavigation
    );
  }

  // Click handler for country options (using event delegation for dynamic content)
  loginFormRoot.addEventListener("click", (e) => {
    const createAccCountryOption = e.target.closest(
      ".conditional-form_select-list.for-custom a.conditional-form_custom-select.w-dropdown-link"
    );
    if (createAccCountryOption && createAccCountryOption.closest("[for-login-form]")) {
      e.preventDefault();
      e.stopPropagation();
      createAccHandleCountrySelection(createAccCountryOption);
    }
  });

  // 🔹 Country search input filtering
  if (createAccCountrySearchInput) {
    // Filter countries as user types
    ["input", "keyup", "paste"].forEach((createAccEventType) => {
      createAccCountrySearchInput.addEventListener(
        createAccEventType,
        (e) => {
          // Don't filter on arrow keys or enter (handled by keyboard navigation)
          if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
            return;
          }
          createAccFilterCountries(e.target.value);
        }
      );
    });

    // Clear search input when dropdown is closed
    const createAccCheckAndResetSearch = () => {
      const createAccHasVisibleDropdown = loginFormRoot.querySelector(
        ".conditional-form_select-list.for-custom.visible"
      );
      if (!createAccHasVisibleDropdown) {
        // No visible dropdown - clear search input and reset filter
        if (createAccCountrySearchInput.value) {
          createAccCountrySearchInput.value = "";
          createAccFilterCountries("");
        }
        createAccResetHighlight();
      }
    };

    // Use MutationObserver to watch for visibility changes
    const createAccObserver = new MutationObserver(createAccCheckAndResetSearch);

    // Observe all dropdown lists for visibility changes
    loginFormRoot
      .querySelectorAll(".conditional-form_select-list.for-custom")
      .forEach((createAccDropdownList) => {
        createAccObserver.observe(createAccDropdownList, {
          attributes: true,
          attributeFilter: ["class"],
        });
      });

    // Also check when dropdowns are closed via click outside or escape
    // This is handled in the document click handler and escape handler
    // We'll add a check there too
  }

  // 🔹 Checkbox tag manager (scoped to login form) + explicit label handling
  const createAccCheckboxTagManager = {
    checkedValues: new Set(),
    templateTag: null,

    getRoot() {
      return loginFormRoot;
    },

    init() {
      this.cacheTemplate();
      this.bindCheckboxEvents();
      this.initializeTagsContainer();
    },

    cacheTemplate() {
      const root = this.getRoot();
      if (!root) return this;

      this.templateTag = root.querySelector(".tags-holder_item");
      if (this.templateTag) {
        Object.assign(this.templateTag.style, { display: "none" });
        this.templateTag.classList.add("template");
      }
      return this;
    },

    bindCheckboxEvents() {
      const root = this.getRoot();
      if (!root) return this;

      const checkboxes = root.querySelectorAll(".conditional-form_checkbox");

      checkboxes.forEach((createAccCheckbox) => {
        // Change event for actual checkbox logic
        createAccCheckbox.addEventListener("change", (e) =>
          this.handleCheckboxChange(e.target)
        );

        // 🔹 Ensure label click toggles checkbox
        if (createAccCheckbox.id) {
          const label = root.querySelector(
            `label[for="${createAccCheckbox.id}"]`
          );
          if (label) {
            label.addEventListener("click", (e) => {
              e.preventDefault();
              if (createAccCheckbox.disabled) return;

              createAccCheckbox.checked = !createAccCheckbox.checked;
              createAccCheckbox.dispatchEvent(
                new Event("change", { bubbles: true })
              );
            });
          }
        }
      });

      return this;
    },

    handleCheckboxChange(createAccCheckbox) {
      const { value } = createAccCheckbox;
      const createAccText = this.getCheckboxText(createAccCheckbox);

      createAccCheckbox.checked
        ? (this.checkedValues.add(value), this.addTag(value, createAccText))
        : (this.checkedValues.delete(value), this.removeTag(value));

      this.updateTagsContainerVisibility();
    },

    getCheckboxText(createAccCheckbox) {
      const createAccLabel = document.querySelector(
        `label[for="${createAccCheckbox.id}"]`
      );
      if (createAccLabel) return createAccLabel.textContent.trim();

      const createAccNextSibling = createAccCheckbox.nextSibling;
      if (createAccNextSibling?.nodeType === Node.TEXT_NODE)
        return createAccNextSibling.textContent.trim();

      return createAccCheckbox.value || "Selected item";
    },

    addTag(createAccValue, createAccText) {
      const root = this.getRoot();
      if (!root || !this.templateTag) return;

      const createAccTagsContainer = root.querySelector(".tags-holder_wrap");
      if (!createAccTagsContainer) return;

      if (
        createAccTagsContainer.querySelector(
          `[data-value="${createAccValue}"]:not(.template)`
        )
      )
        return;

      const createAccTagElement = this.templateTag.cloneNode(true);

      createAccTagElement.style.display = "";
      createAccTagElement.dataset.value = createAccValue;
      createAccTagElement.classList.remove("template");

      const createAccTextElement =
        createAccTagElement.querySelector(".tag-text, [class*='text']") ||
        createAccTagElement.firstElementChild;
      if (createAccTextElement)
        createAccTextElement.textContent = createAccText;

      const createAccCloseButton =
        createAccTagElement.querySelector(
          ".tag-close, [class*='close'], button"
        ) || createAccTagElement.lastElementChild;

      if (createAccCloseButton) {
        const createAccNewCloseButton = createAccCloseButton.cloneNode(true);
        createAccCloseButton.parentNode.replaceChild(
          createAccNewCloseButton,
          createAccCloseButton
        );
        createAccNewCloseButton.addEventListener("click", () =>
          this.removeTagAndUncheck(createAccValue)
        );
      }

      createAccTagsContainer.appendChild(createAccTagElement);
    },

    removeTag(createAccValue) {
      const root = this.getRoot();
      if (!root) return;

      root
        .querySelector(
          `.tags-holder_item[data-value="${createAccValue}\"]:not(.template)`
        )
        ?.remove();
    },

    removeTagAndUncheck(createAccValue) {
      const root = this.getRoot();
      if (!root) return;

      const createAccCheckbox = root.querySelector(
        `.conditional-form_checkbox[value="${createAccValue}"]`
      );
      if (createAccCheckbox) createAccCheckbox.checked = false;

      this.checkedValues.delete(createAccValue);
      this.removeTag(createAccValue);
      this.updateTagsContainerVisibility();
    },

    updateTagsContainerVisibility() {
      const root = this.getRoot();
      if (!root) return;

      const createAccTagsContainer = root.querySelector(".tags-holder_wrap");
      const createAccTagsPlaceholder = root.querySelector(
        "[retailers-placeholder]"
      );
      const createAccHasValues = this.checkedValues.size > 0;

      if (createAccTagsContainer)
        createAccTagsContainer.style.display = createAccHasValues
          ? "flex"
          : "none";
      if (createAccTagsPlaceholder)
        createAccTagsPlaceholder.style.display = createAccHasValues
          ? "none"
          : "flex";
    },

    initializeTagsContainer() {
      const root = this.getRoot();
      if (!root) return;

      const createAccTagsContainer = root.querySelector(".tags-holder_wrap");
      if (createAccTagsContainer) createAccTagsContainer.style.display = "none";
    },

    getCheckedValues() {
      return Array.from(this.checkedValues);
    },

    clearAll() {
      const root = this.getRoot();
      if (!root) return;

      root
        .querySelectorAll(".conditional-form_checkbox:checked")
        .forEach((createAccCheckbox) => (createAccCheckbox.checked = false));

      this.checkedValues.clear();

      root
        .querySelectorAll(".tags-holder_item:not(.template)")
        .forEach((createAccTag) => createAccTag.remove());

      this.updateTagsContainerVisibility();
    },
  };

  createAccCheckboxTagManager.init();

  // 🔹 Conditional dropdown logic (relies on external triggerElement / conditionalDropdown / VISIBILITY_RULES)
  if (typeof triggerElement !== "undefined" && triggerElement) {
    if (loginFormRoot.contains(triggerElement)) {
      const createAccGetTriggerValue = () =>
        triggerElement.value ||
        triggerElement.textContent ||
        triggerElement.innerText;

      const createAccToggleDropdownState = (createAccDisable) => {
        if (!conditionalDropdown) return;

        Object.assign(conditionalDropdown.style, {
          pointerEvents: createAccDisable ? "none" : "",
          opacity: createAccDisable ? "0.5" : "",
        });

        conditionalDropdown.toggleAttribute("disabled", createAccDisable);
        conditionalDropdown.setAttribute("aria-disabled", createAccDisable);

        conditionalDropdown
          .querySelectorAll("select, input, button")
          .forEach((createAccEl) => (createAccEl.disabled = createAccDisable));

        if (createAccDisable) {
          createAccForceCloseDropdown();
          createAccShowAllDropdownItems();
        }
      };

      const createAccForceCloseDropdown = () => {
        conditionalDropdown?.classList.remove("w--open");
        conditionalDropdown
          ?.querySelectorAll(".w--open")
          .forEach((createAccEl) => createAccEl.classList.remove("w--open"));
        conditionalDropdown
          ?.querySelector(".w-dropdown-list")
          ?.classList.remove("w--open");
      };

      const createAccFilterDropdownItems = (createAccTriggerValue) => {
        const createAccAllowedItems =
          VISIBILITY_RULES[createAccTriggerValue] || [];
        conditionalDropdown
          ?.querySelectorAll("a.conditional-form_custom-select.w-dropdown-link")
          .forEach((createAccItem) => {
            createAccItem.style.display = createAccAllowedItems.includes(
              createAccItem.textContent.trim()
            )
              ? ""
              : "none";
          });
      };

      const createAccShowAllDropdownItems = () =>
        conditionalDropdown
          ?.querySelectorAll("a.conditional-form_custom-select.w-dropdown-link")
          .forEach((createAccItem) => (createAccItem.style.display = ""));

      const createAccResetDropdownValues = () => {
        conditionalDropdown
          ?.querySelectorAll("select, input, button")
          .forEach((createAccElement) => {
            if (createAccElement.tagName === "SELECT")
              createAccElement.selectedIndex = 0;
            else if (["checkbox", "radio"].includes(createAccElement.type))
              createAccElement.checked = false;
            else createAccElement.value = "";
            createAccElement.dispatchEvent(
              new Event("change", { bubbles: true })
            );
          });
      };

      const createAccHandleTriggerChange = () => {
        const createAccIsEmpty = !createAccGetTriggerValue().trim();

        if (createAccIsEmpty) {
          createAccForceCloseDropdown();
          createAccResetDropdownValues();
          setTimeout(() => createAccToggleDropdownState(true), 100);
        } else {
          document
            .querySelectorAll("[reset-goal-target]")
            .forEach((createAccBtn) => createAccBtn.click());
          setTimeout(() => {
            createAccToggleDropdownState(false);
            setTimeout(
              () => createAccFilterDropdownItems(createAccGetTriggerValue()),
              50
            );
          }, 50);
        }
      };

      const createAccHandleDropdownClick = (e) => {
        if (!createAccGetTriggerValue().trim()) {
          e.preventDefault();
          e.stopPropagation();
          createAccForceCloseDropdown();
        }
      };

      const createAccInitialize = () => {
        new MutationObserver(createAccHandleTriggerChange).observe(
          triggerElement,
          {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeOldValue: true,
          }
        );

        if (["INPUT", "TEXTAREA", "SELECT"].includes(triggerElement.tagName)) {
          ["input", "change", "keyup", "paste", "cut"].forEach(
            (createAccEvent) =>
              triggerElement.addEventListener(
                createAccEvent,
                createAccHandleTriggerChange
              )
          );
        }

        conditionalDropdown?.addEventListener(
          "click",
          createAccHandleDropdownClick,
          true
        );

        setTimeout(createAccHandleTriggerChange, 100);
      };

      createAccInitialize();
    }
  }

  // 🔹 CLOSE FORM MANAGEMENT (scoped to [for-login-form], except [create-account="open"])
  const createAccForModConfig = {
    animations: {
      close: { duration: 0.6, ease: "power2.out", x: 48 },
      fadeIn: { duration: 0.4, ease: "power2.out" },
      fadeOut: { duration: 0.3, ease: "power2.out" },
      open: { duration: 0.6, ease: "power2.out" },
    },
    nonEditableTypes: ["submit", "button", "reset", "image"],
    selectors: {
      section: ".section.for-form",
      formContainer: ".form-container",
      closeModal: ".close-modal_wrap",
      modalItem: ".close-modal_item",
      triggers: "[close-modal-trigger]",
    },
  };

  const createAccForModIsEditableInput = (createAccInput) =>
    !createAccForModConfig.nonEditableTypes.includes(
      createAccInput.type?.toLowerCase()
    );

  const createAccForModIsInputFilled = (createAccInput) =>
    ["checkbox", "radio"].includes(createAccInput.type)
      ? createAccInput.checked
      : createAccInput.value?.trim() !== "";

  const createAccForModHasFilledInputs = (createAccSection) =>
    [...createAccSection.querySelectorAll("input, textarea, select")]
      .filter(createAccForModIsEditableInput)
      .some(createAccForModIsInputFilled);

  const createAccForModResetFinswetDropdowns = (createAccSection) =>
    createAccSection
      .querySelectorAll('[fs-selectcustom-element="option-reset"]')
      .forEach((createAccLink) => createAccLink.click());

  const createAccForModClearFileUploads = (createAccSection) => {
    createAccSection
      .querySelectorAll(".w-file-upload")
      .forEach((createAccUploadComponent) => {
        const createAccSuccessElement = createAccUploadComponent.querySelector(
          ".w-file-upload-success"
        );

        if (
          createAccSuccessElement &&
          getComputedStyle(createAccSuccessElement).display !== "none"
        ) {
          const createAccRemoveLink = createAccSuccessElement.querySelector(
            ".w-file-remove-link"
          );
          createAccRemoveLink?.click();

          setTimeout(() => {
            ["default", "uploading", "error", "success"].forEach(
              (createAccState) => {
                const createAccEl = createAccUploadComponent.querySelector(
                  `.w-file-upload-${createAccState}`
                );
                if (createAccEl)
                  createAccEl.style.display =
                    createAccState === "default" ? "" : "none";
              }
            );

            const createAccFileInput =
              createAccUploadComponent.querySelector('input[type="file"]');
            if (createAccFileInput) {
              createAccFileInput.value = "";
              createAccFileInput.dispatchEvent(
                new Event("change", { bubbles: true })
              );
            }
          }, 100);
        }
      });
  };

  const createAccForModResetFormInputs = (createAccSection) => {
    [...createAccSection.querySelectorAll("input, textarea, select")].forEach(
      (createAccInput) => {
        if (["checkbox", "radio"].includes(createAccInput.type))
          createAccInput.checked = false;
        else if (!["submit", "button", "reset"].includes(createAccInput.type))
          createAccInput.value = "";
      }
    );

    createAccForModResetFinswetDropdowns(createAccSection);
  };

  const createAccForModResetTabNavigation = () => {
    const root = loginFormRoot || document;
    const createAccTabLinks = root.querySelectorAll(".w-tab-link");
    if (!createAccTabLinks.length) return;

    const createAccFirstTab = createAccTabLinks[0];
    createAccFirstTab?.click();
  };

  const createAccForModClickFirstTabLink = (createAccElement) => {
    const createAccTablist =
      createAccElement.closest('[role="tablist"]') ||
      loginFormRoot.querySelector('[role="tablist"]');
    createAccTablist?.querySelector('a, [role="tab"]')?.click();
  };

  const createAccForModAnimateClose = (createAccSection) => {
    const createAccFormContainer = createAccSection.querySelector(
      createAccForModConfig.selectors.formContainer
    );
    if (!createAccFormContainer) return;

    gsap
      .timeline()
      .to(createAccFormContainer, {
        ...createAccForModConfig.animations.close,
        opacity: 0,
      })
      .to(
        createAccSection,
        {
          opacity: 0,
          duration: createAccForModConfig.animations.close.duration,
          ease: createAccForModConfig.animations.close.ease,
        },
        0
      )
      .set(createAccSection, { display: "none" });
  };

  const createAccForModAnimateOpen = (createAccSection) => {
    const createAccFormContainer = createAccSection.querySelector(
      createAccForModConfig.selectors.formContainer
    );
    if (!createAccFormContainer) return;

    gsap
      .timeline()
      .set(createAccSection, { display: "flex" })
      .set(createAccFormContainer, {
        x: createAccForModConfig.animations.close.x,
        opacity: 0,
      })
      .set(createAccSection, { opacity: 0 })
      .to(createAccFormContainer, {
        x: 0,
        opacity: 1,
        ...createAccForModConfig.animations.open,
      })
      .to(
        createAccSection,
        {
          opacity: 1,
          duration: createAccForModConfig.animations.open.duration,
          ease: createAccForModConfig.animations.open.ease,
        },
        0
      );
  };

  const createAccForModShowConfirmation = (createAccSection) => {
    const createAccModal = createAccSection.querySelector(
      createAccForModConfig.selectors.closeModal
    );
    const createAccModalItem = createAccModal?.querySelector(
      createAccForModConfig.selectors.modalItem
    );
    if (!createAccModal || !createAccModalItem) return;

    gsap
      .timeline()
      .set(createAccModal, { display: "flex", opacity: 0 })
      .set(createAccModalItem, { y: 24, opacity: 0 })
      .to(
        createAccModal,
        { ...createAccForModConfig.animations.fadeIn, opacity: 1 },
        0
      )
      .to(
        createAccModalItem,
        { ...createAccForModConfig.animations.fadeIn, y: 0, opacity: 1 },
        0
      );
  };

  const createAccForModHideConfirmation = (createAccModal) => {
    const createAccModalItem = createAccModal.querySelector(
      createAccForModConfig.selectors.modalItem
    );

    gsap
      .timeline()
      .to(
        createAccModal,
        { ...createAccForModConfig.animations.fadeOut, opacity: 0 },
        0
      )
      .to(
        createAccModalItem,
        { ...createAccForModConfig.animations.fadeOut, y: 24, opacity: 0 },
        0
      )
      .set(createAccModal, { display: "none" });
  };

  const createAccForModCloseClearModal = (
    createAccSection,
    createAccConfirmModal
  ) => {
    if (
      createAccConfirmModal &&
      getComputedStyle(createAccConfirmModal).display !== "none"
    ) {
      createAccForModHideConfirmation(createAccConfirmModal);
    }

    createAccForModResetFormInputs(createAccSection);
    createAccForModClearFileUploads(createAccSection);
    createAccForModResetTabNavigation();

    setTimeout(
      () => createAccForModAnimateClose(createAccSection),
      createAccConfirmModal ? 100 : 0
    );
    setTimeout(() => createAccForModClickFirstTabLink(createAccSection), 200);
  };

  const createAccForModHandleClick = (e) => {
    const createAccHandlers = [
      {
        selector: "[close-modal-trigger]",
        action: (createAccTrigger) => {
          const createAccSection = createAccTrigger.closest(
            createAccForModConfig.selectors.section
          );
          if (!createAccSection) return;
          if (!loginFormRoot.contains(createAccSection)) return;

          const createAccSuccessVisible =
            createAccSection.querySelector(".w-form-done")?.style.display ===
            "block";
          if (createAccSuccessVisible) {
            createAccForModAnimateClose(createAccSection);
            return;
          }

          if (createAccForModHasFilledInputs(createAccSection)) {
            createAccForModShowConfirmation(createAccSection);
          } else {
            createAccForModAnimateClose(createAccSection);
          }
        },
      },
      {
        selector: "[data-confirm-close]",
        action: (createAccButton) => {
          const createAccSection = createAccButton.closest(
            createAccForModConfig.selectors.section
          );
          if (!createAccSection || !loginFormRoot.contains(createAccSection))
            return;
          createAccForModAnimateClose(createAccSection);
        },
      },
      {
        selector: "[data-cancel-close], [cancel-closing-modal]",
        action: (createAccButton) => {
          const createAccModal = createAccButton.closest(
            createAccForModConfig.selectors.closeModal
          );
          if (!createAccModal || !loginFormRoot.contains(createAccModal))
            return;
          createAccForModHideConfirmation(createAccModal);
        },
      },
      {
        selector: "[close-clear-modal]",
        action: (createAccButton) => {
          const createAccSection = createAccButton.closest(
            createAccForModConfig.selectors.section
          );
          if (!createAccSection || !loginFormRoot.contains(createAccSection))
            return;
          const createAccConfirmModal = createAccSection.querySelector(
            createAccForModConfig.selectors.closeModal
          );
          createAccForModCloseClearModal(
            createAccSection,
            createAccConfirmModal
          );
        },
      },
      {
        // This one is allowed to be global (can be outside [for-login-form])
        selector: '[create-account="open"]',
        action: (createAccButton) => {
          const createAccSection =
            createAccButton.closest(createAccForModConfig.selectors.section) ||
            document.querySelector(createAccForModConfig.selectors.section);
          if (!createAccSection) return;
          createAccForModAnimateOpen(createAccSection);
        },
      },
    ];

    for (const { selector, action } of createAccHandlers) {
      const createAccElement = e.target.closest(selector);
      if (!createAccElement) continue;

      if (selector !== '[create-account="open"]') {
        if (!loginFormRoot.contains(createAccElement)) {
          continue;
        }
      }

      e.preventDefault();
      action(createAccElement);
      break;
    }
  };

  document.addEventListener("click", createAccForModHandleClick);
});

(() => {
  const form = document.getElementById('wf-form-Advertiser-registration-form');
  if (!form) return console.warn('Form not found');

  const names = Array.from(
      form.querySelectorAll('input[name], select[name], textarea[name]')
  ).map(el => el.name);

  console.log(names.join('\n'));
})();
