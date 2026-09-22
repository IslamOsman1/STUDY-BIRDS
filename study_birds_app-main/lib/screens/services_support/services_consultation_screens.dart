import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/animations.dart';
import '../../core/api_client.dart';
import '../../core/student_repository.dart';
import '../../core/catalog_repository.dart';

class ServicesCenterScreen extends StatefulWidget {
  const ServicesCenterScreen({super.key});
  @override
  State<ServicesCenterScreen> createState() => _ServicesCenterScreenState();
}

class _ServicesCenterScreenState extends State<ServicesCenterScreen> {
  late Future<List<dynamic>> future = CatalogRepository.instance.getServices();
  Future<void> refresh() async {
    final next = CatalogRepository.instance.getServices();
    setState(() => future = next);
    try {
      await next;
    } catch (_) {/* The FutureBuilder presents the retry state. */}
  }

  @override
  Widget build(BuildContext context) => AppScaffold(
        title: 'مركز الخدمات',
        body: FutureBuilder<List<dynamic>>(
          future: future,
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const LoadingState();
            }
            if (snapshot.hasError) {
              return ErrorState(
                  message: 'تعذر تحميل الخدمات', onRetry: refresh);
            }
            final rows = (snapshot.data ?? []).whereType<Map>().toList();
            if (rows.isEmpty) {
              return const EmptyState(
                  icon: Icons.miscellaneous_services,
                  title: 'لا توجد خدمات متاحة',
                  message: 'ستظهر الخدمات التي ينشرها الفريق هنا.');
            }
            final scale = MediaQuery.textScalerOf(context).scale(14) / 14;
            return RefreshIndicator(
                onRefresh: refresh,
                child: GridView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(12, 16, 12, 20),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      mainAxisExtent: 152 + (scale > 1 ? (scale - 1) * 90 : 0)),
                  itemCount: rows.length,
                  itemBuilder: (context, index) {
                    final row = Map<String, dynamic>.from(rows[index]);
                    final title = row['title']?.toString() ?? '';
                    return Semantics(
                        button: true,
                        label: title,
                        child: Material(
                          color: Colors.white,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: const BorderSide(color: AppColors.border)),
                          clipBehavior: Clip.antiAlias,
                          child: InkWell(
                            onTap: () => Navigator.of(context).push(
                                MaterialPageRoute(
                                    builder: (_) =>
                                        ServiceDetailScreen(service: {
                                          ...row,
                                          'name': title,
                                          'price': 'يحدد بعد مراجعة الطلب',
                                        }))),
                            child: Padding(
                                padding: const EdgeInsets.all(13),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                        width: 36,
                                        height: 36,
                                        decoration: BoxDecoration(
                                            color: const Color(0xFFFFEEDD),
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                        child: Icon(_serviceIcon(title),
                                            size: 19, color: AppColors.orange)),
                                    const Spacer(),
                                    Text(title,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: AppTextStyles.body.copyWith(
                                            fontSize: 14,
                                            height: 1.5,
                                            fontWeight: FontWeight.w500)),
                                    const SizedBox(height: 16),
                                    const Text('السعر عند الطلب',
                                        style: AppTextStyles.caption),
                                  ],
                                )),
                          ),
                        ));
                  },
                ));
          },
        ),
      );
}

IconData _serviceIcon(String title) {
  final value = title.toLowerCase();
  if (value.contains('ترجم') || value.contains('translat')) {
    return Icons.translate_rounded;
  }
  if (value.contains('تصديق') ||
      value.contains('توثيق') ||
      value.contains('certif')) {
    return Icons.verified_rounded;
  }
  if (value.contains('تأمين') ||
      value.contains('تامين') ||
      value.contains('insur')) {
    return Icons.health_and_safety_rounded;
  }
  if (value.contains('مطار') ||
      value.contains('استقبال') ||
      value.contains('airport')) {
    return Icons.directions_car_filled_rounded;
  }
  if (value.contains('شريحة') ||
      value.contains('اتصال') ||
      value.contains('sim')) {
    return Icons.sim_card_rounded;
  }
  if (value.contains('بنك') || value.contains('بنكي') || value.contains('bank')) {
    return Icons.account_balance_wallet_rounded;
  }
  if (value.contains('إقام') ||
      value.contains('اقام') ||
      value.contains('residen') ||
      value.contains('تأشير')) {
    return Icons.badge_rounded;
  }
  if (value.contains('سكن') || value.contains('housing')) {
    return Icons.apartment_rounded;
  }
  if (value.contains('جامع') ||
      value.contains('قبول') ||
      value.contains('دراس')) {
    return Icons.school_rounded;
  }
  return Icons.miscellaneous_services_rounded;
}

