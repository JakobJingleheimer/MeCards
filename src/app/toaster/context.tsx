import { nanoid } from 'nanoid/non-secure';
import {
  createContext,
} from 'preact';
import {
  type ReactNode,
} from 'preact/compat';
import {
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'preact/hooks';

import type { Toast, ToastInput } from './index.d.ts';


type ToasterState = {
  toasts: Toast[];
};

type ToasterAction =
  | {
      type: 'upsert';
      toast: Toast;
    }
  | {
      type: 'remove';
      id: string;
    }
  | {
      type: 'empty';
    };

type ToasterContextValue = {
  empty: () => void;
  push: (toast: ToastInput) => string;
  remove: (id: string) => void;
  toasts: Toast[];
};

const initialState = {
  toasts: [],
} satisfies ToasterState;

const DEFAULT_TOAST_DURATION_MS = 6_000;

const ToasterContext = createContext<ToasterContextValue | null>(null);

function toasterReducer(
  state: ToasterState,
  action: ToasterAction,
): ToasterState {
  switch (action.type) {
    case 'upsert': {
      const nextToasts = state.toasts.filter(
        (toast) => toast.id !== action.toast.id,
      );

      return {
        toasts: [...nextToasts, action.toast],
      };
    }
    case 'remove': {
      return {
        toasts: state.toasts.filter((toast) => toast.id !== action.id),
      };
    }
    case 'empty': {
      return initialState;
    }
  }
}

type ToasterProviderProps = {
  children: ReactNode;
};

export function ToasterProvider({ children }: ToasterProviderProps) {
  const [state, dispatch] = useReducer(toasterReducer, initialState);

  const empty = useCallback(() => {
    dispatch({ type: 'empty' });
  }, []);

  const push = useCallback((input: ToastInput) => {
    const id = input.id ?? nanoid(6);

    dispatch({
      toast: {
        ...input,
        dismissable: input.dismissable ?? input.duration === -1,
        duration: input.duration ?? DEFAULT_TOAST_DURATION_MS,
        id,
      },
      type: 'upsert',
    });

    return id;
  }, []);

  const remove = useCallback((id: string) => {
    dispatch({ id, type: 'remove' });
  }, []);

  const value = useMemo<ToasterContextValue>(
    () => ({
      empty,
      push,
      remove,
      toasts: state.toasts,
    }),
    [empty, push, remove, state.toasts],
  );

  return (
    <ToasterContext.Provider value={value}>{children}</ToasterContext.Provider>
  );
}

export function useToaster() {
  const context = useContext(ToasterContext);

  if (context) return context;

  throw new Error('useToaster must be used within a ToasterProvider');
}
