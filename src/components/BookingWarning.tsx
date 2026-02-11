import * as React from "react";
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
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { CalendarClock } from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, auth } from "../lib/firebase";
import AuthPopup from "./AuthPopup";
import { type User } from "firebase/auth";

const functions = getFunctions(app, "us-east1");

interface StoredBooking {
  bookingId?: string;
  dateTime?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface CancelBookingResponse {
  success: boolean;
  message: string;
}

export default function BookingWarning() {
  const [booking, setBooking] = React.useState<StoredBooking | null>(null);
  const [formattedDate, setFormattedDate] = React.useState<string>("");
  const [cancelId, setCancelId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [cancelled, setCancelled] = React.useState(false);
  const [cancelError, setCancelError] = React.useState<string | null>(null);
  const [showAuthPopup, setShowAuthPopup] = React.useState(false);

  // Read cancel query param from URL and check localStorage on mount
  React.useEffect(() => {
    // Read ?cancel= from the URL client-side
    const params = new URLSearchParams(window.location.search);
    const cancelParam = params.get("cancel");
    if (cancelParam) {
      setCancelId(cancelParam);
      setDialogOpen(true);
    }

    // Check localStorage for existing booking
    const bookingData = localStorage.getItem("moboil_booking");
    if (bookingData) {
      try {
        const parsed = JSON.parse(bookingData) as StoredBooking;
        if (parsed.dateTime) {
          const bookingDate = new Date(parsed.dateTime);
          const now = new Date();

          // Only show if booking is in the future
          if (bookingDate > now) {
            const fDate = bookingDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const fTime = bookingDate.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });

            setFormattedDate(`${fDate} at ${fTime}`);
            setBooking(parsed);
          }
        }
      } catch (e) {
        console.error("Error parsing booking data", e);
      }
    }
  }, []);

  // Determine the booking ID to cancel: URL param takes priority, then localStorage
  const bookingIdToCancel = cancelId || booking?.bookingId;

  const performCancel = async (user: User) => {
    if (!bookingIdToCancel) {
      setCancelError("No booking ID found. Cannot cancel.");
      return;
    }

    setCancelling(true);
    setCancelError(null);

    try {
      const cancelBookingFn = httpsCallable<{ bookingId: string }, CancelBookingResponse>(
        functions,
        "cancelBooking"
      );
      await cancelBookingFn({ bookingId: bookingIdToCancel });

      localStorage.removeItem("moboil_booking");
      setBooking(null);
      setCancelled(true);
      setDialogOpen(false);
      setSuccessDialogOpen(true);
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      const message = err?.message || "Failed to cancel booking. Please try again.";
      setCancelError(message);
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelClick = () => {
    // Check if user is already authenticated
    const currentUser = auth.currentUser;
    if (currentUser) {
      performCancel(currentUser);
    } else {
      // Need to authenticate first
      setShowAuthPopup(true);
    }
  };

  const handleAuthSuccess = async (user: User) => {
    setShowAuthPopup(false);
    await performCancel(user);
  };

  // Show nothing if no booking in localStorage AND no cancelId in URL AND not just cancelled
  if (!booking && !cancelId && !cancelled) return null;

  return (
    <>
      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Success dialog after cancellation */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Cancelled</AlertDialogTitle>
            <AlertDialogDescription>
              Your booking has been cancelled successfully. A confirmation email
              has been sent to your inbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setSuccessDialogOpen(false);
                // Redirect to clean booking page
                window.location.href = "/booking";
              }}
              className="bg-orange-500 hover:bg-orange-400 text-white"
            >
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Banner for existing booking from localStorage (non-URL cancel) */}
      {booking && !cancelId && !cancelled && (
        <div className="w-full bg-yellow-400 text-yellow-950 py-3 px-6 text-center z-40 relative">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2">
            <p className="font-bold flex items-center gap-2">
              <CalendarClock className="w-4 h-4" />
              Existing Booking:
            </p>
            <p className="text-sm md:text-base">
              You already have a booking scheduled for{" "}
              <span className="font-bold">{formattedDate}</span>.
            </p>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4 bg-transparent border-yellow-950 text-yellow-950 hover:bg-yellow-950 hover:text-yellow-400 h-8"
                >
                  Cancel Booking
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your booking for{" "}
                    <span className="font-semibold">{formattedDate}</span>? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {cancelError && (
                  <p className="text-sm text-red-600 px-1">{cancelError}</p>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={cancelling}>
                    Keep Booking
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault(); // Prevent auto-close
                      handleCancelClick();
                    }}
                    disabled={cancelling}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {cancelling ? "Cancelling..." : "Yes, Cancel"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Dialog for URL-based cancel (auto-opened) */}
      {cancelId && (
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {cancelError && (
              <p className="text-sm text-red-600 px-1">{cancelError}</p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cancelling}>
                Keep Booking
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault(); // Prevent auto-close
                  handleCancelClick();
                }}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
