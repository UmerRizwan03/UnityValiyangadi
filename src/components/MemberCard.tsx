
'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import type { Member } from '@/lib/types';
import {
  Users,
  Pencil,
  Trash,
  Loader2,
  Cake,
  Skull,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Droplets,
  Tag,
} from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import React, { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteMemberAction } from '@/app/members/actions';
import { cn } from '@/lib/utils';
import type { User as AuthUser } from '@/lib/types';


const MemberCardActions = ({ member, role }: { member: Member; role: AuthUser['role'] }) => {
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteMemberAction(member.id);
            if (result.success) {
                toast({
                    title: role === 'admin' ? 'Member Deleted' : 'Request Submitted',
                    description: result.message,
                });
                setDeleteDialogOpen(false);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Action Failed',
                    description: result.error,
                });
            }
        });
    };

    return (
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white">
                <Link href={`/members/${member.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit ${member.name}</span>
                </Link>
            </Button>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white">
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete ${member.name}</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {role === 'admin' 
                                ? `This will permanently delete ${member.name}. This action cannot be undone.`
                                : `This will submit a request to delete ${member.name}. An administrator will need to approve it.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isPending} className={cn(
                                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            )}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {role === 'admin' ? 'Delete Permanently' : 'Submit Request'}
                            </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

function calculateAge(birthDateStr: string | null | undefined, deathDateStr?: string | null): number | null {
    if (!birthDateStr) {
        return null;
    }
    try {
        const birthDate = new Date(birthDateStr);
        const endDate = deathDateStr ? new Date(deathDateStr) : new Date();

        if (isNaN(birthDate.getTime()) || isNaN(endDate.getTime())) {
            return null;
        }

        let age = endDate.getFullYear() - birthDate.getFullYear();
        const m = endDate.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : null;
    } catch {
        return null;
    }
}

function formatDate(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        // Add a day to account for potential timezone issues where it might be off by one day
        const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
        return adjustedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
}

const DetailItem = ({ icon: Icon, value }: { icon: React.ElementType; value?: string | string[] | null }) => {
    const displayValue = Array.isArray(value) ? value.join(', ') : value;

    if (!displayValue) {
        return null;
    }

    return (
        <div className="flex items-start gap-3">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground text-sm break-words">{displayValue}</span>
        </div>
    );
};


export default function MemberCard({ member, user, allMembers }: { member: Member, user: AuthUser | null, allMembers: Member[] }) {
    const age = calculateAge(member.dateOfBirth, member.dateOfDeath);
    const birthDate = formatDate(member.dateOfBirth);
    const deathDate = formatDate(member.dateOfDeath);
    
    const membersById = React.useMemo(() => new Map(allMembers.map(m => [m.id, m])), [allMembers]);
    
    const parentNames = (member.parents || [])
        .map(id => membersById.get(id)?.name)
        .filter(Boolean) as string[];
    
    if (member.otherParentName) {
        parentNames.push(member.otherParentName);
    }
    const parentDisplay = parentNames.join(', ');

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5">
        <div 
            className={cn("flex items-start gap-4 p-4 text-foreground relative rounded-t-xl",
                member.gender === 'Male' && "bg-blue-100 dark:bg-blue-900/50",
                member.gender === 'Female' && "bg-pink-100 dark:bg-pink-900/50",
                member.gender === 'Other' && "bg-gray-100 dark:bg-gray-700/50"
            )}
        >
            <div className="relative flex items-start gap-4 z-10">
                <Image
                    src={member.photoUrl}
                    alt={`Photo of ${member.name}`}
                    width={64}
                    height={64}
                    className="rounded-full object-cover shrink-0 mt-1 border-2 border-white/50"
                    data-ai-hint="person portrait"
                />
                <div className="flex-grow min-w-0">
                    <h3 className="text-xl font-bold font-headline truncate drop-shadow-sm">{member.name}</h3>
                    {age !== null && (
                        <p className="text-sm opacity-90">
                            {member.dateOfDeath ? `Died at age ${age}` : `${age} years old`}
                        </p>
                    )}
                </div>
            </div>
        </div>

        <div className="p-4 pt-3 space-y-2.5 text-sm flex-grow">
            <DetailItem icon={Tag} value={member.relationship} />
            <DetailItem icon={Cake} value={birthDate ? `Born: ${birthDate}` : null} />
            {deathDate && <DetailItem icon={Skull} value={`Died: ${deathDate}`} />}
            <DetailItem icon={Users} value={parentDisplay ? `Parents: ${parentDisplay}` : null} />
            <DetailItem icon={Briefcase} value={member.occupation} />
            <DetailItem icon={MapPin} value={member.birthPlace} />
            <DetailItem icon={Droplets} value={member.bloodType} />
            <DetailItem icon={Mail} value={member.email} />
            <DetailItem icon={Phone} value={member.mobile} />
        </div>

        {user && <MemberCardActions member={member} role={user.role} />}
    </Card>
  );
}
