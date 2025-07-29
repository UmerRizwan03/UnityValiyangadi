
import Image from 'next/image';
import { Button } from './ui/button';
import { Download, BookOpen } from 'lucide-react';
import type { Magazine } from '@/lib/types';
import Link from 'next/link';

interface MagazineCoverProps {
  magazine: Magazine;
}

export default function MagazineCover({ magazine }: MagazineCoverProps) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <Image
          src={magazine.coverUrl}
          alt={`Cover of ${magazine.title}`}
          fill
          className="object-cover"
          data-ai-hint="magazine cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <Button asChild>
             <Link href={`/magazines/${magazine.id}/view`}>
                <BookOpen className="mr-2" /> Read Online
              </Link>
            </Button>
          <Button asChild variant="secondary">
            <a href={magazine.pdfUrl} download={`${magazine.title.replace(/\s/g, '_')}.pdf`}>
              <Download className="mr-2" /> Download
            </a>
          </Button>
        </div>
      </div>
      <h3 className="mt-3 font-semibold text-center text-sm text-muted-foreground group-hover:text-foreground">
        {magazine.title}
      </h3>
    </div>
  );
}
