import { useEffect, useMemo, useRef } from 'preact/hooks';

import { ToasterProvider, useToaster } from './context.tsx';
import Toast from './Toast.tsx';

export { Toast, useToaster as useToasterContext, ToasterProvider };

type ToasterProps = {
  max?: number;
};

function Toaster({ max = 3 }: ToasterProps) {
  const { toasts } = useToaster();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const popover = popoverRef.current;

    if (
      typeof popover?.hidePopover !== 'function' ||
      typeof popover?.showPopover !== 'function'
    ) {
      return;
    }

    if (toasts.length > 0) return popover.showPopover();

    popover.hidePopover();
  }, [toasts.length]);

  const renderedToasts = useMemo(
    () =>
      toasts.map((toast, index, { length }) => ({
        removeImmediately: Math.abs(index + 1 - length) >= max,
        toast,
      })),
    [max, toasts],
  );

  return (
    <div
      className="toaster"
      ref={popoverRef}
      popover="manual"
    >
      <ol className="list-unstyled">
        {renderedToasts.map(({ toast, removeImmediately }) => (
          <Toast
            key={toast.id}
            toast={toast}
            removeImmediately={removeImmediately}
          />
        ))}
      </ol>
    </div>
  );
}

export default Toaster;
