import {
    ConfigPlugin,
    createRunOncePlugin,
    withGradleProperties,
    WarningAggregator,
    withProjectBuildGradle,
    withAppBuildGradle,
    AndroidConfig,
    withAndroidManifest
} from '@expo/config-plugins';
import { ExpoConfig } from '@expo/config-types';
import {
    MergeResults,
    mergeContents
} from '@expo/config-plugins/build/utils/generateCode';

const pkg = require('mbx-navigation/package.json');

// Using helpers keeps error messages unified and helps cut down on XML format changes.
const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = AndroidConfig.Manifest;

interface MBXNavigationConfig { mapboxDownloadToken: string; }

// Splitting this function out of the mod makes it easier to test.
async function setCustomConfigAsync(
    config: Pick<ExpoConfig, 'android'>,
    androidManifest: AndroidConfig.Manifest.AndroidManifest
): Promise<AndroidConfig.Manifest.AndroidManifest> {
    // Get the <application /> tag and assert if it doesn't exist.
    const mainApplication = getMainApplicationOrThrow(androidManifest);

    addMetaDataItemToMainApplication(
        mainApplication,
        // value for `android:name`
        'MAPBOX_ACCESS_TOKEN',
        // value for `android:value`
        "pk.*"
    );

    return androidManifest;
}

/**
 * Android App Build Configuration
 */
const withAndroidAppBuildGradle: ConfigPlugin = (config) => {
    return withAppBuildGradle(config, ({ modResults, ...config }) => {
        if (modResults.language !== 'groovy') {
            WarningAggregator.addWarningAndroid(
                'withSeonNavigation',
                `Cannot automatically configure app build.gradle if it's not groovy`,
            );
            return { modResults, ...config };
        }

        modResults.contents = addLibCppFilter(modResults.contents);
        return { modResults, ...config };
    });
};

const addLibCppFilter = (appBuildGradle: string): string => {
    if (appBuildGradle.includes("pickFirst 'lib/x86/libc++_shared.so'"))
        return appBuildGradle;

    return mergeContents({
        tag: `seon-navigation/maps-libcpp`,
        src: appBuildGradle,
        newSrc: `packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
    }`,
        anchor: new RegExp(`^\\s*android\\s*{`),
        offset: 1,
        comment: '//',
    }).contents;
};

/**
 * Android Project Build Configuration
 */
const withAndroidProjectBuildGradle: ConfigPlugin  = (config) => {
    return withProjectBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = addNavigationImport(config.modResults.contents).contents;
        } else {
            throw new Error('Cannot add seon-navigation maven gradle because the build.gradle is not groovy');
        }
        return config;
    });
};

export function addNavigationImport(src: string): MergeResults {
    return mergeContents({
        tag: `expo-seon-navigation-import`,
        src: src,
        newSrc: `maven {
          url 'https://api.mapbox.com/downloads/v2/releases/maven'
          authentication { basic(BasicAuthentication) }
          credentials {
            username = 'mapbox'
            password = project.properties['MAPBOX_DOWNLOADS_TOKEN']
          }
        }`,
        anchor: new RegExp(`^\\s*allprojects\\s*{`), // TODO repositories { is needed as well
        offset: 2,
        comment: '//',
    });
}

/**
 * Android Gradle Properties Configuration
 */
const withAndroidGradleProperties: ConfigPlugin <MBXNavigationConfig> = (config, params) => {
    const key = 'MAPBOX_DOWNLOADS_TOKEN';
    return withGradleProperties(config, (config) => {
        config.modResults = config.modResults.filter((item) => {
            return !(item.type === 'property' && item.key === key);

        });
        config.modResults.push({
            type: 'property',
            key,
            value: params.mapboxDownloadToken,
        });

        return config;
    });
};

/**
 * Android configuration
 */
const withAndroidConfiguration: ConfigPlugin<MBXNavigationConfig> = (config, params) => {

    config = withAndroidManifest(config, async config => {
        config.modResults = await setCustomConfigAsync(config, config.modResults);
        return config;
    })
    config = withAndroidGradleProperties(config, params);
    config = withAndroidProjectBuildGradle(config);

    return withAndroidAppBuildGradle(config);

};

/**
 * Configure the Plugin
 */
const withSeonNavigation: ConfigPlugin<MBXNavigationConfig> = (config, params) => {
    return withAndroidConfiguration(config, params);
};

export default createRunOncePlugin(withSeonNavigation, pkg.name, pkg.version);
