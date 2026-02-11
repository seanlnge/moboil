import * as React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ArrowRight } from "lucide-react";
import AuthPopup from "./AuthPopup";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

import { type User } from "firebase/auth";

export default function BookingForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [showAuthPopup, setShowAuthPopup] = React.useState(false);
  const [pendingBookingData, setPendingBookingData] = React.useState<Record<string, any> | null>(null);

  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const bookingDetails = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      carYear: formData.get("carYear") as string,
      carMake: formData.get("carMake") as string,
      carModel: formData.get("carModel") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      address: formData.get("address") as string,
      notes: formData.get("notes") as string,
      createdAt: new Date().toISOString(),
      status: "pending"
    };

    setPendingBookingData(bookingDetails);
    setShowAuthPopup(true);
  }

  const handleAuthSuccess = async (user: User) => {
    if (!pendingBookingData) return;

    try {
      const finalBookingData = {
        ...pendingBookingData,
        userId: user.uid,
        userEmail: user.email,
      };

      await addDoc(collection(db, "bookings"), finalBookingData);
      
      localStorage.setItem("moboil_booking", JSON.stringify(finalBookingData));
      setSubmitted(true);
      setShowAuthPopup(false);
      window?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Error adding document: ", error);
      if (error.code === 'permission-denied') {
        setError("Permission denied. Please ensure you are signed in and have the correct permissions.");
      } else {
        setError("An error occurred while submitting your booking. Please try again.");
      }
      setShowAuthPopup(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto border-orange-200 bg-orange-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-orange-600 font-header">
            Booking Received!
          </CardTitle>
          <CardDescription className="text-base">
            We'll reach out to confirm your appointment. Thanks for choosing
            Moboil!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto bg-white">
      <AuthPopup 
        isOpen={showAuthPopup} 
        onClose={() => setShowAuthPopup(false)} 
        onSuccess={handleAuthSuccess}
        phoneNumber={pendingBookingData?.phone}
      />
      <CardHeader>
        <CardTitle className="text-2xl font-header">
          Book Your Oil Change
        </CardTitle>
        <CardDescription>
          Fill out the form below and we'll confirm your appointment via text or
          email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6" action="">
          {/* Contact info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(813) 555-1234"
                required
              />
            </div>
          </div>

          {/* Vehicle info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold font-header mb-4">
              Vehicle Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="carYear">Year</Label>
                <Input
                  id="carYear"
                  name="carYear"
                  placeholder="2020"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carMake">Make</Label>
                <Input
                  id="carMake"
                  name="carMake"
                  placeholder="Toyota"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carModel">Model</Label>
                <Input
                  id="carModel"
                  name="carModel"
                  placeholder="Camry"
                  required
                />
              </div>
            </div>
          </div>

          {/* Appointment details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold font-header mb-4">
              Appointment Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time</Label>
                <Select name="time">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">
                      Morning (8am - 12pm)
                    </SelectItem>
                    <SelectItem value="afternoon">
                      Afternoon (12pm - 4pm)
                    </SelectItem>
                    <SelectItem value="evening">
                      Evening (4pm - 7pm)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold font-header mb-4">
              Location
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">
                  Where will the car be parked?
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="1234 Main St, Tampa, FL or parking lot description"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any details we should know — parking spot number, gate code, car color, etc."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 text-white hover:bg-orange-400 font-semibold h-11 text-base tracking-wide"
          >
            Submit Booking Request
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            $87 flat rate — you'll pay when the service is complete. No upfront
            charge.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
