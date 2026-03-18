// In-memory token blocklist (replaces Redis)
// Tokens auto-expire since JWT has 1-hour expiry — cleanup runs every 10 minutes

const blockedTokens = new Map();

setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [token, expiresAt] of blockedTokens) {
    if (expiresAt <= now) blockedTokens.delete(token);
  }
}, 10 * 60 * 1000);

const blockToken = async (token, expTimestamp) => {
  blockedTokens.set(`token:${token}`, expTimestamp);
};

const isTokenBlocked = async (token) => {
  const key = `token:${token}`;
  if (!blockedTokens.has(key)) return false;
  const expiresAt = blockedTokens.get(key);
  if (expiresAt <= Math.floor(Date.now() / 1000)) {
    blockedTokens.delete(key);
    return false;
  }
  return true;
};

module.exports = { blockToken, isTokenBlocked };
