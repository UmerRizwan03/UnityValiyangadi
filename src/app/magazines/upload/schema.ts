
import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

export const magazineFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  coverUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  publishDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Please enter a valid date.' }),
  pages: z.coerce.number().int().positive({ message: 'Please enter a valid number of pages.' }),
  pdf: z
    .instanceof(File, { message: "A PDF file is required for upload." })
    .refine((file) => file.size > 0, "A PDF file is required for upload.")
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `Max file size is 10MB.`
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .pdf files are accepted."
    ),
});

export type MagazineFormData = z.infer<typeof magazineFormSchema>;
