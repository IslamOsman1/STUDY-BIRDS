import 'arrival_services_screen.dart';
import '../services_support/support_team_ai_screens.dart';
import 'package:flutter/material.dart';
import '../../core/app_theme.dart';

class AccommodationScreen extends StatelessWidget {
  const AccommodationScreen({super.key});
  @override
  Widget build(BuildContext context) => const ArrivalServicesScreen();
}

class UniversityRegistrationScreen extends StatelessWidget {
  const UniversityRegistrationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'تسجيل الجامعة',
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Align(
                alignment: Alignment.centerRight,
                child: StatusBadge(
                    label: 'بانتظار الموعد', color: AppColors.warning)),
            const SizedBox(height: 16),
            const Text('المستندات المطلوبة', style: AppTextStyles.sectionLabel),
            const SizedBox(height: 10),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('• جواز السفر الأصلي', style: AppTextStyles.body),
                  SizedBox(height: 6),
                  Text('• خطاب القبول النهائي', style: AppTextStyles.body),
                  SizedBox(height: 6),
                  Text('• إيصال دفع الرسوم', style: AppTextStyles.body),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text('الموعد', style: AppTextStyles.sectionLabel),
            const SizedBox(height: 10),
            AppCard(
              child: Row(
                children: const [
                  Icon(Icons.school_rounded, color: AppColors.navy),
                  SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('13 أكتوبر 2026', style: AppTextStyles.cardTitle),
                      Text('الحرم الجامعي الرئيسي',
                          style: AppTextStyles.caption),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
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
