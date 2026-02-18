import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdSenseScript() {
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
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    useEffect(() => {
        if (settings?.adsensePublisherId) {
            if (!document.getElementById("adsense-script")) {
                const script = document.createElement("script");
                script.id = "adsense-script";
                script.async = true;
                script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsensePublisherId}`;
                script.crossOrigin = "anonymous";
                document.head.appendChild(script);
            }
        }
    }, [settings]);

    return null;
}
