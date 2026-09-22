import { forwardRef, type InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ label, error, className, ...props }, ref) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
    <input
      ref={ref}
      {...props}
      aria-invalid={error ? "true" : "false"}
      className={[
        "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-brand-300 focus:ring",
        error ? "border-rose-300 ring-rose-200" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
    {error ? <span className="mt-2 block text-sm text-rose-600">{error}</span> : null}
  </label>
));

FormInput.displayName = "FormInput";
