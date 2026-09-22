import 'arrival_services_screen.dart';
import 'package:flutter/material.dart';
import '../../core/app_theme.dart';

class VisaCenterScreen extends StatelessWidget {
  const VisaCenterScreen({super.key});

  static const List<Map<String, dynamic>> _requirements = [
    {'name': 'جواز السفر', 'done': true},
    {'name': 'خطاب القبول', 'done': true},
    {'name': 'إثبات القدرة المالية', 'done': false},
    {'name': 'التأمين الصحي', 'done': false},
  ];

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'مركز التأشيرة',
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Align(
              alignment: Alignment.centerRight,
              child:
                  StatusBadge(label: 'قيد التحضير', color: AppColors.warning)),
          const SizedBox(height: 16),
          const Text('المستندات المطلوبة', style: AppTextStyles.sectionLabel),
          const SizedBox(height: 10),
          AppCard(
            child: Column(
              children: _requirements
                  .map((r) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Row(
                          children: [
                            Icon(
                              r['done'] as bool
                                  ? Icons.check_circle_rounded
                                  : Icons.radio_button_unchecked_rounded,
                              size: 20,
                              color: r['done'] as bool
                                  ? AppColors.success
                                  : AppColors.textSecondary,
                            ),
                            const SizedBox(width: 10),
                            Text(r['name'] as String,
                                style: AppTextStyles.body),
                          ],
                        ),
                      ))
                  .toList(),
            ),
          ),
          const SizedBox(height: 16),
          const Text('الموعد', style: AppTextStyles.sectionLabel),
          const SizedBox(height: 10),
          AppCard(
            child: Row(
              children: const [
                Icon(Icons.event_rounded, color: AppColors.navy),
                SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('19 سبتمبر 2026 - 10:00 ص',
                          style: AppTextStyles.cardTitle),
                      Text('القنصلية التركية - إسطنبول',
                          style: AppTextStyles.caption),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class VisaStepsScreen extends StatelessWidget {
  const VisaStepsScreen({super.key});

  static const List<String> _stages = [
    'لم يبدأ',
    'التحضير',
    'إعداد المستندات',
    'تم التقديم',
    'قيد المراجعة',
    'تمت الموافقة'
  ];
  static const int _current = 3;

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'مراحل التأشيرة',
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _stages.length,
        itemBuilder: (context, i) {
          final done = i < _current;
          final active = i == _current;
          final isLast = i == _stages.length - 1;
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
                                : (active
                                    ? AppColors.orange
                                    : AppColors.border),
                            width: 2),
                      ),
                      child: done
                          ? const Icon(Icons.check_rounded,
                              size: 15, color: Colors.white)
                          : (active
                              ? const Icon(Icons.circle,
                                  size: 8, color: Colors.white)
                              : null),
                    ),
                    if (!isLast)
                      Expanded(
                          child: Container(
                              width: 2,
                              color:
                                  done ? AppColors.success : AppColors.border)),
                  ],
                ),
                const SizedBox(width: 14),
                Padding(
                  padding: const EdgeInsets.only(bottom: 28, top: 4),
                  child: Text(
                    _stages[i],
                    style: active
                        ? AppTextStyles.cardTitle
                            .copyWith(color: AppColors.orange)
                        : AppTextStyles.body,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class TravelCenterScreen extends StatelessWidget {
  const TravelCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'مركز السفر',
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppCard(
              child: Row(
                children: const [
                  Icon(Icons.calendar_today_rounded, color: AppColors.navy),
                  SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('تاريخ السفر', style: AppTextStyles.caption),
                      Text('10 أكتوبر 2026', style: AppTextStyles.cardTitle),
                    ],
                  ),
                ],
              ),
            ),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('معلومات الرحلة', style: AppTextStyles.sectionLabel),
                  SizedBox(height: 10),
                  _KV(label: 'شركة الطيران', value: 'Turkish Airlines'),
                  SizedBox(height: 6),
                  _KV(label: 'رقم الرحلة', value: 'TK123'),
                  SizedBox(height: 6),
                  _KV(label: 'مطار الوصول', value: 'مطار إسطنبول (IST)'),
                ],
              ),
            ),
            const SizedBox(height: 8),
            PrimaryButton(
                label: 'طلب استقبال من المطار',
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => const ArrivalServicesScreen())),
                icon: Icons.local_taxi_rounded),
          ],
        ),
      ),
    );
  }
}

class _KV extends StatelessWidget {
  final String label;
  final String value;
  const _KV({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.caption),
        Text(value,
            style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700)),
      ],
    );
  }
}

class AirportPickupScreen extends StatelessWidget {
  final bool assigned;
  const AirportPickupScreen({super.key, this.assigned = true});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'استقبال المطار',
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppCard(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('الحالة', style: AppTextStyles.caption),
                      StatusBadge(
                          label: 'تم تعيين السائق', color: AppColors.success),
                    ],
                  ),
                  const Divider(height: 20),
                  const _KV(
                      label: 'موعد الاستلام', value: '10 أكتوبر - 3:00 م'),
                  const SizedBox(height: 6),
                  const _KV(label: 'رقم الرحلة', value: 'TK123'),
                ],
              ),
            ),
            if (assigned) ...[
              const SizedBox(height: 4),
              const Text('السائق', style: AppTextStyles.sectionLabel),
              const SizedBox(height: 10),
              AppCard(
                child: Row(
                  children: const [
                    CircleAvatar(
                        radius: 22,
                        backgroundColor: AppColors.border,
                        child:
                            Icon(Icons.person_rounded, color: AppColors.navy)),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('محمد يلماز', style: AppTextStyles.cardTitle),
                          Text('سيارة بيضاء - رقم 34 ABC 123',
                              style: AppTextStyles.caption),
                        ],
                      ),
                    ),
                    Icon(Icons.phone_rounded, color: AppColors.orange),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
