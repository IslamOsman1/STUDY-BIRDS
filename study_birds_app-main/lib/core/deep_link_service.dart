import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import '../screens/home_journey/notifications_screen.dart';

/// Handles incoming deep links (both custom scheme studybirds:// and
/// https://studybirds.app) and navigates to the matching screen.
///
/// Call [init] once from main(), passing the app's navigator key.
class DeepLinkService {
  DeepLinkService._();
  static final DeepLinkService instance = DeepLinkService._();

  final _appLinks = AppLinks();
  GlobalKey<NavigatorState>? _navigatorKey;

  Future<void> init(GlobalKey<NavigatorState> navigatorKey) async {
    _navigatorKey = navigatorKey;

    // Cold-start link (app opened via link while not running)
    try {
      final uri = await _appLinks.getInitialLink();
      if (uri != null) _handle(uri);
    } catch (_) {}

    // Warm-start links (app already running)
    _appLinks.uriLinkStream.listen(_handle, onError: (_) {});
  }

  void _handle(Uri uri) {
    // Normalise: extract path from both
    // studybirds://student/payments  ->  /student/payments
    // https://studybirds.app/student/payments  ->  /student/payments
    final path = uri.path.isNotEmpty ? uri.path : '/${uri.host}${uri.path}';
    final screen = notificationScreenForLink(path);
    if (screen == null) return;

    final nav = _navigatorKey?.currentState;
    if (nav == null) return;
    nav.push(MaterialPageRoute(builder: (_) => screen));
  }
}
