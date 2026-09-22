import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import 'catalog_browser.dart';
import 'catalog_detail.dart';
import '../../core/student_repository.dart';

class ProgramsExplorerScreen extends StatelessWidget {
  const ProgramsExplorerScreen({super.key});
  @override
  Widget build(BuildContext context) => AppScaffold(
        title: 'البرامج الدراسية',
        body: CatalogBrowser(
            onOpen: (p) => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => ProgramDetailScreen(
                    programId: p['_id'] as String, initialData: p)))),
      );
}

class ProgramFinderScreen extends StatelessWidget {
  const ProgramFinderScreen({super.key});
  @override
  Widget build(BuildContext context) => AppScaffold(
        title: 'مكتشف البرامج',
        body: CatalogBrowser(
            finder: true,
            onOrientation: () => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => const ProgramOrientationScreen())),
            onOpen: (p) => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => ProgramDetailScreen(
                    programId: p['_id'] as String, initialData: p)))),
      );
}

class ProgramDetailScreen extends StatelessWidget {
  final String programId;
  final Map<String, dynamic>? initialData;
  const ProgramDetailScreen(
      {super.key, required this.programId, this.initialData});
  @override
  Widget build(BuildContext context) =>
      CatalogDetailPage(id: programId, initialData: initialData);
}

/// Orientation preferences saved through the student API.
class ProgramOrientationScreen extends StatefulWidget {
  const ProgramOrientationScreen({super.key});

  @override
  State<ProgramOrientationScreen> createState() =>
      _ProgramOrientationScreenState();
}

class _ProgramOrientationScreenState extends State<ProgramOrientationScreen> {
  static const _subjectOptions = [
    'أحياء',
    'رياضيات',
    'حاسوب',
    'اقتصاد',
    'فيزياء',
    'أدب'
  ];
  final Set<String> _selectedSubjects = {};
  final _budgetController = TextEditingController();
  final _countryController = TextEditingController();
  String _studyStyle = 'متوازن';
  String _language = 'الإنجليزية';
  String _degreeLevel = 'بكالوريوس';
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _budgetController.dispose();
    _countryController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final result = await StudentRepository.instance.submitOrientationTest(
        favoriteSubjects: _selectedSubjects.toList(),
        interestedFields: _selectedSubjects.toList(),
        studyStyle: _studyStyle,
        preferredLanguage: _language,
        preferredCountry: _countryController.text.trim(),
        approximateBudget: _budgetController.text.trim(),
        desiredDegreeLevel: _degreeLevel,
      );
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(
          builder: (_) => ProgramFinderResultsScreen(result: result)));
    } catch (_) {
      if (mounted) {
        setState(() => _error = 'تعذر إرسال بياناتك، حاول مرة أخرى.');
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'تقييم الاهتمامات الدراسية',
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('ساعدنا نلاقي البرنامج المناسب ليك',
                style: AppTextStyles.screenTitle),
            const SizedBox(height: 16),
            _finderChips(
                'المواد المفضلة',
                _subjectOptions,
                _selectedSubjects,
                (s) => setState(() => _selectedSubjects.contains(s)
                    ? _selectedSubjects.remove(s)
                    : _selectedSubjects.add(s))),
            _finderField('الميزانية السنوية التقريبية', 'مثال: 5,000\$',
                _budgetController),
            _finderField('الدولة المفضلة', 'مثال: تركيا', _countryController),
            _choice('نمط الدراسة', _studyStyle, ['متوازن', 'عملي', 'نظري'],
                (value) => setState(() => _studyStyle = value)),
            _choice(
                'لغة الدراسة',
                _language,
                ['الإنجليزية', 'العربية', 'التركية'],
                (value) => setState(() => _language = value)),
            _choice(
                'الدرجة العلمية',
                _degreeLevel,
                ['بكالوريوس', 'ماجستير', 'دكتوراه', 'دبلوم'],
                (value) => setState(() => _degreeLevel = value)),
            if (_error != null) ...[
              Text(_error!,
                  style:
                      const TextStyle(color: AppColors.danger, fontSize: 12.5)),
              const SizedBox(height: 8),
            ],
            const SizedBox(height: 4),
            PrimaryButton(
                label: _submitting ? 'جاري الإرسال...' : 'احصل على اقتراحات',
                onPressed: _submitting ? null : _submit),
            const SizedBox(height: 10),
            const Text('النتائج استرشادية وليست قرارًا نهائيًا.',
                style: AppTextStyles.caption, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  Widget _choice(String label, String value, List<String> values,
          ValueChanged<String> update) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: DropdownButtonFormField<String>(
            initialValue: value,
            decoration: InputDecoration(labelText: label),
            items: values
                .map((item) => DropdownMenuItem(value: item, child: Text(item)))
                .toList(),
            onChanged: _submitting
                ? null
                : (next) {
                    if (next != null) update(next);
                  }),
      );

  Widget _finderField(
      String label, String hint, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.caption),
          const SizedBox(height: 6),
          Container(
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.button),
                border: Border.all(color: AppColors.border)),
            child: TextField(
              controller: controller,
              textAlign: TextAlign.right,
              decoration: InputDecoration(
                  hintText: hint,
                  border: InputBorder.none,
                  contentPadding:
                      const EdgeInsets.symmetric(vertical: 12, horizontal: 12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _finderChips(String label, List<String> options, Set<String> selected,
      void Function(String) onToggle) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.caption),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: options.map((o) {
              final isSelected = selected.contains(o);
              return GestureDetector(
                onTap: () => onToggle(o),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.orange.withValues(alpha: 0.12)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(AppRadius.chip),
                    border: Border.all(
                        color:
                            isSelected ? AppColors.orange : AppColors.border),
                  ),
                  child: Text(o,
                      style: TextStyle(
                          color: isSelected
                              ? AppColors.orange
                              : AppColors.textPrimary,
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600)),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class ProgramFinderResultsScreen extends StatelessWidget {
  final Map<String, dynamic> result;
  const ProgramFinderResultsScreen({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    final suggestedFields =
        (result['suggestedFields'] as List<dynamic>? ?? []).cast<String>();
    final suggestedCountries =
        (result['suggestedCountries'] as List<dynamic>? ?? []).cast<String>();
    final summary = result['recommendationSummary'] as String?;

    return AppScaffold(
      title: 'الاقتراحات المناسبة لك',
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (summary != null) ...[
            AppCard(child: Text(summary, style: AppTextStyles.body)),
            const SizedBox(height: 12),
          ],
          if (suggestedFields.isNotEmpty) ...[
            const Text('مجالات مقترحة', style: AppTextStyles.sectionLabel),
            const SizedBox(height: 8),
            Wrap(
                spacing: 8,
                runSpacing: 8,
                children: suggestedFields
                    .map((f) => StatusBadge(label: f, color: AppColors.orange))
                    .toList()),
            const SizedBox(height: 16),
          ],
          if (suggestedCountries.isNotEmpty) ...[
            const Text('دول مقترحة', style: AppTextStyles.sectionLabel),
            const SizedBox(height: 8),
            Wrap(
                spacing: 8,
                runSpacing: 8,
                children: suggestedCountries
                    .map((c) => StatusBadge(label: c, color: AppColors.info))
                    .toList()),
          ],
          const SizedBox(height: 16),
          const Text(
            'دي نتيجة استرشادية بناءً على إجاباتك. تصفّح البرامج والجامعات المرتبطة بالمجالات دي من قسم الاستكشاف.',
            style: AppTextStyles.caption,
          ),
        ],
      ),
    );
  }
}
