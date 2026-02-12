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
import { getFunctions, httpsCallable } from "firebase/functions";
import { db, app, auth } from "../lib/firebase";
import { carMakes, fetchModels, fetchTrims, type TrimOption } from "../lib/cars";

import { type User } from "firebase/auth";

const functions = getFunctions(app, "us-east1");

export interface BookingData {
  email?: string;
  firstName?: string;
  lastName?: string;
  dateTime?: number; // Unix timestamp
  service?: string;
  address?: string;
  notes?: string;
  phone?: string;
  carYear?: string;
  carMake?: string;
  carModel?: string;
  carTrim?: string;
  emailStatus?: {
    customer?: string;
    admin?: string;
  };
  [key: string]: any;
}

interface SlotsByDate {
  dateLabel: string;
  dateKey: string;
  slots: { label: string; value: string }[];
}

interface GetAvailableSlotsResponse {
  slots: number[];
}

export default function BookingForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [showAuthPopup, setShowAuthPopup] = React.useState(false);
  const [pendingBookingData, setPendingBookingData] = React.useState<BookingData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [slotsByDate, setSlotsByDate] = React.useState<SlotsByDate[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string>("");
  const [selectedMake, setSelectedMake] = React.useState<string>("");
  const [selectedModel, setSelectedModel] = React.useState<string>("");
  const [selectedTrim, setSelectedTrim] = React.useState<string>("");
  const [availableModels, setAvailableModels] = React.useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = React.useState(false);
  const [availableTrims, setAvailableTrims] = React.useState<TrimOption[]>([]);
  const [trimsLoading, setTrimsLoading] = React.useState(false);
  const [carYear, setCarYear] = React.useState<string>("");

  // Fetch available slots from Cloud Function on mount
  React.useEffect(() => {
    const fetchSlots = async () => {
      try {
        const getAvailableSlots = httpsCallable<unknown, GetAvailableSlotsResponse>(functions, "getAvailableSlots");
        const result = await getAvailableSlots();
        const slots = result.data.slots;

        // Group slots by date
        const grouped = new Map<string, { dateLabel: string; slots: { label: string; value: string }[] }>();

        for (const ts of slots) {
          const d = new Date(ts);
          const dateKey = d.toDateString(); // e.g. "Sat Feb 21 2026"
          const dateLabel = d.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          const timeLabel = d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });

          if (!grouped.has(dateKey)) {
            grouped.set(dateKey, { dateLabel, slots: [] });
          }
          grouped.get(dateKey)!.slots.push({ label: timeLabel, value: String(ts) });
        }

        const result2: SlotsByDate[] = [];
        for (const [dateKey, data] of grouped) {
          result2.push({ dateKey, dateLabel: data.dateLabel, slots: data.slots });
        }

        setSlotsByDate(result2);
      } catch (err) {
        console.error("Error fetching available slots:", err);
        setError("Could not load available time slots. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  // Fetch models when year + make are both set
  React.useEffect(() => {
    setSelectedModel("");
    setSelectedTrim("");
    setAvailableModels([]);
    setAvailableTrims([]);

    if (!carYear || !selectedMake || selectedMake === "Other") return;

    let cancelled = false;
    setModelsLoading(true);

    fetchModels(selectedMake, carYear).then((models) => {
      if (!cancelled) {
        setAvailableModels(models);
        setModelsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [carYear, selectedMake]);

  // Fetch trims when year + make + model are all set
  React.useEffect(() => {
    setSelectedTrim("");
    setAvailableTrims([]);

    if (!carYear || !selectedMake || !selectedModel) return;

    let cancelled = false;
    setTrimsLoading(true);

    fetchTrims(carYear, selectedMake, selectedModel).then((trims) => {
      if (!cancelled) {
        setAvailableTrims(trims);
        setTrimsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [carYear, selectedMake, selectedModel]);

  // Get available times for the selected date
  const availableTimesForDate = React.useMemo(() => {
    if (!selectedDate) return [];
    const dateGroup = slotsByDate.find((d) => d.dateKey === selectedDate);
    return dateGroup?.slots ?? [];
  }, [selectedDate, slotsByDate]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const dateTimeStr = formData.get("dateTime") as string;

    if (!dateTimeStr) {
      setError("Please select a date and time.");
      return;
    }
    
    const dateTime = parseInt(dateTimeStr, 10);

    const bookingDetails: BookingData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      carYear: formData.get("carYear") as string,
      carMake: formData.get("carMake") as string,
      carModel: formData.get("carModel") as string,
      carTrim: selectedTrim || undefined,
      dateTime,
      address: formData.get("address") as string,
      notes: formData.get("notes") as string,
      service: "Oil Change",
      createdAt: new Date().toISOString(),
      status: "pending"
    };

    setPendingBookingData(bookingDetails);

    // If the user is already authenticated, skip the auth popup
    const currentUser = auth.currentUser;
    if (currentUser) {
      handleAuthSuccess(currentUser, bookingDetails);
    } else {
      setShowAuthPopup(true);
    }
  }

  const handleAuthSuccess = async (user: User, bookingOverride?: BookingData) => {
    const bookingToSubmit = bookingOverride || pendingBookingData;
    if (!bookingToSubmit) return;

    try {
      const finalBookingData: BookingData = {
        ...bookingToSubmit,
        userId: user.uid,
        userEmail: user.email || bookingToSubmit.email || null,
      };

      const docRef = await addDoc(collection(db, "bookings"), finalBookingData);
      
      localStorage.setItem("moboil_booking", JSON.stringify({ ...finalBookingData, bookingId: docRef.id }));
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="carYear">Year</Label>
                <Input
                  id="carYear"
                  name="carYear"
                  placeholder="2020"
                  required
                  value={carYear}
                  onChange={(e) => setCarYear(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Make</Label>
                <Select
                  name="carMake"
                  required
                  value={selectedMake}
                  onValueChange={(val) => {
                    setSelectedMake(val);
                    setSelectedModel("");
                    setSelectedTrim("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {carMakes.map((make) => (
                      <SelectItem key={make} value={make}>
                        {make}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                {selectedMake === "Other" ? (
                  <Input
                    name="carModel"
                    placeholder="Enter model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    required
                  />
                ) : modelsLoading ? (
                  <p className="text-sm text-muted-foreground pt-2">Loading models...</p>
                ) : availableModels.length > 0 ? (
                  <Select
                    name="carModel"
                    required
                    value={selectedModel}
                    onValueChange={(val) => {
                      setSelectedModel(val);
                      setSelectedTrim("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    name="carModel"
                    placeholder={
                      !carYear || !selectedMake
                        ? "Enter year & make first"
                        : "No models found"
                    }
                    disabled
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Trim</Label>
                {trimsLoading ? (
                  <p className="text-sm text-muted-foreground pt-2">Loading trims...</p>
                ) : availableTrims.length > 0 ? (
                  <Select
                    name="carTrim"
                    required
                    value={selectedTrim}
                    onValueChange={setSelectedTrim}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trim" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTrims.map((trim) => (
                        <SelectItem key={trim.value} value={trim.text}>
                          {trim.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    name="carTrim"
                    placeholder={
                      !selectedModel
                        ? "Pick year, make & model first"
                        : "Enter trim (optional)"
                    }
                    value={selectedTrim}
                    onChange={(e) => setSelectedTrim(e.target.value)}
                    disabled={!selectedModel}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Appointment details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold font-header mb-4">
              Appointment Details
            </h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading available slots...</p>
            ) : slotsByDate.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available slots at this time. Please check back later.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Select
                    value={selectedDate}
                    onValueChange={(val) => setSelectedDate(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a date" />
                    </SelectTrigger>
                    <SelectContent>
                      {slotsByDate.map((d) => (
                        <SelectItem key={d.dateKey} value={d.dateKey}>
                          {d.dateLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Time</Label>
                  <Select name="dateTime" required disabled={!selectedDate}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedDate ? "Select a time" : "Pick a date first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimesForDate.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
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
