import 'package:shared_preferences/shared_preferences.dart';

class FavoritesService {
  FavoritesService._();
  static final instance = FavoritesService._();

  static const _keyUniversities = 'favs_universities';
  static const _keyPrograms = 'favs_programs';

  Future<Set<String>> _load(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(key)?.toSet() ?? {};
  }

  Future<void> _save(String key, Set<String> ids) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(key, ids.toList());
  }

  Future<bool> isFavorite(String id, {required bool university}) async {
    final set = await _load(university ? _keyUniversities : _keyPrograms);
    return set.contains(id);
  }

  Future<bool> toggle(String id, {required bool university}) async {
    final key = university ? _keyUniversities : _keyPrograms;
    final set = await _load(key);
    if (set.contains(id)) {
      set.remove(id);
      await _save(key, set);
      return false;
    } else {
      set.add(id);
      await _save(key, set);
      return true;
    }
  }

  Future<Set<String>> getAllUniversityIds() => _load(_keyUniversities);
  Future<Set<String>> getAllProgramIds() => _load(_keyPrograms);

  Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyUniversities);
    await prefs.remove(_keyPrograms);
  }
}
