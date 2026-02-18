# PDF Receipt Download Implementation - Booking Confirmation Page

## Overview
This document shows how to add PDF receipt download functionality to the Booking Confirmation page.

## Step 1: Install jsPDF Library

```bash
npm install jspdf
```

## Step 2: Update Booking Confirmation Page

**File:** `client/src/pages/Book.tsx`

### Key Changes:

1. **Import jsPDF:**
```typescript
import jsPDF from 'jspdf';
```

2. **Store form data for receipt generation:**
```typescript
const [bookingFormData, setBookingFormData] = useState<BookingFormData | null>(null);
```

3. **Update onSubmit to store form data:**
```typescript
const result = await response.json();
setBookingFormData(data); // Store form data for PDF
setBookingResult(result);
```

4. **Add PDF generation function:**
```typescript
const downloadPDFReceipt = () => {
  if (!bookingResult || !bookingFormData) return;

  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setTextColor(124, 45, 255); // Purple color
  doc.text('Gulf Courier', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Shipping Receipt', 105, 30, { align: 'center' });
  
  // Line
  doc.setDrawColor(124, 45, 255);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  let yPos = 45;
  
  // Booking Details
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Booking Details', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Tracking Number: ${bookingResult.trackingNumber}`, 20, yPos);
  yPos += 7;
  doc.text(`Booking Date: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 20, yPos);
  yPos += 7;
  doc.text(`Estimated Delivery: ${bookingResult.estimatedDelivery}`, 20, yPos);
  yPos += 7;
  doc.text(`Estimated Price: AED ${bookingResult.estimatedPrice.toFixed(2)}`, 20, yPos);
  yPos += 15;
  
  // Customer Information
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Customer Information', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${bookingFormData.senderName}`, 20, yPos);
  yPos += 7;
  doc.text(`Phone: ${bookingFormData.senderPhone}`, 20, yPos);
  yPos += 7;
  doc.text(`Email: ${bookingFormData.senderEmail}`, 20, yPos);
  yPos += 7;
  doc.text(`Address: ${bookingFormData.senderAddress}`, 20, yPos);
  yPos += 7;
  doc.text(`City: ${bookingFormData.senderCity}`, 20, yPos);
  yPos += 15;
  
  // Shipment Details
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Shipment Details', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Receiver: ${bookingFormData.receiverName}`, 20, yPos);
  yPos += 7;
  doc.text(`Receiver Phone: ${bookingFormData.receiverPhone}`, 20, yPos);
  yPos += 7;
  doc.text(`Receiver Address: ${bookingFormData.receiverAddress}`, 20, yPos);
  yPos += 7;
  doc.text(`Receiver City: ${bookingFormData.receiverCity}`, 20, yPos);
  yPos += 7;
  doc.text(`Receiver Country: ${bookingFormData.receiverCountry}`, 20, yPos);
  yPos += 7;
  doc.text(`Shipment Type: ${bookingFormData.shipmentType}`, 20, yPos);
  yPos += 7;
  doc.text(`Weight: ${bookingFormData.weight} kg`, 20, yPos);
  yPos += 7;
  doc.text(`Delivery Mode: ${bookingFormData.deliveryMode}`, 20, yPos);
  yPos += 10;
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for choosing Gulf Courier!', 105, 280, { align: 'center' });
  doc.text('For inquiries, contact: support@gulfcourier.ae', 105, 285, { align: 'center' });
  
  // Save PDF
  doc.save(`Receipt-${bookingResult.trackingNumber}.pdf`);
};
```

5. **Add Download Button:**
```typescript
<Button
  onClick={downloadPDFReceipt}
  variant="outline"
  className="w-full rounded-full"
  data-testid="button-download-receipt"
>
  <FileDown className="w-4 h-4 mr-2" />
  Download Receipt (PDF)
</Button>
```

## Complete Updated Code Block

See `BOOKING_PDF_COMPLETE.tsx` for the complete updated component code.


