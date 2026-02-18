import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { doc, getDoc, setDoc, collection, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

const SERVICE_TYPES = ["same-day", "next-day", "economy", "international"];



export default function ShipmentForm() {
  const [, params] = useRoute("/admin/shipments/:id/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEdit = !!params?.id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    trackingId: "",
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    originEmirate: "",
    destinationEmirate: "",
    serviceType: "",
    parcelWeight: "",
    amountPaid: "",
    notes: "",
    status: "pending",
  });

  useEffect(() => {
    if (isEdit && params?.id) {
      fetchShipment();
    } else {
      // Fetch available tracking number from backend
      apiRequest("GET", "/api/shipments/generate-tracking-number")
        .then(res => res.json())
        .then(data => {
          setFormData((prev) => ({ ...prev, trackingId: data.trackingNumber }));
        })
        .catch(err => {
          console.error("Failed to generate tracking number", err);
          toast({
            title: "Error",
            description: "Failed to generate tracking number",
            variant: "destructive"
          });
        });
    }
  }, [isEdit, params?.id]);

  const fetchShipment = async () => {
    if (!params?.id) return;
    try {
      const docRef = doc(db, "shipments", params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          trackingId: data.trackingId || "",
          senderName: data.senderName || "",
          senderPhone: data.senderPhone || "",
          senderAddress: data.senderAddress || "",
          receiverName: data.receiverName || "",
          receiverPhone: data.receiverPhone || "",
          receiverAddress: data.receiverAddress || "",
          originEmirate: data.originEmirate || "",
          destinationEmirate: data.destinationEmirate || "",
          serviceType: data.serviceType || "",
          parcelWeight: data.parcelWeight?.toString() || "",
          amountPaid: data.amountPaid?.toString() || "",
          notes: data.notes || "",
          status: data.status || "pending",
        });
      }
    } catch (error) {
      console.error("Error fetching shipment:", error);
      toast({
        title: "Error",
        description: "Failed to load shipment data",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const shipmentData = {
        ...formData,
        parcelWeight: parseFloat(formData.parcelWeight) || 0,
        amountPaid: parseFloat(formData.amountPaid) || 0,
        updatedAt: Timestamp.now(),
      };

      const batch = writeBatch(db);

      if (isEdit && params?.id) {
        // Update existing shipment
        const shipmentRef = doc(db, "shipments", params.id);
        batch.set(shipmentRef, shipmentData, { merge: true });

        // Update public tracking data
        if (shipmentData.trackingId) {
          const publicTrackingRef = doc(db, "publicTrackingData", shipmentData.trackingId);
          batch.set(publicTrackingRef, {
            trackingId: shipmentData.trackingId,
            status: shipmentData.status,
            originEmirate: shipmentData.originEmirate,
            destinationEmirate: shipmentData.destinationEmirate,
            updatedAt: Timestamp.now(),
          }, { merge: true });
        }

        await batch.commit();
        toast({
          title: "Success",
          description: "Shipment updated successfully",
        });
      } else {
        // Create new shipment
        const trackingId = formData.trackingId;
        shipmentData.trackingId = trackingId;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (shipmentData as any).createdAt = Timestamp.now();

        const newDocRef = doc(collection(db, "shipments"));
        batch.set(newDocRef, shipmentData);

        // Create public tracking data (only non-sensitive fields)
        const publicTrackingRef = doc(db, "publicTrackingData", trackingId);
        batch.set(publicTrackingRef, {
          trackingId: trackingId,
          status: shipmentData.status,
          originEmirate: shipmentData.originEmirate,
          destinationEmirate: shipmentData.destinationEmirate,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        await batch.commit();
        toast({
          title: "Success",
          description: "Shipment created successfully",
        });
      }

      setLocation("/admin/shipments");
    } catch (error) {
      console.error("Error saving shipment:", error);
      toast({
        title: "Error",
        description: "Failed to save shipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            {isEdit ? "Edit Shipment" : "Add New Shipment"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? "Update shipment details" : "Create a new shipment"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Shipment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tracking ID */}
              <div className="space-y-2">
                <Label htmlFor="trackingId">Tracking ID</Label>
                <Input
                  id="trackingId"
                  value={formData.trackingId}
                  onChange={(e) =>
                    setFormData({ ...formData, trackingId: e.target.value })
                  }
                  required
                  disabled={isEdit}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
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

              {/* Sender Name */}
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name *</Label>
                <Input
                  id="senderName"
                  value={formData.senderName}
                  onChange={(e) =>
                    setFormData({ ...formData, senderName: e.target.value })
                  }
                  required
                />
              </div>

              {/* Sender Phone */}
              <div className="space-y-2">
                <Label htmlFor="senderPhone">Sender Phone *</Label>
                <Input
                  id="senderPhone"
                  type="tel"
                  value={formData.senderPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, senderPhone: e.target.value })
                  }
                  required
                />
              </div>

              {/* Sender Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="senderAddress">Sender Address</Label>
                <Input
                  id="senderAddress"
                  value={formData.senderAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, senderAddress: e.target.value })
                  }
                />
              </div>

              {/* Receiver Name */}
              <div className="space-y-2">
                <Label htmlFor="receiverName">Receiver Name *</Label>
                <Input
                  id="receiverName"
                  value={formData.receiverName}
                  onChange={(e) =>
                    setFormData({ ...formData, receiverName: e.target.value })
                  }
                  required
                />
              </div>

              {/* Receiver Phone */}
              <div className="space-y-2">
                <Label htmlFor="receiverPhone">Receiver Phone *</Label>
                <Input
                  id="receiverPhone"
                  type="tel"
                  value={formData.receiverPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, receiverPhone: e.target.value })
                  }
                  required
                />
              </div>

              {/* Receiver Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="receiverAddress">Receiver Address</Label>
                <Input
                  id="receiverAddress"
                  value={formData.receiverAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, receiverAddress: e.target.value })
                  }
                />
              </div>

              {/* Origin Emirate */}
              <div className="space-y-2">
                <Label htmlFor="originEmirate">Origin Emirate *</Label>
                <Select
                  value={formData.originEmirate}
                  onValueChange={(value) =>
                    setFormData({ ...formData, originEmirate: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select emirate" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMIRATES.map((emirate) => (
                      <SelectItem key={emirate} value={emirate}>
                        {emirate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination Emirate */}
              <div className="space-y-2">
                <Label htmlFor="destinationEmirate">Destination Emirate *</Label>
                <Select
                  value={formData.destinationEmirate}
                  onValueChange={(value) =>
                    setFormData({ ...formData, destinationEmirate: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select emirate" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMIRATES.map((emirate) => (
                      <SelectItem key={emirate} value={emirate}>
                        {emirate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serviceType: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Parcel Weight */}
              <div className="space-y-2">
                <Label htmlFor="parcelWeight">Parcel Weight (kg)</Label>
                <Input
                  id="parcelWeight"
                  type="number"
                  step="0.01"
                  value={formData.parcelWeight}
                  onChange={(e) =>
                    setFormData({ ...formData, parcelWeight: e.target.value })
                  }
                />
              </div>

              {/* Amount Paid */}
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount Paid (AED)</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={(e) =>
                    setFormData({ ...formData, amountPaid: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/admin/shipments")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-purple-800"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : isEdit ? "Update Shipment" : "Create Shipment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

