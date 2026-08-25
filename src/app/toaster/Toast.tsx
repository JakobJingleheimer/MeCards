import CheckCircleIcon from '@tabler/icons/outline/circle-check.svg';
import ExclamationCircleIcon from '@tabler/icons/outline/exclamation-circle.svg';
import InformationCircleIcon from '@tabler/icons/outline/info-circle.svg';
import Spinner from '@tabler/icons/outline/loader-4.svg';
import XCircleIcon from '@tabler/icons/outline/circle-x.svg';
import XMarkIcon from '@tabler/icons/outline/x.svg';
import { clsx } from 'clsx';
import {
  type ComponentType,
} from 'preact/compat';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';

import type { ToastKind, Toast as ToastType } from './index.d.ts';
import { useToaster } from './context.tsx';


type ToastProps = {
  toast: ToastType;
  removeImmediately?: boolean;
};

const iconMap = {
  danger: XCircleIcon,
  info: InformationCircleIcon,
  pending: Spinner,
  primary: InformationCircleIcon,
  secondary: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationCircleIcon,
} as const satisfies Record<ToastKind, ComponentType>;

export default function Toast({ toast, removeImmediately = false }: ToastProps) {
  const { remove } = useToaster();
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const remainingMsRef = useRef(toast.duration);
  const startedAtRef = useRef(0);

  const Icon = iconMap[toast.kind];

  const clearRunning = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (toast.duration < 0 || remainingMsRef.current <= 0) return;

    startedAtRef.current = Date.now();

    timeoutRef.current = setTimeout(
      () => remove(toast.id),
      remainingMsRef.current,
    );
  }, [remove, toast.duration, toast.id]);

  const pauseCountdown = useCallback(() => {
    if (toast.duration < 0) {
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
    clearRunning();
  }, [clearRunning, toast.duration]);

  useEffect(() => {
    if (removeImmediately && toast.duration > -1) return remove(toast.id);

    if (!isPaused) startCountdown();

    return clearRunning;
  }, [
    clearRunning,
    isPaused,
    remove,
    removeImmediately,
    startCountdown,
    toast.duration,
    toast.id,
  ]);

  useEffect(() => {
    if (isPaused) pauseCountdown();
  }, [isPaused, pauseCountdown]);

  const showDismiss = toast.duration > -1 || toast.dismissable;

  const handleDismiss = useCallback(() => {
    toast.onDismiss?.();
    remove(toast.id);
  }, [remove, toast]);

  const message = useMemo(() => {
    const Elm = typeof toast.message === 'string' ? 'p' : 'div';
    return <Elm>{toast.message}</Elm>;
  }, [toast.message]);

  const handleAction = useCallback(
    (dismissOnClick?: boolean, onClick?: () => void) => {
      onClick?.();

      if (dismissOnClick) {
        remove(toast.id);
      }
    },
    [remove, toast.id],
  );

  return (
    <li
      aria-atomic="true"
      aria-live="polite"
      className={clsx('align-center callout sidecar toast', toast.kind)}
      key={toast.id}
      onBlurCapture={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="status"
    >
      <Icon aria-hidden="true" />

      <div>
        {toast.heading && (
          <header className="action-header">
            <h1 className="h2">{toast.heading}</h1>

            {showDismiss && (
              <button
                aria-heading="dismiss toast"
                className="-margin-6xs padding-6xs plain"
                onClick={handleDismiss}
                type="button"
              >
                <XMarkIcon />
              </button>
            )}
          </header>
        )}

        <p>{message}</p>

        {toast.ctas?.length && (
          <div className="split">
            {toast.ctas.map((action) => (
              <button
                onClick={() => handleAction(action.dismissOnClick, action.onClick)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
