const packageJson = require('../package.json');

module.exports = {
  id:             "com.github.anhkind",
  version:        packageJson.version,
  name:           "Shared Debrid Notifier",
  description:    "Notify current user if the shared debrid is being used by others",
  logo:           "https://raw.githubusercontent.com/anhkind/stremio-shared-debrid/master/images/logo-colored-256.png",
  resources:      ["stream" ],
  catalogs:       [],
  types:          ["movie", "series", "channel", "tv"],
  behaviorHints:  {
    configurable:           true,
    configurationRequired:  false,
  }
};
