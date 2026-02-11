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

export default function BookingWarning() {
  const [booking, setBooking] = React.useState<{ date: string; time: string; email?: string } | null>(null);
  const [formattedDate, setFormattedDate] = React.useState<string>("");

  React.useEffect(() => {
    const checkBooking = () => {
      const bookingData = localStorage.getItem('moboil_booking');
      if (bookingData) {
        try {
          const parsed = JSON.parse(bookingData);
          if (parsed.date) {
            // Parse YYYY-MM-DD manually to avoid UTC issues
            const [y, m, d] = parsed.date.split('-').map(Number);
            const bookingDay = new Date(y, m - 1, d);
            
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // Check if booking is today or in the future
            if (bookingDay >= today) {
                // Format date nicely
                const fDate = bookingDay.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                // Capitalize time
                const fTime = parsed.time ? parsed.time.charAt(0).toUpperCase() + parsed.time.slice(1) : '';
                
                setFormattedDate(`${fDate} ${fTime ? `(${fTime})` : ''}`);
                setBooking(parsed);
            }
          }
        } catch (e) {
          console.error("Error parsing booking data", e);
        }
      }
    };
    checkBooking();
  }, []);

  const handleCancel = () => {
    if (booking) {
      const formData = new FormData();
      formData.append("cancel", "true");
      if (booking.email) formData.append("email", booking.email);
      if (booking.date) formData.append("date", booking.date);
      if (booking.time) formData.append("time", booking.time);

      fetch("https://formspree.io/f/mgoloaqp", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      }).catch(err => console.error("Error sending cancel request", err));
    }

    localStorage.removeItem('moboil_booking');
    setBooking(null);
  };

  if (!booking) return null;

  return (
    <div className="w-full bg-yellow-400 text-yellow-950 py-3 px-6 text-center z-40 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2">
            <p className="font-bold flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                Existing Booking:
            </p>
            <p className="text-sm md:text-base">
                You already have a booking scheduled for <span className="font-bold">{formattedDate}</span>.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-4 bg-transparent border-yellow-950 text-yellow-950 hover:bg-yellow-950 hover:text-yellow-400 h-8">
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your booking? This will remove it from your device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white">Yes, Cancel</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
    </div>
  );
}
