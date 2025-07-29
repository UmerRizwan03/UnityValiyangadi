import { getAuthState } from '@/lib/auth';
import NotAuthorized from '@/components/NotAuthorized';
import UploadMagazineForm from './UploadMagazineForm';

export default async function UploadMagazinePage() {
  const { user } = await getAuthState();

  if (user?.role !== 'admin') {
    return <NotAuthorized message="You are not authorized to upload magazines." />;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">
          Upload Magazine
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Fill out the form below to add a new edition to the family magazine archive.
        </p>
      </div>
      <UploadMagazineForm />
    </div>
  );
}
