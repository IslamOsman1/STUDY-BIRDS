import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/student_events.dart';

class ImportantDatesScreen extends StatefulWidget {
  const ImportantDatesScreen({super.key});
  @override
  State<ImportantDatesScreen> createState() => _ImportantDatesScreenState();
}

class _ImportantDatesScreenState extends State<ImportantDatesScreen> {
  late Future<List<StudentEvent>> future = loadCalendarEvents();
  void refresh() => setState(() => future = loadCalendarEvents());
  @override
  Widget build(BuildContext context) => AppScaffold(
        title: 'المواعيد المهمة',
        actions: [
          IconButton(
              onPressed: refresh,
              tooltip: 'تحديث',
              icon: const Icon(Icons.refresh))
        ],
        body: FutureBuilder<List<StudentEvent>>(
            future: future,
            builder: (context, snapshot) {
              if (snapshot.connectionState != ConnectionState.done)
                return const LoadingState();
              if (snapshot.hasError)
                return ErrorState(
                    message: 'تعذر تحميل المواعيد', onRetry: refresh);
              final events = snapshot.data ?? [];
              if (events.isEmpty)
                return const EmptyState(
                    icon: Icons.event,
                    title: 'لا توجد مواعيد مسجلة',
                    message: 'ستظهر مواعيد الفواتير والوصول هنا.');
              return RefreshIndicator(
                onRefresh: () async { refresh(); await future; },
                color: AppColors.navy,
                child: ListView(padding: const EdgeInsets.all(16), children: [
                  for (final event in events)
                    AppCard(
                        child: ListTile(
                            title: Text(event.title),
                            subtitle: Text(
                                '${event.date.year}/${event.date.month}/${event.date.day} ${event.detail}')))
                ]),
              );
            }),
      );
}
