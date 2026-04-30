export function FormField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
  helpText,
  error,
  textarea,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
}) {
  const value = defaultValue ?? "";
  const baseClass =
    "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none";

  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={value as string}
          required={required}
          placeholder={placeholder}
          rows={rows ?? 4}
          className={baseClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={value}
          required={required}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
      {helpText ? <span className="mt-1 block text-xs text-slate-500">{helpText}</span> : null}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
