
'use client';

import React, { useTransition, useState } from 'react';
import type { Member } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import Link from 'next/link';
import {
  Cake,
  Users,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash,
  Loader2,
  Building,
  Droplets,
  Baby,
  GitBranch,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { deleteMemberAction } from '@/app/members/actions';
import { Badge } from './ui/badge';
import type { AuthState } from '@/lib/auth';


interface MemberProfileSheetProps {
  member: Member | null;
  allMembers: Member[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onMemberClick: (member: Member) => void;
  onShowDescendants: (memberId: string) => void;
  authState: AuthState;
}

const DetailItem = ({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) => {
    if (!children) return null;
    return (
        <div className="flex items-start text-sm">
            <Icon className="h-4 w-4 mr-3 mt-1 shrink-0 text-muted-foreground" />
            <div>
                <span className="font-semibold text-foreground">{label}</span>
                <div className="text-muted-foreground">{children}</div>
            </div>
        </div>
    );
};

const RelatedMemberLink = ({ member, onMemberClick }: { member: Member | null, onMemberClick: (member: Member) => void }) => {
    if (!member) {
        return null;
    }

    return (
        <button onClick={() => onMemberClick(member)} className="text-primary hover:underline text-left p-0 h-auto bg-transparent">
            {member.name}
        </button>
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


export function MemberProfileSheet({ member, allMembers, isOpen, onOpenChange, onMemberClick, onShowDescendants, authState }: MemberProfileSheetProps) {
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const { user, isLoggedIn } = authState;
    const membersById = React.useMemo(() => new Map(allMembers.map(m => [m.id, m])), [allMembers]);

    if (!member) {
        return null;
    }
    
    const handleDelete = () => {
        if (!member) return;
        startTransition(async () => {
            const result = await deleteMemberAction(member.id);
            if (result.success) {
                toast({
                    title: user?.role === 'admin' ? 'Member Deleted' : 'Request Submitted',
                    description: result.message,
                });
                setDeleteDialogOpen(false);
                onOpenChange(false);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Action Failed',
                    description: result.error,
                });
            }
        });
    };

    const birthDate = member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const deathDate = member.dateOfDeath ? new Date(member.dateOfDeath).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
    const age = calculateAge(member.dateOfBirth, member.dateOfDeath);

    const children = allMembers.filter(m => m.parents.includes(member!.id));
    const parentMembers = (member.parents || []).map(id => membersById.get(id)).filter(Boolean) as Member[];


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left mb-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20 shrink-0">
                <Image
                    src={member.photoUrl}
                    alt={`Photo of ${member.name}`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    data-ai-hint="person portrait"
                />
            </div>
            <div>
                <SheetTitle className="text-3xl font-headline">{member.name}</SheetTitle>
                <SheetDescription className="text-base">
                    {member.relationship}
                </SheetDescription>
                <div className='mt-2 flex items-center gap-2 flex-wrap'>
                    <Badge variant={member.gender === 'Male' ? 'default' : member.gender === 'Female' ? 'destructive' : 'secondary'}>{member.gender}</Badge>
                    {age !== null && <Badge variant="outline">Age: {age}</Badge>}
                </div>
            </div>
          </div>
        </SheetHeader>
        
        <div className="space-y-6">
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                 <DetailItem icon={Cake} label="Born">{birthDate}</DetailItem>
                 {deathDate && <DetailItem icon={Building} label="Died">{deathDate}</DetailItem>}
                 <DetailItem icon={MapPin} label="Birthplace">{member.birthPlace || 'N/A'}</DetailItem>
            </div>

             <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-lg mb-2">Family</h4>
                 <DetailItem icon={Users} label="Parents">
                    {parentMembers.length === 0 && !member.otherParentName ? 'N/A' : (
                        <>
                            {parentMembers.map((parent, i) => (
                                <React.Fragment key={parent.id}>
                                    <RelatedMemberLink member={parent} onMemberClick={onMemberClick} />
                                    {(i < parentMembers.length - 1 || !!member.otherParentName) && ', '}
                                </React.Fragment>
                            ))}
                            {member.otherParentName}
                        </>
                    )}
                </DetailItem>
                <DetailItem icon={Baby} label="Children">
                    {children.length > 0 ? children.map((child, index) => (
                         <React.Fragment key={child.id}>
                            <RelatedMemberLink member={child} onMemberClick={onMemberClick} />
                            {index < children.length - 1 && ', '}
                        </React.Fragment>
                    )) : 'N/A'}
                </DetailItem>
                <DetailItem icon={Heart} label="Spouse">{member.spouseName || 'N/A'}</DetailItem>
            </div>

             <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-lg mb-2">Tree Actions</h4>
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                        onShowDescendants(member.id);
                    }}
                >
                    <GitBranch className="mr-3 h-4 w-4" />
                    Highlight Descendants
                </Button>
            </div>

             <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-lg mb-2">Contact & Career</h4>
                <DetailItem icon={Mail} label="Email">{member.email || 'N/A'}</DetailItem>
                <DetailItem icon={Phone} label="Mobile">{member.mobile || 'N/A'}</DetailItem>
                <DetailItem icon={Briefcase} label="Occupation">{member.occupation || 'N/A'}</DetailItem>
                <DetailItem icon={Droplets} label="Blood Type">{member.bloodType || 'N/A'}</DetailItem>
            </div>
        </div>

        {isLoggedIn && (
          <SheetFooter className="mt-8 pt-6 border-t flex-row justify-end gap-2">
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {user?.role === 'admin' 
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
                              {user?.role === 'admin' ? 'Delete Permanently' : 'Submit Request'}
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
              <Button asChild className="w-full sm:w-auto">
                  <Link href={`/members/${member.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Member
                  </Link>
              </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
