
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
import { addMemberAction, updateMemberAction } from './actions';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronsUpDown, Loader2, UploadCloud, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { memberFormSchema, type MemberFormData } from './schema';
import type { Member } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { User as AuthUser } from '@/lib/auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AddMemberForm({
  members,
  initialData,
  memberId,
  currentUser,
}: {
  members: Member[];
  initialData?: Member;
  memberId?: string;
  currentUser: AuthUser | null;
}) {
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!initialData;
  const isAdmin = currentUser?.role === 'admin';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoUrl || null);
  const [bloodTypePopoverOpen, setBloodTypePopoverOpen] = useState(false);

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: '',
      gender: undefined,
      parents: [],
      otherParentName: '',
      spouseName: '',
      bloodType: '',
      dateOfBirth: '',
      isDeceased: false,
      dateOfDeath: '',
      mobile: '',
      email: '',
      birthPlace: '',
      occupation: '',
      relationship: '',
      photo: undefined,
    },
  });

  const isDeceased = form.watch('isDeceased');

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        dateOfBirth: initialData.dateOfBirth || '',
        isDeceased: !!initialData.dateOfDeath,
        dateOfDeath: initialData.dateOfDeath || '',
        email: initialData.email || '',
        spouseName: initialData.spouseName || '',
        otherParentName: initialData.otherParentName || '',
        photo: undefined, // Don't pre-fill file input
      });
      setPhotoPreview(initialData.photoUrl);
    }
  }, [initialData, form]);

  function onSubmit(values: MemberFormData) {
    const formData = new FormData();
    for (const key in values) {
      const value = values[key as keyof MemberFormData];
      if (value !== undefined && value !== null) {
        if (key === 'parents' && Array.isArray(value)) {
          value.forEach(p => formData.append(key, p));
        } else if (key === 'photo' && value instanceof File) {
            formData.append('photo', value);
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            formData.append(key, String(value));
        }
      }
    }
    
    startSubmitTransition(async () => {
      const result = isEditMode && memberId
        ? await updateMemberAction(memberId, formData)
        : await addMemberAction(formData);
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        if (isAdmin) {
          router.push('/members');
        } else {
          router.push('/members'); // Redirect member to directory after submitting request
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Submission Error',
          description: result.error || 'An unknown error occurred.',
        });
      }
    });
  }

  const getTitle = () => {
    if (isEditMode) {
        return isAdmin ? 'Edit Member Details' : 'Request to Edit Member';
    }
    return isAdmin ? 'Add New Member' : 'Request to Add Member';
  }

  const getButtonText = () => {
     if (isEditMode) {
        return isAdmin ? 'Save Changes' : 'Submit Edit Request';
    }
    return isAdmin ? 'Add Member' : 'Submit Add Request';
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{getTitle()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                        {photoPreview ? (
                          <Image src={photoPreview} alt="Profile preview" layout="fill" className="rounded-full object-cover" />
                        ) : (
                          <User className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                            setPhotoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a gender" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Date of Birth (optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="YYYY-MM-DD" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="isDeceased"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 h-10">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        id="isDeceased"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <Label htmlFor="isDeceased">
                                        Member is Deceased
                                    </Label>
                                </div>
                            </FormItem>
                        )}
                    />
                    {isDeceased && (
                        <FormField
                        control={form.control}
                        name="dateOfDeath"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Date of Death</FormLabel>
                            <FormControl>
                                <Input placeholder="YYYY-MM-DD" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    )}
                </div>
                <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Aunt, Son" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="spouseName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Spouse Name (optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                control={form.control}
                name="parents"
                render={({ field }) => {
                    const selectedParents = field.value || [];
                    return (
                    <FormItem className="flex flex-col">
                        <FormLabel>Parents (from list)</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                "w-full justify-between",
                                !field.value?.length && "text-muted-foreground"
                                )}
                            >
                                <span className="truncate">
                                {selectedParents.length > 0
                                    ? selectedParents.map(id => members.find(m => m.id === id)?.name || id).join(", ")
                                    : "Select parents"}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                            <CommandInput placeholder="Search members..." />
                            <CommandList>
                                <CommandEmpty>No members found.</CommandEmpty>
                                <CommandGroup>
                                {members.filter(m => m.id !== memberId).map((member) => (
                                    <CommandItem
                                    value={member.name}
                                    key={member.id}
                                    onSelect={() => {
                                        const currentSelection = field.value || [];
                                        const newSelection = currentSelection.includes(member.id)
                                        ? currentSelection.filter((id) => id !== member.id)
                                        : [...currentSelection, member.id];
                                        field.onChange(newSelection.length > 2 ? currentSelection : newSelection);
                                    }}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedParents.includes(member.id)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                    />
                                    {member.name}
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                            </Command>
                        </PopoverContent>
                        </Popover>
                        <FormDescription>
                        Select up to two parents from the list of existing members.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    );
                }}
                />
                 <FormField
                    control={form.control}
                    name="otherParentName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Other Parent Name (optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter name if not in list" {...field} />
                        </FormControl>
                         <FormDescription>Use this if a parent is not an existing member.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., 123-456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., jane@example.com" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Blood Type</FormLabel>
                        <Popover open={bloodTypePopoverOpen} onOpenChange={setBloodTypePopoverOpen}>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                >
                                {field.value || "Select or type blood type"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput
                                    placeholder="Search or type..."
                                    value={field.value || ''}
                                    onValueChange={(search) => field.onChange(search.toUpperCase())}
                                />
                                <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandGroup>
                                    {bloodTypes.map((type) => (
                                    <CommandItem
                                        value={type}
                                        key={type}
                                        onSelect={() => {
                                            field.onChange(type);
                                            setBloodTypePopoverOpen(false);
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", field.value === type ? "opacity-100" : "opacity-0")} />
                                        {type}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                            </PopoverContent>
                        </Popover>
                        <FormDescription>Select from the list or type a custom value.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                control={form.control}
                name="birthPlace"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Birth Place</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Doctor, Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
          </CardContent>
          <CardFooter>
             <Button type="submit" disabled={isSubmitPending}>
               {isSubmitPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {getButtonText()}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
