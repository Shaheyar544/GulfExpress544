import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Package, Truck, Plane, Clock, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const uaeCities = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];
const countries = [
  "UAE", "Saudi Arabia", "Qatar", "Oman", "Bahrain", "Kuwait",
  "United States", "United Kingdom", "Germany", "France", "India",
  "Pakistan", "Philippines", "Canada", "Australia", "Singapore",
  "Malaysia", "China", "Japan", "South Korea", "Other"
];
const shipmentTypes = [
  { value: "documents", label: "Documents", maxWeight: 2 },
  { value: "parcels", label: "Parcels", maxWeight: 30 },
  { value: "freight", label: "Freight / Cargo", maxWeight: 1000 },
];
const deliveryModes = [
  { value: "same-day", label: "Same Day", description: "Delivery within hours", icon: Clock },
  { value: "next-day", label: "Next Day", description: "By tomorrow noon", icon: Truck },
  { value: "express", label: "Express", description: "2-3 business days", icon: Plane },
  { value: "economy", label: "Economy", description: "5-7 business days", icon: Package },
];

const quotationSchema = z.object({
  senderName: z.string().min(2, "Name must be at least 2 characters"),
  senderCity: z.string().min(1, "Please select a city"),
  receiverCountry: z.string().min(1, "Please select a country"),
  shipmentType: z.string().min(1, "Please select shipment type"),
  weight: z.string().min(1, "Please enter weight").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Weight must be a positive number"),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  deliveryMode: z.string().min(1, "Please select delivery speed"),
  pickupRequired: z.boolean().default(true),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email"),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

interface QuoteResult {
  estimatedPrice: number;
  currency: string;
  breakdown: {
    basePrice: number;
    weightCharge: number;
    speedCharge: number;
    pickupCharge: number;
  };
  deliveryTime: string;
}

export default function Quotation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const { toast } = useToast();

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      senderName: "",
      senderCity: "",
      receiverCountry: "",
      shipmentType: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      deliveryMode: "",
      pickupRequired: true,
      phone: "",
      email: "",
    },
  });

  const onSubmit = async (data: QuotationFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/quotations", {
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

      if (!response.ok) throw new Error("Failed to get quote");

      const result = await response.json();
      setQuoteResult(result);
      toast({
        title: "Quote Generated!",
        description: "Your price estimate is ready below.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-quotation">
      <Header />
      <main>
        <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Get a Quote
            </h1>
            <p className="text-xl text-white/80">
              Fill in your shipment details and get an instant price estimate.
              Transparent pricing with no hidden fees.
            </p>
          </div>
        </section>

        <section className="py-20" data-testid="section-quotation-form">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="p-8 border-0 shadow-xl">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center text-white text-sm font-bold">1</span>
                          Sender Details
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="senderName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your name" {...field} className="h-12 rounded-xl" data-testid="input-sender-name" />
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
                                <FormLabel>From City</FormLabel>
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
                        </div>
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center text-white text-sm font-bold">2</span>
                          Shipment Details
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="receiverCountry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Destination Country</FormLabel>
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
                            name="shipmentType"
                            render={({ field }) => (
                              <FormItem>
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
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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
                        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center text-white text-sm font-bold">3</span>
                          Delivery Options
                        </h2>
                        <FormField
                          control={form.control}
                          name="deliveryMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery Speed</FormLabel>
                              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                                {deliveryModes.map((mode) => (
                                  <div
                                    key={mode.value}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${field.value === mode.value
                                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                        : "border-border hover:border-purple-300"
                                      }`}
                                    onClick={() => field.onChange(mode.value)}
                                    data-testid={`option-delivery-${mode.value}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${field.value === mode.value
                                          ? "bg-gradient-purple text-white"
                                          : "bg-muted text-muted-foreground"
                                        }`}>
                                        <mode.icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-foreground">{mode.label}</p>
                                        <p className="text-sm text-muted-foreground">{mode.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pickupRequired"
                          render={({ field }) => (
                            <FormItem className="mt-6 flex items-center justify-between p-4 bg-muted/50 rounded-xl">
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
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center text-white text-sm font-bold">4</span>
                          Contact Information
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="+971 XX XXX XXXX" {...field} className="h-12 rounded-xl" data-testid="input-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your@email.com" {...field} className="h-12 rounded-xl" data-testid="input-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full h-14 rounded-xl bg-gradient-purple hover:opacity-90 shadow-glow-sm font-semibold text-lg"
                        data-testid="button-get-quote"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <Calculator className="w-5 h-5 mr-2" />
                        )}
                        {isSubmitting ? "Calculating..." : "Get Instant Quote"}
                      </Button>
                    </form>
                  </Form>
                </Card>
              </div>

              <div className="space-y-6">
                {quoteResult ? (
                  <Card className="p-6 border-0 shadow-xl bg-gradient-purple text-white sticky top-24" data-testid="quote-result">
                    <h3 className="text-lg font-semibold mb-4">Your Quote</h3>
                    <div className="text-center py-6 border-y border-white/20">
                      <p className="text-sm text-white/80">Estimated Price</p>
                      <p className="text-4xl font-bold mt-1">
                        {quoteResult.currency} {quoteResult.estimatedPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-white/60 mt-2">{quoteResult.deliveryTime}</p>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/80">Base Price</span>
                        <span>{quoteResult.currency} {quoteResult.breakdown.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Weight Charge</span>
                        <span>{quoteResult.currency} {quoteResult.breakdown.weightCharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Speed Charge</span>
                        <span>{quoteResult.currency} {quoteResult.breakdown.speedCharge.toFixed(2)}</span>
                      </div>
                      {quoteResult.breakdown.pickupCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-white/80">Pickup Fee</span>
                          <span>{quoteResult.currency} {quoteResult.breakdown.pickupCharge.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full mt-6 bg-white text-purple-700 hover:bg-white/90 rounded-full"
                      data-testid="button-proceed-booking"
                    >
                      Proceed to Booking
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-6 border-0 shadow-xl sticky top-24">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Why Choose Us</h3>
                    <div className="space-y-4">
                      {[
                        { title: "No Hidden Fees", desc: "Transparent pricing" },
                        { title: "Instant Estimates", desc: "Get your quote in seconds" },
                        { title: "Best Rates", desc: "Competitive pricing" },
                        { title: "Full Insurance", desc: "Package protection included" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="p-6 border-0 shadow-xl">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our team is available 24/7 to assist you with any questions.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium text-foreground">+971 4 123 4567</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-foreground">quotes@gulfexpress.org</span>
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