class ServiceDetailScreen extends StatefulWidget {
  final Map<String, dynamic> service;
  const ServiceDetailScreen({super.key, required this.service});

  @override
  State<ServiceDetailScreen> createState() => _ServiceDetailScreenState();
}

class _ServiceDetailScreenState extends State<ServiceDetailScreen> {
  bool _submitting = false;

  Future<void> _requestService() async {
    final confirmed = await showAppConfirmDialog(
      context,
      title: 'تأكيد طلب الخدمة',
      message:
          'سيتم إرسال طلبك لفريق الدعم للمتابعة معك، والدفع لاحقًا حسب توجيهاتهم. متابعة؟',
    );
    if (confirmed != true || !mounted) return;

    setState(() => _submitting = true);
    try {
      await StudentRepository.instance.createSupportTicket(
        subject: 'طلب خدمة: ${widget.service['name']}',
        message:
            'أرغب في طلب خدمة "${widget.service['name']}" (${widget.service['price']}). برجاء التواصل معي لمتابعة التفاصيل.',
        category: 'other',
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('تم إرسال طلبك، سيتواصل معك فريق الدعم قريبًا'),
          backgroundColor: AppColors.success));
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e is ApiException
              ? e.message
              : 'تعذر إرسال الطلب، حاول مرة أخرى')));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final service = widget.service;
    return AppScaffold(
      title: service['name'] as String? ?? 'الخدمة',
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppCard(
              child: Column(
                children: [
                  _Row(
                      label: 'السعر',
                      value: service['price'] as String? ?? '—'),
                  const Divider(height: 20),
                  Text(
                      service['detailBody']
                              ?.toString()
                              .replaceAll(RegExp(r'<[^>]*>'), '') ??
                          '',
                      style: AppTextStyles.body),
                ],
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'هذه الخدمة تُطلب عبر فريق الدعم — بعد الإرسال هيتواصل معاك فريق Study Birds لتفاصيل الدفع والمتابعة.',
              style: AppTextStyles.caption,
            ),
            const SizedBox(height: 20),
            PrimaryButton(
              label: _submitting ? 'جاري الإرسال...' : 'طلب الخدمة',
              onPressed: _submitting ? null : _requestService,
            ),
          ],
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  const _Row({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.caption),
        Flexible(
            child: Text(value,
                textAlign: TextAlign.end,
                style:
                    AppTextStyles.body.copyWith(fontWeight: FontWeight.w700))),
      ],
    );
  }
}

class ConsultationBookingScreen extends StatefulWidget {
  final VoidCallback? onConfirm;
  const ConsultationBookingScreen({super.key, this.onConfirm});

  @override
  State<ConsultationBookingScreen> createState() =>
      _ConsultationBookingScreenState();
}

