import { type ReactNode } from 'react';

export type ToastKind =
  | 'danger'
  | 'info'
  | 'pending'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  ;

export type ToastAction = {
  dismissOnClick?: boolean;
  label: string;
  onClick?: () => void;
};

export type Toast = {
  ctas?: ToastAction[];
  dismissable: boolean;
  duration: number;
  heading?: string;
  id: string;
  kind: ToastKind;
  message: ReactNode;
  onDismiss?: () => void;
};

export type ToastInput = {
  ctas?: ToastAction[];
  dismissable?: boolean;
  duration?: number;
  heading?: string;
  id?: string;
  kind: ToastKind;
  message: ReactNode;
  onDismiss?: () => void;
};
