const { Signale } = require("signale");

const logger = new Signale({
  scope: "mdss",
  interactive: true,
  types: {
    created: {
      badge: "✔",
      color: "green",
      label: "created",
      logLevel: "info"
    }
  }
});

module.exports = { logger };
