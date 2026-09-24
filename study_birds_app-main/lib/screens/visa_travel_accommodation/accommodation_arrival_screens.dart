import 'arrival_services_screen.dart';
import '../services_support/support_team_ai_screens.dart';
import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/student_repository.dart';
import '../../core/api_client.dart';

class AccommodationScreen extends StatelessWidget {
  const AccommodationScreen({super.key});
  @override
  Widget build(BuildContext context) => const ArrivalServicesScreen();
}

/// Required documents the student should prepare for the registration day.
/// Only the first three have matching upload keys in the Study Birds system.
const List<({String docKey, String label})> kUniversityRegistrationDocs = [
  (docKey: 'passport', label: 'جواز السفر الأصلي'),
  (docKey: 'biometric-photo', label: 'صور شخصية'),
  (docKey: 'latest-qualification', label: 'آخر مؤهل دراسي'),
  (docKey: 'transcript', label: 'كشف الدرجات'),
];

({String label, Color color}) uniRegBadgeFromJourneyStage(String stage) {
  const order = [
    'file-received',
    'documents-review',
    'university-selection',
    'applying',
    'university-review',
    'preliminary-accepted',
    'first-payment',
    'final-accepted',
    'visa',
    'travel',
    'reception',
    'accommodation',
    'university-registration',
    'studies-started',
  ];
  final idx = order.indexOf(stage);
  if (idx < 0 || idx < 12) {
    return (label: 'لم يحن الوقت بعد', color: AppColors.neutral);
  }
  if (idx == 12) {
    return (label: 'بانتظار الموعد', color: AppColors.warning);
  }
  return (label: 'مكتمل', color: AppColors.success);
}

class UniversityRegistrationScreen extends StatefulWidget {
  const UniversityRegistrationScreen({super.key});
  @override
  State<UniversityRegistrationScreen> createState() =>
      _UniversityRegistrationScreenState();
}

class _UniversityRegistrationScreenState
    extends State<UniversityRegistrationScreen> {
  final _repo = StudentRepository.instance;
  bool _loading = true;
  String? _error;
  String _stage = '';
  Set<String> _uploadedKeys = {};

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
      final results =
          await Future.wait([_repo.getOverview(), _repo.getDocuments()]);
      if (!mounted) return;
      final overview = results[0] as Map<String, dynamic>?;
      final docs = results[1] as List<dynamic>;
      setState(() {
        _stage = '${overview?['journeyStage'] ?? ''}';
        _uploadedKeys = docs
            .whereType<Map>()
            .map((d) => '${d['type']}')
            .toSet();
      });
    } catch (e) {
      if (mounted) {
        setState(() => _error = e is ApiException
            ? e.message
            : 'تعذر تحميل البيانات. أعد المحاولة.');
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final badge = uniRegBadgeFromJourneyStage(_stage);
    return AppScaffold(
      title: 'تسجيل الجامعة',
      body: _loading
          ? const LoadingState()
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(padding: const EdgeInsets.all(16), children: [
                Align(
                    alignment: Alignment.centerRight,
                    child: StatusBadge(label: badge.label, color: badge.color)),
                if (_error != null) ...[
                  const SizedBox(height: 10),
                  Text(_error!,
                      style: const TextStyle(color: AppColors.danger)),
                ],
                const SizedBox(height: 16),
                const Text('المستندات المطلوبة',
                    style: AppTextStyles.sectionLabel),
                const SizedBox(height: 10),
                AppCard(
                  child: Column(
                    children: [
                      for (int i = 0;
                          i < kUniversityRegistrationDocs.length;
                          i++) ...[
                        if (i > 0) const Divider(height: 16),
                        _DocRow(
                          label: kUniversityRegistrationDocs[i].label,
                          done: _uploadedKeys
                              .contains(kUniversityRegistrationDocs[i].docKey),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const Text('الموعد', style: AppTextStyles.sectionLabel),
                const SizedBox(height: 10),
                const AppCard(
                  child: Row(children: [
                    Icon(Icons.school_rounded, color: AppColors.navy),
                    SizedBox(width: 12),
                    Expanded(
                        child: Text(
                            'سيتم إبلاغك بتفاصيل موعد التسجيل من قِبل الفريق قريبًا.',
                            style: AppTextStyles.body)),
                  ]),
                ),
              ]),
            ),
    );
  }
}

class _DocRow extends StatelessWidget {
  final String label;
  final bool done;
  const _DocRow({required this.label, required this.done});
  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Icon(
          done ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
          color: done ? AppColors.success : AppColors.neutral,
          size: 20),
      const SizedBox(width: 10),
      Expanded(child: Text(label, style: AppTextStyles.body)),
    ]);
  }
}

class InsuranceScreen extends StatelessWidget {
  const InsuranceScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const NewSupportTicketScreen(initialSubject: 'طلب تأمين');
}

class EquivalencyScreen extends StatelessWidget {
  const EquivalencyScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const NewSupportTicketScreen(initialSubject: 'طلب معادلة');
}
