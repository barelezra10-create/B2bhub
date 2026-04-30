"use client";

export function DeleteButton({
  action,
  confirmMessage,
}: {
  action: () => Promise<void> | void;
  confirmMessage: string;
}) {
  return (
    <form
      action={async () => {
        if (!confirm(confirmMessage)) return;
        await action();
      }}
    >
      <button
        type="submit"
        className="text-xs text-red-600 hover:text-red-700"
      >
        Delete
      </button>
    </form>
  );
}
