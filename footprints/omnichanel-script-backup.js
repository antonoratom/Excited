  (function (d, s, id) {
    let js, ojs = d.getElementsByTagName(s)[0];

    if (d.getElementById(id)) { return; }

    js = d.createElement(s); js.id = id; js.async = !0;

    js.src = "https://app.footprints-ai.com/jsapi/omnichannel.js";

    ojs.parentNode.insertBefore(js, ojs);

  }(document, 'script', 'omnichanneltrack'));

  const pathTagMapping = {
    'ham-it-up-meat-sales-soar-by-5-4-the-unmatched-power-of-retail-media-to-boost-sales': 'Case Study Matache Macelaru',
    '14-in-store-sales-uplift-winning-strategy-the-unmatched-power-of-retail-media-to-boost-sales': 'Case Study Nutline',
    'how-ai-drives-39-51-sales-volume-uplift-the-unmatched-power-of-retail-media-to-boost-in-store-sales': 'Case Study Neumarkt',
    '20x-better-user-acquisition-cost-the-unmatched-power-of-retail-media-to-generate-conversions': 'Case Study INSTANT.RO',
    'heinekens-uefa-delivers-38-6-extra-roi-the-unmatched-power-of-retail-media-to-drive-awareness-at-the-first-moment-of-truth': 'Case Study Heineken',
    '180-lower-customer-acquisition-cost-the-unmatched-power-of-retail-insights-to-improve-performance-media-campaigns': 'Case Study BCR',
    '50-uplift-in-brand-ad-recall-the-unmatched-power-of-retail-media-to-drive-high-impact-brand-awareness': 'Case Study YOXO',
    'dove-boosts-brand-share-by-9-in-1-month-the-unmatched-power-of-retail-media-to-drive-awareness-and-consideration': 'Case Study Dove',
    'in-store-sales-surge-by-22-in-5-weeks-the-unmatched-power-of-retail-media-to-boost-sales': 'Case Study Birra Moretti',
    "fuzetea-achieves-97-sales-growth-with-ai-driven-retail-media-at-profi-ahold-delhaize": "Case Study Fuzetea",
    "hellmanns-spreads-holiday-cheer--and-sales--with-a-161-boost": "Case study Hellmann Spreads Holiday Cheer",
    "coca-cola-drives-sales-uplift-with-ai-driven-retail-media-at-profi-ahold-delhaize" : "Case Study Coca Cola",
    "profi-scales-20x-retail-media-revenue-with-ai-powered-monetization-in-under-3-months": "Case Study Profi Ahold Delhaize",
    "lays-pepsi-achieve-2-78x-roas-with-ai-driven-retail-media-at-profi-ahold-delhaize": "Case Study Pepsi & Lays",
    "ing-bank-case-study": "Case Study ING Bank Success Story",
    "persil-success-story-55-sales-surge-in-26-days-with-occasion-led-retail-media-at-carrefour": "Case Study Persil Success Story",
    "takis-success-story-footprintsai-profi-retailmedia": "Case Study Takis Success Story",
    "carlsberg-croatia-boosts-sales-for-pan-by-41-with-footprints-ai-retail-media": "Case Study Carlsberg Croatia Pan",
    "how-rivex-boosted-sales-by-2-4x-during-easter-cleaning-season": "Case Study Rivex Easter Spring",
    "ursus-premium-delivers-6-31-sales-uplift-during-winter-holiday": "Case Study Ursus Winter",
    "haribo-achieves-32-8-sales-uplift-in-21-days-with-retail-media": "Case Study De Silva Haribo Winter",
    "yummi-gummi-boosts-sales-26-8-with-retail-media": "Case Study Roshen Yummi Gummi Summer",
    "how-coca-cola-turned-streaming-night-into-a-measurable-growth-territory-with-retail-media": "Case Study Coca-Cola Streaming Night",
    "how-amstel-beat-a-declining-beer-market-with-store-segmented-omnichannel-retail-media": "Case Study Amstel Beat a Declining Beer Market",
    "jack-daniels-achieves-390-sales-uplift": "Case Study Jack Daniel",
    "10x-roas-through-retail-media-how-mutti-drove-portfolio-growth": "Case Study Mutti"
    
  };

  const webinarURL = {  
    "transforming-retail-through-data-ai": "Transforming Retail Through Data",
    "the-third-wave-of-advertising": "Third Wave Of Advertising",
    "path-analysis-retail-analytics-demo": "Path Analysis RA Demo",
    "the-power-of-advanced-sales-insights-with-retail-media": "Advanced Sales Insights",
    "copilot-in-action-ask-your-stores-anything" : "Copilot in Action Ask Your Stores Anything",
    "unlocking-the-power-of-omnichannel-retail-media-campaigns" : "Retail Media Campaigns",
    "how-to-target-shopping-occasions": "Target Shopping Occasions"
  }

  const locationIdMapping = {
    "Romania": "5e343cc295f3a60870ed48f2",
    "Poland": "69256b5df8592d6d35c68080",
    "Argentina": "692575f8f8592d6d35c69e78",
    "Croatia": "69256df7f8592d6d35c68b41",
    "Brazil": "692572b4f8592d6d35c695ca",
    "Mexico": "69257441f8592d6d35c6982f",
    "Chile": "69257864f8592d6d35c6ade0",
    "Malaysia": "6603ef103178cce3dd5d079b",
    "Singapore": "6643631e2fd6df5a3e669233",
    "India": "65e054c3368caa35f73ad2b4",
    "United States": "666ecaeb00f6934969a1c8eb",
    "United Kingdom": "666ec88400f6934969a1c78c"
  }

  const fields = {
    "First-Name": "userFirstName",
    "Last-Name": "userLastName",
    "First-Name-2": "userFirstName",
    "email": "userEmail",
    "Phone": "userPhone",
    "contactTime": "contactTime",
    "formType" : "formType",
    "description" : "description",
    "Company-Name" : "userCompanyName",
    "userCompanyName" : "userCompanyName",
    "vat": "vat",
    "Email-Address": "userEmail",
    "Your-Message" : "description",
    "Notification-Consent" : "agreeToCollect",
    "Position-Name": "position",
    "title" : "title",
    "posSystemName": "posSystemName",
    "existingPOS": "existingPOS",
    "locationsCount": "locationsCount",
    "businessType" : "businessType",
    "businessTypeTwo" : "businessTypeTwo",
    "uniqueRegistrationCode": "uniqueRegistrationCode",
    "privacy" : "agreeToCollect",
    "IBAN": "iban",
    "Bank": "bank",
    "userFirstName": "userFirstName",
    "userLastName": "userLastName",
    "Invite-Reference": "inviteReference",
    "ownerConsent" : "agreeToCollect",
    "partnerConsent": "partnerConsent",
    "businessAddress": "userCompanyAddress",
    "areaInterest" : "areaInterest",
    "role": "role",
    "userEmail" : "userEmail",
    "language": "language",
    "userCountry": "userCountry",
    "CountryInput": "userCountry",
    "advertiser": "advertiser",
    "brand":  "brand",
    "product": "product",
    "skus": "skus",
    "retailer": "retailer",
    "brandCategory": "brandCategory",
    "brandStatus": "brandStatus",
    "campaignObjectiveType": "campaignObjectiveType",
    "campaignPrimaryGoalMetric": "campaignPrimaryGoalMetric",
    "campaignName": "campaignName",
    "startDate": "startDate",
    "endDate": "endDate",
    "applicableDiscount": "applicableDiscount",
    "demographics": "demographics",
    "psychographics": "psychographics",
    "retailBehavior": "retailBehavior",
    "audienceExclusions": "audienceExclusions",
    "geographicFocus": "geographicFocus",
    "shoppingMissions": "shoppingMissions",
    "storeFormats": "storeFormats",
    "seasonalityConsiderations": "seasonalityConsiderations",
    "competitorActivity": "competitorActivity",
    "retailEventsAndPromotions": "retailEventsAndPromotions",
    "weatherOrTimeBasedTriggers": "weatherOrTimeBasedTriggers",
    "adMessagingKeySellingProposition": "adMessagingKeySellingProposition",
    "creativeAssetsAndVariants": "creativeAssetsAndVariants",
    "abTestingVariants": "abTestingVariants",
    "callToAction": "callToAction",
    "disclaimersAndLegalLimitations": "disclaimersAndLegalLimitations",
    "advertiserLogo-2": "advertiserLogo",
    "storeName": "storeName",
    "startingDate": "startingDate",
    "duration": "duration",
    "store-types": "storeTypes",
    "currency": "currencySymbol",
    "store-types": "convenienceStoreType",
    "convenience-number-of-stores": "convenienceStoresNumber",
    "convenience-monthly-transactions": "convenienceMonthlyTransactions",
    "convenience-digital-screens": "convenienceHasDigitalScreens",
    "convenience-screens-per-store": "convenienceScreenCount",
    "convenience-stores-with-screens": "convenienceScreenPercentage",
    "convenience-instore-radio": "convenienceHasInStoreRadio",
    "convenience-stores-with-radio": "convenienceRadioPercentage",
    "store-types": "minimarketStoreType",
    "minimarket-number-of-stores": "minimarketStoresNumber",
    "minimarket-monthly-transactions": "minimarketMonthlyTransactions",
    "minimarket-digital-screens": "minimarketHasDigitalScreens",
    "minimarket-screens-per-store": "minimarketScreenCount",
    "minimarket-stores-with-screens": "minimarketScreenPercentage",
    "minimarket-instore-radio": "minimarketHasInStoreRadio",
    "minimarket-stores-with-radio": "minimarketRadioPercentage",
    "store-types": "supermarketStoreType",
    "supermarket-number-of-stores": "supermarketStoresNumber",
    "supermarket-monthly-transactions": "supermarketMonthlyTransactions",
    "supermarket-digital-screens": "supermarketHasDigitalScreens",
    "supermarket-screens-per-store": "supermarketScreenCount",
    "supermarket-stores-with-screens": "supermarketScreenPercentage",
    "supermarket-instore-radio": "supermarketHasInStoreRadio",
    "supermarket-stores-with-radio": "supermarketRadioPercentage",
    "store-types": "hypermarketStoreType",
    "hypermarket-number-of-stores": "hypermarketStoresNumber",
    "hypermarket-monthly-transactions": "hypermarketMonthlyTransactions",
    "hypermarket-digital-screens": "hypermarketHasDigitalScreens",
    "hypermarket-screens-per-store": "hypermarketScreenCount",
    "hypermarket-stores-with-screens": "hypermarketScreenPercentage",
    "hypermarket-instore-radio": "hypermarketHasInStoreRadio",
    "hypermarket-stores-with-radio": "hypermarketRadioPercentage",
    "on-site": "onSiteChannels",
    "active-website-users": "websiteVisitors",
    "active-mobile-app-users": "appUsers",
    "active-loyalty-program-users": "loyaltyUsers",
    "off-site": "offSiteChannels",
    "active-facebook-app-users": "facebookFollowers",
    "active-instagram-users": "instagramFollowers",
    "active-google-users": "googleViews",
    "active-email-users": "emailSubscribers",
    "active-sms-users": "smsUsers",
    "active-whatsapp-users": "whatsappContacts",
    "CountryInput": "userCountry",
    "CountrySearch": "countrySearch",
    "retailer-selection": "retailer",
    "CompanyName": "userCompanyName",
    "otherRole": "otherRole"
  }

  function formatFFRdata(e) {
    let ffrData = {}
    e.preventDefault();
    e.stopImmediatePropagation();
    let elements = e.target.elements
    const fileBase64Promises = [];

    for (let element of elements) {
      console.log(element.name, element.type)
      if (!fields[element.name]) continue;

      console.log("Processing element:", element.name, "of type:", element.type);

      // For checkboxes, collect ALL checked ones
      if (element.type === "checkbox") {
        // Only checkboxes that are checked
        if (!ffrData[fields[element.name]]) ffrData[fields[element.name]] = [];
        if (element.checked) ffrData[fields[element.name]].push(element.value);
      } else if (element.type === "radio") {
        // For radio buttons, assign only the checked one's value
        if (element.checked) {
          ffrData[fields[element.name]] = element.value;
        }
      } else if (element.type === "file" && element.files.length > 0) {
        // Handle file inputs asynchronously
        let file = element.files[0];
        let fieldName = fields[element.name]; // Store the field name

        console.log("File element name:", element.name);
        console.log("Mapped field name:", fieldName);

        if (!fieldName) {
          console.error("No field mapping found for:", element.name);
          continue; // Skip if no mapping
        }

        fileBase64Promises.push(new Promise((resolve, reject) => {
          let reader = new FileReader();
          reader.onload = function(evt) {
            // Strip DataURL prefix if you only want base64 string
            let base64String = evt.target.result.split(',')[1];

            console.log("Setting ffrData[" + fieldName + "] = base64String");
            console.log("Base64 length:", base64String.length);

            ffrData[fieldName] = base64String;

            // Verify it was set
            console.log("Verification - ffrData[" + fieldName + "] exists:", !!ffrData[fieldName]);
            console.log("File read and converted to base64 for field:", fieldName);

            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }));
      } else {
        let value = element.value;
        ffrData[fields[element.name]] = value;
      }
    }

    // Initialize default values
    var fullPath = window.location.pathname; // Full path of the URL
    var path = fullPath.split('/').pop(); // Extract the last segment

    // Set default location Id
    ffrData.locationId = "5e343cc295f3a60870ed48f2";
    
    // consultant 
    ffrData.consultantId = "6480371331db0e65f8f3242d";
    
    // Set default tags
    ffrData.tags = [ 'Footprints AI' ];

    // Detect language 
    const lang = fullPath.split('/')[1];// "es-mx"
    if (lang === "es-mx") {
      console.log("Detected Spanish Language");
      ffrData.locationId = "692575f8f8592d6d35c69e78";
      ffrData.tags = [ "Argentina", "LATAM"];
    } else {
      console.log("Detected English Language");
    }

    // Remove non-letter characters from userCountry
    if (ffrData.userCountry) {
      ffrData.userCountry = ffrData.userCountry.replace(/^[^\p{L}]+/u, "").trim();
    }
    // For Login creation form only
    if (path.toLowerCase() == 'login-test' || path.toLowerCase() == 'login') {
      ffrData.tags = [...ffrData.tags, 'Login'];
      ffrData.agreeToCollect = "true";
      ffrData.marketingChannels = [{agreed: (ffrData.agreeToCollect), channel: "email", type: "owner"}];
      // Trigger sales action
      ffrData.sdk = "loginForm";
      ffrData.leadActionTypeId = "693bda1ee70250f0938f2283";

      // Location Id mapping based on userCountry from global constant mapping
      if (locationIdMapping[ffrData.userCountry]) {
        ffrData.locationId = locationIdMapping[ffrData.userCountry];
      }
    }

    if (path.toLowerCase() == 'footprints-ai-case-study-chio-chips') {
      ffrData.tags = [ 'Case Study Chio' ];
      window.lintrk('track', { conversion_id: 18398962 });
    }

    ffrData.agreeToCollect = String(ffrData.agreeToCollect === "on");

    const lowerCasePath = path.toLowerCase();
    if (pathTagMapping[lowerCasePath]) {
      ffrData.tags = [pathTagMapping[lowerCasePath]];
      ffrData.marketingChannels = [{agreed: (ffrData.agreeToCollect), channel: "email", type: "owner"}];
    }

    if (path.toLowerCase() == 'retail-media-guide') {
      ffrData.tags = [ 'Retail Media Guide' ];
      ffrData.consultantId = "670d0de8bded9876d954474a";
      ffrData.partnerConsent = String(ffrData.partnerConsent === "on");

      ffrData.marketingChannels = [
        {agreed: (ffrData.agreeToCollect), channel: "email", type: "owner"},
        {agreed: (ffrData.partnerConsent), channel: "email", type: "partners"},
      ];

      // Location Id mapping based on language selection
      if (ffrData.language === 'Spanish') {
        ffrData.locationId = "692575f8f8592d6d35c69e78";
      } else if (ffrData.language === 'Polish') {
	ffrData.locationId = "69256b5df8592d6d35c68080";
      }
    }

    if (webinarURL[lowerCasePath]) {
      ffrData.tags = ["Webinars", webinarURL[lowerCasePath]];
      console.log("Webinar URL", ffrData.tags);
      // added on 14.08
      ffrData.agreeToCollect = "true";
      ffrData.marketingChannels = [{agreed: (ffrData.agreeToCollect), channel: "email", type: "owner"}];
    }

    ffrData.offerCategoryId = '628cb6ab6c4f03698efb43b0';
    ffrData.offerId = '628cb7526c4f03698efb43fe';
    if (document.getElementById('form-type')) {
      ffrData.formType = document.getElementById('form-type').value
      if (ffrData.formType == 'Request A Call') {
        delete ffrData.description
      } else {
        delete ffrData.contactTime
      }
    }


    if (path.toLowerCase() == 'danubius') {
      ffrData.locationId = "66051ea62fbf6cd6f2303a4a";
      ffrData.marketingChannels = [{agreed: (ffrData.agreeToCollect), channel: "email", type: "owner"}];
    }

    // creative-solutions
    // List of relevant route paths
    const mediaPlanPaths = [
      'creative-solutions',
      'creative-solutions-for-form-test',
      'campaign-goals',
      'channels',
      'ad-products-and-formats',
      'measurement-and-analytics',
      'manage-services-integrations',
      'retail-media-campaign-planner'
    ];

    // Check if current path matches any media plan path
    if (mediaPlanPaths.includes(path)) {
      ffrData.sdk = "mediaPlan";
    }

    // Business case
    const businessCasePaths = [
      'capabilities',
      'business-case-generator-for-form-test',
      'business-case-generator'
    ];

    if (businessCasePaths.includes(path)) {
      ffrData.sdk = "businessCase";
    }


    console.log("path name", path.toLowerCase());

    if (path.toLowerCase() == 'join-retail-media-network') {      
      ffrData.tags = [ 'Profi Lead Campaign' ];
    }

    if (
      ['2025', 'schedule', 'bucharest-2025'].includes(path.toLowerCase()) &&
      ['retail-media-summit/2025', 'retail-media-summit/schedule'].includes(
        fullPath.split('/').slice(-2).join('/').toLowerCase()
      )
    ) {
      console.log("retail-media-summit initiatted");
      ffrData.tags = [ 'Retail Media Summit 2025' ];
      ffrData.marketingChannels = [{agreed: (ffrData.agreeToCollect), channel: "email", type: "owner"}];
    }

    // Path for consumer-digest
    var firstPath = (fullPath || "").split('/').filter(Boolean).shift() || "";
    if (firstPath === 'consumer-digest') {
      console.log("firstPath", firstPath);
      ffrData.tags = [ 'consumer-digest' ];

      ffrData.partnerConsent = String(ffrData.partnerConsent === "on");

      ffrData.marketingChannels = [
        {agreed: (ffrData.agreeToCollect), channel: "email", type: "owner"},
        {agreed: (ffrData.partnerConsent), channel: "email", type: "partners"},
      ];
    }

    // check another tags
    if (lang === "es-mx") {
      console.log("Adding Argentina and LATAM tags", ffrData.tags);
      ffrData.tags = [...ffrData.tags, "Argentina", "LATAM"];
      console.log("Updated tags", ffrData.tags);
      ffrData.consultantId = "69281aeb2e758f3e6f9ca78a";
    }

    Promise.all(fileBase64Promises)
      .then(() => {
      console.log(ffrData, "ffrData - Complete with files");
      ochn.register(ffrData);

      // ✅ Show success even when .w-form-done is outside <form>
      const form = e.target.closest("form");
      const wrapper = form.parentElement; // parent <div class="conditional-form_block w-form">
      const successWrapper = wrapper.querySelector(".w-form-done");
      const errorWrapper = wrapper.querySelector(".w-form-fail");

      if (successWrapper) successWrapper.style.display = "block";
      if (errorWrapper) errorWrapper.style.display = "none";
      form.style.display = "none";
    })
      .catch((error) => {
      console.error('File processing failed:', error);
      console.log(ffrData, "ffrData - Without files due to error");
      ochn.register(ffrData);

      // ❌ Show error message if submission failed
      const form = e.target.closest("form");
      const wrapper = form.parentElement;
      const errorWrapper = wrapper.querySelector(".w-form-fail");

      if (errorWrapper) errorWrapper.style.display = "block";
    });
  }

  function formTrigger() {
    if (document.getElementsByTagName("form").length > 0) {
      console.log("Form function")
      let forms = document.getElementsByTagName("form")
      console.log(forms)
      for (let form of forms) {
        form.addEventListener("submit", formatFFRdata)
      }
    }
  }

  document.addEventListener("DOMContentLoaded", formTrigger, false);

  function setFormType(e) {
    console.log(e)
    let value = e.target.innerText
    console.log(value)
    document.getElementById('form-type').value = value
  }

  let formTypes = document.getElementsByClassName("formtype-selection")
  console.log(formTypes)
  if (formTypes && formTypes.length) {
    for (let item of formTypes) {
      item.addEventListener('click', setFormType)
    }
  }

  if (document.getElementById('form-type')) {
    document.getElementById('form-type').style = "display: none"
    document.getElementById('form-type').value = "Request A Call"
  }
