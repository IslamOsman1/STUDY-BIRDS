import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/student_events.dart';

class ActivityLogScreen extends StatefulWidget {
  const ActivityLogScreen({super.key});
  @override
  State<ActivityLogScreen> createState() => _ActivityLogScreenState();
}

class _ActivityLogScreenState extends State<ActivityLogScreen> {
  late Future<List<StudentEvent>> future = loadActivityEvents();
  void refresh() => setState(() => future = loadActivityEvents());
  @override
  Widget build(BuildContext context) => AppScaffold(
        title: 'سجل الأنشطة',
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
                    message: 'تعذر تحميل الأنشطة', onRetry: refresh);
              final events = snapshot.data ?? [];
              if (events.isEmpty)
                return const EmptyState(
                    icon: Icons.history,
                    title: 'لا يوجد نشاط بعد',
                    message: 'ستظهر هنا طلباتك ومستنداتك وإشعاراتك.');
              return RefreshIndicator(
                onRefresh: () async { refresh(); await future; },
                color: AppColors.navy,
                child: ListView(padding: const EdgeInsets.all(16), children: [
                  const Text('أنشطة الطلبات والمستندات والإشعارات',
                      style: AppTextStyles.caption),
                  for (final event in events)
                    AppCard(
                        child: ListTile(
                      leading: const Icon(Icons.history, color: AppColors.navy),
                      title: Text(event.title),
                      subtitle: Text(
                          '${event.date.year}/${event.date.month}/${event.date.day}\n${event.detail}'),
                    )),
                ]),
              );
            }),
      );
}
