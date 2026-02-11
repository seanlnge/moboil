import { signInWithPopup, RecaptchaVerifier, type ConfirmationResult, signInWithPhoneNumber } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Loader2, Phone } from "lucide-react";

import { type User } from "firebase/auth";
import { useEffect, useState } from "react";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  phoneNumber?: string;
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function AuthPopup({ isOpen, onClose, onSuccess, phoneNumber }: AuthPopupProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (isOpen && !window.recaptchaVerifier) {
      try {
        // Clear any existing reCAPTCHA instance first if needed
        const existingContainer = document.getElementById('recaptcha-container');
        if (existingContainer) {
          existingContainer.innerHTML = '';
        }

        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          }
        });
      } catch (e) {
        console.error("Recaptcha error:", e);
      }
    }
    
    return () => {
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
                // We set it to null or undefined in a way that respects the type if possible,
                // or just leave it cleared.
                // @ts-ignore
                window.recaptchaVerifier = undefined;
            } catch (e) {
                console.error("Error clearing recaptcha:", e);
            }
        }
    }
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onSuccess(result.user);
    } catch (err: any) {
      console.error("Auth error:", err);
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    if (!phoneNumber) {
      setError("Phone number is missing.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const appVerifier = window.recaptchaVerifier;
      // Format phone number if needed, assuming E.164 or US format
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+1" + formattedPhone.replace(/\D/g, ""); // Default to US +1 if no country code
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setShowPhoneInput(true);
    } catch (err: any) {
      console.error("Phone Auth error:", err);
      if (err.code === 'auth/invalid-app-credential') {
         setError("Configuration error: Domain not authorized or App Check failure. Try adding this domain to Firebase Console or use a Test Phone Number.");
      } else if (err.code === 'auth/invalid-phone-number') {
         setError("The phone number is invalid.");
      } else {
         setError("Failed to send verification code. Please check the phone number and try again.");
      }
      if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!confirmationResult) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      onSuccess(result.user);
    } catch (err: any) {
      console.error("Verification error:", err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div id="recaptcha-container"></div>
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verify Your Identity</AlertDialogTitle>
          <AlertDialogDescription>
            Please sign in to complete your booking. This helps us verify your contact information and keeps your appointment secure.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 py-4">
          {!showPhoneInput ? (
            <>
              <Button 
                onClick={handleGoogleSignIn} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                )}
                Sign in with Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                id="sign-in-button"
                onClick={handlePhoneSignIn}
                disabled={loading || !phoneNumber}
                className="w-full"
                variant="outline"
              >
                 {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="mr-2 h-4 w-4" />
                )}
                Verify Phone Number {phoneNumber}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
              <Button 
                onClick={verifyCode} 
                disabled={loading || verificationCode.length < 6}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setShowPhoneInput(false)}
              >
                Back
              </Button>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
