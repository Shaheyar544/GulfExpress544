import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, FileText, Mail } from "lucide-react";

interface Quotation {
  id: string;
  senderName: string;
  email: string;
  phone: string;
  originEmirate?: string;
  destinationEmirate?: string;
  serviceType: string;
  status: string;
  estimatedPrice?: number;
  createdAt?: any;
  [key: string]: any;
}

export default function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const quotesQuery = query(
        collection(db, "quotes"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(quotesQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Quotation[];
      setQuotations(data);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch quotations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "quotes", id), {
        status,
        updatedAt: new Date(),
      });
      toast({
        title: "Success",
        description: `Quotation ${status}`,
      });
      fetchQuotations();
    } catch (error) {
      console.error("Error updating quotation:", error);
      toast({
        title: "Error",
        description: "Failed to update quotation",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quotation Management</h1>
        <p className="text-gray-600 mt-1">Review and manage quotation requests</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No quotations found
                </TableCell>
              </TableRow>
            ) : (
              quotations.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    {quote.createdAt?.toDate?.()
                      ? new Date(quote.createdAt.toDate()).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">{quote.senderName || "N/A"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{quote.email}</div>
                      <div className="text-gray-500">{quote.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {quote.originEmirate && quote.destinationEmirate
                      ? `${quote.originEmirate} → ${quote.destinationEmirate}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{quote.serviceType || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>
                    {quote.estimatedPrice ? `AED ${quote.estimatedPrice.toFixed(2)}` : "Pending"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        quote.status === "approved"
                          ? "default"
                          : quote.status === "rejected"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {quote.status || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(quote.id, "approved")}
                        disabled={quote.status === "approved"}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(quote.id, "rejected")}
                        disabled={quote.status === "rejected"}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
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



