
import { z } from 'zod';

export const memberFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required.'}),
  parents: z.array(z.string()).max(2, { message: 'A member can have at most two parents.' }).optional(),
  otherParentName: z.string().optional(),
  spouseName: z.string().optional(),
  bloodType: z.string().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please use YYYY-MM-DD format.' }).optional().or(z.literal('')),
  isDeceased: z.boolean().optional(),
  dateOfDeath: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please use YYYY-MM-DD format.' }).optional().or(z.literal('')),
  mobile: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  birthPlace: z.string().optional(),
  occupation: z.string().optional(),
  relationship: z.string().min(2, { message: 'Relationship is required.' }),
  photo: z.any().optional(),
}).refine((data) => {
    // If marked as deceased, date of death is required.
    if (data.isDeceased && (!data.dateOfDeath || data.dateOfDeath.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: "Date of Death is required when member is marked as deceased.",
    path: ["dateOfDeath"],
});


export type MemberFormData = z.infer<typeof memberFormSchema>;
