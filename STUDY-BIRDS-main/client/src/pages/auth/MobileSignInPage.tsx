import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { getErrorMessage } from "../../utils/errors";
export const MobileSignInPage = () => {
  const [params] = useSearchParams();
  const { user, loading } = useAuth();
  const id = params.get("request");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (id && /^[A-Za-z0-9_-]{43}$/.test(id))
      sessionStorage.setItem("mobileSignInRequest", id);
  }, [id]);
  if (loading) return <p>جارٍ تحميل الحساب…</p>;
  return (
    <section className="panel mx-auto max-w-xl space-y-5 p-8">
      <h1 className="text-2xl font-semibold">تسجيل الدخول إلى التطبيق</h1>
      {!id || !/^[A-Za-z0-9_-]{43}$/.test(id) ? (
        <p>طلب غير صالح. افتح تسجيل الدخول من التطبيق مجددًا.</p>
      ) : done ? (
        <p role="status">
          تم السماح بالدخول. عُد إلى التطبيق واضغط «أكملت الدخول».
        </p>
      ) : !user ? (
        <>
          <p>
            سجّل الدخول بحسابك باستخدام Google أو Apple أو مفتاح المرور أو كلمة
            المرور، ثم وافق على دخول التطبيق.
          </p>
          <Link to="/login" className="text-brand-700 underline">
            تسجيل الدخول
          </Link>
        </>
      ) : (
        <>
          <p>
            السماح للتطبيق بالدخول بحساب {user.email}؟ وافق فقط إذا بدأت هذا
            الطلب بنفسك من التطبيق.
          </p>
          {error ? <p role="alert">{error}</p> : null}
          <button
            className="rounded-full bg-brand-900 px-6 py-3 text-white disabled:opacity-50"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api.post("/identity/mobile/approve", { challengeId: id });
                sessionStorage.removeItem("mobileSignInRequest");
                setDone(true);
              } catch (e) {
                setError(getErrorMessage(e, "تعذر إكمال الطلب"));
              } finally {
                setBusy(false);
              }
            }}
          >
            السماح بالدخول
          </button>
        </>
      )}
      <Link
        to="/login"
        onClick={() => sessionStorage.removeItem("mobileSignInRequest")}
        className="block text-brand-700 underline"
      >
        إلغاء طلب الدخول إلى التطبيق
      </Link>
    </section>
  );
};
