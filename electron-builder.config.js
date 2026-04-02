/**
 * electron-builder configuration
 * Produces a Windows NSIS installer and portable executable.
 */
module.exports = {
  appId: "com.kenverse.jobos",
  productName: "KenVerse Job OS",
  copyright: "Copyright © 2026 KenVerse",
  directories: {
    output: "release/${version}",
    buildResources: "assets"
  },
  files: [
    "dist/**/*",
    "assets/**/*",
    "!**/*.map",
    "!**/node_modules/**"
  ],
  extraResources: [
    {
      from: "assets/",
      to: "assets/",
      filter: ["**/*"]
    }
  ],
  win: {
    target: [
      { target: "nsis", arch: ["x64"] },
      { target: "portable", arch: ["x64"] }
    ],
    icon: "assets/icon.ico",
    publisherName: "KenVerse",
    requestedExecutionLevel: "asInvoker"
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowElevation: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: "assets/icon.ico",
    uninstallerIcon: "assets/icon.ico",
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "KenVerse Job OS",
    license: "LICENSE.txt",
    differentialPackage: true
  },
  portable: {
    artifactName: "KenVerse-Job-OS-Portable-${version}.exe"
  },
  asar: true,
  asarUnpack: [
    "**/node_modules/better-sqlite3/**/*",
    "**/node_modules/bindings/**/*"
  ]
}
