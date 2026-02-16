'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  label?: string;
  pendingLabel?: string;
  className?: string;
}

export function SubmitButton({
  label = 'Save',
  pendingLabel = 'Saving...',
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        'rounded-lg bg-[--color-primary] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50'
      }
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
