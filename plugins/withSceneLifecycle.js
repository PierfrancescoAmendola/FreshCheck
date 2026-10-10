// Adopts the UIScene life cycle on iOS.
//
// Apps built with the iOS 27 SDK that have no UIApplicationSceneManifest in
// Info.plist crash on launch (UIKit raises
// _UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption). Expo SDK 54
// still generates an AppDelegate that owns the window, so this plugin:
//   1. adds a single-scene UIApplicationSceneManifest to Info.plist,
//   2. adds SceneDelegate.swift, which creates the window and starts React Native,
//   3. stops AppDelegate from creating its own window.
const fs = require('fs');
const path = require('path');
const {
  withAppDelegate,
  withDangerousMod,
  withInfoPlist,
  withXcodeProject,
  IOSConfig,
} = require('expo/config-plugins');

const SCENE_DELEGATE_FILE = 'SceneDelegate.swift';

const SCENE_DELEGATE_SOURCE = `import React
import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window

    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: appDelegate.launchOptions)

    for context in connectionOptions.urlContexts {
      _ = RCTLinkingManager.application(UIApplication.shared, open: context.url, options: [:])
    }
    for userActivity in connectionOptions.userActivities {
      _ = RCTLinkingManager.application(
        UIApplication.shared,
        continue: userActivity,
        restorationHandler: { _ in })
    }
  }

  // Linking API
  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      _ = RCTLinkingManager.application(UIApplication.shared, open: context.url, options: [:])
    }
  }

  // Universal Links
  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = RCTLinkingManager.application(
      UIApplication.shared,
      continue: userActivity,
      restorationHandler: { _ in })
  }
}
`;

const WINDOW_BLOCK = /#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\(\n\s*withModuleName: "main",\n\s*in: window,\n\s*launchOptions: launchOptions\)\n#endif\n/;

function withSceneInfoPlist(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });
}

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle expects a Swift AppDelegate');
    }
    let src = cfg.modResults.contents;
    if (src.includes('var launchOptions:')) {
      return cfg;
    }
    if (!WINDOW_BLOCK.test(src)) {
      throw new Error('withSceneLifecycle: AppDelegate window setup not found');
    }
    src = src.replace(
      WINDOW_BLOCK,
      '    // The window is created by SceneDelegate (UIScene life cycle).\n' +
        '    self.launchOptions = launchOptions\n'
    );
    src = src.replace(
      'var reactNativeFactory: RCTReactNativeFactory?',
      'var reactNativeFactory: RCTReactNativeFactory?\n' +
        '  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?'
    );
    cfg.modResults.contents = src;
    return cfg;
  });
}

function withSceneDelegateFile(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const projectName = IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);
      const target = path.join(
        cfg.modRequest.platformProjectRoot,
        projectName,
        SCENE_DELEGATE_FILE
      );
      fs.writeFileSync(target, SCENE_DELEGATE_SOURCE);
      return cfg;
    },
  ]);
}

function withSceneDelegateInProject(config) {
  return withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const projectName = IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);
    const filePath = `${projectName}/${SCENE_DELEGATE_FILE}`;
    if (!project.hasFile(filePath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
        filepath: filePath,
        groupName: projectName,
        project,
      });
    }
    return cfg;
  });
}

module.exports = function withSceneLifecycle(config) {
  config = withSceneInfoPlist(config);
  config = withSceneAppDelegate(config);
  config = withSceneDelegateFile(config);
  config = withSceneDelegateInProject(config);
  return config;
};
