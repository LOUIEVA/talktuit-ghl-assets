/*
 * TalkTuit GHL Customizer
 * Version: 1.0.0
 *
 * Vanilla JavaScript only. No jQuery and no user data is transmitted.
 */

(function talkTuitGhlCustomizer() {
  "use strict";

  if (window.__talkTuitGhlCustomizerLoaded) {
    return;
  }

  window.__talkTuitGhlCustomizerLoaded = true;

  var VERSION = "1.0.0";
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
      '<button class="tt-theme-trigger" type="button" aria-expanded="false" aria-controls="tt-theme-panel" aria-label="Open TalkTuit display settings">' +
      waveformMarkup() +
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

    Array.prototype.forEach.call(choices, function updateThemeChoice(button) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.ttThemeChoice === theme)
      );
    });
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

  function markRoute() {
    var route = window.location.pathname
      .split("/")
      .filter(Boolean)
      .slice(-2)
      .join("-");

    document.documentElement.dataset.ttRoute = toSlug(route || "home");
  }

  function refresh(root) {
    if (!document.body) {
      return;
    }

    document.documentElement.classList.add("tt-brand-root");
    document.documentElement.dataset.ttBrandVersion = VERSION;
    document.body.classList.add("tt-brand-ready");
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
  }

  function init() {
    loadStylesheet();
    exposeSafeUserContext();

    var initialTheme = normalizeTheme(getSavedTheme() || config.theme);
    setTheme(initialTheme, false);
    refresh(document);
    createThemeControl();
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

      var control = document.getElementById("tt-theme-control");
      if (control) {
        control.remove();
      }

      document.documentElement.classList.remove("tt-brand-root");
      document.documentElement.removeAttribute("data-tt-theme");

      if (document.body) {
        document.body.classList.remove("tt-brand-ready");
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
