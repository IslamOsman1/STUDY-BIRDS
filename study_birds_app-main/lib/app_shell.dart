import 'package:flutter/material.dart';
import 'core/app_theme.dart';
import 'screens/home_journey/home_dashboard_screen.dart';
import 'screens/home_journey/journey_tracker_screen.dart';
import 'screens/universities_programs_countries/explore_hub_screen.dart';
import 'screens/services_support/services_consultation_screens.dart';
import 'screens/profile_account/profile_account_screens.dart';

/// The connected student experience: one shared bottom nav, real navigation
/// between screens (tap a card → see the actual next screen), instead of
/// the flat screens-gallery list. This is what a client demo should run.
class StudentAppShell extends StatefulWidget {
  const StudentAppShell({super.key});

  @override
  State<StudentAppShell> createState() => _StudentAppShellState();
}

class _StudentAppShellState extends State<StudentAppShell> {
  int _index = 0;

  static const _navItems = [
    _NavItemData(icon: Icons.home_rounded, label: 'الرئيسية'),
    _NavItemData(icon: Icons.timeline_rounded, label: 'الرحلة'),
    _NavItemData(icon: Icons.explore_outlined, label: 'استكشاف'),
    _NavItemData(icon: Icons.miscellaneous_services_outlined, label: 'الخدمات'),
    _NavItemData(icon: Icons.person_outline_rounded, label: 'حسابي'),
  ];

  @override
  Widget build(BuildContext context) {
    final tabs = [
      const HomeDashboardScreen(embedInShell: true),
      const JourneyTrackerScreen(),
      const ExploreHubScreen(),
      const ServicesCenterScreen(),
      const ProfileScreen(),
    ];

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        body: IndexedStack(index: _index, children: tabs),
        bottomNavigationBar: _AnimatedBottomNav(
          currentIndex: _index,
          items: _navItems,
          onTap: (i) => setState(() => _index = i),
        ),
      ),
    );
  }
}

class _NavItemData {
  final IconData icon;
  final String label;
  const _NavItemData({required this.icon, required this.label});
}

/// Custom bottom navigation bar: selected tab's icon scales up smoothly
/// (AnimatedScale) and a slim indicator bar slides beneath the active tab
/// (AnimatedAlign) instead of the flat default BottomNavigationBar.
class _AnimatedBottomNav extends StatelessWidget {
  final int currentIndex;
  final List<_NavItemData> items;
  final ValueChanged<int> onTap;

  const _AnimatedBottomNav(
      {required this.currentIndex, required this.items, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 12,
                offset: const Offset(0, -2))
          ],
        ),
        child: SizedBox(
          height: 64,
          child: Stack(
            children: [
              // Sliding active indicator — a slim bar under the selected tab.
              AnimatedAlign(
                duration: const Duration(milliseconds: 260),
                curve: Curves.easeOutCubic,
                alignment:
                    Alignment(1 - (2 * currentIndex) / (items.length - 1), -1),
                child: FractionallySizedBox(
                  widthFactor: 1 / items.length,
                  child: Align(
                    alignment: Alignment.topCenter,
                    child: Container(
                      margin: const EdgeInsets.only(top: 0),
                      height: 3,
                      width: 32,
                      decoration: BoxDecoration(
                          color: AppColors.orange,
                          borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                ),
              ),
              Row(
                children: List.generate(items.length, (i) {
                  final selected = i == currentIndex;
                  final item = items[i];
                  return Expanded(
                    child: InkWell(
                      onTap: () => onTap(i),
                      child: Padding(
                        padding: const EdgeInsets.only(top: 10),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            AnimatedScale(
                              scale: selected ? 1.15 : 1.0,
                              duration: const Duration(milliseconds: 220),
                              curve: Curves.easeOut,
                              child: Icon(item.icon,
                                  color: selected
                                      ? AppColors.navy
                                      : AppColors.textSecondary,
                                  size: 24),
                            ),
                            const SizedBox(height: 4),
                            AnimatedDefaultTextStyle(
                              duration: const Duration(milliseconds: 220),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: selected
                                    ? FontWeight.w700
                                    : FontWeight.w400,
                                color: selected
                                    ? AppColors.navy
                                    : AppColors.textSecondary,
                              ),
                              child: Text(item.label),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
