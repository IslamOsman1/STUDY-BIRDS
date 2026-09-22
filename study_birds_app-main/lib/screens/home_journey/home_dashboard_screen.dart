import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/animations.dart';
import '../../core/student_repository.dart';
import '../../core/auth_session.dart';
import '../../main.dart' show RootChooserScreen;
import '../profile_account/profile_account_screens.dart';
import 'notifications_screen.dart';
import 'global_search_screen.dart';
import 'journey_tracker_screen.dart';
import 'activity_log_screen.dart';
import '../applications_documents_payments/applications_screens.dart';
import '../applications_documents_payments/documents_screens.dart';
import '../applications_documents_payments/payments_screens.dart';
import '../universities_programs_countries/universities_screens.dart';
import '../universities_programs_countries/countries_scholarships_screens.dart';
import '../services_support/services_consultation_screens.dart';
import '../services_support/support_team_ai_screens.dart';

/// Real, live Home Dashboard — fetches GET /api/students/overview on load.
/// Uses the server next action when available; older deployments fall back
/// to the current journey description.
class HomeDashboardScreen extends StatefulWidget {
  /// When true (used inside StudentAppShell), this screen has no Scaffold/
  /// bottom-nav of its own — the shell provides one shared bar instead.
  final bool embedInShell;
  const HomeDashboardScreen({super.key, this.embedInShell = false});

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  DashboardOverview? _overview;
  bool _loading = true;
  String? _error;

