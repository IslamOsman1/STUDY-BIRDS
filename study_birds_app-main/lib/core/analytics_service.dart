import 'dart:convert';
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_session.dart';

/// Lightweight analytics layer that:
/// 1. Logs events to console in debug mode.
/// 2. Queues events in SharedPreferences for later upload (or a 3rd-party SDK).
///
/// To wire up a real provider (Mixpanel, PostHog, Firebase Analytics):
/// override [_dispatch] — the rest of the call sites don't change.
///
/// PRD بند 91: Product Analytics
class AnalyticsService {
  AnalyticsService._();
  static final AnalyticsService instance = AnalyticsService._();

  static const _queueKey = 'sb_analytics_queue';
  static const _maxQueue = 200;

  Future<void> track(String event, [Map<String, dynamic>? props]) async {
    final payload = {
      'event': event,
      'userId': AuthSession.instance.currentUser?.id ?? 'anonymous',
      'ts': DateTime.now().toUtc().toIso8601String(),
      if (props != null) ...props,
    };
    if (kDebugMode) {
      // ignore: avoid_print
      print('[Analytics] $event ${props ?? ''}');
    }
    await _dispatch(payload);
  }

  // ── convenience wrappers ──────────────────────────────────────────────────

  Future<void> screenView(String screenName) =>
      track('screen_view', {'screen': screenName});

  Future<void> buttonTap(String button, {String? screen}) =>
      track('button_tap', {'button': button, if (screen != null) 'screen': screen});

  Future<void> documentUploaded(String docType) =>
      track('document_uploaded', {'type': docType});

  Future<void> consultationBooked(String consultantId) =>
      track('consultation_booked', {'consultant': consultantId});

  Future<void> applicationViewed(String applicationId) =>
      track('application_viewed', {'id': applicationId});

  Future<void> paymentInitiated(String invoiceId, double amount) =>
      track('payment_initiated', {'invoice': invoiceId, 'amount': amount});

  Future<void> searchPerformed(String query, {String? category}) =>
      track('search', {'query': query, if (category != null) 'category': category});

  Future<void> universityViewed(String universityId) =>
      track('university_viewed', {'id': universityId});

  Future<void> programViewed(String programId) =>
      track('program_viewed', {'id': programId});

  Future<void> onboardingCompleted() => track('onboarding_completed');

  Future<void> loginCompleted(String role) =>
      track('login_completed', {'role': role});

  Future<void> referralShared(String code) =>
      track('referral_shared', {'code': code});

  Future<void> birdAiOpened() => track('bird_ai_opened');

  // ── internal ──────────────────────────────────────────────────────────────

  /// Override this to send to a real analytics backend.
  Future<void> _dispatch(Map<String, dynamic> payload) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getStringList(_queueKey) ?? [];
      raw.add(jsonEncode(payload));
      // Keep queue bounded
      if (raw.length > _maxQueue) raw.removeRange(0, raw.length - _maxQueue);
      await prefs.setStringList(_queueKey, raw);
    } catch (_) {}
  }

  /// Returns queued events (useful for a batch-upload job).
  Future<List<Map<String, dynamic>>> drainQueue() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getStringList(_queueKey) ?? [];
      await prefs.remove(_queueKey);
      return raw
          .map((s) => jsonDecode(s) as Map<String, dynamic>)
          .toList();
    } catch (_) {
      return [];
    }
  }
}
