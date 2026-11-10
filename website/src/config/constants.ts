export const APP_VERSION = "v1.0.0";
export const GITHUB_REPO_URL = "https://github.com/DebbieOba/unibookshop-app";
export const GITHUB_RELEASE_PAGE_URL = "https://github.com/DebbieOba/unibookshop-app/releases/tag/v1.0.0";
export const ANDROID_APK_DOWNLOAD_URL = "https://github.com/DebbieOba/unibookshop-app/releases/download/v1.0.0/BOOKDECK-v1.0.0.apk";

export const APP_DOWNLOAD_URL = import.meta.env.VITE_APP_DOWNLOAD_URL || ANDROID_APK_DOWNLOAD_URL;
export const ANDROID_DOWNLOAD_URL = import.meta.env.VITE_ANDROID_DOWNLOAD_URL || ANDROID_APK_DOWNLOAD_URL;
export const IOS_DOWNLOAD_URL = import.meta.env.VITE_IOS_DOWNLOAD_URL || "https://apps.apple.com/us/app/bookdeck/id123456789";
export const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || "https://bookdeck.example.com";