  // Mock — in production this list comes from the admin panel/CMS (spec
  // points 75/76). No /banners endpoint exists on the backend yet.
  static const List<Map<String, dynamic>> _quickActions = [
    {'label': 'طلباتي', 'icon': Icons.description_outlined},
    {'label': 'الجامعات', 'icon': Icons.account_balance_outlined},
    {'label': 'مستنداتي', 'icon': Icons.folder_open_outlined},
    {'label': 'المدفوعات', 'icon': Icons.payments_outlined},
    {'label': 'Bird AI', 'icon': null},
    {'label': 'استشارة', 'icon': Icons.support_agent_outlined},
    {'label': 'الدعم', 'icon': Icons.headset_mic_outlined},
  ];

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
      final overview = await StudentRepository.instance.getOverview();
      if (!mounted) return;
      setState(() {
        _overview = overview;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذر تحميل بيانات الرئيسية — تحقق من الاتصال وحاول مرة أخرى.';
        _loading = false;
      });
    }
  }

  void _openMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            ListTile(
              leading: const Icon(Icons.person_outline_rounded,
                  color: AppColors.navy),
              title: const Text('حسابي'),
              onTap: () {
                Navigator.pop(sheetContext);
                Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const ProfileScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.notifications_outlined,
                  color: AppColors.navy),
              title: const Text('الإشعارات'),
              onTap: () {
                Navigator.pop(sheetContext);
                Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => const NotificationsScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.support_agent_outlined,
                  color: AppColors.navy),
              title: const Text('مركز الدعم'),
              onTap: () {
                Navigator.pop(sheetContext);
                Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => const SupportCenterScreen()));
              },
            ),
            const Divider(height: 1),
            ListTile(
              leading:
                  const Icon(Icons.logout_rounded, color: AppColors.danger),
              title: const Text('تسجيل الخروج',
                  style: TextStyle(color: AppColors.danger)),
              onTap: () async {
                Navigator.pop(sheetContext);
                await AuthSession.instance.logout();
                if (context.mounted) {
                  Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(
                          builder: (_) => const RootChooserScreen()),
                      (route) => false);
                }
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _quickActionScreen(String label) {
    switch (label) {
      case 'طلباتي':
        return const ApplicationsListScreen();
      case 'الجامعات':
        return const UniversitiesExplorerScreen();
      case 'مستنداتي':
        return const MyDocumentsScreen();
      case 'المدفوعات':
        return const PaymentsSummaryScreen();
      case 'Bird AI':
        return const BirdAIChatScreen();
      case 'استشارة':
        return const ConsultationBookingScreen();
      case 'الدعم':
        return const SupportCenterScreen();
      default:
        return const UniversitiesExplorerScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: _loading
              ? const LoadingState(message: 'جاري تحميل رحلتك...')
              : _error != null
                  ? ErrorState(message: _error!, onRetry: _load)
                  : _buildContent(context, _overview!),
        ),
        bottomNavigationBar: widget.embedInShell
            ? null
            : BottomNavigationBar(
                currentIndex: 0,
                selectedItemColor: AppColors.navy,
                unselectedItemColor: AppColors.textSecondary,
                type: BottomNavigationBarType.fixed,
                items: const [
                  BottomNavigationBarItem(
                      icon: Icon(Icons.home_rounded), label: 'الرئيسية'),
                  BottomNavigationBarItem(
                      icon: Icon(Icons.timeline_rounded), label: 'الرحلة'),
                  BottomNavigationBarItem(
                      icon: Icon(Icons.explore_outlined), label: 'استكشاف'),
                  BottomNavigationBarItem(
                      icon: Icon(Icons.miscellaneous_services_outlined),
                      label: 'الخدمات'),
                  BottomNavigationBarItem(
                      icon: Icon(Icons.person_outline_rounded), label: 'حسابي'),
                ],
              ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, DashboardOverview overview) {
    // Preserve compatibility until the next-action backend is deployed.
    final currentStage = overview.stages.firstWhere(
      (s) => s.status == 'current',
      orElse: () => overview.stages.isNotEmpty
          ? overview.stages.last
          : const DashboardStage(
              key: '',
              titleAr: 'رحلتك الدراسية',
              descriptionAr: 'مرحبًا بك في Study Birds',
              status: 'current'),
    );
    final completedCount =
        overview.stages.where((s) => s.status == 'completed').length;
    final progress =
        overview.stages.isEmpty ? 0.0 : completedCount / overview.stages.length;

    // Journey path label: derived from the most recent application if one
    // exists, otherwise a generic placeholder — no invented university name.
    String journeyPathLabel = 'لم تبدأ رحلة تقديم بعد';
    if (overview.recentApplications.isNotEmpty) {
      final app = overview.recentApplications.first as Map<String, dynamic>;
      final program = app['program'] as Map<String, dynamic>?;
      final university = program?['university'] as Map<String, dynamic>?;
      final uniName = university?['name'] as String?;
      final progName = program?['name'] as String?;
      if (uniName != null || progName != null) {
        journeyPathLabel =
            [uniName, progName].where((e) => e != null).join(' — ');
      }
    }

    final latestNotification = overview.latestNotification;

    return ListView(
      padding: EdgeInsets.zero,
      children: [
        // Hero
        Container(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 34),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [AppColors.navy, AppColors.navy.withOpacity(0.92)],
            ),
            borderRadius:
                const BorderRadius.vertical(bottom: Radius.circular(28)),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  _HeroIconButton(
                      icon: Icons.menu_rounded,
                      onPressed: () => _openMenu(context)),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const Text('مرحباً بك',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.2)),
                        const SizedBox(height: 2),
                        Text(currentStage.titleAr,
                            style: const TextStyle(
                                color: Colors.white60, fontSize: 12)),
                      ],
                    ),
                  ),
                  _HeroIconButton(
                    icon: Icons.notifications_none_rounded,
                    showDot: overview.stats.unreadNotifications > 0,
                    onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(
                            builder: (_) => const NotificationsScreen())),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Container(
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppRadius.card)),
                child: TextField(
                  readOnly: true,
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const GlobalSearchScreen())),
                  textAlign: TextAlign.right,
                  decoration: const InputDecoration(
                    hintText: 'ابحث عن جامعة، برنامج، دولة...',
                    hintStyle:
                        TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    border: InputBorder.none,
                    contentPadding:
                        EdgeInsets.symmetric(vertical: 13, horizontal: 12),
                    prefixIcon: Icon(Icons.search_rounded,
                        color: AppColors.navy, size: 20),
                  ),
                ),
              ),
            ],
          ),
        ),
        // Unified status card — real stage + real stats.
        Transform.translate(
          offset: const Offset(0, -20),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: AppCard(
              margin: EdgeInsets.zero,
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => JourneyTrackerScreen(
                    currentStageKey: overview.journeyStage,
                    journeyPathLabel: journeyPathLabel),
              )),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('رحلتك الحالية',
                                style: AppTextStyles.sectionLabel),
                            const SizedBox(height: 4),
                            Text(journeyPathLabel, style: AppTextStyles.body),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      SizedBox(
                        width: 44,
                        height: 44,
                        child: AnimatedProgressRing(
                          value: progress,
                          size: 44,
                          strokeWidth: 4,
                          centerBuilder: (v) => Text('${(v * 100).round()}%',
                              style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 10.5,
                                  color: AppColors.navy)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  IntrinsicHeight(
                    child: Row(
                      children: [
                        Container(
                            width: 3,
                            decoration: BoxDecoration(
                                color: AppColors.orange,
                                borderRadius: BorderRadius.circular(2))),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                  overview.nextAction?['waiting'] == true
                                      ? 'متابعة الفريق'
                                      : 'الخطوة القادمة',
                                  style: AppTextStyles.caption),
                              const SizedBox(height: 2),
                              Text(
                                  overview.nextAction?['descriptionAr']
                                          as String? ??
                                      currentStage.descriptionAr,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                      color: AppColors.textPrimary)),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        PrimaryButton(
                          label: overview.nextAction == null
                              ? 'تفاصيل الرحلة'
                              : 'عرض التفاصيل',
                          expand: false,
                          onPressed: () =>
                              Navigator.of(context).push(MaterialPageRoute(
                            builder: (_) => overview.nextAction == null ||
                                    overview.nextAction?['destination'] == 'journey'
                                ? JourneyTrackerScreen(
                                    currentStageKey: overview.journeyStage,
                                    journeyPathLabel: journeyPathLabel)
                                : _quickActionScreen(const {
                                      'payments': 'المدفوعات',
                                      'documents': 'مستنداتي',
                                      'applications': 'طلباتي',
                                      'support': 'الدعم',
                                      'catalog': 'الجامعات'
                                    }[overview.nextAction!['destination']] ??
                                    'طلباتي'),
                          )),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Divider(height: 1, color: AppColors.border),
                  const SizedBox(height: 12),
                  // Real stats from the server — no invented "profile completion %".
                  Row(
                    children: [
                      Expanded(
                        child: _InlineStat(
                          icon: Icons.description_outlined,
                          value: '${overview.stats.currentApplications}',
                          label: 'الطلبات النشطة',
                        ),
                      ),
                      Container(width: 1, height: 32, color: AppColors.border),
                      Expanded(
                        child: _InlineStat(
                          icon: Icons.verified_outlined,
                          value: '${overview.stats.acceptedDocuments}',
                          label: 'مستندات مقبولة',
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              const SizedBox(height: 12),
              const Align(
                  alignment: Alignment.centerRight,
                  child:
                      Text('الوصول السريع', style: AppTextStyles.sectionLabel)),
              const SizedBox(height: 10),
              Wrap(
                alignment: WrapAlignment.start,
                spacing: 12,
                runSpacing: 16,
                children: _quickActions
                    .map((q) => GestureDetector(
                          onTap: () {
                            if (q['label'] == 'استشارة') {
                              showAnimatedBottomSheet(
                                context,
                                builder: (_) => SizedBox(
                                  height:
                                      MediaQuery.of(context).size.height * 0.88,
                                  child: const ConsultationBookingScreen(),
                                ),
                              );
                            } else {
                              Navigator.of(context).push(MaterialPageRoute(
                                  builder: (_) => _quickActionScreen(
                                      q['label'] as String)));
                            }
                          },
                          child: SizedBox(
                              width: 72,
                              child: Column(
                                children: [
                                  Container(
                                    width: 52,
                                    height: 52,
                                    decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(
                                            color: AppColors.border)),
                                    child: AppIconTile(q['icon'] as IconData? ??
                                        Icons.auto_awesome_rounded),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(q['label'] as String,
                                      style: AppTextStyles.caption),
                                ],
                              )),
                        ))
                    .toList(),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('المنح الدراسية المتاحة',
                      style: AppTextStyles.sectionLabel),
                  GestureDetector(
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(
                        builder: (_) => const ScholarshipsScreen())),
                    child: const Text('عرض الكل',
                        style: TextStyle(
                            color: AppColors.orange,
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              AppCard(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const ScholarshipsScreen())),
                  child: const ListTile(
                      leading: Icon(Icons.school_outlined),
                      title: Text('استكشف المنح المنشورة'),
                      subtitle:
                          Text('اطّلع على الشروط وقدّم طلبك وتابع حالته.'))),
              const SizedBox(height: 16),
              const Align(
                  alignment: Alignment.centerRight,
                  child: Text('آخر إشعار', style: AppTextStyles.sectionLabel)),
              const SizedBox(height: 10),
              if (latestNotification != null)
                AppCard(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const NotificationsScreen())),
                  child: Row(
                    children: [
                      const Icon(Icons.notifications_active_outlined,
                          color: AppColors.orange, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                          child: Text(
                              latestNotification['title'] as String? ?? '',
                              style: AppTextStyles.body)),
                    ],
                  ),
                )
              else
                AppCard(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const ActivityLogScreen())),
                  child: const Text('لا يوجد إشعارات جديدة حتى الآن.',
                      style: AppTextStyles.caption),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Soft frosted circular icon button used in the hero.
class _HeroIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final bool showDot;
  const _HeroIconButton(
      {required this.icon, required this.onPressed, this.showDot = false});

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.12), shape: BoxShape.circle),
          child: IconButton(
              onPressed: onPressed,
              icon: Icon(icon, color: Colors.white, size: 20)),
        ),
        if (showDot)
          Positioned(
            right: 6,
            top: 6,
            child: Container(
                width: 7,
                height: 7,
                decoration: const BoxDecoration(
                    color: AppColors.orange, shape: BoxShape.circle)),
          ),
      ],
    );
  }
}

/// Calm inline stat — icon, value, label, no border/box around it.
class _InlineStat extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  const _InlineStat(
      {required this.icon, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 6),
        Text(value, style: AppTextStyles.cardTitle.copyWith(fontSize: 15)),
        const SizedBox(width: 4),
        Flexible(
            child: Text(label,
                style: AppTextStyles.caption, overflow: TextOverflow.ellipsis)),
      ],
    );
  }
}
