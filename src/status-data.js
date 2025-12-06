const DEFAULT_SESSION_MINUTES = 180;

class StatusData {
  constructor({username, accessedAt, sessionMinutes}) {
    this.username       = username ?? 'Grandma';
    this.sessionMinutes = typeof sessionMinutes == 'number' ? Math.max(0, Math.round(sessionMinutes)) : DEFAULT_SESSION_MINUTES;
    this.accessedAt     = this._parseDate(accessedAt);
  }

  canAccess(username) {
    if (username === this.username) return true;
    const expiryEpoch = this.accessedAt.getTime() + this.sessionMinutes * 60 * 1000;
    const nowEpoch    = new Date().getTime();
    return expiryEpoch < nowEpoch;
  }

  accessNow() {
    this.accessedAt = new Date();
  }

  toObject() {
    return {
      username: this.username,
      accessedAt: this.accessedAt?.toISOString(),
    }
  }

  _parseDate(timestamp, defaultValue = '1970-01-01') {
    const date = new Date(timestamp);
    return isNaN(date.valueOf()) ? new Date(defaultValue) : date;
  }
}

module.exports = StatusData;
