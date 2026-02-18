import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const contactSettingsSchema = z.object({
    whatsappNumber: z.string().optional(),
    contactAddress: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().optional(),
    workingHours: z.string().optional(),
});

type ContactSettingsFormValues = z.infer<typeof contactSettingsSchema>;

export default function ContactSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<ContactSettingsFormValues>({
        resolver: zodResolver(contactSettingsSchema),
        defaultValues: {
            whatsappNumber: "",
            contactAddress: "",
            contactPhone: "",
            contactEmail: "",
            workingHours: "",
        },
    });

    const { data: settings, isLoading } = useQuery({
        queryKey: ["/api/settings/integrations"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/settings/integrations");
            return res.json();
        }
    });

    useEffect(() => {
        if (settings) {
            form.reset({
                whatsappNumber: settings.whatsappNumber || "",
                contactAddress: settings.contactAddress || "",
                contactPhone: settings.contactPhone || "",
                contactEmail: settings.contactEmail || "",
                workingHours: settings.workingHours || "",
            });
        }
    }, [settings, form]);

    const mutation = useMutation({
        mutationFn: async (data: ContactSettingsFormValues) => {
            // Preserve existing integration settings by merging with current data if needed, 
            // but the API endpoint handles partial updates if we structure it right.
            // However, our current API endpoint expects all fields or partials.
            // We will send just the contact fields. API should be updated to handle partials gracefully (it currently does).
            await apiRequest("POST", "/api/settings/integrations", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/settings/integrations"] });
            toast({
                title: "Settings saved",
                description: "Contact information has been updated successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to save settings. Please try again.",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: ContactSettingsFormValues) => {
        mutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                    Update your business contact details and social links.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="whatsappNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>WhatsApp Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="971xxxxxxxxx" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        International format without '+' (e.g., 971501234567).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="contactPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Numbers</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+971 4 123 4567, +971 50 987 6543" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Separate multiple numbers with commas.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contactEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Addresses</FormLabel>
                                        <FormControl>
                                            <Input placeholder="info@gulfexpress.org" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Separate multiple emails with commas.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="contactAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Physical Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Tower A, Level 3, Business Bay, Dubai, UAE" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="workingHours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Working Hours</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Mon-Sat: 8:00 AM - 8:00 PM&#10;Sun: 9:00 AM - 6:00 PM"
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter each schedule on a new line or separate by commas.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Contact Info
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
