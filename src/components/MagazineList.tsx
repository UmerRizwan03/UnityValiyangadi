
'use client';

import type { Magazine } from '@/lib/types';
import MagazineCover from './MagazineCover';

export default function MagazineList({ magazines }: { magazines: Magazine[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
      {magazines.map((magazine) => (
        <MagazineCover
          key={magazine.id}
          magazine={magazine}
        />
      ))}
    </div>
  );
}
