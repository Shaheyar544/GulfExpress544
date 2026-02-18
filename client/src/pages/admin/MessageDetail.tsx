import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: any;
  status?: string;
}

interface MessageDetailProps {
  inquiry: Inquiry;
  onClose: () => void;
}

export default function MessageDetail({ inquiry, onClose }: MessageDetailProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    if (timestamp.toDate) {
      return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReplyViaEmail = () => {
    // Create mailto link with customer email and subject
    const subject = `Re: ${inquiry.subject}`;
    const mailtoLink = `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}`;
    window.location.href = mailtoLink;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Customer Inquiry Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-end">
            <Button
              onClick={handleReplyViaEmail}
              className="bg-gradient-to-r from-purple-600 to-purple-800 flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Reply via Email
            </Button>
          </div>

          {/* Inquiry Information */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500 text-sm">Date Received</Label>
                  <div className="mt-1 font-medium">{formatDate(inquiry.timestamp)}</div>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Status</Label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {inquiry.status || "New"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500 text-sm">Name</Label>
                  <div className="mt-1 font-medium">{inquiry.name || "N/A"}</div>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Email</Label>
                  <div className="mt-1">
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      {inquiry.email || "N/A"}
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject */}
          <Card>
            <CardContent className="pt-6">
              <Label className="text-gray-500 text-sm">Subject</Label>
              <div className="mt-1 font-medium text-lg">{inquiry.subject || "N/A"}</div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardContent className="pt-6">
              <Label className="text-gray-500 text-sm">Message</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-900">
                {inquiry.message || "No message"}
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={handleReplyViaEmail}
              className="bg-gradient-to-r from-purple-600 to-purple-800 flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Reply via Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


