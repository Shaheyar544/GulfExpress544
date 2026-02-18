import { useState, useEffect } from "react";
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

const integrationsSchema = z.object({
    googleAnalyticsId: z.string().optional(),
    googleVerificationTag: z.string().optional(),
    adsensePublisherId: z.string().optional(),
    genericVerificationTag: z.string().optional(),
    trackingNumberPattern: z.string().optional(),
});

type IntegrationsFormValues = z.infer<typeof integrationsSchema>;

export default function IntegrationsSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<IntegrationsFormValues>({
        resolver: zodResolver(integrationsSchema),
        defaultValues: {
            googleAnalyticsId: "",
            googleVerificationTag: "",
            adsensePublisherId: "",
            genericVerificationTag: "",
            trackingNumberPattern: "",
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
                googleAnalyticsId: settings.googleAnalyticsId || "",
                googleVerificationTag: settings.googleVerificationTag || "",
                adsensePublisherId: settings.adsensePublisherId || "",
                genericVerificationTag: settings.genericVerificationTag || "",
                trackingNumberPattern: settings.trackingNumberPattern || "",
            });
        }
    }, [settings, form]);

    const mutation = useMutation({
        mutationFn: async (data: IntegrationsFormValues) => {
            await apiRequest("POST", "/api/settings/integrations", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/settings/integrations"] });
            toast({
                title: "Settings saved",
                description: "Integration settings have been updated successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: `Failed to save settings: ${error.message}`,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: IntegrationsFormValues) => {
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
                <CardTitle>Website Integrations</CardTitle>
                <CardDescription>
                    Configure third-party integrations for analytics and verification.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="trackingNumberPattern"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tracking Number Pattern</FormLabel>
                                    <FormControl>
                                        <Input placeholder="GC-UAE-{year}-{random}" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Define the format for tracking numbers. Available placeholders:
                                        <code className="mx-1">{`{year}`}</code>,
                                        <code className="mx-1">{`{month}`}</code>,
                                        <code className="mx-1">{`{day}`}</code>,
                                        <code className="mx-1">{`{random}`}</code>,
                                        <code className="mx-1">{`{uuid}`}</code>.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="googleAnalyticsId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Google Analytics ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="G-XXXXXXXXXX" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Your Google Analytics 4 Measurement ID.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="googleVerificationTag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Google Verification Tag</FormLabel>
                                    <FormControl>
                                        <Input placeholder='<meta name="google-site-verification" content="..." />' {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The HTML meta tag provided by Google Search Console.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="adsensePublisherId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>AdSense Publisher ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="pub-XXXXXXXXXXXXXXXX" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Your Google AdSense Publisher ID.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="genericVerificationTag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Generic Verification Meta Tag</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='<meta name="bing-site-verification" content="..." />'
                                            className="min-h-[100px] font-mono text-xs"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Paste any other required meta tags here (e.g., for Bing, Pinterest).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
