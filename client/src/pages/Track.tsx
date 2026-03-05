import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Package, MapPin, Clock, CheckCircle2, Truck, AlertCircle, RefreshCw } from "lucide-react";

interface TrackingResult {
  trackingNumber: string;
  status: "pending" | "in-transit" | "out-for-delivery" | "delivered" | "returned";
  senderName: string;
  senderCity: string;
  receiverName: string;
  receiverCity: string;
  receiverCountry: string;
  weight: number;
  estimatedDelivery: string;
  shipmentMode?: "standard" | "return";
  linkedOrderId?: string | null;
  itemName?: string | null;
  itemValue?: number | null;
  timeline: {
    status: string;
    location: string;
    date: string;
    time: string;
    completed: boolean;
    current?: boolean;
    remarks?: string;
  }[];
}

const statusColors: Record<string, string> = {
  "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "in-transit": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "out-for-delivery": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "delivered": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "returned": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  "pending": "Pending",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  "delivered": "Delivered",
  "returned": "Returned",
};

export default function Track() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const initialId = urlParams.get("id") || "";

  const [trackingNumber, setTrackingNumber] = useState(initialId);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Query public tracking data collection (no authentication required)
      const trackingId = trackingNumber.trim().toUpperCase();
      const trackingRef = doc(db, "publicTrackingData", trackingId);
      const trackingSnap = await getDoc(trackingRef);

      if (!trackingSnap.exists()) {
        setError("Shipment not found. Please check your tracking number.");
        setResult(null);
        return;
      }

      const trackingData = trackingSnap.data();

      // Fetch real timeline from subcollection instead of generating fake data
      let timeline: any[] = [];
      try {
        // Get the shipment ID from publicTrackingData (we need to find the shipment document)
        // Since we don't have direct access to the shipment ID, we'll try to fetch from the timeline
        // using the tracking ID as the shipment ID (this assumes they match or we have a reference)

        // First, try to get timeline from a shipments collection using trackingId
        const shipmentsRef = collection(db, "shipments");
        const shipmentsQuery = query(shipmentsRef);
        const shipmentsSnap = await getDocs(shipmentsQuery);

        let shipmentId: string | null = null;
        shipmentsSnap.forEach((doc) => {
          if (doc.data().trackingId === trackingId) {
            shipmentId = doc.id;
          }
        });

        if (shipmentId) {
          const timelineRef = collection(db, "shipments", shipmentId, "timeline");
          const timelineQuery = query(timelineRef, orderBy("timestamp", "asc")); // Ascending for display
          const timelineSnap = await getDocs(timelineQuery);

          timeline = timelineSnap.docs.map(doc => {
            const data = doc.data();
            const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();

            return {
              status: formatStatusLabel(data.status),
              location: getLocationForStatus(data.status, trackingData),
              date: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              time: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
              completed: true,
              current: false,
              remarks: data.remarks || (data.status === 'delivered' ? `Received by: ${trackingData.receiverName || 'Recipient'}` : undefined)
            };
          });

          // Mark the last item as current if not delivered
          if (timeline.length > 0 && trackingData.status !== 'delivered') {
            timeline[timeline.length - 1].current = true;
          }
        }
      } catch (timelineError) {
        console.error("Error fetching timeline:", timelineError);
      }

      // Fallback to generated timeline if no real timeline exists
      if (timeline.length === 0) {
        timeline = generateTimeline(trackingData.status, trackingData);
      }

      // Format result to match expected interface
      setResult({
        trackingNumber: trackingData.trackingId,
        status: trackingData.status || "pending",
        senderName: trackingData.senderName || "Sender",
        senderCity: trackingData.originEmirate || "UAE",
        receiverName: trackingData.receiverName || "Receiver",
        receiverCity: trackingData.destinationEmirate || "",
        receiverCountry: "UAE",
        weight: trackingData.weight || 0,
        estimatedDelivery: trackingData.updatedAt
          ? new Date(trackingData.updatedAt.toDate()).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
          : "Pending",
        shipmentMode: trackingData.shipmentMode || "standard",
        linkedOrderId: trackingData.linkedOrderId || null,
        itemName: trackingData.itemName || null,
        itemValue: trackingData.itemValue || null,
        timeline,
      });
    } catch (err: any) {
      console.error("Error tracking shipment:", err);
      setError(err.message || "Unable to fetch tracking information. Please try again.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format status labels for display
  const formatStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'pending': 'Order Received',
      'in-transit': 'In Transit',
      'out-for-delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'returned': 'Returned',
    };
    return labels[status] || status;
  };

  // Helper function to get location based on status
  const getLocationForStatus = (status: string, trackingData: any): string => {
    switch (status) {
      case 'pending':
        return 'Gulf Courier HQ';
      case 'in-transit':
        return 'Dubai Distribution Center';
      case 'out-for-delivery':
        return `${trackingData.destinationEmirate || 'Destination'}, UAE`;
      case 'delivered':
        return `${trackingData.destinationEmirate || 'Destination'}, UAE`;
      case 'returned':
        return `${trackingData.originEmirate || 'Origin'}, UAE`;
      default:
        return 'Processing Center';
    }
  };

  // Helper function to generate timeline based on shipment status
  const generateTimeline = (status: string, trackingData: any) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Map status to timeline progression
    const statusMap: Record<string, number> = {
      'pending': 0,
      'in-transit': 1,
      'out-for-delivery': 2,
      'delivered': 3,
      'returned': -1, // Special case
    };

    const statusIndex = statusMap[status] !== undefined ? statusMap[status] : 0;

    // Handle returned status
    if (status === 'returned') {
      return [
        {
          status: "Order Received",
          location: "Gulf Express HQ",
          date: yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: "08:00 AM",
          completed: true,
          current: false,
        },
        {
          status: "In Transit",
          location: "Distribution Center",
          date: yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: "11:45 AM",
          completed: true,
          current: false,
        },
        {
          status: "Returned",
          location: `${trackingData.originEmirate || 'Origin'}, UAE`,
          date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: "02:30 PM",
          completed: true,
          current: true,
        },
      ];
    }

    const timelineSteps = [
      {
        status: "In Transit",
        location: "Dubai Distribution Center",
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: "11:45 AM",
        completed: statusIndex >= 1,
        current: statusIndex === 1,
      },
      {
        status: "Out for Delivery",
        location: `${trackingData.destinationEmirate || 'Destination'}, UAE`,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: "02:15 PM",
        completed: statusIndex >= 2,
        current: statusIndex === 2,
      },
      {
        status: "Delivered",
        location: `${trackingData.destinationEmirate || 'Destination'}, UAE`,
        date: statusIndex >= 3
          ? now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : "Pending",
        time: statusIndex >= 3 ? "04:30 PM" : "Est. 04:30 PM",
        completed: statusIndex >= 3,
        current: statusIndex === 3,
      },
    ];

    // If status is pending, show initial state
    if (statusIndex === 0) {
      return [
        {
          status: "Order Received",
          location: "Gulf Courier HQ",
          date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: "08:00 AM",
          completed: true,
          current: false,
        },
        {
          status: "Awaiting Processing",
          location: `${trackingData.originEmirate || 'Origin'}, UAE`,
          date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: "Scheduled",
          completed: false,
          current: true,
        },
        ...timelineSteps.map(step => ({ ...step, completed: false, current: false })),
      ];
    }

    // For other statuses, prepend "Order Received" step
    return [
      {
        status: "Order Received",
        location: "Gulf Courier HQ",
        date: yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: "08:00 AM",
        completed: true,
        current: false,
      },
      ...timelineSteps.map(step => ({
        ...step,
        date: step.date !== "Pending"
          ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : "Pending",
        remarks: step.status === "Delivered" && statusIndex >= 3
          ? `Received by: ${trackingData.receiverName || 'Recipient'}`
          : undefined
      })),
    ];
  };

  useEffect(() => {
    if (initialId) {
      handleTrack();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background" data-testid="page-track">
      <Header />
      <main>
        <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Track Your Shipment
            </h1>
            <p className="text-xl text-white/80 mb-10">
              Enter your tracking number to get real-time updates on your package.
            </p>

            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter tracking number (e.g., GC-UAE-2024-1234)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="pl-12 h-14 rounded-full text-base bg-white dark:bg-gray-800 border-0"
                  data-testid="input-tracking-number"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="h-14 px-8 rounded-full bg-white text-purple-700 hover:bg-white/90 shadow-lg font-semibold"
                data-testid="button-track"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>

        <section className="py-20" data-testid="section-tracking-result">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {!hasSearched && !result && (
              <Card className="p-12 text-center border-0 shadow-xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Package className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Track Your Package
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter your Gulf Express tracking number above to see the current status
                  and location of your shipment.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Real-time GPS tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Delivery status updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Estimated arrival time</span>
                  </div>
                </div>
              </Card>
            )}

            {error && (
              <Card className="p-12 text-center border-0 shadow-xl" data-testid="tracking-error">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Shipment Not Found
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  {error}
                </p>
                <p className="text-sm text-muted-foreground">
                  Try tracking numbers like: <span className="font-mono">GC-UAE-2024-1234</span>
                </p>
              </Card>
            )}

            {result && (
              <div className="space-y-6" data-testid="tracking-result">
                {/* Return Shipment Banner */}
                {result.shipmentMode === "return" && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-900 dark:text-orange-200 text-sm uppercase tracking-wide mb-1">Return Shipment</p>
                      {result.linkedOrderId && (
                        <p className="text-sm text-orange-800 dark:text-orange-300">
                          <span className="font-medium">Order ID:</span> {result.linkedOrderId}
                        </p>
                      )}
                      {result.itemName && (
                        <p className="text-sm text-orange-800 dark:text-orange-300">
                          <span className="font-medium">Item:</span> {result.itemName}
                          {result.itemValue ? ` — AED ${result.itemValue.toFixed(2)}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <Card className="overflow-visible p-0 border-0 shadow-xl">
                  <div className="p-6 bg-gradient-purple text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Package className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-white/80">Tracking Number</p>
                          <p className="text-xl font-bold font-mono">{result.trackingNumber}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[result.status] || statusColors.pending}`}>
                        {statusLabels[result.status] || "Unknown Status"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid sm:grid-cols-3 gap-6 mb-8">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">From</p>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{result.senderName}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-muted-foreground">{result.senderCity}, UAE</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">To</p>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{result.receiverName}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-muted-foreground">{result.receiverCity}, {result.receiverCountry}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Details</p>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-foreground">{result.weight} kg</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-foreground">{result.estimatedDelivery}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="text-lg font-semibold text-foreground mb-6">Shipment Progress</h3>
                      <div className="relative pl-6 space-y-0">
                        {result.timeline.map((step, index) => (
                          <div key={index} className="relative pb-8 last:pb-0">
                            {index < result.timeline.length - 1 && (
                              <div className={`absolute left-0 top-4 w-0.5 h-full ${step.completed ? "bg-purple-500" : "bg-gray-200 dark:bg-gray-700"
                                }`} />
                            )}

                            <div className="flex items-start gap-6">
                              <div className={`relative z-10 w-4 h-4 rounded-full mt-1 flex-shrink-0 ${step.completed
                                ? "bg-purple-500 ring-4 ring-purple-500/20"
                                : step.current
                                  ? "bg-purple-500 ring-4 ring-purple-500/30 animate-pulse"
                                  : "bg-gray-300 dark:bg-gray-600"
                                }`}>
                                {step.completed && (
                                  <CheckCircle2 className="w-4 h-4 text-white absolute -top-0 -left-0" />
                                )}
                              </div>

                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <p className={`font-medium ${step.completed || step.current ? "text-foreground" : "text-muted-foreground"}`}>
                                    {step.status}
                                  </p>
                                  <span className={`text-sm ${step.completed ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                                    {step.date} at {step.time}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {step.location}
                                </p>
                                {step.remarks && (
                                  <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md inline-block">
                                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                      {step.remarks}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Contact our support team for any questions about your shipment.
                    </p>
                    <Button variant="outline" className="w-full rounded-full">
                      Contact Support
                    </Button>
                  </Card>
                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Delivery Updates</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get SMS and email notifications for your shipment.
                    </p>
                    <Button variant="outline" className="w-full rounded-full">
                      Enable Notifications
                    </Button>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
