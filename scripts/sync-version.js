const fs = require('fs');
const path = require('path');

// Read package.json version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Parse version (e.g., "1.0.0" -> versionCode: 1000)
const [major, minor, patch] = version.split('.').map(Number);
const versionCode = major * 10000 + minor * 100 + patch;

// Update Android build.gradle
const buildGradlePath = 'android/app/build.gradle';
let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

// Replace versionName and versionCode
buildGradle = buildGradle.replace(
    /versionName ".*?"/,
    `versionName "${version}"`
);
buildGradle = buildGradle.replace(
    /versionCode \d+/,
    `versionCode ${versionCode}`
);

fs.writeFileSync(buildGradlePath, buildGradle);

console.log(`✓ Updated Android version to ${version} (${versionCode})`);
