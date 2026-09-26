import 'package:shared_preferences/shared_preferences.dart';
import 'api_client.dart';
import 'auth_session.dart';

/// Favorites — local-first with API sync.
/// All writes hit the local cache immediately (optimistic) and attempt a
/// server sync in the background. Reads prefer the server when online but
/// fall back gracefully to the local cache so the feature works offline.
class FavoritesService {
  FavoritesService._();
  static final instance = FavoritesService._();

  static const _keyUniversities = 'favs_universities';
  static const _keyPrograms = 'favs_programs';

  String? get _token => AuthSession.instance.token;

  // ── Local cache helpers ───────────────────────────────────────────────────

  Future<Set<String>> _localLoad(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(key)?.toSet() ?? {};
  }

  Future<void> _localSave(String key, Set<String> ids) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(key, ids.toList());
  }

  void _cacheFromServer(Map<String, dynamic> favs) {
    final unis = (favs['universities'] as List?)?.map((e) => '$e').toSet() ?? <String>{};
    final progs = (favs['programs'] as List?)?.map((e) => '$e').toSet() ?? <String>{};
    _localSave(_keyUniversities, unis);
    _localSave(_keyPrograms, progs);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  Future<bool> isFavorite(String id, {required bool university}) async {
    final set = await _localLoad(university ? _keyUniversities : _keyPrograms);
    return set.contains(id);
  }

  /// Toggles favorite. Returns true if item is now a favorite, false if removed.
  Future<bool> toggle(String id, {required bool university}) async {
    final key = university ? _keyUniversities : _keyPrograms;
    final set = await _localLoad(key);
    final wasIn = set.contains(id);

    // Optimistic local update
    if (wasIn) { set.remove(id); } else { set.add(id); }
    await _localSave(key, set);

    // Background sync with server
    final token = _token;
    if (token != null) {
      try {
        final res = await ApiClient.instance.post(
          '/students/favorites/toggle',
          token: token,
          body: {'type': university ? 'university' : 'program', 'id': id},
        ) as Map<String, dynamic>;
        if (res['favorites'] != null) _cacheFromServer(res['favorites'] as Map<String, dynamic>);
        return res['added'] == true;
      } catch (_) {
        // Server not ready yet — local state is already updated
      }
    }
    return !wasIn;
  }

  Future<Set<String>> getAllUniversityIds() => _getAllIds(university: true);
  Future<Set<String>> getAllProgramIds() => _getAllIds(university: false);

  Future<Set<String>> _getAllIds({required bool university}) async {
    final token = _token;
    if (token != null) {
      try {
        final res = await ApiClient.instance.get('/students/favorites', token: token)
            as Map<String, dynamic>;
        _cacheFromServer(res);
        final key = university ? 'universities' : 'programs';
        return (res[key] as List?)?.map((e) => '$e').toSet() ?? {};
      } catch (_) {
        // Fall through to local cache
      }
    }
    return _localLoad(university ? _keyUniversities : _keyPrograms);
  }

  Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyUniversities);
    await prefs.remove(_keyPrograms);
  }
}
