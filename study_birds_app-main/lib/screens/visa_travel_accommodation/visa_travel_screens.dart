import 'arrival_services_screen.dart';
import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/api_client.dart';
import '../../core/student_repository.dart';
import '../../core/feature_ui.dart';

// ── Pure helpers (extracted for testability) ───────────────────────────────

/// Maps a backend journey-stage key to a 0-5 visa sub-step index.
///
/// Visa sub-steps:
///  0 – لم تبدأ (before preliminary acceptance)
///  1 – التحضير (preliminary-accepted → first-payment)
///  2 – إعداد المستندات (final-accepted)
///  3 – تم التقديم (at visa stage)
///  4 – قيد المراجعة (still at visa, alias used for display)
///  5 – تمت الموافقة (travel or beyond)
int visaStepFromJourneyStage(String stage) {
  final idx = kJourneyStageOrder.indexWhere((s) => s['key'] == stage);
  if (idx < 0) return 0;
  if (idx < 5) return 0;
  if (idx < 7) return 1;
  if (idx < 8) return 2;
  if (idx == 8) return 3; // 'visa'
  return 5;
}

/// Returns [label, color] badge for the visa status derived from [stage].
({String label, Color color}) visaBadgeFromJourneyStage(String stage) {
  final idx = kJourneyStageOrder.indexWhere((s) => s['key'] == stage);
  if (idx < 0 || idx < 5) {
    return (label: 'لم تبدأ', color: AppColors.neutral);
  }
  if (idx < 7) return (label: 'التحضير', color: AppColors.info);
  if (idx < 8) return (label: 'إعداد المستندات', color: AppColors.warning);
  if (idx == 8) return (label: 'قيد المعالجة', color: AppColors.orange);
  return (label: 'تمت الموافقة', color: AppColors.success);
}

// ── Visa requirements list ─────────────────────────────────────────────────

/// Standard visa requirements mapped to document-type keys the backend knows.
/// A requirement is "done" when the student has uploaded a doc of that type.
const List<({String docKey, String label})> kVisaRequirements = [
  (docKey: 'passport', label: 'جواز السفر'),
  (docKey: 'biometric-photo', label: 'صورة شخصية'),
  (docKey: 'latest-qualification', label: 'آخر مؤهل دراسي'),
  (docKey: 'language-certificate', label: 'شهادة اللغة (إن وُجدت)'),
];

// ── VisaCenterScreen ───────────────────────────────────────────────────────

class VisaCenterScreen extends StatefulWidget {
  const VisaCenterScreen({super.key});

  @override
  State<VisaCenterScreen> createState() => _VisaCenterScreenState();
}

class _VisaCenterScreenState extends State<VisaCenterScreen> {
  bool _loading = true;
  String? _error;
  String _currentStage = '';
  Set<String> _uploadedDocKeys = {};

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
        StudentRepository.instance.getOverview(),
        StudentRepository.instance.getDocuments(),
      ]);
      final overview = results[0] as DashboardOverview;
      final docs = results[1] as List<dynamic>;
      if (!mounted) return;
      setState(() {
        _currentStage = overview.currentStage;
        _uploadedDocKeys =
            docs.map((d) => (d as Map)['type']?.toString() ?? '').toSet();
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذر تحميل بيانات التأشيرة. تحقق من الإنترنت وحاول مجدداً.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const AppScaffold(title: 'مركز التأشيرة', body: LoadingState(message: 'جاري التحميل...'));
    if (_error != null) {
      return AppScaffold(
        title: 'مركز التأشيرة',
        body: ErrorState(message: _error!, onRetry: _load),
      );
    }

    final badge = visaBadgeFromJourneyStage(_currentStage);
    final stageLabel = kJourneyStageOrder
        .firstWhere((s) => s['key'] == _currentStage,
            orElse: () => {'title': _currentStage})['title'] ??
        _currentStage;

    return AppScaffold(
      title: 'مركز التأشيرة',
      actions: [
        IconButton(
            onPressed: _load,
            tooltip: 'تحديث',
            icon: const Icon(Icons.refresh))
      ],
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.navy,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: StatusBadge(label: badge.label, color: badge.color),
          ),
          const SizedBox(height: 8),
          AppCard(
            child: Row(
              children: [
                const Icon(Icons.route_rounded, color: AppColors.navy, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('المرحلة الحالية', style: AppTextStyles.caption),
                      Text(stageLabel, style: AppTextStyles.cardTitle),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text('المستندات المطلوبة للتأشيرة', style: AppTextStyles.sectionLabel),
          const SizedBox(height: 10),
          AppCard(
            child: Column(
              children: kVisaRequirements
                  .map((req) {
                    final done = _uploadedDocKeys.contains(req.docKey);
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        children: [
                          Icon(
                            done
                                ? Icons.check_circle_rounded
                                : Icons.radio_button_unchecked_rounded,
                            size: 20,
                            color: done ? AppColors.success : AppColors.textSecondary,
                          ),
                          const SizedBox(width: 10),
                          Expanded(child: Text(req.label, style: AppTextStyles.body)),
                          if (!done)
                            Text('لم يُرفع', style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                        ],
                      ),
                    );
                  })
                  .toList(),
            ),
          ),
          const SizedBox(height: 8),
          const InlineNotice(
              'الموعد الدقيق لمقابلة القنصلية يُحدَّد من قِبل فريق Study Birds وسيتم إبلاغك عبر الإشعارات.'),
        ],
        ),
      ),
    );
  }
}

