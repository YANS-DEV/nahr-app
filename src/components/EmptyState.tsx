import { CubeTransparentIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  title: string;
  message: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg text-center">
      <CubeTransparentIcon className="h-16 w-16 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-200 mb-2">{title}</h2>
      <p className="text-gray-400">{message}</p>
    </div>
  );
}