// ===================================
// FORM-SPECIFIC VALIDATION & LOGIC
// ===================================

document.addEventListener("DOMContentLoaded", () => {
  const formManager = new ConditionalFormManager();
  if (!formManager.init())
    return console.error("Form manager failed to initialize");

  // ===================================
  // UTILITY FUNCTIONS
  // ===================================

  const setElementState = (
    element,
    { required = false, tabindex = null, value = null, checked = null } = {}
  ) => {
    required
      ? element.setAttribute("required", "")
      : element.removeAttribute("required");

    if (tabindex !== null) {
      tabindex === -1
        ? element.setAttribute("tabindex", "-1")
        : element.removeAttribute("tabindex");
    }

    if (value !== null && "value" in element) element.value = value;
    if (checked !== null && "checked" in element) element.checked = checked;
  };

  const setElementsState = (elements, state) =>
    elements.forEach((el) => setElementState(el, state));

  const queryAll = (parent, selector) =>
    Array.from(parent.querySelectorAll(selector));

  const getTextInputs = (parent) =>
    queryAll(parent, "input, textarea, select").filter(
      (input) =>
        ["text", "email", "tel", "number"].includes(input.type) ||
        ["TEXTAREA", "SELECT"].includes(input.tagName)
    );

  const triggerValidation = () =>
    setTimeout(
      () =>
        formManager.customValidator?.(
          formManager.getCurrentStepIndex(),
          formManager.getCurrentPane(),
          formManager.elements.nextButton
        ),
      10
    );

  const replaceElement = (element) => {
    const clone = element.cloneNode(true);
    element.parentNode.replaceChild(clone, element);
    return clone;
  };

  // ===================================
  // MERGED SELECTS LOGIC
  // ===================================

  const MONTH_MAP = {
    january: "01",
    jan: "01",
    february: "02",
    feb: "02",
    march: "03",
    mar: "03",
    april: "04",
    apr: "04",
    may: "05",
    june: "06",
    jun: "06",
    july: "07",
    jul: "07",
    august: "08",
    aug: "08",
    september: "09",
    sep: "09",
    sept: "09",
    october: "10",
    oct: "10",
    november: "11",
    nov: "11",
    december: "12",
    dec: "12",
  };

  const getMonthNumber = (value) => {
    if (!value) return null;
    if (/^\d+$/.test(value)) return value.toString().padStart(2, "0");
    return MONTH_MAP[value.toLowerCase().trim()] || null;
  };

  const handleMergedSelects = () => {
    const container = document.querySelector("#merged-selects");
    if (!container) return;

    // Populate year select
    const yearSelect = document.querySelector("#customYears");
    if (yearSelect) {
      const currentYear = new Date().getFullYear();
      const placeholder = yearSelect.querySelector('option[value=""]');

      yearSelect.innerHTML = placeholder?.outerHTML || "";
      Array.from({ length: 6 }, (_, i) => currentYear + i).forEach((year) => {
        yearSelect.insertAdjacentHTML(
          "beforeend",
          `<option value="${year}">${year}</option>`
        );
      });

      console.log(`✓ Years populated: ${currentYear}-${currentYear + 5}`);
    }

    const selects = queryAll(container, "select");
    const targetInput = container.querySelector('input[type="text"]');

    if (selects.length < 2 || !targetInput) {
      return console.warn("Missing selects or target input in #merged-selects");
    }

    const [monthSelect, yearSelectEl] = [
      selects.find((s) => s.id !== "customYears") || selects[0],
      yearSelect || selects[1],
    ];

    const updateMergedValue = () => {
      const month = monthSelect.value;
      const year = yearSelectEl.value;

      if (!month || !year) {
        targetInput.value = "";
        targetInput.removeAttribute("value");
        return;
      }

      const monthNumber = getMonthNumber(month);
      if (!monthNumber) return console.warn("Invalid month:", month);

      const formattedDate = `${year}-${monthNumber}-01`;
      targetInput.value = formattedDate;
      targetInput.setAttribute("value", formattedDate);
      targetInput.dispatchEvent(new Event("input", { bubbles: true }));

      console.log("✓ Date:", formattedDate);
    };

    [monthSelect, yearSelectEl].forEach((select) =>
      select.addEventListener("change", updateMergedValue)
    );

    updateMergedValue();
  };

  // ===================================
  // CHECKBOX GROUP HANDLERS
  // ===================================

  const clearConditionalWrap = (wrap) => {
    setElementsState(getTextInputs(wrap), {
      required: false,
      tabindex: -1,
      value: "",
    });

    queryAll(wrap, ".conditional-subvalue_group").forEach((group) => {
      setElementsState(queryAll(group, '[type="radio"]'), {
        required: false,
        tabindex: -1,
        checked: false,
      });
      setElementsState(getTextInputs(group), {
        required: false,
        tabindex: -1,
        value: "",
      });
    });
  };

  const handleNoneCheckbox = (groupName) => {
    const noneCheckbox = document.querySelector(
      `[name="${groupName}"][value="None"]`
    );
    if (!noneCheckbox) return;

    const handleToggle = (isNone, checkbox) => {
      if (!checkbox.checked) return;

      const others = queryAll(document, `[name="${groupName}"]`).filter((cb) =>
        isNone ? cb.value !== "None" : cb.value === "None"
      );

      others.forEach((cb) => {
        if (cb.checked) {
          cb.checked = false;
          cb.dispatchEvent(new Event("change", { bubbles: true }));

          const wrap = cb.closest(".conditional-checkbox_wrap");
          if (wrap) clearConditionalWrap(wrap);
        }
      });

      triggerValidation();
    };

    queryAll(document, `[name="${groupName}"]`).forEach((cb) =>
      cb.addEventListener("change", (e) =>
        handleToggle(cb.value === "None", e.target)
      )
    );
  };

  // ===================================
  // CONDITIONAL CHECKBOX LOGIC
  // ===================================

  const handleConditionalCheckboxes = () => {
    queryAll(document, ".conditional-checkbox_wrap").forEach((wrap) => {
      const checkbox = wrap.querySelector('[type="checkbox"]');
      if (!checkbox) return;

      const directInputs = getTextInputs(wrap).filter(
        (input) => !input.closest(".conditional-subvalue_group")
      );

      const subvalueGroups = queryAll(wrap, ".conditional-subvalue_group");

      const updateState = () => {
        const isChecked = checkbox.checked;

        // Update direct inputs with tabindex 1 when checked
        setElementsState(directInputs, {
          required: isChecked,
          tabindex: isChecked ? 1 : -1, // Changed: now sets to 1 instead of null
          ...(!isChecked && { value: "" }),
        });

        subvalueGroups.forEach((group) => {
          const radios = queryAll(group, '[type="radio"]');
          const inputs = getTextInputs(group);

          // Radio buttons get tabindex 1 when checkbox is checked
          setElementsState(radios, {
            required: isChecked,
            tabindex: isChecked ? 1 : -1, // Changed: now sets to 1 instead of null
            ...(!isChecked && { checked: false }),
          });

          if (!isChecked) {
            setElementsState(inputs, {
              required: false,
              tabindex: -1,
              value: "",
            });
          }
          // Note: When checked, inputs in subvalue groups are controlled by handleSubvalueGroup
          // which sets tabindex based on Yes/No radio selection
        });

        triggerValidation();
      };

      checkbox.addEventListener("change", updateState);
      updateState();
    });
  };

  // ===================================
  // SUBVALUE GROUP LOGIC
  // ===================================

  const handleSubvalueGroup = (group) => {
    const yesRadio = group.querySelector('[type="radio"][value="Yes"]');
    if (!yesRadio) return;

    const inputs = getTextInputs(group);
    const radioName = yesRadio.getAttribute("name");
    const allRadios = radioName
      ? queryAll(document, `[type="radio"][name="${radioName}"]`)
      : queryAll(group, '[type="radio"]');

    const updateInputs = () => {
      const isYesChecked =
        group.querySelector('[type="radio"][value="Yes"]')?.checked || false;

      setElementsState(inputs, {
        required: isYesChecked,
        tabindex: isYesChecked ? 1 : -1,
        ...(!isYesChecked && { value: "" }),
      });

      triggerValidation();
    };

    allRadios.forEach((radio) =>
      replaceElement(radio).addEventListener("change", updateInputs)
    );

    updateInputs();
  };

  // ===================================
  // VALIDATION LOGIC
  // ===================================

  const CHECKBOX_GROUPS = ["store-types", "on-site", "off-site"];

  const isDatepicker = (input) =>
    input.getAttribute("data-toggle") === "datepicker" ||
    input.classList.contains("datepicker") ||
    input.hasAttribute("data-datepicker") ||
    input.closest('[data-toggle="datepicker"]') ||
    input.closest(".datepicker-container");

  const getDatepickerValue = (input) => {
    const { value, placeholder } = input;
    const dataPlaceholder = input.getAttribute("data-placeholder");

    if (value?.trim() && value !== placeholder && value !== dataPlaceholder)
      return value;
    return (
      input.parentElement
        ?.querySelector('input[type="hidden"]')
        ?.value?.trim() || ""
    );
  };

  const validateInput = (input, activePane) => {
    const checkboxGroupName = input.getAttribute("name");
    if (CHECKBOX_GROUPS.includes(checkboxGroupName)) return true;

    const checkboxWrap = input.closest(".conditional-checkbox_wrap");
    if (checkboxWrap?.querySelector('[type="checkbox"]')?.checked === false)
      return true;

    if (input.type !== "radio") {
      const subvalueGroup = input.closest(".conditional-subvalue_group");
      if (
        subvalueGroup?.querySelector('[type="radio"][value="Yes"]')?.checked ===
        false
      )
        return true;
    }

    if (input.type === "radio") {
      const radioName = input.getAttribute("name");
      if (!radioName) return input.checked;

      const radioGroup = queryAll(
        activePane,
        `input[type="radio"][name="${radioName}"][required]`
      );
      return (
        radioGroup.length === 0 || radioGroup.some((radio) => radio.checked)
      );
    }

    if (isDatepicker(input)) return !!getDatepickerValue(input);

    return input.value.trim() && input.checkValidity();
  };

  const validateCheckboxGroup = (checkboxes) => {
    const isValid =
      checkboxes.length === 0 || checkboxes.some((cb) => cb.checked);
    setElementsState(checkboxes, { required: !isValid });
    return isValid;
  };

  const validateStep = (stepIndex, activePane, nextButton) => {
    if (!activePane) return;

    const requiredInputs = queryAll(
      activePane,
      "input[required], textarea[required], select[required]"
    );
    const checkboxGroups = CHECKBOX_GROUPS.map((name) =>
      queryAll(activePane, `[name="${name}"]`)
    );

    const checkValidity = () => {
      const [storeTypesValid, onSiteValid, offSiteValid] = checkboxGroups.map(
        validateCheckboxGroup
      );
      const allFilled = requiredInputs.every((input) =>
        validateInput(input, activePane)
      );
      const isValid =
        allFilled && storeTypesValid && onSiteValid && offSiteValid;

      if (isValid) {
        formManager.enableNextButton();
      } else {
        const errorMessages = [
          [storeTypesValid, "Please select at least one store type"],
          [onSiteValid, "Please select at least one on-site option"],
          [offSiteValid, "Please select at least one off-site option"],
        ];

        const errorMessage =
          errorMessages.find(([valid]) => !valid)?.[1] ||
          "Make sure all required inputs are filled with correct data";

        formManager.disableNextButton(errorMessage);
      }
    };

    const setupDatepickerListeners = (input) => {
      input.addEventListener("change", () => {
        if (input.value) input.setAttribute("value", input.value);
        checkValidity();
      });

      new MutationObserver(checkValidity).observe(input, {
        attributes: true,
        attributeFilter: ["value", "data-value"],
      });

      let lastValue = input.value;
      const pollInterval = setInterval(() => {
        if (!document.contains(input)) return clearInterval(pollInterval);
        if (input.value !== lastValue) {
          lastValue = input.value;
          checkValidity();
        }
      }, 500);
    };

    [
      ...checkboxGroups.flat(),
      ...queryAll(activePane, 'input[type="radio"]'),
      ...requiredInputs,
    ].forEach((input) => {
      const checkboxGroupName = input.getAttribute("name");

      if (
        input.type === "radio" ||
        CHECKBOX_GROUPS.includes(checkboxGroupName)
      ) {
        input.addEventListener("change", checkValidity);
      } else {
        ["input", "blur"].forEach((event) =>
          input.addEventListener(event, checkValidity)
        );
        if (isDatepicker(input)) setupDatepickerListeners(input);
      }
    });

    checkValidity();
    setTimeout(checkValidity, 100);
  };

  formManager.setCustomValidator(validateStep);
  validateStep(
    formManager.getCurrentStepIndex(),
    formManager.getCurrentPane(),
    formManager.elements.nextButton
  );

  // ===================================
  // FORM CLOSE LOGIC WITH SUCCESS CHECK
  // ===================================

  const handleFormClose = () => {
    document.addEventListener(
      "click",
      (e) => {
        const closeButton = e.target.closest("[close-modal-trigger]");
        if (!closeButton) return;

        const section = closeButton.closest(".section.for-form");
        if (!section) return;

        // Check if success message is visible
        const successMessage = section.querySelector(
          ".form-success-message_wrap"
        );
        if (successMessage) {
          const isVisible =
            window.getComputedStyle(successMessage).display !== "none";

          if (isVisible) {
            // Success message is showing - skip confirmation modal
            e.stopPropagation(); // Stop the global handler from running
            e.preventDefault();

            console.log(
              "✓ Success message visible - closing without confirmation"
            );

            // Close the form directly
            if (window.FormModalManager) {
              window.FormModalManager.animateClose(section);
            }
          }
        }
      },
      true
    ); // Use capture phase to run before global handler
  };

  // ===================================
  // CUSTOM DROPDOWN TRACKING
  // ===================================

  const trackDropdownChanges = () => {
    queryAll(document, ".conditional-form_input-bl")
      .filter((container) => !container.closest("#merged-selects"))
      .forEach((container) => {
        const placeholder = container.querySelector(
          ".conditional-form_input-placeholder"
        );
        const textInput = container.querySelector('input[type="text"]');
        const dropdown = container.querySelector(
          ".conditional-form_select-dropdown"
        );

        if (
          !placeholder ||
          !textInput ||
          !dropdown ||
          textInput.closest("#merged-selects")
        )
          return;

        const defaultText = placeholder.textContent.trim();

        const updateInput = () => {
          const currentText = placeholder.textContent.trim();
          const hasValue = currentText !== defaultText;

          textInput.value = hasValue ? currentText : "";
          hasValue
            ? textInput.setAttribute("value", currentText)
            : textInput.removeAttribute("value");
          textInput.dispatchEvent(new Event("input"));
        };

        dropdown.addEventListener("change", updateInput);
        updateInput();
      });
  };

  // ===================================
  // INITIALIZATION
  // ===================================

  handleConditionalCheckboxes();
  handleNoneCheckbox("on-site");
  handleNoneCheckbox("off-site");
  handleMergedSelects();
  handleFormClose(); // Add this line
  queryAll(document, ".conditional-subvalue_group").forEach(
    handleSubvalueGroup
  );
  trackDropdownChanges();
});
