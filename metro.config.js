const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Makes Metro resolve the correct (CJS) build of packages on web.
config.resolver.unstable_enablePackageExports = true;

// iPhone photos have uppercase extensions (.JPG, .JPEG, .HEIC).
// Without this, Metro tries to parse them as JavaScript and crashes.
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  "JPG", "JPEG", "PNG", "HEIC", "HEIF", "WEBP", "GIF",
];

module.exports = config;
