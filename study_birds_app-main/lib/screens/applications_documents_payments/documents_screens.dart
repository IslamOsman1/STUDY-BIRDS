import 'package:url_launcher/url_launcher.dart';
import '../../core/document_access.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/app_theme.dart';
import '../../core/status_info.dart';
import '../../core/student_repository.dart';

/// Maps the backend's document status (legacy 3-value `status`, or the
/// richer 8-value `detailedStatus` when present) to Arabic label + color.
class DocStatusMeta {
  final String label;
  final Color color;
  const DocStatusMeta(this.label, this.color);
}

DocStatusMeta docStatusMeta(Map<String, dynamic> doc) {
  final info = StatusInfo.of(doc);
  if (info != null) return DocStatusMeta(info.label, info.color);
  final detailed = doc['detailedStatus'] as String?;
  switch (detailed ?? doc['status'] as String? ?? 'pending') {
    case 'missing':
      return const DocStatusMeta('مفقود', AppColors.neutral);
    case 'uploaded':
    case 'pending':
      return const DocStatusMeta('قيد المراجعة', AppColors.info);
    case 'under-review':
      return const DocStatusMeta('قيد المراجعة', AppColors.info);
    case 'approved':
    case 'verified':
      return const DocStatusMeta('تمت الموافقة', AppColors.success);
    case 'rejected':
      return const DocStatusMeta('مرفوض', AppColors.danger);
    case 'needs-revision':
      return const DocStatusMeta('يحتاج تعديل', AppColors.warning);
    case 'needs-translation':
      return const DocStatusMeta('مطلوب ترجمة', AppColors.warning);
    case 'expired':
      return const DocStatusMeta('منتهي الصلاحية', AppColors.warning);
    default:
      return const DocStatusMeta('قيد المراجعة', AppColors.info);
  }
}

/// Document type options the backend recognizes for application eligibility
/// (see applicationController.js requiredDocumentTypes) plus a few common
/// extras. Free text on the backend, but a fixed list keeps the app tidy.
const List<Map<String, String>> kDocumentTypes = [
  {'key': 'passport', 'label': 'جواز السفر'},
  {'key': 'biometric-photo', 'label': 'صورة شخصية'},
  {'key': 'latest-qualification', 'label': 'آخر مؤهل دراسي'},
  {'key': 'transcript', 'label': 'كشف الدرجات'},
  {'key': 'language-certificate', 'label': 'شهادة اللغة'},
  {'key': 'other', 'label': 'أخرى'},
];

String docTypeLabel(String? key) {
  return kDocumentTypes.firstWhere((t) => t['key'] == key,
      orElse: () => {'label': key ?? 'مستند'})['label']!;
}

/// Picks a file and uploads it as the given document type. Shared by
/// MyDocumentsScreen and DocumentDetailScreen (a pushed route is NOT a
/// widget-tree ancestor of the screen that opened it, so this can't be a
/// method looked up via findAncestorStateOfType — it's a standalone helper).
Future<bool> pickAndUploadDocument(BuildContext context, String type) async {
  final result = await FilePicker.platform.pickFiles(
    type: FileType.custom,
    allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
    withData: true,
  );
  if (result == null || result.files.isEmpty) return false;

  final file = result.files.single;
  if (file.bytes == null) {
    if (context.mounted)
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تعذر قراءة الملف المختار')));
    return false;
  }

  try {
    await StudentRepository.instance.uploadDocument(
        fileBytes: file.bytes!, fileName: file.name, type: type);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('تم رفع المستند بنجاح'),
          backgroundColor: AppColors.success));
    }
    return true;
  } catch (_) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('تعذر رفع المستند، حاول مرة أخرى'),
          backgroundColor: AppColors.danger));
    }
    return false;
  }
}

class MyDocumentsScreen extends StatefulWidget {
  const MyDocumentsScreen({super.key});

  @override
  State<MyDocumentsScreen> createState() => _MyDocumentsScreenState();
}

