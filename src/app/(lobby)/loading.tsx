import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#060810]">
      <Loader2 className="h-8 w-8 animate-spin text-[#E8B430]" />
    </div>
  );
}

