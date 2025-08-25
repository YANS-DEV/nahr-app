import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
}

export default function LoadingSpinner({ size = 'medium', color = 'text-blue-500', message }: LoadingSpinnerProps) {
  const spinnerSize = clsx({
    'h-4 w-4': size === 'small',
    'h-8 w-8': size === 'medium',
    'h-12 w-12': size === 'large',
  });

  return (
    <div className="flex items-center justify-center">
      <ArrowPathIcon className={clsx("animate-spin", spinnerSize, color)} />
      {message && <p className="text-lg font-semibold">{message}</p>}
    </div>
  );
}