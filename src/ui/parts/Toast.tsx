import { toast } from '../../state';

export function ToastHost() {
  if (!toast.value) return null;
  const t = toast.value;
  return (
    <div class="toast">
      <span>{t.message}</span>
      {t.onUndo && (
        <button
          onClick={() => {
            t.onUndo?.();
            toast.value = undefined;
          }}
        >
          Undo
        </button>
      )}
    </div>
  );
}
