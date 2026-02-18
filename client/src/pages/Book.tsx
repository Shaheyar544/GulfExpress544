import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { collection, doc, setDoc, writeBatch, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Package, Truck, User, MapPin, CheckCircle2, Loader2, Copy, ArrowRight, FileDown } from "lucide-react";
import jsPDF from "jspdf";

const uaeCities = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];
const countries = ["UAE", "Saudi Arabia", "Qatar", "Oman", "Bahrain", "Kuwait", "United States", "United Kingdom", "Germany", "France", "India", "Pakistan", "Philippines", "Other"];
const shipmentTypes = [
  { value: "documents", label: "Documents" },
  { value: "parcels", label: "Parcels" },
  { value: "freight", label: "Freight / Cargo" },
];
const deliveryModes = [
  { value: "same-day", label: "Same Day" },
  { value: "next-day", label: "Next Day" },
  { value: "express", label: "Express (2-3 days)" },
  { value: "economy", label: "Economy (5-7 days)" },
];

const bookingSchema = z.object({
  senderName: z.string().min(2, "Name is required"),
  senderPhone: z.string().min(10, "Valid phone number required"),
  senderEmail: z.string().email("Valid email required"),
  senderAddress: z.string().min(5, "Address is required"),
  senderCity: z.string().min(1, "City is required"),
  receiverName: z.string().min(2, "Receiver name is required"),
  receiverPhone: z.string().min(10, "Valid phone number required"),
  receiverEmail: z.string().email().optional().or(z.literal("")),
  receiverAddress: z.string().min(5, "Address is required"),
  receiverCity: z.string().min(1, "City is required"),
  receiverCountry: z.string().min(1, "Country is required"),
  shipmentType: z.string().min(1, "Shipment type is required"),
  weight: z.string().min(1, "Weight is required"),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  deliveryMode: z.string().min(1, "Delivery mode is required"),
  pickupRequired: z.boolean().default(true),
  pickupDate: z.string().optional(),
  specialInstructions: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingResult {
  trackingNumber: string;
  estimatedDelivery: string;
  estimatedPrice: number;
}

export default function Book() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [bookingFormData, setBookingFormData] = useState<BookingFormData | null>(null);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      senderName: "",
      senderPhone: "",
      senderEmail: "",
      senderAddress: "",
      senderCity: "",
      receiverName: "",
      receiverPhone: "",
      receiverEmail: "",
      receiverAddress: "",
      receiverCity: "",
      receiverCountry: "",
      shipmentType: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      deliveryMode: "",
      pickupRequired: true,
      pickupDate: "",
      specialInstructions: "",
    },
  });

  // Helper function to generate tracking ID
  const generateTrackingId = (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `GC-UAE-${year}-${random}`;
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          weight: parseFloat(data.weight),
          length: data.length ? parseFloat(data.length) : null,
          width: data.width ? parseFloat(data.width) : null,
          height: data.height ? parseFloat(data.height) : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create booking");

      const result = await response.json();
      const trackingId = result.trackingNumber;

      // Write to Firestore: Create pickup request, shipment, and public tracking data
      const batch = writeBatch(db);
      const now = Timestamp.now();

      // Map senderCity to emirate (assuming UAE cities map to emirates)
      const cityToEmirate: Record<string, string> = {
        "Dubai": "Dubai",
        "Abu Dhabi": "Abu Dhabi",
        "Sharjah": "Sharjah",
        "Ajman": "Ajman",
        "Ras Al Khaimah": "Ras Al Khaimah",
        "Fujairah": "Fujairah",
        "Umm Al Quwain": "Umm Al Quwain",
      };
      const originEmirate = cityToEmirate[data.senderCity] || data.senderCity;
      const destinationEmirate = data.receiverCountry === "UAE"
        ? (cityToEmirate[data.receiverCity] || data.receiverCity)
        : data.receiverCountry;

      // 1. Create pickup request if pickup is required
      if (data.pickupRequired) {
        const pickupRef = doc(collection(db, "pickups"));
        batch.set(pickupRef, {
          name: data.senderName,
          phone: data.senderPhone,
          email: data.senderEmail,
          address: data.senderAddress,
          emirate: originEmirate,
          city: data.senderCity,
          status: "pending",
          pickupDate: data.pickupDate || null,
          specialInstructions: data.specialInstructions || null,
          trackingNumber: trackingId,
          createdAt: now,
          updatedAt: now,
        });
      }

      // 2. Create shipment document
      const shipmentRef = doc(collection(db, "shipments"));
      const shipmentData = {
        trackingId: trackingId,
        senderName: data.senderName,
        senderPhone: data.senderPhone,
        senderEmail: data.senderEmail,
        senderAddress: data.senderAddress,
        originEmirate: originEmirate,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        receiverEmail: data.receiverEmail || null,
        receiverAddress: data.receiverAddress,
        destinationEmirate: destinationEmirate,
        receiverCountry: data.receiverCountry,
        serviceType: data.deliveryMode,
        parcelWeight: parseFloat(data.weight),
        shipmentType: data.shipmentType,
        deliveryMode: data.deliveryMode,
        pickupRequired: data.pickupRequired || false,
        status: "pending",
        estimatedDelivery: result.estimatedDelivery,
        amountPaid: 0, // Will be updated when payment is processed
        notes: data.specialInstructions || null,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(shipmentRef, shipmentData);

      // 3. Create public tracking data (only non-sensitive fields)
      const publicTrackingRef = doc(db, "publicTrackingData", trackingId);
      batch.set(publicTrackingRef, {
        trackingId: trackingId,
        status: "pending",
        originEmirate: originEmirate,
        destinationEmirate: destinationEmirate,
        createdAt: now,
        updatedAt: now,
      });

      // Commit all writes
      await batch.commit();

      setBookingFormData(data); // Store form data for PDF receipt generation
      setBookingResult(result);
      toast({
        title: "Booking Confirmed!",
        description: `Your tracking number is ${result.trackingNumber}`,
      });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTrackingNumber = () => {
    if (bookingResult) {
      navigator.clipboard.writeText(bookingResult.trackingNumber);
      toast({ title: "Copied!", description: "Tracking number copied to clipboard." });
    }
  };

  const downloadPDFReceipt = () => {
    if (!bookingResult || !bookingFormData) {
      toast({
        title: "Error",
        description: "Booking information not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();

      // Company Header
      doc.setFontSize(20);
      doc.setTextColor(124, 45, 255); // Purple color
      doc.text("Gulf Express", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Shipping Receipt", 105, 30, { align: "center" });

      // Line
      doc.setDrawColor(124, 45, 255);
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);

      let yPos = 45;

      // Booking Details
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Booking Details", 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Tracking Number: ${bookingResult.trackingNumber}`, 20, yPos);
      yPos += 7;

      const bookingDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      doc.text(`Booking Date & Time: ${bookingDate}`, 20, yPos);
      yPos += 7;
      doc.text(`Estimated Delivery: ${bookingResult.estimatedDelivery}`, 20, yPos);
      yPos += 7;
      doc.text(`Estimated Price: AED ${bookingResult.estimatedPrice.toFixed(2)}`, 20, yPos);
      yPos += 15;

      // Customer Information
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Customer Information", 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${bookingFormData.senderName}`, 20, yPos);
      yPos += 7;
      doc.text(`Phone: ${bookingFormData.senderPhone}`, 20, yPos);
      yPos += 7;
      doc.text(`Email: ${bookingFormData.senderEmail}`, 20, yPos);
      yPos += 7;

      // Handle long addresses
      const addressLines = doc.splitTextToSize(`Address: ${bookingFormData.senderAddress}`, 170);
      doc.text(addressLines, 20, yPos);
      yPos += addressLines.length * 7;

      doc.text(`City: ${bookingFormData.senderCity}`, 20, yPos);
      yPos += 15;

      // Shipment Details
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Shipment Details", 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Receiver Name: ${bookingFormData.receiverName}`, 20, yPos);
      yPos += 7;
      doc.text(`Receiver Phone: ${bookingFormData.receiverPhone}`, 20, yPos);
      yPos += 7;

      const receiverAddressLines = doc.splitTextToSize(
        `Receiver Address: ${bookingFormData.receiverAddress}`,
        170
      );
      doc.text(receiverAddressLines, 20, yPos);
      yPos += receiverAddressLines.length * 7;

      doc.text(`Receiver City: ${bookingFormData.receiverCity}`, 20, yPos);
      yPos += 7;
      doc.text(`Receiver Country: ${bookingFormData.receiverCountry}`, 20, yPos);
      yPos += 7;

      // Format shipment type
      const shipmentTypeMap: Record<string, string> = {
        documents: "Documents",
        parcels: "Parcels",
        freight: "Freight / Cargo"
      };
      doc.text(`Shipment Type: ${shipmentTypeMap[bookingFormData.shipmentType] || bookingFormData.shipmentType}`, 20, yPos);
      yPos += 7;
      doc.text(`Weight: ${bookingFormData.weight} kg`, 20, yPos);
      yPos += 7;

      // Format delivery mode
      const deliveryModeMap: Record<string, string> = {
        "same-day": "Same Day",
        "next-day": "Next Day",
        "express": "Express (2-3 days)",
        "economy": "Economy (5-7 days)"
      };
      doc.text(`Delivery Mode: ${deliveryModeMap[bookingFormData.deliveryMode] || bookingFormData.deliveryMode}`, 20, yPos);
      yPos += 10;

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("Thank you for choosing Gulf Express!", 105, 280, { align: "center" });
      doc.text("For inquiries, contact: support@gulfexpress.org", 105, 285, { align: "center" });

      // Save PDF
      doc.save(`Receipt-${bookingResult.trackingNumber}.pdf`);

      toast({
        title: "Success",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF receipt",
        variant: "destructive",
      });
    }
  };

  if (bookingResult) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-booking-success">
        <Header />
        <main className="pt-32 pb-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8 border-0 shadow-xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Booking Confirmed!
              </h1>
              <p className="text-muted-foreground mb-8">
                Your shipment has been booked successfully. Use your tracking number to monitor the delivery status.
              </p>

              <div className="bg-muted/50 rounded-xl p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-2">Tracking Number</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-bold font-mono text-foreground" data-testid="text-tracking-number">
                    {bookingResult.trackingNumber}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyTrackingNumber}
                    data-testid="button-copy-tracking"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  <p className="text-lg font-semibold text-foreground">{bookingResult.estimatedDelivery}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground">Estimated Price</p>
                  <p className="text-lg font-semibold text-foreground">AED {bookingResult.estimatedPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <Button
                  onClick={downloadPDFReceipt}
                  variant="outline"
                  className="w-full rounded-full"
                  data-testid="button-download-receipt"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download Receipt (PDF)
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/track?id=${bookingResult.trackingNumber}`} className="flex-1">
                  <Button className="w-full rounded-full bg-gradient-purple" data-testid="button-track-booking">
                    Track Shipment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full rounded-full" data-testid="button-back-home">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-book">
      <Header />
      <main>
        <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Book a Shipment
            </h1>
            <p className="text-xl text-white/80">
              Fill in the details below to schedule your pickup and delivery.
              Fast, reliable, and fully tracked.
            </p>
          </div>
        </section>

        <section className="py-20" data-testid="section-booking-form">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8 border-0 shadow-xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      Sender Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="senderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} className="h-12 rounded-xl" data-testid="input-sender-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="senderPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+971 XX XXX XXXX" {...field} className="h-12 rounded-xl" data-testid="input-sender-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="senderEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} className="h-12 rounded-xl" data-testid="input-sender-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="senderCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl" data-testid="select-sender-city">
                                  <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {uaeCities.map((city) => (
                                  <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="senderAddress"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Full address for pickup" {...field} className="h-12 rounded-xl" data-testid="input-sender-address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      Receiver Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="receiverName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Receiver's name" {...field} className="h-12 rounded-xl" data-testid="input-receiver-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="receiverPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+971 XX XXX XXXX" {...field} className="h-12 rounded-xl" data-testid="input-receiver-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="receiverEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="receiver@email.com" {...field} className="h-12 rounded-xl" data-testid="input-receiver-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="receiverCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl" data-testid="select-receiver-country">
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="receiverCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Delivery city" {...field} className="h-12 rounded-xl" data-testid="input-receiver-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="receiverAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Full delivery address" {...field} className="h-12 rounded-xl" data-testid="input-receiver-address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      Package Details
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="shipmentType"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Shipment Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl" data-testid="select-shipment-type">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {shipmentTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} className="h-12 rounded-xl" data-testid="input-weight" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Optional" {...field} className="h-12 rounded-xl" data-testid="input-length" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Optional" {...field} className="h-12 rounded-xl" data-testid="input-width" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Optional" {...field} className="h-12 rounded-xl" data-testid="input-height" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      Delivery Options
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="deliveryMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Speed</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl" data-testid="select-delivery-mode">
                                  <SelectValue placeholder="Select speed" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {deliveryModes.map((mode) => (
                                  <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pickupDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Pickup Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-12 rounded-xl" data-testid="input-pickup-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="pickupRequired"
                      render={({ field }) => (
                        <FormItem className="mt-4 flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                          <div>
                            <FormLabel className="text-base font-medium">Pickup Required?</FormLabel>
                            <p className="text-sm text-muted-foreground">We'll collect the package from your location</p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-pickup-required"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special handling instructions or notes..."
                              {...field}
                              className="min-h-24 rounded-xl resize-none"
                              data-testid="textarea-instructions"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-xl bg-gradient-purple hover:opacity-90 shadow-glow-sm font-semibold text-lg"
                    data-testid="button-submit-booking"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Package className="w-5 h-5 mr-2" />
                    )}
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