// ── VisaStepsScreen ────────────────────────────────────────────────────────

const List<String> _visaStages = [
  'لم تبدأ',
  'التحضير',
  'إعداد المستندات',
  'تم التقديم',
  'قيد المراجعة',
  'تمت الموافقة',
];

class VisaStepsScreen extends StatefulWidget {
  const VisaStepsScreen({super.key});

  @override
  State<VisaStepsScreen> createState() => _VisaStepsScreenState();
}

class _VisaStepsScreenState extends State<VisaStepsScreen> {
  bool _loading = true;
  String? _error;
  int _currentStep = 0;

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
        _currentStep = visaStepFromJourneyStage(overview.currentStage);
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذر تحميل مراحل التأشيرة.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const AppScaffold(title: 'مراحل التأشيرة', body: LoadingState());
    if (_error != null) {
      return AppScaffold(
        title: 'مراحل التأشيرة',
        body: ErrorState(message: _error!, onRetry: _load),
      );
    }

    return AppScaffold(
      title: 'مراحل التأشيرة',
      actions: [
        IconButton(onPressed: _load, tooltip: 'تحديث', icon: const Icon(Icons.refresh))
      ],
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.navy,
        child: ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: _visaStages.length,
          itemBuilder: (context, i) {
            final done = i < _currentStep;
            final active = i == _currentStep;
            final isLast = i == _visaStages.length - 1;
          return IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: done
                            ? AppColors.success
                            : (active ? AppColors.orange : Colors.white),
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: done
                                ? AppColors.success
                                : (active ? AppColors.orange : AppColors.border),
                            width: 2),
                      ),
                      child: done
                          ? const Icon(Icons.check_rounded, size: 15, color: Colors.white)
                          : (active
                              ? const Icon(Icons.circle, size: 8, color: Colors.white)
                              : null),
                    ),
                    if (!isLast)
                      Expanded(
                          child: Container(
                              width: 2,
                              color: done ? AppColors.success : AppColors.border)),
                  ],
                ),
                const SizedBox(width: 14),
                Padding(
                  padding: const EdgeInsets.only(bottom: 28, top: 4),
                  child: Text(
                    _visaStages[i],
                    style: active
                        ? AppTextStyles.cardTitle.copyWith(color: AppColors.orange)
                        : AppTextStyles.body,
                  ),
                ),
              ],
            ),
          );
          },
        ),
      ),
    );
  }
}

// ── TravelCenterScreen ─────────────────────────────────────────────────────

class TravelCenterScreen extends StatefulWidget {
  const TravelCenterScreen({super.key});

  @override
  State<TravelCenterScreen> createState() => _TravelCenterScreenState();
}

class _TravelCenterScreenState extends State<TravelCenterScreen> {
  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _data;

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
      final data = await StudentRepository.instance.getArrivalServices();
      if (!mounted) return;
      setState(() {
        _data = data;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذر تحميل بيانات السفر.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const AppScaffold(title: 'مركز السفر', body: LoadingState(message: 'جاري التحميل...'));
    if (_error != null) {
      return AppScaffold(
        title: 'مركز السفر',
        body: ErrorState(message: _error!, onRetry: _load),
      );
    }

    return AppScaffold(
      title: 'مركز السفر',
      actions: [
        IconButton(onPressed: _load, tooltip: 'تحديث', icon: const Icon(Icons.refresh))
      ],
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_data == null) ...[
              const EmptyState(
                icon: Icons.flight_outlined,
                title: 'لم تُقدَّم بيانات السفر بعد',
                message: 'أضف معلومات رحلتك وطلب الخدمات عبر الزر أدناه.',
              ),
            ] else ...[
              AppCard(
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_rounded, color: AppColors.navy),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('تاريخ السفر', style: AppTextStyles.caption),
                        Text(
                          _data!['arrivalDate'] != null
                              ? (_data!['arrivalDate'] as String).split('T').first
                              : 'غير محدد',
                          style: AppTextStyles.cardTitle,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('معلومات الرحلة', style: AppTextStyles.sectionLabel),
                    const SizedBox(height: 10),
                    _KV(label: 'رقم الرحلة', value: _data!['flightNumber']?.toString() ?? 'غير محدد'),
                    const SizedBox(height: 6),
                    _KV(label: 'وقت الوصول', value: _data!['arrivalTime']?.toString() ?? 'غير محدد'),
                    const SizedBox(height: 6),
                    _KV(label: 'المطار', value: _data!['airport']?.toString() ?? 'غير محدد'),
                    const SizedBox(height: 6),
                    _KV(label: 'حالة الطلب', value: _data!['status']?.toString() ?? 'submitted'),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],
            PrimaryButton(
              label: _data == null ? 'تقديم بيانات السفر' : 'تعديل البيانات',
              onPressed: () async {
                await Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const ArrivalServicesScreen()));
                if (mounted) _load();
              },
              icon: Icons.flight_takeoff_rounded,
            ),
          ],
        ),
      ),
    );
  }
}

