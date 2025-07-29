
'use client';

import { useState, useTransition } from 'react';
import type { ChangeRequest, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { approveRequestAction, rejectRequestAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2, X, Users, GitPullRequest } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const RequestDetails = ({ request }: { request: ChangeRequest }) => {
    if (!request.data) return null;
    const { data } = request;

    const changes = Object.entries(data).map(([key, value]) => {
        if (!value) return null;
        if (key === 'photo' && value instanceof File) {
            return <li key={key}><strong>{key}:</strong> {value.name}</li>;
        }
        if (Array.isArray(value)) {
             return <li key={key}><strong>{key}:</strong> {value.join(', ')}</li>
        }
        return <li key={key}><strong>{key}:</strong> {String(value)}</li>;
    }).filter(Boolean);

    if (changes.length === 0) {
        return <p className="text-sm text-muted-foreground">No details provided.</p>;
    }
    
    return (
        <Card className="my-4 bg-muted/50">
            <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-sm">Proposed Details:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    {changes}
                </ul>
            </CardContent>
        </Card>
    )
}

const ChangeRequestsTab = ({ initialRequests }: { initialRequests: ChangeRequest[] }) => {
    const [requests, setRequests] = useState(initialRequests);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleApprove = (requestId: string) => {
        startTransition(async () => {
            const result = await approveRequestAction(requestId);
            if (result.success) {
                toast({ title: "Request Approved", description: result.message });
                setRequests(prev => prev.filter(r => r.id !== requestId));
            } else {
                toast({ variant: 'destructive', title: "Approval Failed", description: result.error });
            }
        });
    };

    const handleReject = (requestId: string) => {
        startTransition(async () => {
            const result = await rejectRequestAction(requestId);
            if (result.success) {
                toast({ title: "Request Rejected", description: result.message });
                setRequests(prev => prev.filter(r => r.id !== requestId));
            } else {
                toast({ variant: 'destructive', title: "Rejection Failed", description: result.error });
            }
        });
    };

    const getBadgeVariant = (type: ChangeRequest['type']) => {
        switch(type) {
            case 'add': return 'default';
            case 'edit': return 'secondary';
            case 'delete': return 'destructive';
            default: return 'outline';
        }
    }

    if (requests.length === 0) {
        return (
            <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>All Caught Up!</AlertTitle>
                <AlertDescription>
                    There are no pending requests to review.
                </AlertDescription>
            </Alert>
        )
    }

    return (
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.map(req => (
                    <>
                        <TableRow key={req.id}>
                            <TableCell>{new Date(req.requestedAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Badge variant={getBadgeVariant(req.type)} className="capitalize">{req.type}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{req.memberName}</TableCell>
                            <TableCell>{req.requestedByName}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleApprove(req.id)} disabled={isPending}>
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4" />}
                                    <span className="ml-2 hidden sm:inline">Approve</span>
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)} disabled={isPending}>
                                     {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4" />}
                                    <span className="ml-2 hidden sm:inline">Reject</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                        {(req.type === 'add' || req.type === 'edit') && (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <RequestDetails request={req} />
                                </TableCell>
                            </TableRow>
                        )}
                    </>
                ))}
            </TableBody>
        </Table>
    )
}

const RegisteredUsersTab = ({ users }: { users: User[] }) => {
    if (users.length === 0) {
        return (
            <Alert>
                <Users className="h-4 w-4" />
                <AlertTitle>No Registered Users</AlertTitle>
                <AlertDescription>
                    No users have signed up yet.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Role</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => (
                    <TableRow key={user.uid}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                {user.role}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


export default function AdminDashboardClient({ 
    initialRequests, 
    users 
}: { 
    initialRequests: ChangeRequest[], 
    users: User[] 
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>Manage change requests and view registered users.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="requests">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="requests">
                            <GitPullRequest className="mr-2 h-4 w-4" />
                            Change Requests ({initialRequests.length})
                        </TabsTrigger>
                        <TabsTrigger value="users">
                            <Users className="mr-2 h-4 w-4" />
                            Registered Users ({users.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="requests" className="mt-4">
                        <ChangeRequestsTab initialRequests={initialRequests} />
                    </TabsContent>
                    <TabsContent value="users" className="mt-4">
                        <RegisteredUsersTab users={users} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
