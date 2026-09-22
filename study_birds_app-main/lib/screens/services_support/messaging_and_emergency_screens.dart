import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/feature_ui.dart';
import '../../core/api_client.dart';
import '../../core/auth_session.dart';
import 'support_team_ai_screens.dart';

class ConversationThreadScreen extends StatefulWidget {
  final String contactName;
  const ConversationThreadScreen({super.key, this.contactName = 'الرسائل'});
  @override
  State<ConversationThreadScreen> createState() =>
      _ConversationThreadScreenState();
}

class _ConversationThreadScreenState extends State<ConversationThreadScreen> {
  List<dynamic> contacts = [], messages = [];
  Map? contact;
  Timer? poller;
  bool polling = false;
  bool loading = true, sending = false, older = false;
  String? error;
  final text = TextEditingController();
  String? get token => AuthSession.instance.token;
  @override
  void initState() {
    super.initState();
    load();
    poller = Timer.periodic(const Duration(seconds: 10), (_) => poll());
  }

  @override
  void dispose() {
    poller?.cancel();
    text.dispose();
    super.dispose();
  }

  Future<void> poll() async {
    final selected = contact;
    if (!mounted ||
        selected == null ||
        loading ||
        sending ||
        polling ||
        ModalRoute.of(context)?.isCurrent != true ||
        WidgetsBinding.instance.lifecycleState != AppLifecycleState.resumed)
      return;
    polling = true;
    try {
      final query =
          Uri(queryParameters: {'recipient': '${selected['_id']}'}).query;
      final value = await ApiClient.instance
          .get('/mobile-workspace/messages?$query', token: token) as List;
      if (!mounted || contact?['_id'] != selected['_id']) return;
      final merged = {
        for (final row in messages) '${row['_id']}': row,
        for (final row in value) '${row['_id']}': row
      };
      final sorted = merged.values.toList()
        ..sort((a, b) => '${a['_id']}'.compareTo('${b['_id']}'));
      setState(() => messages = sorted);
      await ApiClient.instance.post('/mobile-workspace/messages/read',
          token: token, body: {'sender': selected['_id']});
    } catch (_) {
      /* Keep the conversation and unsent draft visible during a transient failure. */
    } finally {
      polling = false;
    }
  }

  Future<void> load({bool previous = false}) async {
    final selected = contact;
    setState(() {
      loading = true;
      error = null;
    });
    try {
      if (selected == null) {
        final value = await ApiClient.instance
            .get('/mobile-workspace/contacts', token: token);
        if (mounted) setState(() => contacts = value as List);
      } else {
        final query = Uri(queryParameters: {
          'recipient': '${selected['_id']}',
          if (previous && messages.isNotEmpty)
            'before': '${messages.first['_id']}'
        }).query;
        final value = await ApiClient.instance
            .get('/mobile-workspace/messages?$query', token: token) as List;
        if (!mounted) return;
        setState(() {
          messages = previous ? [...value, ...messages] : value;
          older = value.length == 50;
        });
        await ApiClient.instance.post('/mobile-workspace/messages/read',
            token: token, body: {'sender': selected['_id']});
      }
    } catch (e) {
      if (mounted)
        setState(() => error = e is ApiException && e.statusCode == 404
            ? 'المحادثات لم تُفعّل على السيرفر بعد. يمكنك استخدام تذاكر الدعم.'
            : 'تعذر تحميل الرسائل. حاول مجددًا.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> send() async {
    final body = text.text.trim();
    if (body.isEmpty || contact == null || sending) return;
    setState(() => sending = true);
    try {
      final value = await ApiClient.instance.post('/mobile-workspace/messages',
          token: token, body: {'recipient': contact!['_id'], 'body': body});
      if (!mounted) return;
      setState(() {
        messages = [...messages, value];
        text.clear();
      });
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(e is ApiException
                ? e.message
                : 'تعذر الإرسال؛ رسالتك محفوظة في الحقل')));
    } finally {
      if (mounted) setState(() => sending = false);
    }
  }

