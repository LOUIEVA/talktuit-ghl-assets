/*
 * TalkTuit GHL Customizer
 * Version: 1.3.0
 *
 * Vanilla JavaScript only. No jQuery and no user data is transmitted.
 */

(function talkTuitGhlCustomizer() {
  "use strict";

  if (window.__talkTuitGhlCustomizerLoaded) {
    return;
  }

  window.__talkTuitGhlCustomizerLoaded = true;

  var VERSION = "1.3.0";
  var STORAGE_KEY = "talktuit-ghl-theme";
  var script =
    document.currentScript ||
    document.querySelector('script[src*="talktuit-ghl.js"]');
  var scriptData = script ? script.dataset : {};

  var DEFAULT_TAG_ALIASES = {
    hot: ["hot", "hot lead"],
    urgent: ["urgent", "emergency", "priority"],
    new: ["new", "new lead"],
    won: ["won", "closed won", "booked"],
    "follow-up": ["follow up", "follow-up", "callback", "call back"],
    cold: ["cold", "unqualified", "closed lost"]
  };

  var DEFAULTS = {
    cssUrl: "",
    theme: "light",
    persistTheme: true,
    showThemeControl: true,
    decorateOpportunityTags: true,
    colorfulSections: true,
    fullWorkspaceTheme: false,
    brandShell: true,
    showLoadConfirmation: false,
    tagAliases: DEFAULT_TAG_ALIASES,
    debug: false
  };

  var globalConfig = isPlainObject(window.TalkTuitGHLConfig)
    ? window.TalkTuitGHLConfig
    : {};

  var config = Object.assign({}, DEFAULTS, globalConfig, {
    cssUrl: scriptData.cssUrl || globalConfig.cssUrl || DEFAULTS.cssUrl,
    theme: scriptData.theme || globalConfig.theme || DEFAULTS.theme,
    persistTheme: readBoolean(
      scriptData.persistTheme,
      globalConfig.persistTheme,
      DEFAULTS.persistTheme
    ),
    showThemeControl: readBoolean(
      scriptData.showThemeControl,
      globalConfig.showThemeControl,
      DEFAULTS.showThemeControl
    ),
    decorateOpportunityTags: readBoolean(
      scriptData.decorateOpportunityTags,
      globalConfig.decorateOpportunityTags,
      DEFAULTS.decorateOpportunityTags
    ),
    colorfulSections: readBoolean(
      scriptData.colorfulSections,
      globalConfig.colorfulSections,
      DEFAULTS.colorfulSections
    ),
    fullWorkspaceTheme: readBoolean(
      scriptData.fullWorkspaceTheme,
      globalConfig.fullWorkspaceTheme,
      DEFAULTS.fullWorkspaceTheme
    ),
    brandShell: readBoolean(
      scriptData.brandShell,
      globalConfig.brandShell,
      DEFAULTS.brandShell
    ),
    showLoadConfirmation: readBoolean(
      scriptData.showLoadConfirmation,
      globalConfig.showLoadConfirmation,
      DEFAULTS.showLoadConfirmation
    ),
    debug: readBoolean(
      scriptData.debug,
      globalConfig.debug,
      DEFAULTS.debug
    ),
    tagAliases: Object.assign(
      {},
      DEFAULT_TAG_ALIASES,
      isPlainObject(globalConfig.tagAliases) ? globalConfig.tagAliases : {}
    )
  });

  var observer = null;
  var refreshTimer = null;
  var routeTimer = null;
  var lastLocationHref = "";
  var tagLookup = buildTagLookup(config.tagAliases);

  function isPlainObject(value) {
    return Boolean(
      value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.getPrototypeOf(value) === Object.prototype
    );
  }

  function readBoolean(attributeValue, configuredValue, fallback) {
    if (attributeValue === "true") {
      return true;
    }

    if (attributeValue === "false") {
      return false;
    }

    if (typeof configuredValue === "boolean") {
      return configuredValue;
    }

    return fallback;
  }

  function log() {
    if (!config.debug || !window.console) {
      return;
    }

    var args = Array.prototype.slice.call(arguments);
    args.unshift("[TalkTuit GHL]");
    window.console.info.apply(window.console, args);
  }

  function deriveCssUrl() {
    if (config.cssUrl) {
      return config.cssUrl;
    }

    if (!script || !script.src) {
      return "";
    }

    try {
      return new URL("talktuit-ghl.css", script.src).href;
    } catch (error) {
      log("Could not derive the stylesheet URL.", error);
      return "";
    }
  }

  function loadStylesheet() {
    if (
      document.getElementById("talktuit-ghl-theme") ||
      document.querySelector('link[href*="talktuit-ghl.css"]')
    ) {
      return;
    }

    var cssUrl = deriveCssUrl();

    if (!cssUrl) {
      log(
        "No CSS URL found. Add data-css-url to the script tag or load the CSS separately."
      );
      return;
    }

    var link = document.createElement("link");
    link.id = "talktuit-ghl-theme";
    link.rel = "stylesheet";
    link.href = cssUrl;
    link.dataset.ttVersion = VERSION;
    document.head.appendChild(link);
  }

  function isResolvedTemplateValue(value) {
    return Boolean(value && value.indexOf("{{") === -1);
  }

  function exposeSafeUserContext() {
    var root = document.documentElement;
    var userRole = scriptData.userRole || "";
    var userType = scriptData.userType || "";

    if (isResolvedTemplateValue(userRole)) {
      root.dataset.ttUserRole = toSlug(userRole);
    }

    if (isResolvedTemplateValue(userType)) {
      root.dataset.ttUserType = toSlug(userType);
    }
  }

  function getSavedTheme() {
    if (!config.persistTheme) {
      return "";
    }

    try {
      return window.localStorage.getItem(STORAGE_KEY) || "";
    } catch (error) {
      log("Theme preference storage is unavailable.", error);
      return "";
    }
  }

  function saveTheme(theme) {
    if (!config.persistTheme) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      log("Theme preference could not be saved.", error);
    }
  }

  function normalizeTheme(theme) {
    return theme === "focus" ? "focus" : "light";
  }

  function setTheme(theme, shouldPersist) {
    var normalizedTheme = normalizeTheme(theme);
    document.documentElement.dataset.ttTheme = normalizedTheme;

    if (shouldPersist !== false) {
      saveTheme(normalizedTheme);
    }

    syncThemeControl(normalizedTheme);

    document.dispatchEvent(
      new CustomEvent("talktuit:theme-change", {
        detail: { theme: normalizedTheme }
      })
    );
  }

  function waveformMarkup() {
    return (
      '<span class="tt-waveform" aria-hidden="true">' +
      "<span></span><span></span><span></span><span></span>" +
      "</span>"
    );
  }

  function createThemeControl() {
    if (!config.showThemeControl || document.getElementById("tt-theme-control")) {
      return;
    }

    var control = document.createElement("div");
    control.id = "tt-theme-control";
    control.innerHTML =
      '<div class="tt-theme-panel" id="tt-theme-panel" role="dialog" aria-label="TalkTuit display settings">' +
      '<p class="tt-theme-heading">TalkTuit\u2122 display</p>' +
      '<p class="tt-theme-copy">Choose the calm light workspace or navy focus mode.</p>' +
      '<div class="tt-theme-options" role="group" aria-label="Display theme">' +
      '<button class="tt-theme-option" type="button" data-tt-theme-choice="light" aria-pressed="false">Light</button>' +
      '<button class="tt-theme-option" type="button" data-tt-theme-choice="focus" aria-pressed="false">Navy focus</button>' +
      "</div>" +
      "</div>" +
      '<button class="tt-theme-trigger" type="button" aria-expanded="false" aria-controls="tt-theme-panel" aria-label="Open TalkTuit display settings. Current theme: Light">' +
      waveformMarkup() +
      '<span class="tt-theme-trigger__label">Light</span>' +
      "</button>";

    document.body.appendChild(control);

    var trigger = control.querySelector(".tt-theme-trigger");
    var choices = control.querySelectorAll("[data-tt-theme-choice]");

    trigger.addEventListener("click", function onThemeTriggerClick() {
      var isOpen = control.classList.toggle("tt-theme-control--open");
      trigger.setAttribute("aria-expanded", String(isOpen));
    });

    Array.prototype.forEach.call(choices, function bindThemeChoice(button) {
      button.addEventListener("click", function onThemeChoiceClick() {
        setTheme(button.dataset.ttThemeChoice);
      });
    });

    document.addEventListener("click", function closeThemeControl(event) {
      if (!control.contains(event.target)) {
        control.classList.remove("tt-theme-control--open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function closeThemeControlOnEscape(event) {
      if (event.key === "Escape") {
        control.classList.remove("tt-theme-control--open");
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      }
    });

    syncThemeControl(document.documentElement.dataset.ttTheme || "light");
  }

  function syncThemeControl(theme) {
    var choices = document.querySelectorAll("[data-tt-theme-choice]");
    var trigger = document.querySelector("#tt-theme-control .tt-theme-trigger");
    var triggerLabel = document.querySelector(
      "#tt-theme-control .tt-theme-trigger__label"
    );
    var themeLabel = theme === "focus" ? "Navy Focus" : "Light";

    Array.prototype.forEach.call(choices, function updateThemeChoice(button) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.ttThemeChoice === theme)
      );
    });

    if (triggerLabel) {
      triggerLabel.textContent = themeLabel;
    }

    if (trigger) {
      trigger.dataset.ttActiveTheme = theme;
      trigger.setAttribute(
        "aria-label",
        "Open TalkTuit display settings. Current theme: " + themeLabel
      );
      trigger.setAttribute("title", "TalkTuit theme: " + themeLabel);
    }
  }

  function createLoadConfirmation() {
    if (
      !config.showLoadConfirmation ||
      document.getElementById("tt-load-confirmation")
    ) {
      return;
    }

    var notice = document.createElement("div");
    notice.id = "tt-load-confirmation";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    notice.innerHTML =
      '<strong style="display:block;font-size:13px;line-height:1.25;">TalkTuit theme loaded</strong>' +
      '<span style="display:block;font-size:11px;line-height:1.35;margin-top:2px;opacity:.78;">Contacts, Opportunities, and Conversations are ready.</span>';

    Object.assign(notice.style, {
      background: "linear-gradient(135deg, #0b324b, #124663)",
      border: "1px solid rgba(99, 198, 195, .45)",
      borderRadius: "14px",
      bottom: "20px",
      boxShadow: "0 14px 36px rgba(11, 50, 75, .28)",
      color: "#ffffff",
      fontFamily: "Manrope, Arial, sans-serif",
      maxWidth: "310px",
      padding: "12px 15px",
      position: "fixed",
      right: "78px",
      zIndex: "2147482999"
    });

    document.body.appendChild(notice);

    window.setTimeout(function removeLoadConfirmation() {
      if (notice.parentNode) {
        notice.remove();
      }
    }, 6500);
  }

  function sectionLabel(section) {
    if (section === "contacts") {
      return "Contacts";
    }

    if (section === "opportunities") {
      return "Opportunities";
    }

    if (section === "conversations") {
      return "Conversations";
    }

    return "CRM";
  }

  function createBrandShell() {
    if (!config.brandShell || document.getElementById("tt-brand-shell")) {
      return;
    }

    var shell = document.createElement("div");
    shell.id = "tt-brand-shell";
    shell.setAttribute("aria-label", "TalkTuit branded CRM");
    shell.innerHTML =
      '<span class="tt-brand-shell__mark">' +
      waveformMarkup() +
      "</span>" +
      '<span class="tt-brand-shell__name">TalkTuit</span>' +
      '<span class="tt-brand-shell__divider" aria-hidden="true"></span>' +
      '<span class="tt-brand-shell__section">CRM</span>';

    document.body.appendChild(shell);
  }

  function syncBrandShell(section) {
    var shell = document.getElementById("tt-brand-shell");

    if (!shell) {
      return;
    }

    shell.dataset.ttShellSection = section || "crm";

    var label = shell.querySelector(".tt-brand-shell__section");
    if (label) {
      label.textContent = sectionLabel(section);
    }
  }

  function normalizeTag(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[_/]+/g, " ")
      .replace(/\s+/g, " ");
  }

  function toSlug(value) {
    return normalizeTag(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function buildTagLookup(tagAliases) {
    var lookup = {};

    Object.keys(tagAliases).forEach(function registerTheme(theme) {
      var aliases = Array.isArray(tagAliases[theme])
        ? tagAliases[theme]
        : [tagAliases[theme]];

      aliases.concat(theme).forEach(function registerAlias(alias) {
        lookup[normalizeTag(alias)] = theme;
      });
    });

    return lookup;
  }

  function getTagTheme(element) {
    var explicitName =
      element.getAttribute("data-tag-name") ||
      element.getAttribute("data-name") ||
      element.textContent ||
      "";
    var normalizedName = normalizeTag(explicitName);

    if (!normalizedName || normalizedName.length > 32) {
      return "";
    }

    return tagLookup[normalizedName] || "";
  }

  function findOpportunityCard(element) {
    return element.closest(
      [
        ".opportunity-card",
        ".pipeline-card",
        ".tt-demo-opportunity",
        '[data-testid*="opportunity-card"]'
      ].join(",")
    );
  }

  function decorateOpportunityTags(root) {
    if (!config.decorateOpportunityTags) {
      return;
    }

    var scope = root && root.querySelectorAll ? root : document;
    var candidates = scope.querySelectorAll(
      [
        "[data-tag-name]",
        '[data-testid*="tag"]',
        ".tag",
        ".hl_tag",
        ".tag-pill",
        ".tt-demo-tag"
      ].join(",")
    );

    Array.prototype.forEach.call(candidates, function decorateTag(element) {
      if (element.dataset.ttTagDecorated === VERSION) {
        return;
      }

      var theme = getTagTheme(element);

      if (!theme) {
        return;
      }

      element.classList.add("tt-tag", "tt-tag--" + theme);
      element.dataset.ttTagDecorated = VERSION;

      var card = findOpportunityCard(element);

      if (card) {
        card.classList.add("tt-opportunity-" + theme);
        card.dataset.ttOpportunityTheme = theme;
      }
    });
  }

  function detectSection(route) {
    var previewSection = toSlug(
      document.documentElement.dataset.ttPreviewSection || ""
    );

    if (
      previewSection === "contacts" ||
      previewSection === "opportunities" ||
      previewSection === "conversations"
    ) {
      return previewSection;
    }

    var sectionMatchers = [
      {
        name: "conversations",
        pattern: /(^|-)(conversations?|messages?|inbox)($|-)/
      },
      {
        name: "opportunities",
        pattern: /(^|-)(opportunities|opportunity|pipelines?|kanban)($|-)/
      },
      {
        name: "contacts",
        pattern: /(^|-)(contacts?|smart-list|smartlist)($|-)/
      }
    ];

    for (var index = 0; index < sectionMatchers.length; index += 1) {
      if (sectionMatchers[index].pattern.test(route)) {
        return sectionMatchers[index].name;
      }
    }

    return "";
  }

  function getRouteSignal() {
    var signals = [
      window.location.pathname || "",
      window.location.hash || "",
      window.location.search || "",
      document.title || ""
    ];
    var activeSelectors = [
      ".sidebar-v2-location #sidebar-v2 a.active",
      ".sidebar-v2-location #sidebar-v2 [aria-current=\"page\"]",
      ".sidebar-v2-agency #sidebar-v2 a.active",
      ".sidebar-v2-agency #sidebar-v2 [aria-current=\"page\"]",
      ".sidebar-v2-agency #sidebar-v2 .active span",
      "#sidebar-v2 a.active",
      "#sidebar-v2 [aria-current=\"page\"]",
      "#sidebar-v2 .active span",
      "main h1",
      '[role="main"] h1',
      '[role="heading"][aria-level="1"]',
      "main h2",
      '[role="main"] h2'
    ];

    for (var index = 0; index < activeSelectors.length; index += 1) {
      var element = document.querySelector(activeSelectors[index]);

      if (element && element.textContent) {
        signals.push(element.textContent.trim());
      }
    }

    return toSlug(signals.join(" "));
  }

  function isUsableSurface(element, minimumWidth, minimumHeight) {
    if (!element || element.closest('[role="dialog"]')) {
      return false;
    }

    var bounds = element.getBoundingClientRect();
    var style = window.getComputedStyle(element);

    return Boolean(
      style.display !== "none" &&
        style.visibility !== "hidden" &&
        bounds.width >= (minimumWidth || 120) &&
        bounds.height >= (minimumHeight || 40)
    );
  }

  function findWorkspaceRoot() {
    var selectors = [
      "#app main",
      '[role="main"]',
      ".hl_wrapper--inner",
      ".hl_main-content",
      ".hl-wrapper-container",
      "main"
    ];
    var bestMatch = null;
    var bestArea = 0;

    for (var index = 0; index < selectors.length; index += 1) {
      var candidates = document.querySelectorAll(selectors[index]);

      for (var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
        var candidate = candidates[candidateIndex];

        if (
          candidate.closest("#sidebar-v2, .hl_sidebar, [role=\"dialog\"]") ||
          !isUsableSurface(candidate, 360, 220)
        ) {
          continue;
        }

        var bounds = candidate.getBoundingClientRect();
        var area = bounds.width * bounds.height;

        if (area > bestArea) {
          bestMatch = candidate;
          bestArea = area;
        }
      }
    }

    return bestMatch;
  }

  function markVisibleMatches(root, selector, className, width, height) {
    var matches = root.querySelectorAll(selector);

    Array.prototype.forEach.call(matches, function markMatch(element) {
      if (isUsableSurface(element, width, height)) {
        element.classList.add(className);
      }
    });
  }

  function markLiveSurfaces(section) {
    var oldWorkspace = document.querySelector(".tt-live-workspace");

    if (oldWorkspace) {
      oldWorkspace.classList.remove("tt-live-workspace");
      oldWorkspace.removeAttribute("data-tt-live-section");
    }

    Array.prototype.forEach.call(
      document.querySelectorAll(
        ".tt-live-surface, .tt-live-contact-table, .tt-live-contact-panel, .tt-live-pipeline-stage, .tt-live-opportunity-card, .tt-live-conversation-panel"
      ),
      function clearLiveMarker(element) {
        element.classList.remove(
          "tt-live-surface",
          "tt-live-contact-table",
          "tt-live-contact-panel",
          "tt-live-pipeline-stage",
          "tt-live-opportunity-card",
          "tt-live-conversation-panel"
        );
      }
    );

    if (!section) {
      return;
    }

    var workspace = findWorkspaceRoot();

    if (!workspace) {
      return;
    }

    workspace.classList.add("tt-live-workspace");
    workspace.dataset.ttLiveSection = section;

    markVisibleMatches(
      workspace,
      'table, [role="table"], [role="grid"], [role="list"], [class*="card" i], [class*="panel" i], [class*="pane" i], [class*="widget" i], [class*="drawer" i]',
      "tt-live-surface",
      140,
      48
    );

    if (section === "contacts") {
      markVisibleMatches(
        workspace,
        'table, [role="table"], [role="grid"], .n-data-table, [class*="contact" i][class*="table" i], [data-testid*="contact-list" i]',
        "tt-live-contact-table",
        300,
        100
      );
      markVisibleMatches(
        workspace,
        '[class*="contact" i][class*="detail" i], [class*="contact" i][class*="panel" i], [class*="contact" i][class*="card" i], [class*="detail" i][class*="panel" i], [class*="drawer" i], [data-testid*="contact-detail" i]',
        "tt-live-contact-panel",
        220,
        140
      );
    }

    if (section === "opportunities") {
      markVisibleMatches(
        workspace,
        '[class*="pipeline" i][class*="column" i], [class*="pipeline" i][class*="stage" i], [class*="kanban" i][class*="column" i], [class*="stage" i], [role="list"], [data-testid*="pipeline-stage" i]',
        "tt-live-pipeline-stage",
        160,
        180
      );
      markVisibleMatches(
        workspace,
        '[draggable="true"], [role="listitem"], [class*="card" i], [class*="opportunity" i], [class*="pipeline" i][class*="card" i], [class*="kanban" i][class*="card" i], [data-testid*="opportunity-card" i]',
        "tt-live-opportunity-card",
        140,
        50
      );
    }

    if (section === "conversations") {
      markVisibleMatches(
        workspace,
        '[class*="conversation" i], [class*="inbox" i], [class*="message-list" i], [class*="chat-body" i], [class*="thread" i], [class*="pane" i], [class*="panel" i], [class*="card" i], [role="list"], [data-testid*="conversation" i]',
        "tt-live-conversation-panel",
        160,
        100
      );
    }
  }

  function markRoute() {
    var route = toSlug(
      decodeURIComponent(
        [
          window.location.pathname || "",
          window.location.hash || "",
          window.location.search || ""
        ].join(" ")
      ) || "home"
    );
    var section = detectSection(getRouteSignal() || route);
    var root = document.documentElement;

    root.dataset.ttRoute = route || "home";

    if (section) {
      root.dataset.ttSection = section;
    } else {
      root.removeAttribute("data-tt-section");
    }

    syncBrandShell(section);
    markLiveSurfaces(section);
  }

  function refresh(root) {
    if (!document.body) {
      return;
    }

    document.documentElement.classList.add("tt-brand-root");
    document.documentElement.classList.toggle(
      "tt-full-workspace",
      config.fullWorkspaceTheme
    );
    document.documentElement.dataset.ttBrandVersion = VERSION;
    document.body.classList.add("tt-brand-ready");
    document.body.classList.toggle(
      "tt-colorful-sections",
      config.colorfulSections
    );
    document.body.classList.toggle(
      "tt-full-workspace",
      config.fullWorkspaceTheme
    );
    createBrandShell();
    markRoute();
    decorateOpportunityTags(root || document);
  }

  function scheduleRefresh(root) {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(function runScheduledRefresh() {
      refresh(root || document);
    }, 80);
  }

  function observeApplication() {
    if (!document.body || observer) {
      return;
    }

    observer = new MutationObserver(function onApplicationMutation(mutations) {
      var addedRoot = null;

      for (var index = 0; index < mutations.length; index += 1) {
        if (mutations[index].addedNodes.length) {
          addedRoot =
            mutations[index].target instanceof Element
              ? mutations[index].target
              : document;
          break;
        }
      }

      if (addedRoot) {
        scheduleRefresh(addedRoot);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener("popstate", function onHistoryNavigation() {
      scheduleRefresh(document);
    });

    window.addEventListener("hashchange", function onHashNavigation() {
      scheduleRefresh(document);
    });

    lastLocationHref = window.location.href;
    routeTimer = window.setInterval(function checkApplicationRoute() {
      if (window.location.href !== lastLocationHref) {
        lastLocationHref = window.location.href;
        scheduleRefresh(document);
      }
    }, 900);
  }

  function init() {
    loadStylesheet();
    exposeSafeUserContext();

    var initialTheme = normalizeTheme(getSavedTheme() || config.theme);
    setTheme(initialTheme, false);
    refresh(document);
    createThemeControl();
    createLoadConfirmation();
    observeApplication();

    document.dispatchEvent(
      new CustomEvent("talktuit:ready", {
        detail: { version: VERSION, theme: initialTheme }
      })
    );

    log("Customizer ready.", { version: VERSION, theme: initialTheme });
  }

  window.TalkTuitGHL = {
    version: VERSION,
    refresh: function publicRefresh() {
      refresh(document);
    },
    setTheme: function publicSetTheme(theme) {
      setTheme(theme);
    },
    destroy: function destroyCustomizer() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      window.clearTimeout(refreshTimer);
      window.clearInterval(routeTimer);

      var control = document.getElementById("tt-theme-control");
      if (control) {
        control.remove();
      }

      var loadConfirmation = document.getElementById("tt-load-confirmation");
      if (loadConfirmation) {
        loadConfirmation.remove();
      }

      var brandShell = document.getElementById("tt-brand-shell");
      if (brandShell) {
        brandShell.remove();
      }

      document.documentElement.classList.remove("tt-brand-root");
      document.documentElement.classList.remove("tt-full-workspace");
      document.documentElement.removeAttribute("data-tt-theme");
      document.documentElement.removeAttribute("data-tt-route");
      document.documentElement.removeAttribute("data-tt-section");

      if (document.body) {
        document.body.classList.remove(
          "tt-brand-ready",
          "tt-colorful-sections",
          "tt-full-workspace"
        );
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
