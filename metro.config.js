const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Makes Metro resolve the correct (CJS) build of packages on web,
// fixing "Cannot use import.meta outside a module" errors from
// packages like react-native-reanimated and react-native-worklets.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
