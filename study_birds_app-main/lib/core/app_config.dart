/// Central app configuration constants.
/// Fill in the values before release.
class AppConfig {
  AppConfig._();

  // PostHog — get from app.posthog.com > Project Settings > Project API Key
  // Leave empty to disable analytics silently.
  static const posthogApiKey = '';
  static const posthogHost = 'https://us.i.posthog.com';

  // Google Sign-In — Web Application client ID from Google Cloud Console.
  // Required on Android (no google-services.json).
  // Also add this value to GOOGLE_CLIENT_ID env var on Render.
  static const googleWebClientId = '384879232095-rqr6ifgn90i7goftdqv7ldr0ntl82o6l.apps.googleusercontent.com';
}
