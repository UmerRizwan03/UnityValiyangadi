
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FlipbookViewer from './FlipbookViewer';
import type { Magazine } from '@/lib/types';

interface MagazineViewerDialogProps {
  magazine: Magazine | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function MagazineViewerDialog({ magazine, isOpen, onOpenChange }: MagazineViewerDialogProps) {
  if (!magazine) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-full h-[90vh] p-0 flex flex-col">
         <DialogHeader className="p-4 text-center border-b shrink-0">
          <DialogTitle className="text-2xl font-bold font-headline">{magazine.title}</DialogTitle>
          <DialogDescription>{new Date(magazine.publishDate).getFullYear()}</DialogDescription>
         </DialogHeader>
        <div className="flex-grow relative h-full">
          <FlipbookViewer pdfUrl={`/api/magazines/${magazine.id}/pdf`} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