// ── AirportPickupScreen ────────────────────────────────────────────────────

class AirportPickupScreen extends StatefulWidget {
  const AirportPickupScreen({super.key});

  @override
  State<AirportPickupScreen> createState() => _AirportPickupScreenState();
}

class _AirportPickupScreenState extends State<AirportPickupScreen> {
  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _data;

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
      final data = await StudentRepository.instance.getArrivalServices();
      if (!mounted) return;
      setState(() {
        _data = data;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذر تحميل بيانات الاستقبال.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const AppScaffold(title: 'استقبال المطار', body: LoadingState());
    if (_error != null) {
      return AppScaffold(
        title: 'استقبال المطار',
        body: ErrorState(message: _error!, onRetry: _load),
      );
    }

    final services = (_data?['services'] as Map?)?.cast<String, dynamic>() ?? {};
    final pickupRequested = services['airportPickup'] == true;
    final status = _data?['status']?.toString() ?? '';

    return AppScaffold(
      title: 'استقبال المطار',
      actions: [
        IconButton(onPressed: _load, tooltip: 'تحديث', icon: const Icon(Icons.refresh))
      ],
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_data == null || !pickupRequested) ...[
              const EmptyState(
                icon: Icons.local_taxi_rounded,
                title: 'لم يُطلب استقبال من المطار',
                message: 'يمكنك طلب خدمة الاستقبال عند تقديم بيانات وصولك.',
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'تقديم طلب الاستقبال',
                onPressed: () async {
                  await Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const ArrivalServicesScreen()));
                  if (mounted) _load();
                },
                icon: Icons.add_rounded,
              ),
            ] else ...[
              AppCard(
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('الحالة', style: AppTextStyles.caption),
                        StatusBadge(
                          label: _statusLabel(status),
                          color: _statusColor(status),
                        ),
                      ],
                    ),
                    const Divider(height: 20),
                    _KV(
                      label: 'موعد الوصول',
                      value: _data!['arrivalDate'] != null
                          ? (_data!['arrivalDate'] as String).split('T').first +
                              (_data!['arrivalTime'] != null
                                  ? ' - ${_data!['arrivalTime']}'
                                  : '')
                          : 'غير محدد',
                    ),
                    const SizedBox(height: 6),
                    _KV(label: 'رقم الرحلة', value: _data!['flightNumber']?.toString() ?? 'غير محدد'),
                    const SizedBox(height: 6),
                    _KV(label: 'المطار', value: _data!['airport']?.toString() ?? 'غير محدد'),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const InlineNotice(
                  'سيتواصل معك فريق Study Birds لتأكيد تفاصيل الاستقبال قبل موعد وصولك.'),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () async {
                  await Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const ArrivalServicesScreen()));
                  if (mounted) _load();
                },
                icon: const Icon(Icons.edit_outlined, size: 16),
                label: const Text('تعديل بيانات الوصول'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.button)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'confirmed':
        return 'تم التأكيد';
      case 'assigned':
        return 'تم تعيين السائق';
      case 'completed':
        return 'مكتمل';
      default:
        return 'تم الاستلام';
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'confirmed':
      case 'assigned':
        return AppColors.success;
      case 'completed':
        return AppColors.info;
      default:
        return AppColors.warning;
    }
  }
}

// ── Shared widget ──────────────────────────────────────────────────────────

class _KV extends StatelessWidget {
  final String label;
  final String value;
  const _KV({required this.label, required this.value});
  @override
  Widget build(BuildContext context) => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.caption),
          Text(value,
              style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700)),
        ],
      );
}
