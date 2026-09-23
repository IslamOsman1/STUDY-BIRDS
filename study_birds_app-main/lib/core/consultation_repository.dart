import 'api_client.dart';
import 'auth_session.dart';

class ConsultationRepository {
  ConsultationRepository._();
  static final instance = ConsultationRepository._();
  String? get _token => AuthSession.instance.token;
  Future<List<Map<String, dynamic>>> _list(String path) async {
    final data =
        await ApiClient.instance.get('/consultations$path', token: _token);
    return (data as List)
        .map((row) => Map<String, dynamic>.from(row as Map))
        .toList();
  }

  Future<List<Map<String, dynamic>>> slots() => _list('/slots');
  Future<List<Map<String, dynamic>>> mine() => _list('/mine');
  Future<void> book(String slotId) async {
    await ApiClient.instance.post('/consultations/bookings',
        token: _token, body: {'slotId': slotId});
  }

  Future<void> cancel(Map<String, dynamic> booking) async {
    await ApiClient.instance.post(
        '/consultations/bookings/${booking['_id']}/cancel',
        token: _token,
        body: {'version': booking['__v']});
  }

  Future<void> reschedule(Map<String, dynamic> booking, String slotId) async {
    await ApiClient.instance.post(
        '/consultations/bookings/${booking['_id']}/reschedule',
        token: _token,
        body: {'version': booking['__v'], 'slotId': slotId});
  }

  // ---- Staff availability & bookings (requires the 'consultations'
  // permission; admins see every consultant, staff see only themselves) ----

  Future<List<Map<String, dynamic>>> staffAdvisors() =>
      _list('/staff/advisors');
  Future<List<Map<String, dynamic>>> staffSlots() => _list('/staff/slots');
  Future<List<Map<String, dynamic>>> staffBookings() =>
      _list('/staff/bookings');

  Future<void> publishSlot({
    required String advisorId,
    required DateTime startsAt,
    required String mode,
    String meetingUrl = '',
    String instructions = '',
  }) async {
    await ApiClient.instance
        .post('/consultations/staff/slots', token: _token, body: {
      'advisorId': advisorId,
      'startsAt': startsAt.toUtc().toIso8601String(),
      'mode': mode,
      'meetingUrl': meetingUrl,
      'instructions': instructions,
    });
  }

  Future<void> saveOutcome(Map<String, dynamic> booking,
      {required String result,
      required String summary,
      required String nextSteps}) async {
    await ApiClient.instance.put(
        '/consultations/staff/bookings/${booking['_id']}/outcome',
        token: _token,
        body: {
          'version': booking['__v'],
          'result': result,
          'summary': summary.trim(),
          'nextSteps': nextSteps.trim(),
        });
  }

  Future<void> publishSlots(
      {required String advisorId,
      required List<DateTime> startsAt,
      required String mode,
      String meetingUrl = '',
      String instructions = ''}) async {
    await ApiClient.instance
        .post('/consultations/staff/slots/batch', token: _token, body: {
      'advisorId': advisorId,
      'startsAt':
          startsAt.map((date) => date.toUtc().toIso8601String()).toList(),
      'mode': mode,
      'meetingUrl': meetingUrl,
      'instructions': instructions
    });
  }

  Future<void> setSlotEnabled(Map<String, dynamic> slot, bool enabled) async {
    await ApiClient.instance.patch('/consultations/staff/slots/${slot['_id']}',
        token: _token, body: {'version': slot['__v'], 'enabled': enabled});
  }
}
