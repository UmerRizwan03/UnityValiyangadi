
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText } from 'lucide-react';
import { magazineFormSchema, type MagazineFormData } from './schema';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { uploadMagazineAction } from './actions';

export default function UploadMagazineForm() {
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<MagazineFormData>({
    resolver: zodResolver(magazineFormSchema),
    defaultValues: {
      title: '',
      description: '',
      coverUrl: '',
      publishDate: '',
      pages: undefined,
      pdf: undefined,
    },
  });

  function onSubmit(values: MagazineFormData) {
    const formData = new FormData();
    // Explicitly append each field to the FormData object to ensure correctness.
    // This is more robust than looping and avoids issues with falsy values.
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('coverUrl', values.coverUrl);
    formData.append('publishDate', values.publishDate);
    formData.append('pages', String(values.pages));
    formData.append('pdf', values.pdf);
    
    startSubmitTransition(async () => {
      const result = await uploadMagazineAction(formData);
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        router.push('/magazines');
      } else {
        toast({
          variant: 'destructive',
          title: 'Upload Error',
          description: result.error || 'An unknown error occurred.',
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Magazine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Magazine Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Summer Reunion 2024" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="publishDate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Publish Date</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} />
                        </FormControl>
                         <FormDescription>
                            YYYY-MM-DD format.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea placeholder="A brief summary of the magazine's content..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="coverUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com/cover.png" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Number of Pages</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="pdf"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                    <FormLabel>Magazine PDF</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input 
                                {...fieldProps}
                                type="file" 
                                accept="application/pdf"
                                onChange={(event) => {
                                    onChange(event.target.files && event.target.files[0]);
                                }}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </FormControl>
                    <FormDescription>
                        Upload the complete magazine in PDF format (max 10MB).
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
          </CardContent>
          <CardFooter>
             <Button type="submit" disabled={isSubmitPending}>
               {isSubmitPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Upload Magazine
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
