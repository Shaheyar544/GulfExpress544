import { useEffect, useState } from "react";
import { collection, getDocs, doc, query, orderBy, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Ban, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Receipt } from "@shared/schema";

export default function Receipts() {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchReceipts();
    }, []);

    useEffect(() => {
        filterReceipts();
    }, [receipts, searchTerm]);

    const fetchReceipts = async () => {
        try {
            const q = query(
                collection(db, "receipts"),
                orderBy("generatedAt", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => doc.data() as Receipt);
            setReceipts(data);
        } catch (error) {
            console.error("Error fetching receipts:", error);
            toast({
                title: "Error",
                description: "Failed to fetch receipts.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filterReceipts = () => {
        let filtered = [...receipts];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.receiptNumber.toLowerCase().includes(term) ||
                    r.trackingId.toLowerCase().includes(term) ||
                    r.customerName.toLowerCase().includes(term) ||
                    r.customerEmail.toLowerCase().includes(term)
            );
        }
        setFilteredReceipts(filtered);
    };

    const handleDownload = (receiptNumber: string) => {
        window.open(`/api/receipts/${receiptNumber}/pdf`, "_blank");
    };

    const handleEmailContext = async (receipt: Receipt) => {
        const confirmEmail = window.prompt(`Send VAT receipt to ${receipt.customerEmail}?`, receipt.customerEmail);
        if (!confirmEmail) return;

        try {
            // In production API key needs to be managed appropriately
            const response = await fetch(`/api/receipts/${receipt.receiptNumber}/email`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-API-Key": "GE-ADMIN-KEY-TEMP" },
                body: JSON.stringify({ to_email: confirmEmail }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to send email");

            toast({
                title: "Email Sent",
                description: `Receipt sent to ${confirmEmail} successfully.`,
            });
        } catch (error: any) {
            toast({
                title: "Email Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleVoid = async (receipt: Receipt) => {
        const reason = window.prompt(`Reason for voiding receipt ${receipt.receiptNumber}?`);
        if (reason === null) return;

        try {
            const receiptRef = doc(db, "receipts", receipt.receiptId);
            await updateDoc(receiptRef, { status: "voided", voidReason: reason });
            toast({
                title: "Receipt Voided",
                description: `${receipt.receiptNumber} has been marked as voided.`,
            });
            fetchReceipts();
        } catch (error: any) {
            toast({
                title: "Error voiding receipt",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const totalRevenue = receipts.filter(r => r.status === "active").reduce((s, r) => s + r.grandTotal, 0);
    const activeCount = receipts.filter(r => r.status === "active").length;
    const voidedCount = receipts.filter(r => r.status === "voided").length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">VAT Receipts</h1>
                <p className="text-gray-600 mt-1">Manage all generated VAT receipts across the system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
                    <span className="text-sm font-medium text-gray-500">Total Receipts</span>
                    <span className="text-2xl font-bold">{receipts.length}</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
                    <span className="text-sm font-medium text-gray-500">Total Valid Revenue</span>
                    <span className="text-2xl font-bold text-green-600">AED {totalRevenue.toFixed(2)}</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
                    <span className="text-sm font-medium text-gray-500">Active Receipts</span>
                    <span className="text-2xl font-bold">{activeCount}</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
                    <span className="text-sm font-medium text-gray-500">Voided Receipts</span>
                    <span className="text-2xl font-bold text-red-600">{voidedCount}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 md:max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by receipt no, tracking or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Receipt No.</TableHead>
                            <TableHead>Tracking ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total (AED)</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReceipts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                    No receipts found. Generate them from the Shipments page.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReceipts.map((r) => (
                                <TableRow key={r.receiptId}>
                                    <TableCell className="font-mono font-medium text-purple-700">
                                        {r.receiptNumber}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {r.trackingId}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-sm">{r.customerName}</div>
                                        <div className="text-xs text-slate-500">{r.customerEmail}</div>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        AED {r.grandTotal.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50">{r.paymentMethod}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {r.status === "active" ? (
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Active</Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200" title={r.voidReason}>Voided</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleDownload(r.receiptNumber)}
                                                title="Download PDF"
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleEmailContext(r)}
                                                title="Email Customer"
                                                disabled={r.status !== "active"}
                                            >
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                            {r.status === "active" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleVoid(r)}
                                                    title="Void Receipt"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
