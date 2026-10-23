// All client-side persistence lives here, behind a small set of named
// functions, so the rest of the app never touches localStorage directly.

const KEYS = {
  SAVED_REQUESTS: "apisentinel:saved-requests",
  ENVIRONMENTS: "apisentinel:environments",
  ACTIVE_ENV: "apisentinel:active-env",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Saved requests ---------------------------------------------------

export function getSavedRequests() {
  return read(KEYS.SAVED_REQUESTS, []);
}

export function saveRequest(entry) {
  const all = getSavedRequests();
  const withId = { ...entry, id: entry.id || crypto.randomUUID(), savedAt: new Date().toISOString() };
  const next = [withId, ...all.filter((r) => r.id !== withId.id)];
  write(KEYS.SAVED_REQUESTS, next);
  return withId;
}

export function deleteSavedRequest(id) {
  const next = getSavedRequests().filter((r) => r.id !== id);
  write(KEYS.SAVED_REQUESTS, next);
  return next;
}

export function exportSavedRequests() {
  return JSON.stringify(getSavedRequests(), null, 2);
}

export function importSavedRequests(json) {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("Import file must contain an array of requests");
  write(KEYS.SAVED_REQUESTS, parsed);
  return parsed;
}

// --- Environments (named sets of variables for {{substitution}}) -------

export function getEnvironments() {
  return read(KEYS.ENVIRONMENTS, [{ id: "default", name: "Default", variables: {} }]);
}

export function saveEnvironments(envs) {
  write(KEYS.ENVIRONMENTS, envs);
}

export function getActiveEnvironmentId() {
  return read(KEYS.ACTIVE_ENV, "default");
}

export function setActiveEnvironmentId(id) {
  write(KEYS.ACTIVE_ENV, id);
}

export function applyEnvironment(str, variables) {
  if (!str) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(variables, name) ? variables[name] : match
  );
}
