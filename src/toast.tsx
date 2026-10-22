import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type Kind = "success" | "info" | "error";
interface Toast {
  id: number;
  message: string;
  kind: Kind;
}

const ToastContext = createContext<(message: string, kind?: Kind) => void>(
  () => {},
);
export const useToast = () => useContext(ToastContext);

const icons = { success: CheckCircle2, info: Info, error: AlertCircle };
const colors = {
  success: "text-mint",
  info: "text-sky",
  error: "text-oxblood",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const dismiss = useCallback(
    (id: number) => setItems((c) => c.filter((t) => t.id !== id)),
    [],
  );
  const push = useCallback(
    (message: string, kind: Kind = "success") => {
      const id = Date.now() + Math.random();
      setItems((c) => [...c.slice(-3), { id, message, kind }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4"
      >
        <AnimatePresence>
          {items.map((t) => {
            const Icon = icons[t.kind];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink py-3 pl-4 pr-3 text-sm text-white shadow-2xl"
              >
                <Icon size={18} className={colors[t.kind]} />
                {t.message}
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                  className="cursor-pointer rounded-full p-1 hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
