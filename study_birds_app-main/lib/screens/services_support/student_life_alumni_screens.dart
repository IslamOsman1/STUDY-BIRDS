import 'package:flutter/material.dart';
import '../../core/api_client.dart';
import '../../core/auth_session.dart';
import '../../core/app_theme.dart';
import 'community_screen.dart' show StudentCommunityScreen;

// ─── shared helpers ───────────────────────────────────────────────────────────

String _fmtDate(dynamic raw) {
  final d = DateTime.tryParse('$raw')?.toLocal();
  if (d == null) return '';
  return '${d.day}/${d.month}/${d.year}';
}

// ─── بند 56: عروض ونمط الحياة الطلابية ────────────────────────────────────────

class StudentLifeOffersScreen extends StatefulWidget {
  const StudentLifeOffersScreen({super.key});
  @override
  State<StudentLifeOffersScreen> createState() =>
      _StudentLifeOffersScreenState();
}

class _StudentLifeOffersScreenState extends State<StudentLifeOffersScreen> {
  Map<String, dynamic>? _upcoming;
  List<dynamic> _past = [];
  bool _loading = true;
  String? _error;
  bool _registering = false;

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
      final results = await Future.wait([
        ApiClient.instance.get('/content/upcoming-event'),
        ApiClient.instance.get('/content/past-events'),
      ]);
      if (!mounted) return;
      setState(() {
        _upcoming = results[0] is Map
            ? Map<String, dynamic>.from(results[0] as Map)
            : null;
        _past = results[1] is List ? results[1] as List : [];
      });
    } catch (e) {
      if (mounted) {
        setState(
            () => _error = 'تعذر تحميل الفعاليات. تحقق من الاتصال وأعد المحاولة.');
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _register() async {
    final user = AuthSession.instance.currentUser;
    final userName = user?.name ?? '';
    final userEmail = user?.email ?? '';
    final yes = await showAppConfirmDialog(context,
        title: 'تسجيل الحضور',
        message: 'سيتم تسجيل اسمك "$userName" للفعالية القادمة. تأكيد؟',
        confirmLabel: 'تسجيل');
    if (yes != true || !mounted) return;
    setState(() => _registering = true);
    try {
      await ApiClient.instance.post('/content/event-registrations',
          body: {'name': userName, 'email': userEmail});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('تم تسجيل حضورك بنجاح ✓')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(
                e is ApiException ? e.message : 'تعذر التسجيل. حاول مجددًا.')));
      }
    } finally {
      if (mounted) setState(() => _registering = false);
    }
  }

  @override
  Widget build(BuildContext context) => AppScaffold(
        title: 'الحياة الطلابية والفعاليات',
        body: RefreshIndicator(
          onRefresh: _load,
          color: AppColors.navy,
          child: _loading
              ? const LoadingState(message: 'جاري تحميل الفعاليات...')
              : _error != null
                  ? ErrorState(message: _error!, onRetry: _load)
                  : ListView(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        const Text(
                            'اكتشف الفعاليات الطلابية والأنشطة المتاحة لك.',
                            style: AppTextStyles.body),
                        const SizedBox(height: 20),
                        if (_upcoming != null &&
                            (_upcoming!['title'] as String? ?? '').isNotEmpty)
                          _UpcomingEventCard(
                              event: _upcoming!,
                              registering: _registering,
                              onRegister: _register),
                        if (_upcoming == null ||
                            (_upcoming!['title'] as String? ?? '').isEmpty)
                          const AppCard(
                            child: Center(
                                child: Padding(
                              padding: EdgeInsets.all(12),
                              child: Text('لا توجد فعالية قادمة حالياً.',
                                  style: AppTextStyles.caption),
                            )),
                          ),
                        const SizedBox(height: 20),
                        if (_past.isNotEmpty) ...[
                          const Text('الفعاليات السابقة',
                              style: AppTextStyles.sectionLabel),
                          const SizedBox(height: 10),
                          for (final e in _past)
                            if (e is Map)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 10),
                                child: _PastEventCard(event: e),
                              ),
                        ],
                        const SizedBox(height: 20),
                        AppCard(
                          onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                  builder: (_) =>
                                      const StudentCommunityScreen())),
                          child: const Row(children: [
                            Icon(Icons.forum_rounded, color: AppColors.navy),
                            SizedBox(width: 12),
                            Expanded(
                                child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                  Text('مجتمع الطلاب',
                                      style: AppTextStyles.cardTitle),
                                  Text(
                                      'تبادل التجارب والنصائح مع زملائك الطلاب',
                                      style: AppTextStyles.caption),
                                ])),
                            Icon(Icons.arrow_back_ios_new_rounded,
                                size: 14, color: AppColors.textSecondary),
                          ]),
                        ),
                      ],
                    ),
        ),
      );
}

