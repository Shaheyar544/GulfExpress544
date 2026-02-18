import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { collection, getDocs } from "firebase/firestore";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, RefreshCw, Eye, Mail } from "lucide-react";
import MessageDetail from "./MessageDetail";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: any;
  status?: string;
}

export default function Inbox() {
  const [, setLocation] = useLocation();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      
      // Fetch all inquiries from Firestore
      const inquiriesCollection = collection(db, "inquiries");
      const snapshot = await getDocs(inquiriesCollection);
      
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Inquiry[];
      
      // Sort client-side by timestamp (newest first)
      const sortedData = data.sort((a, b) => {
        const aDate = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
        const bDate = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return bDate - aDate; // Descending order (newest first)
      });
      
      setInquiries(sortedData);
      
      // Log for debugging
      console.log(`Successfully fetched ${sortedData.length} inquiries`);
      
      if (sortedData.length === 0) {
        console.warn("No inquiries found in Firestore collection 'inquiries'");
      }
    } catch (error: any) {
      console.error("Error fetching inquiries:", error);
      const errorMessage = error?.message || "Unknown error";
      const errorCode = error?.code || "";
      
      toast({
        title: "Error",
        description: errorCode === "permission-denied"
          ? "Permission denied. Please ensure you are logged in as an admin."
          : `Failed to fetch inquiries: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    if (timestamp.toDate) {
      return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "N/A";
  };

  const getMessageSnippet = (message: string, maxLength: number = 60) => {
    if (!message) return "No message";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
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
        <h1 className="text-3xl font-bold text-gray-900">Customer Inquiries</h1>
        <p className="text-gray-600 mt-1">View and manage customer contact form submissions</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, subject, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={fetchInquiries}
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {inquiries.length === 0
                    ? "No inquiries found"
                    : "No inquiries match your search"}
                </TableCell>
              </TableRow>
            ) : (
              filteredInquiries.map((inquiry) => (
                <TableRow
                  key={inquiry.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedInquiry(inquiry)}
                >
                  <TableCell className="whitespace-nowrap">
                    {formatDate(inquiry.timestamp)}
                  </TableCell>
                  <TableCell className="font-medium">{inquiry.name || "N/A"}</TableCell>
                  <TableCell className="text-gray-600">{inquiry.email || "N/A"}</TableCell>
                  <TableCell className="max-w-xs truncate">{inquiry.subject || "N/A"}</TableCell>
                  <TableCell className="max-w-md truncate text-gray-600">
                    {getMessageSnippet(inquiry.message)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInquiry(inquiry);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Message Detail Side Panel */}
      {selectedInquiry && (
        <MessageDetail
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
        />
      )}
    </div>
  );
}


