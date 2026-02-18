import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AdUnitProps {
    slot: string;
    format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
    responsive?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export default function AdUnit({
    slot,
    format = "auto",
    responsive = true,
    className,
    style
}: AdUnitProps) {
    const adRef = useRef<HTMLModElement>(null);
    const initialized = useRef(false);

    // Fetch settings to get Client ID
    const { data: settings } = useQuery({
        queryKey: ["/api/settings/integrations"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/settings/integrations");
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        // Only push if settings loaded, ref exists, and not already initialized
        if (settings?.adsensePublisherId && adRef.current && !initialized.current) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                initialized.current = true;
            } catch (err) {
                console.error("AdSense push error:", err);
            }
        }
    }, [settings, slot]);

    if (!settings?.adsensePublisherId) return null;

    return (
        <div className={className} style={{ minHeight: "280px", ...style }}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={settings.adsensePublisherId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </div>
    );
}
