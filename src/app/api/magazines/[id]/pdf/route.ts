import { getMagazine } from '@/services/firestore';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return new Response('Magazine ID is required', { status: 400 });
  }

  try {
    const { magazine, error } = await getMagazine(id);

    if (error || !magazine || !magazine.pdfUrl) {
      console.error(`PDF proxy error for ID ${id}: ${error || 'Magazine or PDF URL not found'}`);
      return new Response('Magazine not found or PDF URL is missing', { status: 404 });
    }

    // Fetch the PDF from the public GCS URL
    const pdfResponse = await fetch(magazine.pdfUrl);

    if (!pdfResponse.ok) {
      console.error(`Failed to fetch PDF from GCS for ID ${id}. Status: ${pdfResponse.status}`);
      return new Response('Failed to fetch PDF from storage', { status: pdfResponse.status });
    }
    
    // The body is a ReadableStream. We can pipe it directly.
    const body = pdfResponse.body;

    // Stream the PDF content back to the client
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    
    return new Response(body, {
      status: 200,
      headers: headers,
    });

  } catch (e: any) {
    console.error(`Failed to proxy PDF for magazine ${id}:`, e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
