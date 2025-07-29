
'use client';

import { useState, useEffect } from 'react';
import type { Member } from '@/lib/types';
import MemberCard from '@/components/MemberCard';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AuthState } from '@/lib/auth';

export default function MemberDirectory({ members, authState }: { members: Member[]; authState: AuthState }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState(members);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (lowercasedQuery === '') {
        setFilteredMembers(members);
        return;
    }
    const filtered = members.filter((member) =>
      member.name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredMembers(filtered);
  }, [searchQuery, members]);

  return (
    <>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">
                    Family Members
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Search and explore our cherished family directory.
                </p>
            </div>
            <div className="flex w-full md:w-auto items-center gap-2">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name..."
                        className="w-full pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 gap-1 shrink-0">
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Filter
                        </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Generation</DropdownMenuItem>
                        <DropdownMenuItem>Surname</DropdownMenuItem>
                        <DropdownMenuItem>Household</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        {filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
            {filteredMembers.map((member) => (
                <MemberCard key={member.id} member={member} user={authState.user} allMembers={members} />
            ))}
            </div>
        ) : (
            <Alert>
            <Search className="h-4 w-4" />
            <AlertTitle>No Results</AlertTitle>
            <AlertDescription>
                No family members match your search criteria. Try a different name.
            </AlertDescription>
            </Alert>
        )}
    </>
  );
}
