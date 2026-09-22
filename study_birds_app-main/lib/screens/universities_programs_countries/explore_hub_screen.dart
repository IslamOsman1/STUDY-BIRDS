import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import 'universities_screens.dart';
import 'programs_screens.dart';
import 'countries_scholarships_screens.dart';
import 'compare_list_screen.dart';

class ExploreHubScreen extends StatelessWidget {
  const ExploreHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'استكشاف',
      showBackButton: false,
      body: GridView(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.15),
        children: [
          _ExploreCard(
              label: 'الجامعات',
              icon: Icons.account_balance_rounded,
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => const UniversitiesExplorerScreen()))),
          _ExploreCard(
              label: 'البرامج',
              icon: Icons.menu_book_rounded,
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => const ProgramsExplorerScreen()))),
          _ExploreCard(
              label: 'الدول',
              icon: Icons.public_rounded,
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => const CountriesExplorerScreen()))),
          _ExploreCard(
              label: 'المنح الدراسية',
              icon: Icons.card_giftcard_rounded,
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => const ScholarshipsScreen()))),
          _ExploreCard(
              label: 'مكتشف البرنامج',
              icon: Icons.quiz_outlined,
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => const ProgramFinderScreen()))),
          _ExploreCard(
              label: 'قائمة المقارنة',
              icon: Icons.compare_arrows_rounded,
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => const CompareListScreen()))),
        ],
      ),
    );
  }
}

class _ExploreCard extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  const _ExploreCard(
      {required this.label, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(AppRadius.card),
            border: Border.all(color: AppColors.border)),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AppIconTile(icon),
            const SizedBox(height: 10),
            Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Text(label,
                    textAlign: TextAlign.center,
                    style: AppTextStyles.cardTitle)),
          ],
        ),
      ),
    );
  }
}
