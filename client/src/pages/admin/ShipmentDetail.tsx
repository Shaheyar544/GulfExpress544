import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp, writeBatch, getDocs, query, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Clock, RotateCw, Edit, Trash, Save, X } from "lucide-react";

export default function ShipmentDetail() {
  const [, params] = useRoute("/admin/shipments/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [eta, setEta] = useState("");
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);
  const [editedTimeline, setEditedTimeline] = useState<any>({});

  useEffect(() => {
    if (params?.id) {
      fetchShipment();
    }
  }, [params?.id]);

  const fetchShipment = async () => {
    if (!params?.id) return;
    try {
      const docRef = doc(db, "shipments", params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setShipment(data);
        setStatus(data.status || "pending");
        setEta(data.estimatedDelivery || "");

        // Fetch timeline events from subcollection
        const timelineRef = collection(db, "shipments", params.id, "timeline");
        const timelineQuery = query(timelineRef, orderBy("timestamp", "desc"));
        const timelineSnap = await getDocs(timelineQuery);
        const timelineData = timelineSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTimeline(timelineData);
      }
    } catch (error) {
      console.error("Error fetching shipment:", error);
      toast({
        title: "Error",
        description: "Failed to load shipment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!params?.id || !shipment) return;

    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();

      // Update private shipment document
      const shipmentRef = doc(db, "shipments", params.id);
      batch.update(shipmentRef, {
        status,
        estimatedDelivery: eta || null,
        updatedAt: now,
      });

      // Update public tracking data (only non-sensitive fields)
      if (shipment.trackingId) {
        const publicTrackingRef = doc(db, "publicTrackingData", shipment.trackingId);
        batch.set(publicTrackingRef, {
          trackingId: shipment.trackingId,
          status: status,
          originEmirate: shipment.originEmirate,
          destinationEmirate: shipment.destinationEmirate,
          updatedAt: now,
        }, { merge: true });
      }

      // Commit batch first, then add timeline event
      await batch.commit();

      // Add timeline event (separate operation to avoid batch complexity)
      try {
        await addDoc(collection(db, "shipments", params.id, "timeline"), {
          status,
          timestamp: now,
          description: `Status changed to ${status}`,
        });
      } catch (timelineError) {
        console.warn("Timeline event could not be added:", timelineError);
        // Don't fail the whole update if timeline fails
      }

      toast({
        title: "Success",
        description: "Shipment updated successfully",
      });
      fetchShipment();
    } catch (error: any) {
      console.error("Error updating shipment:", error);
      const errorMessage = error?.message || "Failed to update shipment";
      const errorCode = error?.code || "";

      toast({
        title: "Error",
        description: errorCode === "permission-denied"
          ? "Permission denied. Please ensure you are logged in as an admin."
          : errorMessage.includes("permission") || errorCode.includes("permission")
            ? "Permission denied. Check Firestore security rules."
            : `Failed to update shipment: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    const formatted = `Today, ${now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`;
    setEta(formatted);
    toast({
      title: "Success",
      description: "Estimated delivery set to current time",
    });
  };

  const handleEditTimeline = (timelineEntry: any) => {
    setEditingTimelineId(timelineEntry.id);
    setEditedTimeline({
      status: timelineEntry.status,
      description: timelineEntry.description,
      timestamp: timelineEntry.timestamp,
    });
  };

  const handleCancelEdit = () => {
    setEditingTimelineId(null);
    setEditedTimeline({});
  };

  const handleSaveTimelineEdit = async () => {
    if (!params?.id || !editingTimelineId) return;

    try {
      const timelineDocRef = doc(db, "shipments", params.id, "timeline", editingTimelineId);
      await updateDoc(timelineDocRef, {
        status: editedTimeline.status,
        description: editedTimeline.description,
        timestamp: editedTimeline.timestamp,
      });

      toast({
        title: "Success",
        description: "Timeline entry updated successfully",
      });

      setEditingTimelineId(null);
      setEditedTimeline({});
      fetchShipment(); // Refresh timeline
    } catch (error) {
      console.error("Error updating timeline:", error);
      toast({
        title: "Error",
        description: "Failed to update timeline entry",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTimestampForPicker = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      // Include year to prevent parsing issues
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Shipment not found</p>
        <Button onClick={() => setLocation("/admin/shipments")} className="mt-4">
          Back to Shipments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/admin/shipments")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Shipment Details
          </h1>
          <p className="text-gray-600 mt-1">Tracking ID: {shipment.trackingId || "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Status</Label>
                <div className="mt-1">
                  <Badge variant="default">{shipment.status || "pending"}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-500">Service Type</Label>
                <div className="mt-1">{shipment.serviceType || "N/A"}</div>
              </div>
              <div>
                <Label className="text-gray-500">Sender Name</Label>
                <div className="mt-1 font-medium">{shipment.senderName || "N/A"}</div>
              </div>
              <div>
                <Label className="text-gray-500">Sender Phone</Label>
                <div className="mt-1">{shipment.senderPhone || "N/A"}</div>
              </div>
              <div>
                <Label className="text-gray-500">Receiver Name</Label>
                <div className="mt-1 font-medium">{shipment.receiverName || "N/A"}</div>
              </div>
              <div>
                <Label className="text-gray-500">Receiver Phone</Label>
                <div className="mt-1">{shipment.receiverPhone || "N/A"}</div>
              </div>
              <div>
                <Label className="text-gray-500">Route</Label>
                <div className="mt-1">
                  {shipment.originEmirate} → {shipment.destinationEmirate}
                </div>
              </div>
              <div>
                <Label className="text-gray-500">Weight</Label>
                <div className="mt-1">{shipment.parcelWeight || "N/A"} kg</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eta">Estimated Delivery</Label>
              <div className="flex gap-2">
                <DateTimePicker
                  value={eta}
                  onChange={setEta}
                  placeholder="Select date and time"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSetCurrentTime}
                  title="Set current date and time"
                  className="flex-shrink-0"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleStatusUpdate}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800"
            >
              Update Status
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Parcel Updates Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Parcel Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No updates yet</p>
          ) : (
            <div className="space-y-4">
              {timeline.map((entry, index) => (
                <div
                  key={entry.id}
                  className="relative pl-8 pb-6 border-l-2 border-purple-200 last:border-l-0 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 -ml-[9px] w-4 h-4 rounded-full bg-purple-600 border-2 border-white"></div>

                  {editingTimelineId === entry.id ? (
                    // Edit mode
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={editedTimeline.status}
                          onValueChange={(value) =>
                            setEditedTimeline({ ...editedTimeline, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-transit">In Transit</SelectItem>
                            <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={editedTimeline.description}
                          onChange={(e) =>
                            setEditedTimeline({
                              ...editedTimeline,
                              description: e.target.value,
                            })
                          }
                          placeholder="Update description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Date & Time</Label>
                        <DateTimePicker
                          value={formatTimestampForPicker(editedTimeline.timestamp)}
                          onChange={(value) => {
                            // Convert the string value to a Firestore Timestamp
                            const date = new Date(value);
                            setEditedTimeline({
                              ...editedTimeline,
                              timestamp: Timestamp.fromDate(date),
                            });
                          }}
                          placeholder="Select date and time"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveTimelineEdit}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="default" className="capitalize">
                              {entry.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700">{entry.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditTimeline(entry)}
                          className="flex-shrink-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

