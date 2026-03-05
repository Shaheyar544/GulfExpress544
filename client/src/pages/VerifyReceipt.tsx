import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileText, AlertCircle, Download, ExternalLink } from "lucide-react";
import { type Receipt } from "@shared/schema";

export default function VerifyReceipt() {
    const [, params] = useRoute("/verify/:receiptNumber");
    const receiptNumber = params?.receiptNumber;

    const [loading, setLoading] = useState(true);
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (receiptNumber) {
            verifyReceipt(receiptNumber);
        } else {
            setLoading(false);
            setError("No receipt number provided.");
        }
    }, [receiptNumber]);

    const verifyReceipt = async (number: string) => {
        try {
            // In a real app this would call an API endpoint that isn't admin-protected
            const response = await fetch(`/api/receipts/verify/${number}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Receipt not found. Please check the receipt number.");
                }
                throw new Error("Failed to verify receipt.");
            }

            const data = await response.json();
            setReceipt(data.receipt);
        } catch (err: any) {
            setError(err.message || "An error occurred verifying the receipt.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = () => {
        if (receiptNumber) {
            window.open(`/api/receipts/${receiptNumber}/pdf`, "_blank");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center pt-24 pb-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 pt-32 pb-16">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">VAT Receipt Verification</h1>
                    <p className="text-slate-600">Official verification portal for Gulf Express LLC documents</p>
                </div>

                {error ? (
                    <Card className="border-red-200 bg-red-50/50 shadow-sm">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <XCircle className="h-16 w-16 text-red-500 mb-4" />
                            <h2 className="text-xl font-bold text-red-900 mb-2">Verification Failed</h2>
                            <p className="text-red-700 max-w-md">{error}</p>
                            <Button
                                variant="outline"
                                className="mt-6 border-red-200 text-red-700 hover:bg-red-100"
                                onClick={() => window.location.href = "/"}
                            >
                                Return Home
                            </Button>
                        </CardContent>
                    </Card>
                ) : receipt ? (
                    <div className="space-y-6">
                        <Card className={receipt.status === "active" ? "border-green-200 border-2" : "border-red-200 border-2"}>
                            <CardHeader className={receipt.status === "active" ? "bg-green-50/50 border-b border-green-100" : "bg-red-50/50 border-b border-red-100"}>
                                <div className="flex items-center gap-3">
                                    {receipt.status === "active" ? (
                                        <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                                    )}
                                    <div>
                                        <CardTitle className={receipt.status === "active" ? "text-green-800" : "text-red-800"}>
                                            {receipt.status === "active" ? "Authentic VAT Receipt" : "Voided Receipt"}
                                        </CardTitle>
                                        <p className={receipt.status === "active" ? "text-green-600 text-sm mt-1" : "text-red-600 text-sm mt-1"}>
                                            {receipt.status === "active"
                                                ? `This document was issued by ${receipt.companyName}`
                                                : `This document has been marked as voided. Reason: ${receipt.voidReason || "Not specified"}`}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 pb-2 px-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Document Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-slate-600">Receipt No</span>
                                                <span className="font-mono font-medium text-slate-900">{receipt.receiptNumber}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-slate-600">Issue Date</span>
                                                <span className="font-medium text-slate-900">{new Date(receipt.issueDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Tracking Ref</span>
                                                <span className="font-mono font-medium text-purple-700">{receipt.trackingId}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Value Summary</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-slate-600">Total Before VAT</span>
                                                <span className="font-medium text-slate-900">AED {receipt.subtotalExVAT.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-slate-600">VAT ({(receipt.vatRate).toFixed(1)}%)</span>
                                                <span className="font-medium text-slate-900">AED {receipt.vatAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg pt-1">
                                                <span className="text-slate-900">Grand Total</span>
                                                <span className="text-green-700">AED {receipt.grandTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="bg-slate-50 p-6 flex flex-col sm:flex-row gap-3 rounded-b-lg border-t border-slate-100">
                                <Button
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={handleDownloadPdf}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Original PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => window.open(`/track?trackingNumber=${receipt.trackingId}`, "_blank")}
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Track Shipment
                                </Button>
                            </div>
                        </Card>
                    </div>
                ) : null}

                <div className="mt-8 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    Powered by Gulf Express secure verification system
                </div>
            </main>
            <Footer />
        </div>
    );
}
