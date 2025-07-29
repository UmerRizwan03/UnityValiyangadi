
import { getMagazine } from '@/services/firestore';
import FlipbookViewer from '@/components/FlipbookViewer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import FirestoreError from '@/components/FirestoreError';
import { Button } from '@/components/ui/button';

export default async function MagazineViewPage({ params }: { params: { id: string } }) {
  const { magazine, error } = await getMagazine(params.id);

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <FirestoreError error={error} />
      </div>
    );
  }

  if (!magazine) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Magazine Not Found</AlertTitle>
          <AlertDescription>
            The magazine you are looking for does not exist. Return to the{' '}
            <Link href="/magazines" className="font-semibold underline">
              magazines list
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-200 dark:bg-gray-900 p-4 flex flex-col">
        <div className='text-center mb-4 relative'>
             <Button asChild variant="outline" className="absolute top-0 left-4">
                <Link href="/magazines">
                    <ArrowLeft className="mr-2" />
                    Back
                </Link>
             </Button>
             <h1 className="text-2xl font-bold font-headline">{magazine.title}</h1>
             <p className="text-sm text-muted-foreground">{new Date(magazine.publishDate).getFullYear()}</p>
        </div>
        <div className="flex-grow flex items-center justify-center">
            <FlipbookViewer pdfUrl={`/api/magazines/${params.id}/pdf`} />
        </div>
    </div>
  );
}
