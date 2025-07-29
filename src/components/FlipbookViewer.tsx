
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

// Set worker path. This is required for pdf.js to work.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// A simplified Page component that now just displays a pre-rendered image.
const Page = React.memo(React.forwardRef<HTMLDivElement, { imageUrl: string }>(({ imageUrl }, ref) => {
    return (
        <div ref={ref} className="bg-white flex justify-center items-center shadow-inner">
            {imageUrl ? (
                <img src={imageUrl} alt="Magazine page" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            ) : (
                <Skeleton className="w-full h-full" />
            )}
        </div>
    );
}));
Page.displayName = 'Page';

export default function FlipbookViewer({ pdfUrl }: { pdfUrl:string }) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageImages, setPageImages] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const book = useRef<any>(null);

    useEffect(() => {
        const loadPdfAndRenderPages = async () => {
            setIsLoading(true);
            setError(null);
            setPageImages([]);
            
            try {
                const loadingTask = pdfjsLib.getDocument(pdfUrl);
                const pdf = await loadingTask.promise;
                setNumPages(pdf.numPages);

                const images: string[] = [];
                // Pre-render all pages to image data URLs to prevent canvas race conditions.
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    if (!context) {
                        throw new Error('Could not get canvas context');
                    }
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    
                    await page.render(renderContext).promise;
                    images.push(canvas.toDataURL('image/jpeg', 0.9));
                }
                setPageImages(images);

            } catch (e: any) {
                console.error('Failed to load or render PDF', e);
                setError('Failed to load the PDF. Please ensure the URL is correct and public CORS is enabled on the storage bucket.');
            } finally {
                setIsLoading(false);
            }
        };

        loadPdfAndRenderPages();
        
    }, [pdfUrl]);
    
    const onFlip = useCallback((e: any) => {
        setCurrentPage(e.data);
    }, []);

    const showLoading = isLoading || (numPages !== null && pageImages.length !== numPages);

    if (showLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-full text-center">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-lg font-semibold">Preparing Magazine...</p>
                {numPages && pageImages.length > 0 && (
                     <p className="text-muted-foreground">Rendering page {pageImages.length + 1} of {numPages}</p>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-red-500 p-4 bg-destructive/10 rounded-md">{error}</p>
            </div>
        );
    }
    
    let pageCounterText = '';
    if (numPages !== null) {
        if (currentPage === 0) {
            pageCounterText = `Cover`;
        } else if (currentPage + 1 >= numPages) {
            pageCounterText = `Page ${numPages} of ${numPages}`;
        } else {
            pageCounterText = `Pages ${currentPage + 1}-${currentPage + 2} of ${numPages}`;
        }
    }
    
    const isLastPage = numPages ? currentPage + 2 >= numPages : false;
    
    return (
        <div className="flex flex-col items-center gap-4">
            <HTMLFlipBook
                width={450}
                height={600}
                size="fixed"
                minWidth={315}
                maxWidth={1000}
                minHeight={400}
                maxHeight={1500}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={onFlip}
                className="shadow-2xl"
                ref={book}
            >
                {pageImages.map((imageUrl, index) => (
                    <Page key={`page-${index}`} imageUrl={imageUrl} />
                ))}
            </HTMLFlipBook>

            {numPages && (
                <div className="flex items-center justify-center p-2 gap-4 bg-background/80 backdrop-blur-sm rounded-full shadow-lg">
                    <Button variant="outline" size="icon" onClick={() => book.current?.pageFlip().flipPrev()} disabled={currentPage === 0}>
                        <ChevronLeft />
                    </Button>
                    <div className="text-sm font-medium tabular-nums w-44 text-center">
                       {pageCounterText}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => book.current?.pageFlip().flipNext()} disabled={isLastPage}>
                        <ChevronRight />
                    </Button>
                </div>
            )}
        </div>
    );
}