class _ConsultationBookingScreenState extends State<ConsultationBookingScreen> {
  int _type = 1;
  static const _types = ['مكتب', 'أونلاين', 'هاتف'];
  DateTime? _date;
  TimeOfDay? _time;
  bool _submitting = false;
  String? _error;

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
        context: context,
        initialDate: DateTime.now(),
        firstDate: DateTime.now(),
        lastDate: DateTime.now().add(const Duration(days: 90)));
    if (picked != null) setState(() => _date = picked);
  }

  Future<void> _pickTime() async {
    final picked =
        await showTimePicker(context: context, initialTime: TimeOfDay.now());
    if (picked != null) setState(() => _time = picked);
  }

  Future<void> _confirm() async {
    if (widget.onConfirm != null) {
      widget.onConfirm!();
      return;
    }
    if (_date == null || _time == null) {
      setState(() => _error = 'اختر التاريخ والوقت أولًا');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    final dateLabel = '${_date!.year}-${_date!.month}-${_date!.day}';
    final timeLabel = _time!.format(context);
    try {
      await StudentRepository.instance.createSupportTicket(
        subject: 'طلب حجز استشارة (${_types[_type]})',
        message:
            'أرغب في حجز استشارة ${_types[_type]} بتاريخ $dateLabel الساعة $timeLabel.',
        category: 'other',
      );
      if (!mounted) return;
      Navigator.of(context).pop();
      showSuccessModal(context,
          title: 'تم إرسال طلب استشارتك',
          message: 'سيتواصل معك فريقنا لتأكيد الموعد.');
    } catch (e) {
      if (!mounted) return;
      setState(() => _error =
          e is ApiException ? e.message : 'تعذر إرسال الطلب، حاول مرة أخرى');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'حجز استشارة',
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('نوع الاستشارة', style: AppTextStyles.sectionLabel),
            const SizedBox(height: 10),
            Row(
              children: List.generate(_types.length, (i) {
                final selected = i == _type;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _type = i),
                    child: Container(
                      margin:
                          EdgeInsets.only(left: i == _types.length - 1 ? 0 : 8),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: selected ? AppColors.navy : Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.button),
                        border: Border.all(
                            color:
                                selected ? AppColors.navy : AppColors.border),
                      ),
                      child: Text(_types[i],
                          style: TextStyle(
                              color: selected
                                  ? Colors.white
                                  : AppColors.textPrimary,
                              fontWeight: FontWeight.w600)),
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 20),
            const Text('التاريخ والوقت', style: AppTextStyles.sectionLabel),
            const SizedBox(height: 10),
            AppCard(
              onTap: _pickDate,
              child: Row(
                children: [
                  const Icon(Icons.calendar_today_rounded,
                      color: AppColors.navy, size: 18),
                  const SizedBox(width: 10),
                  Text(
                      _date != null
                          ? '${_date!.year}-${_date!.month}-${_date!.day}'
                          : 'اختر التاريخ',
                      style: AppTextStyles.body),
                ],
              ),
            ),
            const SizedBox(height: 10),
            AppCard(
              onTap: _pickTime,
              child: Row(
                children: [
                  const Icon(Icons.access_time_rounded,
                      color: AppColors.navy, size: 18),
                  const SizedBox(width: 10),
                  Text(_time != null ? _time!.format(context) : 'اختر الوقت',
                      style: AppTextStyles.body),
                ],
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 10),
              Text(_error!,
                  style:
                      const TextStyle(color: AppColors.danger, fontSize: 12.5)),
            ],
            const Spacer(),
            PrimaryButton(
                label: _submitting ? 'جاري الإرسال...' : 'تأكيد الموعد',
                onPressed: _submitting ? null : _confirm),
          ],
        ),
      ),
    );
  }
}

class ConsultationConfirmationScreen extends StatelessWidget {
  const ConsultationConfirmationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'تأكيد الموعد',
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              width: 84,
              height: 84,
              decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.12),
                  shape: BoxShape.circle),
              child: const Icon(Icons.check_rounded,
                  color: AppColors.success, size: 42),
            ),
            const SizedBox(height: 16),
            const Text('تم تأكيد موعدك بنجاح', style: AppTextStyles.cardTitle),
            const SizedBox(height: 20),
            AppCard(
              child: Column(
                children: const [
                  _Row(label: 'التاريخ والوقت', value: '18 سبتمبر - 11:00 ص'),
                  Divider(height: 20),
                  _Row(label: 'نوع الاستشارة', value: 'أونلاين'),
                  Divider(height: 20),
                  _Row(label: 'المستشار', value: 'سارة أحمد'),
                  Divider(height: 20),
                  _Row(
                      label: 'رابط الاجتماع', value: 'meet.studybirds.com/xyz'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text('سيتم إرسال تذكير لك قبل الموعد.',
                style: AppTextStyles.caption),
          ],
        ),
      ),
    );
  }
}
