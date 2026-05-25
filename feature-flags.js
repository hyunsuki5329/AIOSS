(function () {
  const STORAGE_KEYS = {
    userId: "aioss.featureFlags.userId",
    eventLog: "aioss.featureFlags.events",
    overrides: "aioss.featureFlags.overrides"
  };

  const MAX_EVENTS = 40;

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function getUserId() {
    let userId = localStorage.getItem(STORAGE_KEYS.userId);
    if (!userId) {
      userId = `user-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}-${Date.now().toString(36)}`;
      localStorage.setItem(STORAGE_KEYS.userId, userId);
    }
    return userId;
  }

  function getAudience(userId) {
    const bucket = hashString(userId) % 100;
    if (bucket < 20) {
      return "maintainer";
    }
    if (bucket < 60) {
      return "beta";
    }
    return "observer";
  }

  function getQueryOverrides() {
    const params = new URLSearchParams(window.location.search);
    const overrides = {};

    for (const [key, value] of params.entries()) {
      if (key.startsWith("flag_")) {
        overrides[key.slice(5)] = value === "on" || value === "true";
      }
      if (key === "variant") {
        overrides.variant = value;
      }
    }

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.overrides) || "{}");
      return { ...saved, ...overrides };
    } catch {
      return overrides;
    }
  }

  async function loadSettings() {
    try {
      const response = await fetch("./rollout-settings.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`rollout-settings.json fetch failed (${response.status})`);
      }
      return await response.json();
    } catch {
      return {
        flags: {},
        experiments: {
          dashboardLayout: {
            variants: ["control", "compact"],
            weights: [50, 50]
          }
        }
      };
    }
  }

  function resolveFlagState(flagName, flagConfig, audience, userId, overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, flagName)) {
      return {
        enabled: Boolean(overrides[flagName]),
        reason: "query-override"
      };
    }

    if (!flagConfig.enabled) {
      return { enabled: false, reason: "disabled" };
    }

    if (Array.isArray(flagConfig.audiences) && !flagConfig.audiences.includes(audience)) {
      return { enabled: false, reason: `audience:${audience}` };
    }

    const bucket = hashString(`${flagName}:${userId}`) % 100;
    const enabled = bucket < Number(flagConfig.rolloutPercent ?? 0);

    return {
      enabled,
      reason: enabled ? `rollout:${flagConfig.rolloutPercent}%` : `bucket:${bucket}`
    };
  }

  function pickVariant(experimentName, experimentConfig, userId, overrides) {
    if (typeof overrides.variant === "string" && experimentConfig.variants.includes(overrides.variant)) {
      return {
        variant: overrides.variant,
        reason: "query-override"
      };
    }

    const bucket = hashString(`${experimentName}:${userId}`) % 100;
    const [firstWeight = 50] = experimentConfig.weights || [];
    const variant = bucket < firstWeight ? experimentConfig.variants[0] : experimentConfig.variants[1];

    return {
      variant,
      reason: `bucket:${bucket}`
    };
  }

  function readEventLog() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.eventLog) || "[]");
    } catch {
      return [];
    }
  }

  function trackEvent(type, payload) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      type,
      payload,
      timestamp: new Date().toISOString()
    };

    const events = readEventLog();
    events.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.eventLog, JSON.stringify(events.slice(0, MAX_EVENTS)));
    window.dispatchEvent(new CustomEvent("aioss:feature-flag-event", { detail: entry }));
    return entry;
  }

  function exportOverrides(overrides) {
    localStorage.setItem(STORAGE_KEYS.overrides, JSON.stringify(overrides));
  }

  function clearOverrides() {
    localStorage.removeItem(STORAGE_KEYS.overrides);
  }

  async function bootstrap() {
    const settings = await loadSettings();
    const userId = getUserId();
    const audience = getAudience(userId);
    const overrides = getQueryOverrides();

    const flags = Object.entries(settings.flags || {}).reduce((accumulator, [name, config]) => {
      accumulator[name] = resolveFlagState(name, config, audience, userId, overrides);
      return accumulator;
    }, {});

    const experimentConfig = settings.experiments?.dashboardLayout || {
      variants: ["control", "compact"],
      weights: [50, 50]
    };
    const experiment = pickVariant("dashboardLayout", experimentConfig, userId, overrides);

    trackEvent("flag_bootstrap", {
      userId,
      audience,
      flags: Object.fromEntries(Object.entries(flags).map(([name, value]) => [name, value.enabled])),
      variant: experiment.variant
    });

    return {
      userId,
      audience,
      flags,
      experiment: {
        name: "dashboardLayout",
        variant: experiment.variant,
        reason: experiment.reason,
        variants: experimentConfig.variants
      },
      overrides,
      settings,
      trackEvent,
      readEventLog,
      exportOverrides,
      clearOverrides
    };
  }

  window.AIOSSFlags = {
    bootstrap,
    readEventLog,
    trackEvent,
    exportOverrides,
    clearOverrides,
    hashString
  };
})();