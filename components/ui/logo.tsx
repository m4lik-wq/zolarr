import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  showText?: boolean;
  size?: number;
  className?: string;
}

export function Logo({ showText = true, size = 32, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/logo.svg"
        alt="Zolarr Logo"
        width={size}
        height={size}
        preload
        role="img"
      />
      {showText && (
        <span className="font-display font-bold text-xl tracking-tight">
          Zolarr
        </span>
      )}
    </div>
  );
}