  @override
  Widget build(BuildContext context) => AppScaffold(
      title: contact?['name']?.toString() ?? 'الرسائل',
      actions: [
        if (contact != null)
          IconButton(
              tooltip: 'جهات الاتصال',
              onPressed: loading || sending
                  ? null
                  : () {
                      setState(() {
                        contact = null;
                        messages = [];
                        text.clear();
                      });
                      load();
                    },
              icon: const Icon(Icons.people_outline)),
        IconButton(
            tooltip: 'تحديث',
            onPressed: loading || sending ? null : load,
            icon: const Icon(Icons.refresh)),
      ],
      bottomBar: contact == null || error != null
          ? null
          : SafeArea(
              top: false,
              child: Container(
                  color: Colors.white,
                  padding: const EdgeInsets.all(12),
                  child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                            child: TextField(
                                controller: text,
                                enabled: !sending,
                                maxLength: 4000,
                                minLines: 1,
                                maxLines: 4,
                                decoration: featureInput('رسالتك')
                                    .copyWith(counterText: ''))),
                        const SizedBox(width: 8),
                        IconButton.filled(
                            tooltip: 'إرسال',
                            onPressed: sending ? null : send,
                            icon: sending
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2))
                                : const Icon(Icons.send_rounded)),
                      ]))),
      body: loading
          ? const LoadingState()
          : error != null
              ? FeatureBody(children: [
                  InlineNotice(error!, error: true),
                  PrimaryButton(label: 'إعادة المحاولة', onPressed: load),
                  const SizedBox(height: 16),
                  TextButton(
                      onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const NewSupportTicketScreen())),
                      child: const Text('إرسال تذكرة دعم')),
                ])
              : contact == null
                  ? FeatureBody(children: [
                      const FeatureIntro(
                          title: 'تواصل مع فريقك',
                          subtitle: 'جهات الاتصال المتاحة حسب حسابك وطلباتك.',
                          icon: Icons.forum_outlined),
                      if (contacts.isEmpty)
                        const InlineNotice('لا توجد جهات اتصال متاحة حاليًا.'),
                      for (final row in contacts)
                        FeaturePanel(
                            child: ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: const CircleAvatar(
                                    child: Icon(Icons.person_outline)),
                                title: Text('${row['name']}',
                                    style: AppTextStyles.cardTitle),
                                trailing: const Icon(Icons.chevron_left),
                                onTap: () {
                                  setState(() => contact = row as Map);
                                  load();
                                })),
                    ])
                  : ListView(
                      reverse: true,
                      padding: const EdgeInsets.all(16),
                      children: [
                          for (final row in messages.reversed)
                            Align(
                                alignment: '${row['sender']}' ==
                                        AuthSession.instance.currentUser?.id
                                    ? Alignment.centerLeft
                                    : Alignment.centerRight,
                                child: Container(
                                  constraints: BoxConstraints(
                                      maxWidth:
                                          MediaQuery.sizeOf(context).width *
                                              .8),
                                  margin: const EdgeInsets.only(bottom: 12),
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                      color: '${row['sender']}' ==
                                              AuthSession
                                                  .instance.currentUser?.id
                                          ? AppColors.navy
                                          : Colors.white,
                                      borderRadius: BorderRadius.circular(16)),
                                  child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text('${row['body']}',
                                            style: TextStyle(
                                                color: '${row['sender']}' ==
                                                        AuthSession.instance
                                                            .currentUser?.id
                                                    ? Colors.white
                                                    : AppColors.textPrimary,
                                                height: 1.5)),
                                        const SizedBox(height: 5),
                                        Text(
                                            '${row['createdAt'] ?? ''}'
                                                .replaceFirst('T', ' ')
                                                .split('.')
                                                .first,
                                            style: TextStyle(
                                                fontSize: 10,
                                                color: '${row['sender']}' ==
                                                        AuthSession.instance
                                                            .currentUser?.id
                                                    ? Colors.white70
                                                    : AppColors.textSecondary)),
                                        if ('${row['sender']}' ==
                                            AuthSession
                                                .instance.currentUser?.id)
                                          Text(
                                              row['readAt'] != null
                                                  ? 'مقروءة'
                                                  : 'تم الإرسال',
                                              style: const TextStyle(
                                                  fontSize: 10,
                                                  color: Colors.white70))
                                      ]),
                                )),
                          if (older)
                            TextButton(
                                onPressed: () => load(previous: true),
                                child: const Text('رسائل أقدم')),
                          if (messages.isEmpty)
                            const Padding(
                                padding: EdgeInsets.all(24),
                                child: Text('ابدأ المحادثة بإرسال رسالة.',
                                    textAlign: TextAlign.center)),
                        ]));
}

class EmergencySupportScreen extends StatelessWidget {
  const EmergencySupportScreen({super.key});
  @override
  Widget build(BuildContext context) => const ConversationThreadScreen();
}
