import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileDown } from "lucide-react";
import jsPDF from "jspdf";

export default function PickupDetail() {
  const [, params] = useRoute("/admin/pickups/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [pickup, setPickup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (params?.id) {
      fetchPickup();
    }
  }, [params?.id]);

  const fetchPickup = async () => {
    if (!params?.id) return;
    try {
      const docRef = doc(db, "pickups", params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPickup({ id: docSnap.id, ...data });
        setStatus(data.status || "pending");
      }
    } catch (error) {
      console.error("Error fetching pickup:", error);
      toast({
        title: "Error",
        description: "Failed to load pickup details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!params?.id || !pickup) return;

    try {
      await updateDoc(doc(db, "pickups", params.id), {
        status,
        updatedAt: Timestamp.now(),
      });

      toast({
        title: "Success",
        description: "Pickup status updated successfully",
      });
      fetchPickup();
    } catch (error: any) {
      console.error("Error updating pickup:", error);
      const errorMessage = error?.message || "Failed to update pickup";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const downloadPDFReceipt = () => {
    if (!pickup) {
      toast({
        title: "Error",
        description: "Pickup information not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();

      // Company Header
      doc.setFontSize(20);
      doc.setTextColor(124, 45, 255); // Purple color
      doc.text("Gulf Express", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Pickup Request Receipt", 105, 30, { align: "center" });

      // Line
      doc.setDrawColor(124, 45, 255);
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);

      let yPos = 45;

      // Pickup Request Details
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Pickup Request Details", 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Tracking Number (if available)
      if (pickup.trackingNumber) {
        doc.text(`Tracking Number: ${pickup.trackingNumber}`, 20, yPos);
        yPos += 7;
      }

      // Request Date
      const requestDate = pickup.createdAt
        ? new Date(typeof pickup.createdAt?.toDate === 'function' ? pickup.createdAt.toDate() : pickup.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
        : "N/A";
      doc.text(`Request Date & Time: ${requestDate}`, 20, yPos);
      yPos += 7;

      // Pickup Date (if available)
      if (pickup.pickupDate) {
        doc.text(`Preferred Pickup Date: ${pickup.pickupDate}`, 20, yPos);
        yPos += 7;
      }

      // Status
      doc.text(`Status: ${pickup.status || "Pending"}`, 20, yPos);
      yPos += 15;

      // Customer Information
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Customer Information", 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${pickup.name || "N/A"}`, 20, yPos);
      yPos += 7;
      doc.text(`Phone: ${pickup.phone || "N/A"}`, 20, yPos);
      yPos += 7;

      if (pickup.email) {
        doc.text(`Email: ${pickup.email}`, 20, yPos);
        yPos += 7;
      }

      // Handle long addresses
      const addressLines = doc.splitTextToSize(`Address: ${pickup.address || "N/A"}`, 170);
      doc.text(addressLines, 20, yPos);
      yPos += addressLines.length * 7;

      if (pickup.city) {
        doc.text(`City: ${pickup.city}`, 20, yPos);
        yPos += 7;
      }

      if (pickup.emirate) {
        doc.text(`Emirate: ${pickup.emirate}`, 20, yPos);
        yPos += 7;
      }

      yPos += 10;

      // Special Instructions (if available)
      if (pickup.specialInstructions) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Special Instructions", 20, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const instructionLines = doc.splitTextToSize(pickup.specialInstructions, 170);
        doc.text(instructionLines, 20, yPos);
        yPos += instructionLines.length * 7;
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("Thank you for choosing Gulf Express!", 105, 280, { align: "center" });
      doc.text("For inquiries, contact: support@gulfexpress.org", 105, 285, { align: "center" });

      // Save PDF
      const fileName = `Pickup-Receipt-${pickup.trackingNumber || pickup.id || "Receipt"}.pdf`;
      doc.save(fileName);

      toast({
        title: "Success",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF receipt",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pickup request not found</p>
        <Button onClick={() => setLocation("/admin/pickups")} className="mt-4">
          Back to Pickups
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/admin/pickups")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pickup Request Details
            </h1>
            {pickup.trackingNumber && (
              <p className="text-gray-600 mt-1">Tracking ID: {pickup.trackingNumber}</p>
            )}
          </div>
        </div>
        <Button
          onClick={downloadPDFReceipt}
          className="bg-gradient-to-r from-purple-600 to-purple-800 flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Download Customer Receipt (PDF)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pickup Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Status</Label>
                <div className="mt-1">
                  <Badge
                    variant={
                      pickup.status === "completed"
                        ? "default"
                        : pickup.status === "pending"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {pickup.status || "pending"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-500">Request Date</Label>
                <div className="mt-1">
                  {pickup.createdAt
                    ? new Date(typeof pickup.createdAt?.toDate === 'function' ? pickup.createdAt.toDate() : pickup.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "N/A"}
                </div>
              </div>
              {pickup.pickupDate && (
                <div>
                  <Label className="text-gray-500">Preferred Pickup Date</Label>
                  <div className="mt-1">{pickup.pickupDate}</div>
                </div>
              )}
              {pickup.trackingNumber && (
                <div>
                  <Label className="text-gray-500">Tracking Number</Label>
                  <div className="mt-1 font-mono">{pickup.trackingNumber}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Customer Name</Label>
                <div className="mt-1 font-medium">{pickup.name || "N/A"}</div>
              </div>
              <div>
                <Label className="text-gray-500">Phone</Label>
                <div className="mt-1">{pickup.phone || "N/A"}</div>
              </div>
              {pickup.email && (
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <div className="mt-1">{pickup.email}</div>
                </div>
              )}
              <div>
                <Label className="text-gray-500">Emirate</Label>
                <div className="mt-1">{pickup.emirate || "N/A"}</div>
              </div>
              {pickup.city && (
                <div>
                  <Label className="text-gray-500">City</Label>
                  <div className="mt-1">{pickup.city}</div>
                </div>
              )}
              <div className="col-span-2">
                <Label className="text-gray-500">Address</Label>
                <div className="mt-1">{pickup.address || "N/A"}</div>
              </div>
              {pickup.specialInstructions && (
                <div className="col-span-2">
                  <Label className="text-gray-500">Special Instructions</Label>
                  <div className="mt-1 text-sm">{pickup.specialInstructions}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
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
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="picked">Picked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
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
    </div>
  );
}


