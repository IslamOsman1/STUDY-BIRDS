import 'package:flutter/material.dart';
import '../../core/api_client.dart';
import '../../core/auth_session.dart';
import '../../core/app_theme.dart';
import '../../core/feature_ui.dart';
import '../../core/analytics_service.dart';

class BirdAssistantScreen extends StatefulWidget {
  const BirdAssistantScreen({super.key});
  @override
  State<BirdAssistantScreen> createState() => _BirdAssistantScreenState();
}

class _BirdAssistantScreenState extends State<BirdAssistantScreen> {
  final input = TextEditingController();
  List<dynamic> threads = [], messages = [];
  String? threadId, error;
  bool busy = false, loading = true;
  String? get token => AuthSession.instance.token;
  @override
  void initState() {
    super.initState();
    AnalyticsService.instance.birdAiOpened();
    loadThreads();
  }

  @override
  void dispose() {
    input.dispose();
    super.dispose();
  }

  Future<void> loadThreads() async {
    try {
      final value = await ApiClient.instance
          .get('/assistant/threads', token: token) as List;
      if (mounted) setState(() => threads = value);
    } catch (e) {
      if (mounted) {
        setState(() =>
            error = e is ApiException ? e.message : 'تعذر تحميل المحادثات');
      }
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> open(String id) async {
    setState(() => loading = true);
    try {
      final data = await ApiClient.instance
          .get('/assistant/threads/$id', token: token) as Map;
      if (mounted) {
        setState(() {
          threadId = id;
          messages = data['messages'] as List;
          error = null;
        });
      }
    } catch (_) {
      if (mounted) setState(() => error = 'تعذر فتح المحادثة');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> send() async {
    final body = input.text.trim();
    if (body.isEmpty || busy || loading) return;
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final data = await ApiClient.instance.post('/assistant/message',
          token: token,
          body: {
            'message': body,
            if (threadId != null) 'threadId': threadId
          }) as Map;
      if (mounted) {
        setState(() {
          threadId = data['threadId'] as String;
          messages = data['messages'] as List;
          input.clear();
        });
        await loadThreads();
      }
    } catch (e) {
      if (mounted) {
        setState(() =>
            error = e is ApiException ? e.message : 'تعذر الاتصال بالمساعد');
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => AppScaffold(
      title: 'Bird AI',
      actions: [
        IconButton(
            tooltip: 'محادثة جديدة',
            onPressed: busy || loading
                ? null
                : () => setState(() {
                      threadId = null;
                      messages = [];
                      error = null;
                      input.clear();
                    }),
            icon: const Icon(Icons.add_comment_outlined))
      ],
      bottomBar: SafeArea(
          child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(children: [
                Expanded(
                    child: TextField(
                        controller: input,
                        enabled: !busy && !loading,
                        maxLength: 2000,
                        minLines: 1,
                        maxLines: 4,
                        decoration: featureInput('رسالتك'))),
                IconButton(
                    onPressed: busy || loading ? null : send,
                    icon: busy
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator())
                        : const Icon(Icons.send))
              ]))),
      body: loading
          ? const LoadingState()
          : ListView(padding: const EdgeInsets.all(16), children: [
              const InlineNotice(
                  'مساعد آلي للمعلومات العامة. رسائلك تُرسل لمزوّد الذكاء الاصطناعي وتُحفظ في حسابك. لا ترسل كلمات مرور أو مستندات هوية، وتحقق من المعلومات المهمة مع فريق الدعم.'),
              if (error != null) InlineNotice(error!, error: true),
              if (messages.isEmpty) ...[
                const SizedBox(height: 16),
                const Text('اسأل عن الدراسة أو التحضير لرحلتك',
                    style: AppTextStyles.sectionLabel),
                for (final thread in threads)
                  ListTile(
                      leading: const Icon(Icons.chat_bubble_outline),
                      title: Text('${thread['title']}',
                          maxLines: 1, overflow: TextOverflow.ellipsis),
                      onTap: busy ? null : () => open('${thread['_id']}'))
              ],
              for (final row in messages)
                AppCard(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text(row['role'] == 'user' ? 'أنت' : 'Bird AI',
                          style: AppTextStyles.caption),
                      const SizedBox(height: 8),
                      SelectableText('${row['content']}')
                    ])),
            ]));
}