class _UpcomingEventCard extends StatelessWidget {
  final Map<String, dynamic> event;
  final bool registering;
  final VoidCallback onRegister;
  const _UpcomingEventCard(
      {required this.event,
      required this.registering,
      required this.onRegister});

  @override
  Widget build(BuildContext context) {
    final coverUrl = event['coverImage'] as String?;
    final date = _fmtDate(event['date']);
    return AppCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        if (coverUrl != null && coverUrl.isNotEmpty)
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Image.network(coverUrl,
                width: double.infinity,
                height: 140,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox.shrink()),
          ),
        if (coverUrl != null && coverUrl.isNotEmpty) const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
              color: AppColors.orange.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(6)),
          child: const Text('الفعالية القادمة',
              style: TextStyle(
                  color: AppColors.orange,
                  fontSize: 12,
                  fontWeight: FontWeight.w600)),
        ),
        const SizedBox(height: 10),
        Text('${event['title'] ?? ''}', style: AppTextStyles.cardTitle),
        if ((event['description'] as String? ?? '').isNotEmpty) ...[
          const SizedBox(height: 6),
          Text('${event['description']}', style: AppTextStyles.body),
        ],
        if (date.isNotEmpty) ...[
          const SizedBox(height: 8),
          Row(children: [
            const Icon(Icons.calendar_today_outlined,
                size: 14, color: AppColors.textSecondary),
            const SizedBox(width: 6),
            Text(date, style: AppTextStyles.caption),
          ]),
        ],
        const SizedBox(height: 14),
        PrimaryButton(
          label: registering ? 'جارٍ التسجيل...' : 'سجّل حضورك',
          onPressed: registering ? null : onRegister,
        ),
      ]),
    );
  }
}

class _PastEventCard extends StatelessWidget {
  final Map event;
  const _PastEventCard({required this.event});
  @override
  Widget build(BuildContext context) {
    final coverUrl = event['coverImage'] as String?;
    final date = _fmtDate(event['date']);
    return AppCard(
      child: Row(children: [
        if (coverUrl != null && coverUrl.isNotEmpty)
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(coverUrl,
                width: 56,
                height: 56,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _iconBox()),
          )
        else
          _iconBox(),
        const SizedBox(width: 12),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('${event['title'] ?? ''}', style: AppTextStyles.cardTitle),
          if (date.isNotEmpty)
            Text(date, style: AppTextStyles.caption),
        ])),
      ]),
    );
  }

  Widget _iconBox() => Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
          color: AppColors.navy.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(8)),
      child:
          const Icon(Icons.event_rounded, color: AppColors.navy, size: 24));
}

// ─── بند 57: شبكة الخريجين ─────────────────────────────────────────────────────

class AlumniNetworkScreen extends StatefulWidget {
  const AlumniNetworkScreen({super.key});
  @override
  State<AlumniNetworkScreen> createState() => _AlumniNetworkScreenState();
}

