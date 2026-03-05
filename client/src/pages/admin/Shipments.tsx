import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Shipment {
  id: string;
  trackingId?: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  originEmirate: string;
  destinationEmirate: string;
  serviceType: string;
  status: string;
  createdAt?: any;
  [key: string]: any;
}

export default function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<string | null>(null);

  // Receipt Generation Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptShipment, setReceiptShipment] = useState<Shipment | null>(null);
  const [receiptForm, setReceiptForm] = useState({
    courierAmount: "",
    paymentMethod: "Cash",
    paymentRef: "",
    discountPercent: "0",
    customerEmail: "",
    notes: ""
  });
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [shipments, searchTerm, statusFilter]);

  const fetchShipments = async () => {
    try {
      const shipmentsQuery = query(
        collection(db, "shipments"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(shipmentsQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Shipment[];
      setShipments(data);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch shipments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterShipments = () => {
    let filtered = [...shipments];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.trackingId?.toLowerCase().includes(term) ||
          s.senderName?.toLowerCase().includes(term) ||
          s.receiverName?.toLowerCase().includes(term) ||
          s.senderPhone?.includes(term) ||
          s.receiverPhone?.includes(term)
      );
    }

    setFilteredShipments(filtered);
  };

  const handleDelete = async () => {
    if (!shipmentToDelete) return;

    try {
      await deleteDoc(doc(db, "shipments", shipmentToDelete));
      toast({
        title: "Success",
        description: "Shipment deleted successfully",
      });
      fetchShipments();
      setDeleteDialogOpen(false);
      setShipmentToDelete(null);
    } catch (error) {
      console.error("Error deleting shipment:", error);
      toast({
        title: "Error",
        description: "Failed to delete shipment",
        variant: "destructive",
      });
    }
  };

  const openReceiptModal = (shipment: Shipment) => {
    setReceiptShipment(shipment);
    setReceiptForm({
      courierAmount: "",
      paymentMethod: "Cash",
      paymentRef: `TXN-${Date.now()}`,
      discountPercent: "0",
      customerEmail: shipment.senderEmail || "",
      notes: ""
    });
    setReceiptModalOpen(true);
  };

  const handleGenerateReceipt = async () => {
    if (!receiptShipment || !receiptShipment.trackingId) return;

    // Ensure amount is valid
    const amount = parseFloat(receiptForm.courierAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid courier amount.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingReceipt(true);
    try {
      const response = await fetch("/api/receipts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "GE-ADMIN-KEY-TEMP", // Handled server-side usually or via session auth
        },
        body: JSON.stringify({
          tracking_id: receiptShipment.trackingId,
          payment_method: receiptForm.paymentMethod,
          payment_ref: receiptForm.paymentRef,
          courier_amount: amount,
          discount_percent: parseFloat(receiptForm.discountPercent) || 0,
          notes: receiptForm.notes,
          customer_email: receiptForm.customerEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate receipt");
      }

      toast({
        title: "Receipt Generated",
        description: `Receipt ${data.receipt_number} created successfully.`,
        variant: "default",
      });

      setReceiptModalOpen(false);
      fetchShipments(); // Refresh list to show updated status

      // Optionally auto-download the PDF
      if (data.pdf_url) {
        window.open(data.pdf_url, "_blank");
      }

    } catch (error: any) {
      console.error("Receipt generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      "in-transit": { variant: "secondary", label: "In Transit" },
      "out-for-delivery": { variant: "default", label: "Out for Delivery" },
      delivered: { variant: "default", label: "Delivered" },
      returned: { variant: "destructive", label: "Returned" },
    };

    const config = statusConfig[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipment Management</h1>
          <p className="text-gray-600 mt-1">Manage all shipments and track their status</p>
        </div>
        <Link href="/admin/shipments/new">
          <Button className="bg-gradient-to-r from-purple-600 to-purple-800">
            <Plus className="mr-2 h-4 w-4" />
            Add Shipment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by tracking ID, name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-transit">In Transit</SelectItem>
            <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Receiver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No shipments found
                </TableCell>
              </TableRow>
            ) : (
              filteredShipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono font-medium">
                    {shipment.trackingId || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shipment.senderName}</div>
                      <div className="text-sm text-gray-500">{shipment.senderPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shipment.receiverName}</div>
                      <div className="text-sm text-gray-500">{shipment.receiverPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {shipment.originEmirate} → {shipment.destinationEmirate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{shipment.serviceType || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(shipment.status || "pending")}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant={shipment.receiptGenerated ? "outline" : "default"}
                        size="sm"
                        onClick={() => openReceiptModal(shipment)}
                        className={shipment.receiptGenerated ? "text-purple-600 border-purple-600 hover:bg-purple-50" : "bg-purple-600 hover:bg-purple-700 text-white"}
                        title={shipment.receiptGenerated ? "Regenerate Receipt" : "Generate Receipt"}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        {shipment.receiptGenerated ? "Receipt" : "Generate"}
                      </Button>
                      <Link href={`/admin/shipments/${shipment.id}`}>
                        <Button variant="ghost" size="icon" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/shipments/${shipment.id}/edit`}>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => {
                          setShipmentToDelete(shipment.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shipment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Generate Receipt Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate VAT Receipt</DialogTitle>
          </DialogHeader>
          {receiptShipment && (
            <div className="grid gap-4 py-4">
              <div className="bg-slate-50 p-3 rounded-md text-sm mb-2 border">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Tracking:</span>
                  <span className="font-mono font-medium text-purple-700">{receiptShipment.trackingId}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-medium">{receiptShipment.senderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Route:</span>
                  <span className="font-medium">{receiptShipment.originEmirate} → {receiptShipment.destinationEmirate}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount (<span className="text-xs text-slate-500">inc VAT</span>)*
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="col-span-3"
                  value={receiptForm.courierAmount}
                  onChange={(e) => setReceiptForm({ ...receiptForm, courierAmount: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment" className="text-right">
                  Payment
                </Label>
                <Select
                  value={receiptForm.paymentMethod}
                  onValueChange={(val) => setReceiptForm({ ...receiptForm, paymentMethod: val })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="COD">Cash on Delivery</SelectItem>
                    <SelectItem value="Online Payment">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ref" className="text-right text-xs">
                  Reference
                </Label>
                <Input
                  id="ref"
                  placeholder="TXN-..."
                  className="col-span-3"
                  value={receiptForm.paymentRef}
                  onChange={(e) => setReceiptForm({ ...receiptForm, paymentRef: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount" className="text-right text-xs">
                  Discount %
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  className="col-span-3"
                  value={receiptForm.discountPercent}
                  onChange={(e) => setReceiptForm({ ...receiptForm, discountPercent: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-xs">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@email.com"
                  className="col-span-3"
                  value={receiptForm.customerEmail}
                  onChange={(e) => setReceiptForm({ ...receiptForm, customerEmail: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReceipt}
              disabled={isGeneratingReceipt || !receiptForm.courierAmount}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGeneratingReceipt ? "Generating..." : "🧾 Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



