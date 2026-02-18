import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Loader2, CheckCircle2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Contact() {
  const { data: settings } = useQuery({
    queryKey: ["/api/settings/integrations"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/settings/integrations");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: [settings?.contactAddress || "Tower A, Level 3, Business Bay, Dubai, UAE"],
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: settings?.contactPhone ? settings.contactPhone.split(',').map((p: string) => p.trim()) : ["+971 4 123 4567", "+971 50 987 6543"],
      color: "from-green-400 to-green-600",
    },
    {
      icon: Mail,
      title: "Email Us",
      details: settings?.contactEmail ? settings.contactEmail.split(',').map((e: string) => e.trim()) : ["info@gulfexpress.org", "support@gulfexpress.org"],
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: settings?.workingHours ? settings.workingHours.split('\n').map((h: string) => h.trim()) : ["Mon-Sat: 8:00 AM - 8:00 PM", "Sun: 9:00 AM - 6:00 PM"],
      color: "from-orange-400 to-orange-600",
    },
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Write directly to Firestore /inquiries/ collection
      await addDoc(collection(db, "inquiries"), {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        timestamp: Timestamp.now(),
        status: "new", // Optional: track message status
      });

      setIsSuccess(true);
      form.reset();
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-contact">
      <Header />
      <main>
        <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-white/80">
              Have questions or need assistance? We're here to help.
              Reach out to us through any of the channels below.
            </p>
          </div>
        </section>

        <section className="py-20" data-testid="section-contact">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow text-center"
                  data-testid={`card-contact-info-${index}`}
                >
                  <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <info.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{info.title}</h3>
                  {info.details.map((detail: string, i: number) => (
                    <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                  ))}
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <Card className="p-8 border-0 shadow-xl">
                {isSuccess ? (
                  <div className="text-center py-12" data-testid="contact-success">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">
                      Message Sent Successfully!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. Our team will get back to you within 24 hours.
                    </p>
                    <Button
                      onClick={() => setIsSuccess(false)}
                      className="rounded-full bg-gradient-purple"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your name" {...field} className="h-12 rounded-xl" data-testid="input-contact-name" />
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
                                  <Input type="email" placeholder="your@email.com" {...field} className="h-12 rounded-xl" data-testid="input-contact-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="How can we help you?" {...field} className="h-12 rounded-xl" data-testid="input-contact-subject" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us more about your inquiry..."
                                  {...field}
                                  className="min-h-32 rounded-xl resize-none"
                                  data-testid="textarea-contact-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="w-full h-14 rounded-xl bg-gradient-purple hover:opacity-90 shadow-glow-sm font-semibold text-lg"
                          data-testid="button-contact-submit"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          ) : (
                            <Send className="w-5 h-5 mr-2" />
                          )}
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </Form>
                  </>
                )}
              </Card>

              <div className="space-y-6">
                <Card className="overflow-hidden border-0 shadow-xl">
                  <div className="p-4 bg-gradient-purple text-white">
                    <h3 className="text-lg font-semibold">Find Us</h3>
                    <p className="text-sm text-white/80">Dubai Business Bay Office</p>
                  </div>
                  <div className="h-64 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {settings?.contactAddress || "Tower A, Level 3\nBusiness Bay, Dubai, UAE"}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-full"
                        onClick={() => window.open("https://www.google.com/maps?q=25.1865,55.2730", "_blank")}
                        data-testid="button-view-map"
                      >
                        View on Google Maps
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-0 shadow-xl">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    Quick Support via WhatsApp
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    For faster support, chat with us on WhatsApp. Our team typically responds within minutes.
                  </p>
                  <Button
                    className="w-full rounded-full bg-green-500 hover:bg-green-600"
                    onClick={() => window.open(`https://wa.me/${settings?.whatsappNumber || "971412345678"}`, "_blank")}
                    data-testid="button-whatsapp-contact"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </Card>

                <Card className="p-6 border-0 shadow-xl">
                  <h3 className="text-lg font-semibold text-foreground mb-4">FAQs</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">What are your delivery hours?</p>
                      <p className="text-muted-foreground">We deliver Mon-Sat 8AM-8PM, Sun 9AM-6PM.</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">How can I track my package?</p>
                      <p className="text-muted-foreground">Use your tracking number on our Track page.</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Do you offer same-day delivery?</p>
                      <p className="text-muted-foreground">Yes, for orders placed before 12PM within UAE.</p>
                    </div>
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
