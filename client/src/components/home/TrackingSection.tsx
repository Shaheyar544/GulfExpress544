import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, MapPin, Clock, CheckCircle2 } from "lucide-react";

export function TrackingSection() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [, setLocation] = useLocation();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setLocation(`/track?id=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  return (
    <section className="py-20 md:py-32 bg-muted/30" data-testid="section-tracking">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              Real-Time Tracking
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Track Your Shipment{" "}
              <span className="bg-gradient-purple bg-clip-text text-transparent">In Real-Time</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Know exactly where your package is at every step of the journey. 
              Enter your tracking number to get instant updates.
            </p>
            
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter tracking number (e.g., GC-UAE-2024-1234)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="pl-12 h-14 rounded-full text-base bg-background border-input"
                  data-testid="input-tracking-number"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 rounded-full bg-gradient-purple hover:opacity-90 shadow-glow-sm font-semibold"
                data-testid="button-track-now"
              >
                Track Now
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Live GPS Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>SMS & Email Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Proof of Delivery</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl blur-3xl" />
            
            <div className="relative bg-card rounded-3xl shadow-xl p-8 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-purple rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">GC-UAE-2024-1234</p>
                    <p className="text-sm text-muted-foreground">Express Delivery</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  In Transit
                </span>
              </div>

              <div className="relative pl-4 space-y-0">
                {[
                  { status: "Package Picked Up", location: "Abu Dhabi Warehouse", time: "09:30 AM", completed: true },
                  { status: "In Transit", location: "Dubai Distribution Center", time: "11:45 AM", completed: true },
                  { status: "Out for Delivery", location: "Dubai, Business Bay", time: "02:15 PM", completed: false, current: true },
                  { status: "Delivered", location: "Destination", time: "Est. 04:30 PM", completed: false },
                ].map((step, index) => (
                  <div key={index} className="relative pb-8 last:pb-0">
                    {index < 3 && (
                      <div className={`absolute left-0 top-3 w-0.5 h-full ${
                        step.completed ? "bg-gradient-to-b from-purple-500 to-purple-500" : "bg-gray-200 dark:bg-gray-700"
                      }`} />
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className={`relative z-10 w-3 h-3 rounded-full mt-1.5 ${
                        step.completed 
                          ? "bg-purple-500 ring-4 ring-purple-500/20" 
                          : step.current 
                            ? "bg-purple-500 ring-4 ring-purple-500/30 animate-pulse" 
                            : "bg-gray-300 dark:bg-gray-600"
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${step.completed || step.current ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.status}
                          </p>
                          <span className={`text-sm ${step.completed ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                            {step.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {step.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Estimated Delivery: Today, 4:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
