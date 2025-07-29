
'use client';

import { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { completeSignupAction, checkUserExistsAction } from './actions';
import { createSessionCookieAction } from '@/app/login/actions';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, ShieldCheck, KeyRound } from 'lucide-react';
import FirebaseClientError from '@/components/FirebaseClientError';
import Link from 'next/link';

type Step = 'phone' | 'otp' | 'profile';

export default function SignUpPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneIdToken, setPhoneIdToken] = useState<string | null>(null);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({ variant: 'destructive', title: 'Firebase is not configured.' });
        return;
    }
    
    setIsPending(true);
    try {
      // Create a new reCAPTCHA verifier on each attempt to avoid state issues.
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved.
        },
        'expired-callback': () => {
          toast({
            variant: "destructive",
            title: "reCAPTCHA Expired",
            description: "Please try sending the OTP again.",
          });
        }
      });
      
      const result = await signInWithPhoneNumber(auth, `+${phoneNumber}`, recaptchaVerifier);
      setConfirmationResult(result);
      setStep('otp');
      toast({ title: 'OTP Sent!', description: 'Check your phone for the verification code.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to send OTP', description: error.message });
    } finally {
      // Clear the reCAPTCHA container for the next attempt.
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
      setIsPending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return toast({ variant: 'destructive', title: 'Please request an OTP first.' });
    setIsPending(true);
    try {
      const credential = await confirmationResult.confirm(otp);
      const idToken = await credential.user.getIdToken(true);
      
      const { exists, error } = await checkUserExistsAction(idToken);
      if (error) {
        throw new Error(error);
      }

      if (exists) {
        const sessionResult = await createSessionCookieAction(idToken);
        if (!sessionResult.success) {
          throw new Error(sessionResult.error);
        }
        
        toast({ title: 'Login Successful!', description: "Welcome back!" });
        router.push('/');
        router.refresh();
      } else {
        setPhoneIdToken(idToken);
        setStep('profile');
        toast({ title: 'Phone Verified!', description: 'Please create your profile.' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'OTP Verification Failed', description: error.message });
    } finally {
      setIsPending(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneIdToken) return toast({ variant: 'destructive', title: 'Phone verification is missing.' });
    setIsPending(true);
    try {
      const result = await completeSignupAction({
        idToken: phoneIdToken,
        username,
        email,
        password,
      });

      if (!result.success) throw new Error(result.error ?? 'Unknown error');

      if (!auth) throw new Error("Firebase client not available to log in.");
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken(true);
      const sessionResult = await createSessionCookieAction(idToken);
      
      if (!sessionResult.success) throw new Error(sessionResult.error ?? 'Unknown error');

      toast({ title: 'Account Created!', description: "Welcome to the family!" });
      router.push('/');
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Signup Failed', description: error.message });
    } finally {
      setIsPending(false);
    }
  };
  
  if (!auth) {
    return <FirebaseClientError />;
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4">
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md">
        {step === 'phone' && (
          <form onSubmit={handleSendOtp}>
            <CardHeader>
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>Step 1: Verify your phone number to begin.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="e.g., 919876543210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send OTP
                </Button>
                <Button variant="link" size="sm" asChild>
                    <Link href="/login">Already have an account? Login</Link>
                </Button>
            </CardFooter>
          </form>
        )}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <CardHeader>
              <CardTitle className="text-2xl">Enter OTP</CardTitle>
              <CardDescription>Step 2: Enter the code sent to +{phoneNumber}.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="otp">One-Time Password</Label>
                    <Input id="otp" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <ShieldCheck className="mr-2"/>
                    Verify
                </Button>
                <Button variant="link" size="sm" onClick={() => setStep('phone')}>Use a different phone number</Button>
            </CardFooter>
          </form>
        )}
        {step === 'profile' && (
          <form onSubmit={handleCreateProfile}>
            <CardHeader>
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
              <CardDescription>Step 3: Choose your username and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required/>
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <UserPlus className="mr-2"/>
                    Create Account & Login
                </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
