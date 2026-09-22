import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

/// Thrown by [ApiClient] for any non-2xx response. [message] is the
/// backend's own `{ message: "..." }` string when present, since the
/// Express error middleware always returns that shape.
class ApiException implements Exception {
  final int statusCode;
  final String message;
  const ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException($statusCode): $message';
}

/// Single place that knows the backend's base URL. When the Render URL
/// changes, this is the only line that needs editing.
class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  static const String baseUrl = 'https://study-birds1.onrender.com/api';

  /// Supplied by AuthSession at call time so ApiClient itself has no
  /// circular dependency on the session — every authenticated call passes
  /// its own token explicitly.
  Map<String, String> _headers(String? token) => {
        'Content-Type': 'application/json',
        'X-Study-Birds-Client': 'mobile',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Future<dynamic> get(String path, {String? token}) async {
    final response = await http.get(Uri.parse('$baseUrl$path'), headers: _headers(token));
    return _decode(response);
  }

  Future<dynamic> post(String path, {Map<String, dynamic>? body, String? token}) async {
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: _headers(token),
      body: body != null ? jsonEncode(body) : null,
    );
    return _decode(response);
  }

  Future<dynamic> patch(String path, {Map<String, dynamic>? body, String? token}) async {
    final response = await http.patch(
      Uri.parse('$baseUrl$path'),
      headers: _headers(token),
      body: body != null ? jsonEncode(body) : null,
    );
    return _decode(response);
  }

  Future<dynamic> put(String path, {Map<String, dynamic>? body, String? token}) async {
    final response = await http.put(
      Uri.parse('$baseUrl$path'),
      headers: _headers(token),
      body: body != null ? jsonEncode(body) : null,
    );
    return _decode(response);
  }

  Future<dynamic> delete(String path, {String? token}) async {
    final response = await http.delete(Uri.parse('$baseUrl$path'), headers: _headers(token));
    return _decode(response);
  }

  /// Maps a file extension to the exact MIME type the backend's
  /// fileFilter allowlist expects (server/src/middleware/uploadMiddleware.js).
  /// CRITICAL: without this, http.MultipartFile defaults every upload to
  /// application/octet-stream, which the backend always rejects with
  /// "Unsupported file type" — this was the root cause of every upload
  /// failure across the app (documents, support tickets, payment proofs,
  /// agent uploads, content images).
  static MediaType _mimeTypeFor(String fileName) {
    final ext = fileName.split('.').last.toLowerCase();
    switch (ext) {
      case 'pdf': return MediaType('application', 'pdf');
      case 'doc': return MediaType('application', 'msword');
      case 'docx': return MediaType('application', 'vnd.openxmlformats-officedocument.wordprocessingml.document');
      case 'xls': return MediaType('application', 'vnd.ms-excel');
      case 'xlsx': return MediaType('application', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      case 'ppt': return MediaType('application', 'vnd.ms-powerpoint');
      case 'pptx': return MediaType('application', 'vnd.openxmlformats-officedocument.presentationml.presentation');
      case 'txt': return MediaType('text', 'plain');
      case 'zip': return MediaType('application', 'zip');
      case 'jpg':
      case 'jpeg': return MediaType('image', 'jpeg');
      case 'png': return MediaType('image', 'png');
      case 'webp': return MediaType('image', 'webp');
      default: return MediaType('application', 'octet-stream'); // will still be rejected — matches an unsupported type on purpose
    }
  }

  /// Multipart upload (matches Multer's `upload.single("file")` on the
  /// backend). [fields] become additional form fields (e.g. `type` for a
  /// document's category) alongside the file itself.
  Future<dynamic> postMultipart(
    String path, {
    required List<int> fileBytes,
    required String fileName,
    String fileFieldName = 'file',
    Map<String, String>? fields,
    String? token,
  }) async {
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl$path'));
    if (token != null) request.headers['Authorization'] = 'Bearer $token';
    if (fields != null) request.fields.addAll(fields);
    request.files.add(http.MultipartFile.fromBytes(fileFieldName, fileBytes, filename: fileName, contentType: _mimeTypeFor(fileName)));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return _decode(response);
  }

  dynamic _decode(http.Response response) {
    final bodyText = response.body.isEmpty ? '{}' : response.body;
    late final dynamic decoded;
    try {
      decoded = jsonDecode(bodyText);
    } catch (_) {
      decoded = {'message': bodyText};
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }

    final message = (decoded is Map && decoded['message'] is String)
        ? decoded['message'] as String
        : 'Request failed (${response.statusCode})';
    throw ApiException(response.statusCode, message);
  }
}
