import '../../core/api_client.dart';
import 'catalog_detail.dart' show catalogArticleSections, catalogAssetUrl;
import '../../core/auth_session.dart';
import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/catalog_repository.dart';
import 'universities_screens.dart' show UniversitiesExplorerScreen;

class CountriesExplorerScreen extends StatefulWidget {
  const CountriesExplorerScreen({super.key});

  @override
  State<CountriesExplorerScreen> createState() =>
      _CountriesExplorerScreenState();
}

class _CountriesExplorerScreenState extends State<CountriesExplorerScreen> {
  List<dynamic> _countries = [];
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
      final data = await CatalogRepository.instance.getCountries();
      if (!mounted) return;
      setState(() {
        _countries = data;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذر تحميل قائمة الدول.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'استكشاف الدول',
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.navy,
        child: _loading
            ? const LoadingState(message: 'جاري تحميل الدول...')
            : _error != null
                ? ErrorState(message: _error!, onRetry: _load)
                : _countries.isEmpty
                    ? const EmptyState(
                        icon: Icons.public_off_rounded,
                        title: 'لا توجد دول مضافة بعد',
                        message: 'سيتم إضافتها من لوحة التحكم قريبًا.')
                    : GridView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _countries.length,
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              mainAxisSpacing: 12,
                              crossAxisSpacing: 12,
                              childAspectRatio: 1.15),
                      itemBuilder: (context, i) {
                        final c = _countries[i] as Map<String, dynamic>;
                        return GestureDetector(
                          onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                  builder: (_) =>
                                      CountryDetailScreen(country: c))),
                          child: Container(
                            decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius:
                                    BorderRadius.circular(AppRadius.card),
                                border: Border.all(color: AppColors.border)),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  width: 52,
                                  height: 52,
                                  decoration: BoxDecoration(
                                      color: AppColors.navy.withValues(alpha: 0.08),
                                      shape: BoxShape.circle),
                                  child: (c['heroImage'] as String?)
                                              ?.isNotEmpty ==
                                          true
                                      ? ClipOval(
                                          child: Image.network(
                                            c['heroImage'] as String,
                                            fit: BoxFit.cover,
                                            width: 52,
                                            height: 52,
                                            errorBuilder: (_, __, ___) =>
                                                const Icon(Icons.public_rounded,
                                                    color: AppColors.navy,
                                                    size: 24),
                                          ),
                                        )
                                      : const Icon(Icons.public_rounded,
                                          color: AppColors.navy, size: 24),
                                ),
                                const SizedBox(height: 10),
                                Text(c['name'] as String? ?? '—',
                                    style: AppTextStyles.cardTitle),
                                const SizedBox(height: 2),
                                Text('${c['universityCount'] ?? 0} جامعة',
                                    style: AppTextStyles.caption),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
      ),
    );
  }
}

class CountryDetailScreen extends StatelessWidget {
  final Map<String, dynamic> country;
  const CountryDetailScreen({super.key, required this.country});

  @override
  Widget build(BuildContext context) {
    final description = country['description'] as String?;
    final visaNotes = country['visaNotes'] as String?;
    final heroImage = catalogAssetUrl(country['heroImage']);

    return AppScaffold(
      title: country['name'] as String? ?? 'دولة',
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            height: 110,
            decoration: BoxDecoration(
                color: AppColors.navy.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(AppRadius.card)),
            child: heroImage != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.card),
                    child: Image.network(
                      heroImage,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorBuilder: (_, __, ___) => const Center(
                          child: Icon(Icons.flag_rounded,
                              size: 40, color: AppColors.navy)),
                    ),
                  )
                : const Center(
                    child: Icon(Icons.flag_rounded,
                        size: 40, color: AppColors.navy)),
          ),
          const SizedBox(height: 16),
          if (description != null && description.isNotEmpty) ...[
            AppCard(child: Text(description, style: AppTextStyles.body)),
            const SizedBox(height: 12),
          ],
          AppCard(
            child: Wrap(
              spacing: 20,
              runSpacing: 10,
              children: [
                _Fact(
                    label: 'عدد الجامعات',
                    value: '${country['universityCount'] ?? 0}'),
                _Fact(
                    label: 'عدد التخصصات',
                    value: '${country['specialtyCount'] ?? 0}'),
                if (country['averageTuition'] != null)
                  _Fact(
                      label: 'متوسط الرسوم',
                      value: '\$${country['averageTuition']}'),
              ],
            ),
          ),
          if (visaNotes != null && visaNotes.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text('ملاحظات التأشيرة', style: AppTextStyles.sectionLabel),
            const SizedBox(height: 10),
            AppCard(child: Text(visaNotes, style: AppTextStyles.body)),
          ],
          ...catalogArticleSections(country),
          const SizedBox(height: 16),
          AppCard(
            onTap: () => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => UniversitiesExplorerScreen(
                    countryId: country['_id'] as String?))),
            child: Row(
              children: [
                const Icon(Icons.account_balance_rounded,
                    color: AppColors.navy, size: 20),
                const SizedBox(width: 12),
                const Expanded(
                    child: Text('عرض جامعات هذه الدولة',
                        style: AppTextStyles.cardTitle)),
                const Icon(Icons.arrow_back_ios_new_rounded,
                    size: 14, color: AppColors.textSecondary),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Fact extends StatelessWidget {
  final String label;
  final String value;
  const _Fact({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.caption),
        Text(value,
            style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700)),
      ],
    );
  }
}