class _AlumniNetworkScreenState extends State<AlumniNetworkScreen> {
  Map<String, dynamic>? _upcoming;
  List<dynamic> _past = [];
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
      final results = await Future.wait([
        ApiClient.instance.get('/content/upcoming-event'),
        ApiClient.instance.get('/content/past-events'),
      ]);
      if (!mounted) return;
      setState(() {
        _upcoming = results[0] is Map
            ? Map<String, dynamic>.from(results[0] as Map)
            : null;
        _past = results[1] is List ? results[1] as List : [];
      });
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر التحميل. أعد المحاولة.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => AppScaffold(
        title: 'شبكة الخريجين',
        body: RefreshIndicator(
          onRefresh: _load,
          color: AppColors.navy,
          child: _loading
              ? const LoadingState(message: 'جاري التحميل...')
              : _error != null
                  ? ErrorState(message: _error!, onRetry: _load)
                  : ListView(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        AppCard(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            Row(children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                    color: AppColors.navy.withValues(alpha: 0.08),
                                    shape: BoxShape.circle),
                                child: const Icon(Icons.workspace_premium_rounded,
                                    color: AppColors.navy, size: 22),
                              ),
                              const SizedBox(width: 12),
                              const Expanded(
                                  child: Text('برنامج السفراء',
                                      style: AppTextStyles.cardTitle)),
                            ]),
                            const SizedBox(height: 10),
                            const Text(
                                'انضم لبرنامج سفراء Study Birds بعد تخرجك وساعد الطلاب الجدد في رحلتهم الدراسية.',
                                style: AppTextStyles.body),
                          ]),
                        ),
                        const SizedBox(height: 12),
                        ..._alumniCards(context),
                        if (_upcoming != null &&
                            (_upcoming!['title'] as String? ?? '').isNotEmpty) ...[
                          const SizedBox(height: 20),
                          const Text('الفعالية القادمة',
                              style: AppTextStyles.sectionLabel),
                          const SizedBox(height: 10),
                          AppCard(
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                Text('${_upcoming!['title']}',
                                    style: AppTextStyles.cardTitle),
                                if ((_upcoming!['description'] as String? ?? '')
                                    .isNotEmpty) ...[
                                  const SizedBox(height: 6),
                                  Text('${_upcoming!['description']}',
                                      style: AppTextStyles.body),
                                ],
                                if (_fmtDate(_upcoming!['date']).isNotEmpty) ...[
                                  const SizedBox(height: 6),
                                  Text(_fmtDate(_upcoming!['date']),
                                      style: AppTextStyles.caption),
                                ],
                              ])),
                        ],
                        if (_past.isNotEmpty) ...[
                          const SizedBox(height: 20),
                          const Text('فعاليات الخريجين السابقة',
                              style: AppTextStyles.sectionLabel),
                          const SizedBox(height: 10),
                          for (final e in _past)
                            if (e is Map)
                              Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: AppCard(
                                      child: Row(children: [
                                    const Icon(Icons.event_rounded,
                                        color: AppColors.navy, size: 20),
                                    const SizedBox(width: 12),
                                    Expanded(
                                        child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                          Text('${e['title'] ?? ''}',
                                              style: AppTextStyles.cardTitle),
                                          if (_fmtDate(e['date']).isNotEmpty)
                                            Text(_fmtDate(e['date']),
                                                style: AppTextStyles.caption),
                                        ])),
                                  ]))),
                        ],
                        const SizedBox(height: 20),
                        AppCard(
                          onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                  builder: (_) =>
                                      const StudentCommunityScreen())),
                          child: const Row(children: [
                            Icon(Icons.forum_rounded, color: AppColors.navy),
                            SizedBox(width: 12),
                            Expanded(
                                child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                  Text('مجتمع الخريجين',
                                      style: AppTextStyles.cardTitle),
                                  Text('تواصل مع الخريجين وشارك تجربتك',
                                      style: AppTextStyles.caption),
                                ])),
                            Icon(Icons.arrow_back_ios_new_rounded,
                                size: 14, color: AppColors.textSecondary),
                          ]),
                        ),
                      ],
                    ),
        ),
      );

  List<Widget> _alumniCards(BuildContext context) => const [
        _InfoCard(
          icon: Icons.work_outline_rounded,
          title: 'فرص العمل والتدريب',
          body:
              'نربطك بأفضل فرص العمل والتدريب المهني في مجالك بعد التخرج. ترقّب الإعلانات في مجتمع الطلاب.',
        ),
        SizedBox(height: 12),
        _InfoCard(
          icon: Icons.school_outlined,
          title: 'منح الدراسات العليا',
          body:
              'فرص منح الماجستير والدكتوراه والبرامج المتقدمة. متابعة منتظمة من فريق Study Birds.',
        ),
      ];
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;
  const _InfoCard(
      {required this.icon, required this.title, required this.body});
  @override
  Widget build(BuildContext context) => AppCard(
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
                color: AppColors.navy.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: AppColors.navy, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(title, style: AppTextStyles.cardTitle),
                const SizedBox(height: 4),
                Text(body, style: AppTextStyles.body),
              ])),
        ]),
      );
}
