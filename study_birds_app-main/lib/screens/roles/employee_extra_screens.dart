import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/app_theme.dart';
import '../../core/api_client.dart';
import '../../core/employee_repository.dart';

/// Real data from GET /api/admin/students — ALL students on the platform.
/// Relabeled honestly: the backend has no per-employee assignment, so this
/// isn't "my" students, it's every student. Search/filter locally for now.
class MyStudentsQueueScreen extends StatefulWidget {
  const MyStudentsQueueScreen({super.key});

  @override
  State<MyStudentsQueueScreen> createState() => _MyStudentsQueueScreenState();
}

class _MyStudentsQueueScreenState extends State<MyStudentsQueueScreen> {
  List<dynamic> _students = [];
  bool _loading = true;
  String? _error;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() => setState(() {}));
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await EmployeeRepository.instance.getAllStudents();
      if (!mounted) return;
      setState(() {
        _students = data;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e is ApiException ? e.message : 'تعذر تحميل قائمة الطلاب.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final q = _searchController.text.trim().toLowerCase();
    final filtered = q.isEmpty
        ? _students
        : _students.where((s) => ((s as Map<String, dynamic>)['name'] as String? ?? '').toLowerCase().contains(q)).toList();

    return AppScaffold(
      title: 'كل الطلاب',
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.card), border: Border.all(color: AppColors.border)),
              child: TextField(
                controller: _searchController,
                textAlign: TextAlign.right,
                decoration: const InputDecoration(hintText: 'ابحث باسم الطالب...', border: InputBorder.none, contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 12), prefixIcon: Icon(Icons.search_rounded, color: AppColors.navy)),
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? const LoadingState(message: 'جاري تحميل الطلاب...')
                : _error != null
                    ? ErrorState(message: _error!, onRetry: _load)
                    : filtered.isEmpty
                        ? const EmptyState(icon: Icons.people_outline_rounded, title: 'لا يوجد طلاب', message: 'لا توجد نتائج مطابقة.')
                        : ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                            itemCount: filtered.length,
                            itemBuilder: (context, i) {
                              final s = filtered[i] as Map<String, dynamic>;
                              final profile = s['profile'] as Map<String, dynamic>?;
                              final stage = profile?['applicationStage'] as String?;
                              return AppCard(
                                child: Row(
                                  children: [
                                    const CircleAvatar(radius: 20, backgroundColor: AppColors.border, child: Icon(Icons.person_rounded, color: AppColors.navy, size: 18)),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(s['name'] as String? ?? '—', style: AppTextStyles.cardTitle),
                                          Text(s['email'] as String? ?? '', style: AppTextStyles.caption),
                                        ],
                                      ),
                                    ),
                                    if (stage != null) StatusBadge(label: stage, color: AppColors.info),
                                  ],
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}

class MessageThread {
  final String name;
  final String lastMessage;
  final String time;
  final bool unread;
  const MessageThread({required this.name, required this.lastMessage, required this.time, this.unread = false});
}

class MessagesInboxScreen extends StatelessWidget {
  const MessagesInboxScreen({super.key});

  static const List<MessageThread> _threads = [
    MessageThread(name: 'أحمد خالد', lastMessage: 'هل الترجمة المعتمدة مقبولة؟', time: '10:24 ص', unread: true),
    MessageThread(name: 'جامعة إسطنبول التقنية', lastMessage: 'تم استلام الطلب، جاري المراجعة', time: 'أمس'),
    MessageThread(name: 'منى سالم', lastMessage: 'شكرًا جزيلًا على المساعدة!', time: 'أمس'),
  ];

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'الرسائل (تجريبي)',
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _threads.length + 1,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, i) {
          if (i == 0) {
            return Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.warning.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
              child: const Text('بيانات توضيحية — الباك اند لسه مفيهوش نظام رسائل حقيقي بين الموظف والطالب.', style: TextStyle(color: AppColors.warning, fontSize: 12)),
            );
          }
          final t = _threads[i - 1];
          return AppCard(
            margin: EdgeInsets.zero,
            onTap: () {},
            child: Row(
              children: [
                const CircleAvatar(radius: 20, backgroundColor: AppColors.border, child: Icon(Icons.person_rounded, color: AppColors.navy, size: 18)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(t.name, style: t.unread ? AppTextStyles.cardTitle : AppTextStyles.body),
                      Text(t.lastMessage, style: AppTextStyles.caption, maxLines: 1, overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(t.time, style: AppTextStyles.caption),
                    if (t.unread) Container(margin: const EdgeInsets.only(top: 4), width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.orange, shape: BoxShape.circle)),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

/// Manager Overview — spec point 110: short indicators only, not a full ERP.
/// Real platform-wide numbers from GET /api/admin/overview. These are NOT
/// personal-to-this-employee (the backend has no such concept) — they're
/// the whole platform's numbers, labeled honestly as such.
class ManagerOverviewScreen extends StatefulWidget {
  const ManagerOverviewScreen({super.key});

  @override
  State<ManagerOverviewScreen> createState() => _ManagerOverviewScreenState();
}

class _ManagerOverviewScreenState extends State<ManagerOverviewScreen> {
  Map<String, dynamic>? _overview;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await EmployeeRepository.instance.getOverview();
      if (!mounted) return;
      setState(() {
        _overview = data;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e is ApiException ? e.message : 'تعذر تحميل نظرة عامة على المنصة.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'نظرة عامة على المنصة',
      body: _loading
          ? const LoadingState(message: 'جاري التحميل...')
          : _error != null
              ? ErrorState(message: _error!, onRetry: _load)
              : _buildContent(_overview!),
    );
  }

  Widget _buildContent(Map<String, dynamic> overview) {
    final stats = overview['stats'] as Map<String, dynamic>? ?? {};
    final metrics = [
      {'label': 'إجمالي الطلاب', 'value': '${stats['students'] ?? 0}', 'color': AppColors.info},
      {'label': 'إجمالي الطلبات', 'value': '${stats['applications'] ?? 0}', 'color': AppColors.navy},
      {'label': 'قيد المراجعة', 'value': '${stats['underReviewApplications'] ?? 0}', 'color': AppColors.warning},
      {'label': 'تم تقديمها', 'value': '${stats['submittedApplications'] ?? 0}', 'color': AppColors.info},
      {'label': 'الجامعات', 'value': '${stats['universities'] ?? 0}', 'color': AppColors.success},
      {'label': 'البرامج', 'value': '${stats['programs'] ?? 0}', 'color': AppColors.success},
      {'label': 'الوكلاء (Partners)', 'value': '${stats['partners'] ?? 0}', 'color': AppColors.orange},
      {'label': 'حسابات غير نشطة', 'value': '${stats['inactiveUsers'] ?? 0}', 'color': AppColors.danger},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'أرقام المنصة بالكامل (مش مخصصة لك وحدك — الباك اند مفيهوش نظام "مهام لكل موظف" لسه).',
          style: AppTextStyles.caption,
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: metrics.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.3),
          itemBuilder: (context, i) {
            final m = metrics[i];
            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.card), border: Border.all(color: AppColors.border)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(m['value'] as String, style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: m['color'] as Color)),
                  Text(m['label'] as String, style: AppTextStyles.caption),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