class _MyDocumentsScreenState extends State<MyDocumentsScreen> {
  List<dynamic> _docs = [];
  bool _loading = true;
  String? _error;
  bool _uploading = false;

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
      final docs = await StudentRepository.instance.getDocuments();
      if (!mounted) return;
      setState(() {
        _docs = docs;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'تعذر تحميل مستنداتك.';
        _loading = false;
      });
    }
  }

  Future<void> _pickTypeAndUpload() async {
    final selectedType = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Padding(
                padding: EdgeInsets.all(16),
                child:
                    Text('اختر نوع المستند', style: AppTextStyles.cardTitle)),
            ...kDocumentTypes.map(
              (t) => ListTile(
                title: Text(t['label']!, textAlign: TextAlign.right),
                onTap: () => Navigator.of(context).pop(t['key']),
              ),
            ),
          ],
        ),
      ),
    );
    if (selectedType == null || !mounted) return;

    setState(() => _uploading = true);
    final success = await pickAndUploadDocument(context, selectedType);
    if (!mounted) return;
    setState(() => _uploading = false);
    if (success) await _load();
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'مستنداتي',
      actions: [
        IconButton(
          onPressed: _uploading ? null : _pickTypeAndUpload,
          icon: _uploading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Colors.white))
              : const Icon(Icons.add_circle_outline_rounded,
                  color: Colors.white),
        ),
      ],
      body: _loading
          ? const LoadingState(message: 'جاري تحميل مستنداتك...')
          : _error != null
              ? ErrorState(message: _error!, onRetry: _load)
              : _docs.isEmpty
                  ? EmptyState(
                      icon: Icons.folder_open_outlined,
                      title: 'لا توجد مستندات بعد',
                      message: 'ابدأ برفع أول مستند من زر الإضافة أعلى الشاشة.',
                      ctaLabel: 'رفع مستند',
                      onCta: _pickTypeAndUpload,
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _docs.length,
                      itemBuilder: (context, i) {
                        final d = _docs[i] as Map<String, dynamic>;
                        final meta = docStatusMeta(d);
                        final info = StatusInfo.of(d);
                        // Surface what to fix without opening the document.
                        final needsAction = info != null &&
                            (info.tone == 'action' || info.tone == 'danger');
                        return AppCard(
                          onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                  builder: (_) =>
                                      DocumentDetailScreen(document: d))),
                          child: Row(
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                    color: AppColors.navy.withOpacity(0.08),
                                    borderRadius: BorderRadius.circular(10)),
                                child: const Icon(
                                    Icons.insert_drive_file_outlined,
                                    color: AppColors.navy,
                                    size: 19),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                  child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(docTypeLabel(d['type'] as String?),
                                      style: AppTextStyles.cardTitle),
                                  if (needsAction)
                                    Text(info.meaning,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: AppTextStyles.caption
                                            .copyWith(color: meta.color)),
                                ],
                              )),
                              const SizedBox(width: 8),
                              StatusBadge(label: meta.label, color: meta.color),
                            ],
                          ),
                        );
                      },
                    ),
    );
  }
}

class DocumentDetailScreen extends StatelessWidget {
  final Map<String, dynamic> document;
  const DocumentDetailScreen({super.key, required this.document});

  @override
  Widget build(BuildContext context) {
    final meta = docStatusMeta(document);
    final info = StatusInfo.of(document);
    final reviewNote = document['reviewNote'] as String?;
    final createdAt = document['createdAt'] as String?;
    final expiresAt = DateTime.tryParse('${document['expiresAt']}')?.toLocal();

    return AppScaffold(
      title: docTypeLabel(document['type'] as String?),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 180,
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.navy.withOpacity(0.05),
                borderRadius: BorderRadius.circular(AppRadius.card),
                border: Border.all(color: AppColors.border),
              ),
              child: const Center(
                  child: Icon(Icons.description_outlined,
                      size: 48, color: AppColors.textSecondary)),
            ),
            const SizedBox(height: 16),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('اسم الملف', style: AppTextStyles.caption),
                      Flexible(
                          child: Text(document['fileName'] as String? ?? '—',
                              style: AppTextStyles.body,
                              overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('تاريخ الرفع', style: AppTextStyles.caption),
                      Text(createdAt != null ? createdAt.split('T').first : '—',
                          style: AppTextStyles.body),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('الحالة', style: AppTextStyles.caption),
                      StatusBadge(label: meta.label, color: meta.color),
                    ],
                  ),
                  if (expiresAt != null) ...[
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('صالح حتى', style: AppTextStyles.caption),
                        Text(
                            MaterialLocalizations.of(context)
                                .formatMediumDate(expiresAt),
                            style: AppTextStyles.body),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            // The server's explanation already includes the reviewer's reason.
            if (info != null) ...[
              const SizedBox(height: 12),
              StatusExplanationCard(info: info),
            ] else if (reviewNote != null && reviewNote.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.danger.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(AppRadius.card),
                  border: Border.all(color: AppColors.danger.withOpacity(0.3)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline_rounded,
                        color: AppColors.danger, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                        child: Text(reviewNote,
                            style: const TextStyle(
                                color: AppColors.danger,
                                fontSize: 13,
                                fontWeight: FontWeight.w600))),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 20),
            if (document['filePath'] is String)
              OutlinedButton.icon(
                  icon: const Icon(Icons.download_rounded),
                  label: const Text('فتح المستند'),
                  onPressed: () async {
                    try {
                      final uri = await resolveDocumentDownload(
                          document['filePath'] as String);
                      if (!await launchUrl(uri,
                          mode: LaunchMode.externalApplication))
                        throw Exception('Cannot open file');
                    } catch (_) {
                      if (context.mounted)
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                            content: Text(
                                'تعذر فتح الملف. تحقق من الجلسة والصلاحيات ثم حاول مجددًا.')));
                    }
                  }),
            PrimaryButton(
              label: 'رفع نسخة جديدة',
              icon: Icons.upload_file_rounded,
              onPressed: () async {
                final success = await pickAndUploadDocument(
                    context, document['type'] as String? ?? 'other');
                if (success && context.mounted) Navigator.of(context).pop();
              },
            ),
          ],
        ),
      ),
    );
  }
}
