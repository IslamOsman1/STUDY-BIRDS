import 'student_repository.dart';

class StudentEvent {
  final DateTime date;
  final String title;
  final String detail;
  const StudentEvent(this.date, this.title, [this.detail = '']);
}

List<StudentEvent> calendarEvents(
    Map<String, dynamic> financials, Map<String, dynamic>? arrival) {
  final events = <StudentEvent>[];
  for (final invoice in (financials['invoices'] as List? ?? [])) {
    final date = DateTime.tryParse(invoice['dueDate']?.toString() ?? '');
    if (date != null && invoice['status'] != 'paid') {
      events.add(StudentEvent(date,
          'استحقاق: ${invoice['description'] ?? invoice['invoiceNumber'] ?? 'فاتورة'}'));
    }
  }
  final date = DateTime.tryParse(arrival?['arrivalDate']?.toString() ?? '');
  if (date != null)
    events.add(StudentEvent(
        date,
        'موعد الوصول',
        '${arrival?['airport'] ?? ''} ${arrival?['arrivalTime'] ?? ''}'
            .trim()));
  events.sort((a, b) => a.date.compareTo(b.date));
  return events;
}

List<StudentEvent> activityEvents(List<dynamic> applications,
    List<dynamic> documents, List<dynamic> notifications) {
  final events = <StudentEvent>[];
  void add(dynamic rawDate, String title, [String detail = '']) {
    final date = DateTime.tryParse(rawDate?.toString() ?? '');
    if (date != null) events.add(StudentEvent(date.toLocal(), title, detail));
  }

  for (final application in applications) {
    add(application['createdAt'], 'تقديم طلب دراسي');
    for (final item in (application['timeline'] as List? ?? [])) {
      add(item['changedAt'], 'تحديث الطلب',
          item['note']?.toString() ?? item['status']?.toString() ?? '');
    }
  }
  for (final document in documents) {
    add(
        document['createdAt'],
        'رفع مستند',
        document['originalName']?.toString() ??
            document['type']?.toString() ??
            '');
  }
  for (final notification in notifications) {
    add(notification['createdAt'], notification['title']?.toString() ?? 'إشعار',
        notification['message']?.toString() ?? '');
  }
  events.sort((a, b) => b.date.compareTo(a.date));
  return events;
}

Future<List<StudentEvent>> loadCalendarEvents() async {
  final repo = StudentRepository.instance;
  final values =
      await Future.wait([repo.getFinancials(), repo.getArrivalServices()]);
  return calendarEvents(values[0]!, values[1]);
}

Future<List<StudentEvent>> loadActivityEvents() async {
  final repo = StudentRepository.instance;
  final values = await Future.wait(
      [repo.getApplications(), repo.getDocuments(), repo.getNotifications()]);
  return activityEvents(values[0], values[1], values[2]);
}
