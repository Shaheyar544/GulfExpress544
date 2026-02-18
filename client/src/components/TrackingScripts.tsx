import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function TrackingScripts() {
    const { data: settings } = useQuery({
        queryKey: ["/api/settings/integrations"],
        queryFn: async () => {
            try {
                const res = await apiRequest("GET", "/api/settings/integrations");
                return res.json();
            } catch (err) {
                console.error("Failed to fetch tracking settings", err);
                return null;
            }
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: false,
    });

    useEffect(() => {
        if (!settings) return;

        // Google Analytics Injection
        if (settings.googleAnalyticsId) {
            if (!document.getElementById("ga-script")) {
                // Main gtag.js script
                const script = document.createElement("script");
                script.id = "ga-script";
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`;
                document.head.appendChild(script);

                // Configuration script
                const configScript = document.createElement("script");
                configScript.id = "ga-config-script";
                configScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${settings.googleAnalyticsId}');
        `;
                document.head.appendChild(configScript);
            }
        }

        // Google Verification Tag Injection
        if (settings.googleVerificationTag) {
            // Basic parsing to handle full tag or just content
            let content = settings.googleVerificationTag;

            // If user pasted full tag, try to extract content
            if (content.includes("content=")) {
                const match = content.match(/content=["'](.*?)["']/);
                if (match && match[1]) {
                    content = match[1];
                }
            }

            if (!document.querySelector('meta[name="google-site-verification"]')) {
                const meta = document.createElement("meta");
                meta.name = "google-site-verification";
                meta.content = content;
                document.head.appendChild(meta);
            }
        }



    }, [settings]);

    return null; // This component does not render visual UI
}
