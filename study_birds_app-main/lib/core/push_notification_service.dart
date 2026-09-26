import 'package:flutter/material.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';

/// Routes a notification tap to the correct screen name.
/// The server sends `screen` in the notification data to tell us where to go.
typedef PushTapHandler = void Function(String screen, Map<String, dynamic> data);

class PushNotificationService {
  PushNotificationService._();
  static final instance = PushNotificationService._();

  static const _appId = '06774f8d-4fc5-427e-b024-ae8fec0114eb';

  PushTapHandler? _tapHandler;

  /// Call once in main() before runApp.
  Future<void> init() async {
    OneSignal.initialize(_appId);

    // Ask for permission (Android 13+ and iOS).
    await OneSignal.Notifications.requestPermission(true);

    // Handle tap when app is in background / closed.
    OneSignal.Notifications.addClickListener((event) {
      final data = Map<String, dynamic>.from(
          event.notification.additionalData ?? {});
      final screen = data['screen']?.toString() ?? '';
      _tapHandler?.call(screen, data);
    });

    // Foreground: show a brief snackbar instead of a system popup.
    OneSignal.Notifications.addForegroundWillDisplayListener((event) {
      event.preventDefault();
      final title = event.notification.title ?? '';
      final body = event.notification.body ?? '';
      debugPrint('[Push] $title — $body');
      // The notification is still stored in NotificationsScreen on the server.
    });
  }

  /// Link this device to the logged-in user.
  /// Call after every successful login.
  void setUser(String userId) {
    OneSignal.login(userId);
  }

  /// Unlink device from user on logout.
  void clearUser() {
    OneSignal.logout();
  }

  /// Register a handler that navigates when user taps a notification.
  /// Called from main.dart after the navigator key is ready.
  void setTapHandler(PushTapHandler handler) {
    _tapHandler = handler;
  }
}
