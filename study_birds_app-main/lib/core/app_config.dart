/// Central app configuration constants.
/// Fill in the values before release.
class AppConfig {
  AppConfig._();

  // PostHog — get from app.posthog.com > Project Settings > Project API Key
  // Leave empty to disable analytics silently.
  static const posthogApiKey = '';
  static const posthogHost = 'https://us.i.posthog.com';
}
