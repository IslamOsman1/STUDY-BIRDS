import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/student_repository.dart';

IconData _resourceIcon(String? type) {
  switch (type) {
    case 'pdf':
      return Icons.picture_as_pdf_outlined;
    case 'video':
      return Icons.play_circle_outline_rounded;
    case 'link':
      return Icons.link_rounded;
    case 'article':
    default:
      return Icons.article_outlined;
  }
}

class KnowledgeBaseScreen extends StatefulWidget {
  const KnowledgeBaseScreen({super.key});

  @override
  State<KnowledgeBaseScreen> createState() => _KnowledgeBaseScreenState();
}

class _KnowledgeBaseScreenState extends State<KnowledgeBaseScreen> {
  List<dynamic> _items = [];
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
      final data = await StudentRepository.instance.getKnowledgeBase();
      if (!mounted) return;
      setState(() {
        _items = data;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذر تحميل مركز المعرفة.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'مركز المعرفة',
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.navy,
        child: _loading
            ? const LoadingState(message: 'جاري التحميل...')
            : _error != null
                ? ErrorState(message: _error!, onRetry: _load)
                : _items.isEmpty
                    ? const EmptyState(
                        icon: Icons.menu_book_outlined,
                        title: 'لا يوجد محتوى بعد',
                        message: 'سيتم إضافة مقالات ومصادر مفيدة قريبًا.')
                    : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _items.length,
                      itemBuilder: (context, i) {
                        final item = _items[i] as Map<String, dynamic>;
                        return AppCard(
                          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => KnowledgeBaseArticleScreen(item: item))),
                          child: Row(
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(color: AppColors.navy.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(10)),
                                child: Icon(_resourceIcon(item['resourceType'] as String?), color: AppColors.navy, size: 19),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item['title'] as String? ?? '—', style: AppTextStyles.cardTitle),
                                    if ((item['summary'] as String?)?.isNotEmpty == true)
                                      Text(item['summary'] as String, style: AppTextStyles.caption, maxLines: 1, overflow: TextOverflow.ellipsis),
                                  ],
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

class KnowledgeBaseArticleScreen extends StatelessWidget {
  final Map<String, dynamic> item;
  const KnowledgeBaseArticleScreen({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: item['title'] as String? ?? 'مقال',
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Text(item['body'] as String? ?? '', style: AppTextStyles.body),
      ),
    );
  }
}
