
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { createSessionCookieAction, getEmailForUsername } from './actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import FirebaseClientError from '@/components/FirebaseClientError';


export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({ variant: 'destructive', title: 'Firebase is not configured.' });
        return;
    }
    if (!username || !password) {
        toast({ variant: 'destructive', title: 'Username and password are required.' });
        return;
    }
    
    setIsVerifying(true);
    try {
      // Step 1: Look up the email for the given username
      const emailResult = await getEmailForUsername(username);

      if (!emailResult.success || !emailResult.email) {
        throw new Error(emailResult.error || 'Invalid username or password.');
      }

      // Step 2: Sign in with email and password on the client
      const credential = await signInWithEmailAndPassword(auth, emailResult.email, password);
      // Force refresh of the token to get the latest custom claims.
      const idToken = await credential.user.getIdToken(true);

      // Step 3: Create a session cookie on the server
      const result = await createSessionCookieAction(idToken);
      
      if (result.success) {
        toast({ title: 'Login Successful!', description: "Welcome back!" });
        router.push('/');
        router.refresh(); // Force a refresh of Server Component data
      } else {
        // Check for the specific error message indicating a need to sign in again
        if (result.error?.includes('Your permissions have been updated. Please sign in again')) {
          toast({ variant: 'destructive', title: 'Permissions Updated', description: result.error });
        } else {
          throw new Error(result.error || 'Failed to create session.');
        }
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      let description = 'An unknown error occurred.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.message.includes('Invalid username or password')) {
          description = 'The username or password you entered is incorrect.';
      } else {
          description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: description
      });
    } finally {
        setIsVerifying(false);
    }
  };
  
  if (!auth) {
    return <FirebaseClientError />;
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Enter your username and password to access your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g., familyhistorian"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 <LogIn className="mr-2" />
                Login
              </Button>
               <Button variant="link" size="sm" asChild>
                <Link href="/signup">
                    Don't have an account? Sign Up
                </Link>
              </Button>
            </CardFooter>
          </form>
      </Card>
    </div>
  );
}