class ScholarshipsScreen extends StatefulWidget {
  const ScholarshipsScreen({super.key});
  @override
  State<ScholarshipsScreen> createState() => _ScholarshipsScreenState();
}

class _ScholarshipsScreenState extends State<ScholarshipsScreen> {
  List<dynamic> rows = [], entries = [];
  bool loading = true, sending = false;
  String? error;
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final values = await Future.wait([
        ApiClient.instance.get('/scholarships'),
        if (AuthSession.instance.currentUser?.role == UserRole.student)
          ApiClient.instance
              .get('/scholarships/mine', token: AuthSession.instance.token),
      ]);
      if (mounted)
        setState(() {
          rows = values[0] as List;
          entries = values.length > 1 ? values[1] as List : [];
        });
    } catch (e) {
      if (mounted)
        setState(() => error = e is ApiException && e.statusCode == 404
            ? 'لم تُنشر خدمة المنح بعد.'
            : 'تعذر تحميل المنح. حاول مجددًا.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> apply(Map row) async {
    final yes = await showAppConfirmDialog(context,
        title: 'التقديم للمنحة',
        message:
            'إرسال طلبك لمنحة ${row['title']}؟ سيخضع الطلب لمراجعة الأهلية.',
        confirmLabel: 'إرسال الطلب');
    if (yes != true) return;
    setState(() => sending = true);
    try {
      await ApiClient.instance.post('/scholarships/${row['_id']}/apply',
          token: AuthSession.instance.token, body: {});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('تم تسجيل الطلب للمراجعة')));
        await load();
      }
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(e is ApiException ? e.message : 'تعذر إرسال الطلب')));
    } finally {
      if (mounted) setState(() => sending = false);
    }
  }

  @override
  Widget build(BuildContext context) => AppScaffold(
      title: 'المنح الدراسية',
      actions: [
        IconButton(
            onPressed: sending ? null : load, icon: const Icon(Icons.refresh))
      ],
      body: loading
          ? const LoadingState()
          : error != null
              ? ErrorState(message: error!, onRetry: load)
              : rows.isEmpty && entries.isEmpty
                  ? const EmptyState(
                      icon: Icons.school_outlined,
                      title: 'لا توجد منح منشورة حاليًا',
                      message: 'ستظهر المنح وشروطها عند نشرها من الإدارة.')
                  : ListView(padding: const EdgeInsets.all(16), children: [
                      for (final item in rows)
                        AppCard(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                              Text('${item['title']}',
                                  style: AppTextStyles.cardTitle),
                              Text([
                                item['university'],
                                item['country'],
                                item['degree'],
                                item['funding']
                              ]
                                  .where((v) => v != null && '$v'.isNotEmpty)
                                  .join(' • ')),
                              if (item['eligibility'] != null)
                                Text('${item['eligibility']}'),
                              if (item['deadline'] != null)
                                Text(
                                    'آخر موعد: ${item['deadline'].toString().split('T').first}'),
                              const SizedBox(height: 12),
                              if (AuthSession.instance.currentUser?.role ==
                                  UserRole.student)
                                PrimaryButton(
                                    label: entries.any((e) =>
                                            e['scholarship']?['_id'] ==
                                            item['_id'])
                                        ? 'تم تقديم الطلب'
                                        : 'تقديم الطلب',
                                    onPressed: sending ||
                                            entries.any((e) =>
                                                e['scholarship']?['_id'] ==
                                                item['_id'])
                                        ? null
                                        : () => apply(item as Map)),
                            ])),
                      if (entries.isNotEmpty)
                        const Text('طلباتي السابقة',
                            style: AppTextStyles.sectionLabel),
                      for (final entry in entries)
                        ListTile(
                            title: Text(
                                '${entry['scholarship']?['title'] ?? 'منحة'}'),
                            subtitle: Text(const {
                                  'submitted': 'تم التقديم',
                                  'reviewing': 'قيد المراجعة',
                                  'accepted': 'مقبول',
                                  'rejected': 'غير مقبول'
                                }[entry['status']] ??
                                '${entry['status']}')),
                    ]));
}
