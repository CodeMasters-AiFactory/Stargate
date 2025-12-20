/**
 * Mobile App Builder Service
 * Generates iOS and Android app packages from websites
 */

import * as fs from 'fs';
import * as path from 'path';
import { writeFileContent, readFileContent } from './azureStorage';

export interface MobileAppConfig {
  appName: string;
  packageName: string; // e.g., com.example.app
  version: string;
  icon: string; // Path to icon
  splashScreen?: string; // Path to splash screen
  orientation: 'portrait' | 'landscape' | 'both';
  permissions?: string[];
  deepLinks?: Array<{ scheme: string; host: string }>;
}

export interface iOSAppConfig extends MobileAppConfig {
  bundleId: string;
  teamId?: string;
  capabilities?: string[];
}

export interface AndroidAppConfig extends MobileAppConfig {
  minSdkVersion: number;
  targetSdkVersion: number;
  signingKey?: string;
}

/**
 * Generate iOS app package
 */
export async function generateiOSApp(
  projectSlug: string,
  websiteHTML: string,
  config: iOSAppConfig
): Promise<{ appPath: string; instructions: string }> {
  // In production, this would use Capacitor or similar to generate actual iOS app
  // For now, generate configuration files

  const appConfig = {
    name: config.appName,
    bundleId: config.bundleId,
    version: config.version,
    orientation: config.orientation,
    icon: config.icon,
    splashScreen: config.splashScreen,
    capabilities: config.capabilities || [],
    deepLinks: config.deepLinks || [],
  };

  // Generate Info.plist structure (simplified)
  const infoPlist = generateiOSInfoPlist(config);

  // Save configuration
  await writeFileContent(projectSlug, 'ios-app-config.json', JSON.stringify(appConfig, null, 2));
  await writeFileContent(projectSlug, 'ios-Info.plist', infoPlist);

  const instructions = `
iOS App Package Generated

To build the iOS app:
1. Install Xcode and CocoaPods
2. Run: pod install
3. Open .xcworkspace in Xcode
4. Configure signing with your Apple Developer account
5. Build and archive the app
6. Submit to App Store

Files generated:
- ios-app-config.json
- ios-Info.plist
  `.trim();

  return {
    appPath: `ios-app-${projectSlug}`,
    instructions,
  };
}

/**
 * Generate Android app package
 */
export async function generateAndroidApp(
  projectSlug: string,
  websiteHTML: string,
  config: AndroidAppConfig
): Promise<{ appPath: string; instructions: string }> {
  // In production, this would use Capacitor or similar to generate actual Android app
  // For now, generate configuration files

  const appConfig = {
    name: config.appName,
    packageName: config.packageName,
    version: config.version,
    minSdkVersion: config.minSdkVersion,
    targetSdkVersion: config.targetSdkVersion,
    orientation: config.orientation,
    icon: config.icon,
    splashScreen: config.splashScreen,
    permissions: config.permissions || [],
    deepLinks: config.deepLinks || [],
  };

  // Generate AndroidManifest.xml structure (simplified)
  const androidManifest = generateAndroidManifest(config);

  // Generate build.gradle (simplified)
  const buildGradle = generateAndroidBuildGradle(config);

  // Save configuration
  await writeFileContent(projectSlug, 'android-app-config.json', JSON.stringify(appConfig, null, 2));
  await writeFileContent(projectSlug, 'android-AndroidManifest.xml', androidManifest);
  await writeFileContent(projectSlug, 'android-build.gradle', buildGradle);

  const instructions = `
Android App Package Generated

To build the Android app:
1. Install Android Studio
2. Open the project in Android Studio
3. Configure signing with your keystore
4. Build APK or AAB
5. Submit to Google Play Store

Files generated:
- android-app-config.json
- android-AndroidManifest.xml
- android-build.gradle
  `.trim();

  return {
    appPath: `android-app-${projectSlug}`,
    instructions,
  };
}

/**
 * Generate iOS Info.plist
 */
function generateiOSInfoPlist(config: iOSAppConfig): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleDisplayName</key>
  <string>${config.appName}</string>
  <key>CFBundleExecutable</key>
  <string>\$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>${config.bundleId}</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>${config.appName}</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>${config.version}</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSRequiresIPhoneOS</key>
  <true/>
  <key>UISupportedInterfaceOrientations</key>
  <array>
    ${config.orientation === 'portrait' || config.orientation === 'both' ? '<string>UIInterfaceOrientationPortrait</string>' : ''}
    ${config.orientation === 'landscape' || config.orientation === 'both' ? '<string>UIInterfaceOrientationLandscapeLeft</string><string>UIInterfaceOrientationLandscapeRight</string>' : ''}
  </array>
  <key>UIRequiredDeviceCapabilities</key>
  <array>
    <string>armv7</string>
  </array>
  <key>UILaunchStoryboardName</key>
  <string>LaunchScreen</string>
</dict>
</plist>`.trim();
}

/**
 * Generate Android AndroidManifest.xml
 */
function generateAndroidManifest(config: AndroidAppConfig): string {
  const permissions = (config.permissions || []).map(p => `    <uses-permission android:name="${p}" />`).join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${config.packageName}">

    ${permissions}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${config.appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/AppTheme">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            ${(config.deepLinks || []).map(link => `
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="${link.scheme}" android:host="${link.host}" />
            </intent-filter>
            `).join('\n')}
        </activity>
    </application>
</manifest>`.trim();
}

/**
 * Generate Android build.gradle
 */
function generateAndroidBuildGradle(config: AndroidAppConfig): string {
  return `apply plugin: 'com.android.application'

android {
    compileSdkVersion ${config.targetSdkVersion}

    defaultConfig {
        applicationId "${config.packageName}"
        minSdkVersion ${config.minSdkVersion}
        targetSdkVersion ${config.targetSdkVersion}
        versionCode 1
        versionName "${config.version}"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}
`.trim();
}

/**
 * Generate app store listing
 */
export function generateAppStoreListing(config: MobileAppConfig): {
  title: string;
  description: string;
  keywords: string[];
  screenshots: string[];
  promotionalText?: string;
} {
  return {
    title: config.appName,
    description: `${config.appName} - Mobile app for your business`,
    keywords: ['business', 'website', 'app'],
    screenshots: [],
    promotionalText: 'Download now for the best mobile experience',
  };
}

