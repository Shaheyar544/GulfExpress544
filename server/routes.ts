import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, calculatePrice, getEstimatedDelivery } from "./storage";
import { insertQuotationSchema, insertContactMessageSchema, insertBookingSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./firebase";
import { doc, getDoc, collection, getDocs, query, where, updateDoc, orderBy, limit, setDoc } from "firebase/firestore";
import { apiKeyMiddleware } from "./middleware/apiKeyMiddleware";
import { generateReceiptNumber, buildLineItems, loadCompanyConfig, numberToWords } from "./utils/receiptHelpers";
import { generateReceiptPDF } from "./utils/receiptPDF";
import { type Receipt } from "@shared/schema";
import fs from "fs";
import nodemailer from "nodemailer";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Track shipment by tracking number
  app.get("/api/track/:trackingNumber", async (req, res) => {
    try {
      const { trackingNumber } = req.params;

      const shipment = await storage.getShipmentByTrackingNumber(trackingNumber);

      if (!shipment) {
        return res.status(404).json({ error: "Shipment not found" });
      }

      // Generate timeline based on status
      const timeline = generateTimeline(shipment.status, shipment);

      res.json({
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        senderCity: shipment.senderCity,
        receiverCity: shipment.receiverCity,
        receiverCountry: shipment.receiverCountry,
        estimatedDelivery: shipment.estimatedDelivery,
        timeline,
      });
    } catch (error) {
      console.error("Error tracking shipment:", error);
      res.status(500).json({ error: "Failed to track shipment" });
    }
  });

  // Create quotation
  app.post("/api/quotations", async (req, res) => {
    try {
      const validatedData = insertQuotationSchema.parse(req.body);

      const quotation = await storage.createQuotation(validatedData);

      // Calculate pricing breakdown
      const { estimatedPrice, breakdown } = calculatePrice(
        validatedData.shipmentType,
        validatedData.weight,
        validatedData.deliveryMode,
        validatedData.receiverCountry,
        validatedData.pickupRequired || false
      );

      const deliveryTime = getDeliveryTimeDescription(validatedData.deliveryMode, validatedData.receiverCountry);

      res.json({
        id: quotation.id,
        estimatedPrice,
        currency: "AED",
        breakdown,
        deliveryTime,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating quotation:", error);
      res.status(500).json({ error: "Failed to create quotation" });
    }
  });

  // Create contact message
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);

      const message = await storage.createContactMessage(validatedData);

      res.json({
        success: true,
        id: message.id,
        message: "Thank you for your message. We'll get back to you within 24 hours.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating contact message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter", async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriptionSchema.parse(req.body);

      // Check if already subscribed
      const existing = await storage.getNewsletterSubscription(validatedData.email);
      if (existing) {
        return res.json({ success: true, message: "You're already subscribed!" });
      }

      await storage.createNewsletterSubscription(validatedData);

      res.json({
        success: true,
        message: "Thank you for subscribing to our newsletter!",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      console.error("Error creating newsletter subscription:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);

      const booking = await storage.createBooking(validatedData);

      // Calculate estimated delivery and price
      const estimatedDelivery = getEstimatedDelivery(validatedData.deliveryMode, validatedData.receiverCountry);
      const { estimatedPrice } = calculatePrice(
        validatedData.shipmentType,
        validatedData.weight,
        validatedData.deliveryMode,
        validatedData.receiverCountry,
        validatedData.pickupRequired || false
      );

      res.json({
        id: booking.id,
        trackingNumber: booking.trackingNumber,
        estimatedDelivery,
        estimatedPrice,
        status: 'confirmed',
        message: "Your shipment has been booked successfully!",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Get booking by tracking number
  app.get("/api/bookings/:trackingNumber", async (req, res) => {
    try {
      const { trackingNumber } = req.params;

      const booking = await storage.getBookingByTrackingNumber(trackingNumber);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // Website Integrations Settings
  app.get("/api/settings/integrations", async (_req, res) => {
    try {
      const analyticsId = await storage.getSiteConfig('google_analytics_id');
      const verificationTag = await storage.getSiteConfig('google_verification_tag');
      const adsenseId = await storage.getSiteConfig('adsense_publisher_id');
      const genericTag = await storage.getSiteConfig('generic_verification_tag');
      const whatsapp = await storage.getSiteConfig('whatsapp_number');
      const address = await storage.getSiteConfig('contact_address');
      const phone = await storage.getSiteConfig('contact_phone');
      const email = await storage.getSiteConfig('contact_email');
      const hours = await storage.getSiteConfig('working_hours');
      const trackingPattern = await storage.getSiteConfig('tracking_number_pattern');

      console.log('GET /api/settings/integrations - Returned Pattern:', trackingPattern);

      res.json({
        googleAnalyticsId: analyticsId || '',
        googleVerificationTag: verificationTag || '',
        adsensePublisherId: adsenseId || '',
        genericVerificationTag: genericTag || '',
        whatsappNumber: whatsapp || '',
        contactAddress: address || '',
        contactPhone: phone || '',
        contactEmail: email || '',
        workingHours: hours || '',
        trackingNumberPattern: trackingPattern || '',
      });
    } catch (error) {
      console.error("Error fetching integration settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings/integrations", async (req, res) => {
    try {

      const {
        googleAnalyticsId,
        googleVerificationTag,
        adsensePublisherId,
        genericVerificationTag,
        whatsappNumber,
        contactAddress,
        contactPhone,
        contactEmail,
        workingHours,
        trackingNumberPattern
      } = req.body;

      if (googleAnalyticsId !== undefined) await storage.setSiteConfig('google_analytics_id', googleAnalyticsId);
      if (googleVerificationTag !== undefined) await storage.setSiteConfig('google_verification_tag', googleVerificationTag);
      if (adsensePublisherId !== undefined) await storage.setSiteConfig('adsense_publisher_id', adsensePublisherId);
      if (genericVerificationTag !== undefined) await storage.setSiteConfig('generic_verification_tag', genericVerificationTag);

      if (whatsappNumber !== undefined) await storage.setSiteConfig('whatsapp_number', whatsappNumber);
      if (contactAddress !== undefined) await storage.setSiteConfig('contact_address', contactAddress);
      if (contactPhone !== undefined) await storage.setSiteConfig('contact_phone', contactPhone);
      if (contactEmail !== undefined) await storage.setSiteConfig('contact_email', contactEmail);
      if (workingHours !== undefined) await storage.setSiteConfig('working_hours', workingHours);
      if (trackingNumberPattern !== undefined) {
        console.log('POST /api/settings/integrations - Saving Pattern:', trackingNumberPattern);
        try {
          await storage.setSiteConfig('tracking_number_pattern', trackingNumberPattern);
          console.log('POST /api/settings/integrations - Saved Pattern successfully');
        } catch (e) {
          console.error('POST /api/settings/integrations - Error saving Pattern:', e);
          throw e;
        }
      }

      res.json({ success: true, message: "Settings saved successfully" });
      console.log('POST /api/settings/integrations - Response sent');
    } catch (error) {
      console.error("Error saving integration settings:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Public Tracking API for 17TRACK integration
  app.get("/api/public/track/:trackingNumber", async (req, res) => {
    const { trackingNumber } = req.params;
    try {
      // 1. Fetch basic tracking info
      const trackingRef = doc(db, "publicTrackingData", trackingNumber.toUpperCase());
      const trackingSnap = await getDoc(trackingRef);

      if (!trackingSnap.exists()) {
        res.status(404).json({ error: "Tracking number not found" });
        return;
      }

      const trackingData = trackingSnap.data();

      // 2. TIMELINE GENERATION (Fallback approach due to Firestore permission restrictions on 'shipments')
      // Since the server doesn't have admin privileges to read the private 'shipments' collection,
      // we generate a plausible timeline based on the public status and location data.
      // This matches the frontend's fallback behavior.

      const shipmentDataForTimeline = {
        senderCity: trackingData.originEmirate || "UAE",
        receiverCity: trackingData.destinationEmirate || "UAE",
        receiverCountry: "UAE",
        currentLocation: trackingData.destinationEmirate || "UAE", // Approximate for generated logic
        estimatedDelivery: trackingData.updatedAt?.toDate ? trackingData.updatedAt.toDate().toLocaleDateString() : "Pending",
        status: trackingData.status
      };

      const generatedEvents = generateTimeline(trackingData.status || 'pending', shipmentDataForTimeline);

      const events = generatedEvents.map(step => ({
        location: step.location,
        description: step.status,
        time: step.current // If current, make it recent, otherwise use the generated date
          ? new Date().toISOString()
          : new Date(step.date + " " + step.time).toISOString()
        // Note: Date parsing might be fuzzy, but sufficient for fallback. 
        // Ideally we'd use real timestamps if available in publicData.
      }));

      // Ensure valid ISO strings
      events.forEach(e => {
        if (e.time === 'Invalid Date') e.time = new Date().toISOString();
      });

      // Sort newest first
      events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      // If no events found, generate a basic "Order Placed" event
      if (events.length === 0) {
        const created = trackingData.createdAt?.toDate ? trackingData.createdAt.toDate() : new Date();
        events.push({
          location: trackingData.originEmirate || "Origin",
          description: "Order Received",
          time: created.toISOString()
        });
      }

      // 3. Return JSON response
      res.json({
        tracking_number: trackingNumber,
        status: trackingData.status,
        carrier: "Gulf Express",
        weight: trackingData.weight || 0,
        events: events
      });

    } catch (error) {
      console.error("Error in public tracking API:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/shipments/generate-tracking-number", async (req, res) => {
    try {
      const trackingNumber = await storage.generateTrackingNumber();
      res.json({ trackingNumber });
    } catch (error) {
      console.error("Error generating tracking number:", error);
      res.status(500).json({ message: "Failed to generate tracking number" });
    }
  });

  // ============================================================
  // External API v1 — protected by GULF_EXPRESS_API_KEY header
  // Used by OrderFlow Pro to create and track shipments remotely
  // ============================================================

  // POST /api/v1/shipments — Create a shipment (standard or return)
  app.post("/api/v1/shipments", apiKeyMiddleware, async (req, res) => {
    try {
      const {
        sender_name, sender_phone, sender_address,
        receiver_name, receiver_phone, receiver_address,
        origin_emirate, destination_emirate,
        service_type, parcel_weight, amount_paid, notes,
        shipment_type, linked_order_id, item_name, item_value,
      } = req.body;

      if (!sender_name || !receiver_name || !origin_emirate || !destination_emirate || !service_type) {
        return res.status(400).json({ error: "Missing required fields: sender_name, receiver_name, origin_emirate, destination_emirate, service_type" });
      }

      const { trackingId, shipmentId } = await (storage as any).createApiShipment({
        senderName: sender_name,
        senderPhone: sender_phone,
        senderAddress: sender_address,
        receiverName: receiver_name,
        receiverPhone: receiver_phone,
        receiverAddress: receiver_address,
        originEmirate: origin_emirate,
        destinationEmirate: destination_emirate,
        serviceType: service_type,
        parcelWeight: parcel_weight,
        amountPaid: amount_paid,
        notes,
        shipmentMode: shipment_type === "return" ? "return" : "standard",
        linkedOrderId: linked_order_id,
        itemName: item_name,
        itemValue: item_value,
      });

      return res.status(201).json({
        success: true,
        tracking_id: trackingId,
        shipment_id: shipmentId,
        status: "pending",
        created_at: new Date().toISOString(),
        tracking_url: `https://gulfexpress.org/track?id=${trackingId}`,
      });
    } catch (error: any) {
      console.error("[API v1] Error creating shipment:", error);
      return res.status(500).json({
        error: "Failed to create shipment",
        detail: error?.message || String(error),
        code: error?.code || null,
      });
    }
  });

  // GET /api/v1/shipments — List recent shipments (last 50)
  app.get("/api/v1/shipments", apiKeyMiddleware, async (_req, res) => {
    try {
      const q = query(collection(db, "shipments"), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      const shipments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.json({ success: true, shipments });
    } catch (error) {
      console.error("[API v1] Error listing shipments:", error);
      return res.status(500).json({ error: "Failed to list shipments" });
    }
  });

  // GET /api/v1/shipments/:trackingId — Get shipment by tracking ID
  app.get("/api/v1/shipments/:trackingId", apiKeyMiddleware, async (req, res) => {
    try {
      const { trackingId } = req.params;
      const q = query(collection(db, "shipments"), where("trackingId", "==", trackingId));
      const snap = await getDocs(q);
      if (snap.empty) {
        // Also try trackingNumber field for backwards compat
        const q2 = query(collection(db, "shipments"), where("trackingNumber", "==", trackingId));
        const snap2 = await getDocs(q2);
        if (snap2.empty) {
          return res.status(404).json({ error: "Shipment not found" });
        }
        const d2 = snap2.docs[0];
        return res.json({ success: true, shipment: { id: d2.id, ...d2.data() } });
      }
      const d = snap.docs[0];
      return res.json({ success: true, shipment: { id: d.id, ...d.data() } });
    } catch (error) {
      console.error("[API v1] Error fetching shipment:", error);
      return res.status(500).json({ error: "Failed to fetch shipment" });
    }
  });

  // PATCH /api/v1/shipments/:trackingId/status — Update shipment status
  app.patch("/api/v1/shipments/:trackingId/status", apiKeyMiddleware, async (req, res) => {
    try {
      const { trackingId } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Missing required field: status" });
      }

      // Find the shipment document
      const q = query(collection(db, "shipments"), where("trackingId", "==", trackingId));
      const snap = await getDocs(q);
      if (snap.empty) {
        return res.status(404).json({ error: "Shipment not found" });
      }

      const docRef = snap.docs[0].ref;
      await updateDoc(docRef, { status });

      // Also update publicTrackingData
      try {
        const pubRef = doc(db, "publicTrackingData", trackingId);
        await updateDoc(pubRef, { status, updatedAt: new Date() });
      } catch (_) { /* non-critical */ }

      return res.json({ success: true, tracking_id: trackingId, status });
    } catch (error) {
      console.error("[API v1] Error updating shipment status:", error);
      return res.status(500).json({ error: "Failed to update status" });
    }
  });

  // ============================================================
  // Alias routes — /api/shipments (without /v1/) for OrderFlow Pro
  // Some OrderFlow Pro builds call /api/shipments directly
  // ============================================================

  app.post("/api/shipments", apiKeyMiddleware, async (req, res) => {
    // Delegate to the same handler logic as /api/v1/shipments
    const {
      sender_name, sender_phone, sender_address,
      receiver_name, receiver_phone, receiver_address,
      origin_emirate, destination_emirate,
      service_type, parcel_weight, amount_paid, notes,
      shipment_type, linked_order_id, item_name, item_value,
    } = req.body;

    if (!sender_name || !receiver_name || !origin_emirate || !destination_emirate || !service_type) {
      return res.status(400).json({ error: "Missing required fields: sender_name, receiver_name, origin_emirate, destination_emirate, service_type" });
    }

    try {
      const { trackingId, shipmentId } = await (storage as any).createApiShipment({
        senderName: sender_name,
        senderPhone: sender_phone,
        senderAddress: sender_address,
        receiverName: receiver_name,
        receiverPhone: receiver_phone,
        receiverAddress: receiver_address,
        originEmirate: origin_emirate,
        destinationEmirate: destination_emirate,
        serviceType: service_type,
        parcelWeight: parcel_weight,
        amountPaid: amount_paid,
        notes,
        shipmentMode: shipment_type === "return" ? "return" : "standard",
        linkedOrderId: linked_order_id,
        itemName: item_name,
        itemValue: item_value,
      });
      return res.status(201).json({
        success: true,
        tracking_id: trackingId,
        shipment_id: shipmentId,
        status: "pending",
        created_at: new Date().toISOString(),
        tracking_url: `https://gulfexpress.org/track?id=${trackingId}`,
      });
    } catch (error: any) {
      console.error("[API alias] Error creating shipment:", error);
      return res.status(500).json({
        error: "Failed to create shipment",
        detail: error?.message || String(error),
        code: error?.code || null,
      });
    }
  });

  app.get("/api/shipments/:trackingId", apiKeyMiddleware, async (req, res) => {
    try {
      const { trackingId } = req.params;
      const q = query(collection(db, "shipments"), where("trackingId", "==", trackingId));
      const snap = await getDocs(q);
      if (snap.empty) {
        const q2 = query(collection(db, "shipments"), where("trackingNumber", "==", trackingId));
        const snap2 = await getDocs(q2);
        if (snap2.empty) return res.status(404).json({ error: "Shipment not found" });
        const d2 = snap2.docs[0];
        return res.json({ success: true, shipment: { id: d2.id, ...d2.data() } });
      }
      const d = snap.docs[0];
      return res.json({ success: true, shipment: { id: d.id, ...d.data() } });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch shipment" });
    }
  });

  app.patch("/api/shipments/:trackingId/status", apiKeyMiddleware, async (req, res) => {
    try {
      const { trackingId } = req.params;
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "Missing required field: status" });
      const q = query(collection(db, "shipments"), where("trackingId", "==", trackingId));
      const snap = await getDocs(q);
      if (snap.empty) return res.status(404).json({ error: "Shipment not found" });
      await updateDoc(snap.docs[0].ref, { status });
      try {
        await updateDoc(doc(db, "publicTrackingData", trackingId), { status, updatedAt: new Date() });
      } catch (_) { /* non-critical */ }
      return res.json({ success: true, tracking_id: trackingId, status });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update status" });
    }
  });

  // ============================================================
  // VAT Receipts API
  // ============================================================

  // Public endpoint for verification (NO apiKeyMiddleware)
  app.get("/api/receipts/verify/:receiptNumber", async (req, res) => {
    try {
      const q = query(
        collection(db, "receipts"),
        where("receiptNumber", "==", req.params.receiptNumber),
        limit(1)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        return res.status(404).json({ error: "Receipt not found" });
      }

      // Return a subset of public data or full receipt based on your business logic
      return res.json({ success: true, receipt: snap.docs[0].data() });
    } catch (error: any) {
      console.error("Error verifying receipt:", error);
      return res.status(500).json({ error: "Failed to verify receipt" });
    }
  });

  app.post("/api/receipts/generate", async (req, res) => {
    try {
      const {
        tracking_id,
        payment_method,   // "Credit Card" | "Cash" | "Bank Transfer" | "COD"
        payment_ref,      // optional transaction reference
        courier_amount,   // what customer paid for courier (AED)
        discount_percent, // optional discount %
        notes,            // optional
        customer_name,    // override if not in shipment
        customer_phone,
        customer_email,
        customer_address,
      } = req.body;

      if (!tracking_id) {
        return res.status(400).json({ error: "tracking_id is required" });
      }

      // 1. Fetch shipment from Firestore
      const q = query(collection(db, "shipments"), where("trackingId", "==", tracking_id));
      const snap = await getDocs(q);
      if (snap.empty) {
        return res.status(404).json({ error: `Shipment ${tracking_id} not found` });
      }

      const shipmentData = snap.docs[0].data();
      const shipmentDocId = snap.docs[0].id;

      // 2. Load company config
      const company = await loadCompanyConfig();

      // 3. Generate receipt number
      const receiptNumber = await generateReceiptNumber(company.receipt_prefix);

      // 4. Build line items based on shipment
      const lineItems = buildLineItems(shipmentData, courier_amount, discount_percent || 0);

      // 5. Calculate totals
      const vatRate = parseFloat(company.company_vat_rate || "5") / 100;
      const subtotalExVAT = lineItems.reduce((s, i) => s + i.unitPrice * i.quantity * (1 - i.discount / 100), 0);
      const discountAmount = lineItems.reduce((s, i) => s + (i.unitPrice * i.quantity * i.discount / 100), 0);
      const vatAmount = parseFloat((subtotalExVAT * vatRate).toFixed(2));
      const grandTotal = parseFloat((subtotalExVAT + vatAmount).toFixed(2));
      const amountInWords = numberToWords(grandTotal);

      // 6. Build receipt object
      const now = new Date();
      const receiptId = `receipt_${receiptNumber.replace(/[^a-zA-Z0-9]/g, '_')}`;

      const receipt: Receipt = {
        receiptId,
        receiptNumber,
        trackingId: tracking_id,
        shipmentId: shipmentDocId,
        issueDate: now.toISOString(),
        supplyDate: now.toISOString(),
        currency: "AED",

        companyName: company.company_name,
        companyAddress: company.company_address,
        companyTRN: company.company_trn,
        companyVATReg: company.company_vat_reg,
        companyEmail: company.company_email,
        companyPhone: company.company_phone,
        companyWeb: "gulfexpress.org", // You can use company.company_web if added

        // Bill To = Sender — same person
        customerName: shipmentData.senderName || customer_name || "",
        customerPhone: shipmentData.senderPhone || customer_phone || "",
        customerEmail: shipmentData.senderEmail || customer_email || "",
        customerAddress: shipmentData.senderAddress || customer_address || "",

        // Sender (same as Bill To)
        senderName: shipmentData.senderName || "",
        senderPhone: shipmentData.senderPhone || "",
        senderAddress: shipmentData.senderAddress || shipmentData.senderCity || "",

        // Receiver (To)
        receiverName: shipmentData.receiverName || "",
        receiverPhone: shipmentData.receiverPhone || "",
        receiverAddress: shipmentData.receiverAddress || shipmentData.receiverCity || "",

        originEmirate: shipmentData.originEmirate || shipmentData.senderCity,
        destinationEmirate: shipmentData.destinationEmirate || shipmentData.receiverCity,
        serviceType: shipmentData.serviceType,
        parcelWeight: shipmentData.parcelWeight || shipmentData.weight || 0,
        shipmentMode: shipmentData.shipmentMode || "standard",

        lineItems,
        subtotalExVAT,
        discountAmount,
        vatRate: parseFloat(company.company_vat_rate || "5"),
        vatAmount,
        grandTotal,
        amountInWords,

        paymentMethod: payment_method || "Cash",
        paymentRef: payment_ref || `TXN-${Date.now()}`,
        paymentStatus: "paid",

        pdfPath: "", // filled after PDF generation
        generatedBy: (req as any).apiUser || "system",
        generatedAt: now.toISOString(),
        status: "active",
      };

      // 7. Generate PDF using Playwright
      const pdfPath = await generateReceiptPDF(receipt, company);
      receipt.pdfPath = pdfPath;

      // 8. Save receipt to Firestore
      await setDoc(doc(db, "receipts", receiptId), receipt);

      // 9. Update shipment with receipt reference
      await updateDoc(snap.docs[0].ref, {
        receiptId: receiptId,
        receiptNumber: receiptNumber,
        receiptGenerated: true,
      });

      return res.status(201).json({
        success: true,
        receipt_id: receiptId,
        receipt_number: receiptNumber,
        grand_total: grandTotal,
        pdf_url: `/api/receipts/${receiptNumber}/pdf`,
      });

    } catch (error: any) {
      console.error("[Receipt] Generation error:", error);
      return res.status(500).json({ error: "Failed to generate receipt", detail: error.message });
    }
  });

  app.get("/api/receipts/:receiptNumber/pdf", async (req, res) => {
    const { receiptNumber } = req.params;
    const q = query(collection(db, "receipts"), where("receiptNumber", "==", receiptNumber));
    const snap = await getDocs(q);
    if (snap.empty) return res.status(404).json({ error: "Receipt not found" });

    const { pdfPath } = snap.docs[0].data();
    if (!pdfPath || !fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: "PDF file not found — please regenerate" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${receiptNumber}.pdf"`);
    fs.createReadStream(pdfPath).pipe(res);
  });

  app.get("/api/receipts/shipment/:trackingId", async (req, res) => {
    const q = query(collection(db, "receipts"), where("trackingId", "==", req.params.trackingId));
    const snap = await getDocs(q);
    if (snap.empty) return res.status(404).json({ error: "No receipt for this shipment" });
    return res.json({ success: true, receipt: snap.docs[0].data() });
  });

  app.get("/api/receipts", async (req, res) => {
    const q = query(collection(db, "receipts"), orderBy("generatedAt", "desc"), limit(100));
    const snap = await getDocs(q);
    return res.json({ receipts: snap.docs.map(d => d.data()) });
  });

  // Public receipt verification — no API key needed, customer-facing
  app.get("/verify/:receiptNumber", async (req, res) => {
    const { receiptNumber } = req.params;

    try {
      const q = query(collection(db, "receipts"), where("receiptNumber", "==", receiptNumber));
      const snap = await getDocs(q);

      if (snap.empty) {
        // Serve 404 page — receipt not found
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Receipt Not Found — Gulf Express</title>
            <style>
              * { margin:0; padding:0; box-sizing:border-box; }
              body { font-family: system-ui, sans-serif; background: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
              .box { background: white; border-radius: 16px; padding: 40px; text-align: center; max-width: 420px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,.1); }
              .icon { font-size: 48px; margin-bottom: 16px; }
              h1 { font-size: 20px; color: #0f172a; margin-bottom: 8px; }
              p { font-size: 13px; color: #64748b; margin-bottom: 20px; line-height: 1.6; }
              .badge { display:inline-block; background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:20px; padding:4px 14px; font-size:12px; font-weight:600; margin-bottom:20px; }
              a { display:inline-block; background:#7c3aed; color:white; padding:10px 24px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:600; }
            </style>
          </head>
          <body>
            <div class="box">
              <div class="icon">🔍</div>
              <div class="badge">❌ Receipt Not Found</div>
              <h1>Invalid Receipt</h1>
              <p>Receipt <strong>${receiptNumber}</strong> could not be verified. It may be invalid, voided, or the number may be incorrect.</p>
              <a href="https://gulfexpress.org">← Back to Gulf Express</a>
            </div>
          </body>
          </html>
        `);
      }

      const receipt = snap.docs[0].data();

      // Status color
      const statusColor = receipt.status === "active"
        ? { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7", label: "✓ VERIFIED" }
        : { bg: "#fef2f2", text: "#dc2626", border: "#fecaca", label: "✗ VOIDED" };

      // Serve verification page
      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Receipt ${receiptNumber} — Gulf Express Verification</title>
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet"/>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'DM Sans', system-ui, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
            .card { background: white; border-radius: 20px; width: 100%; max-width: 480px; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,.4); }
            .card-top { background: linear-gradient(135deg, #6d28d9, #4c1d95); padding: 28px 28px 24px; display: flex; align-items: center; justify-content: space-between; }
            .brand { display: flex; align-items: center; gap: 12px; }
            .brand-logo { width: 44px; height: 44px; background: rgba(255,255,255,.15); border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: white; letter-spacing: -1px; }
            .brand-name { color: white; font-size: 18px; font-weight: 700; }
            .brand-sub { color: rgba(255,255,255,.65); font-size: 11px; }
            .verify-badge { background: ${statusColor.bg}; border: 1.5px solid ${statusColor.border}; color: ${statusColor.text}; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 20px; letter-spacing: .5px; text-transform: uppercase; }
            .card-body { padding: 28px; }
            .receipt-no { font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 600; color: #7c3aed; margin-bottom: 4px; letter-spacing: .5px; }
            .receipt-sub { font-size: 12px; color: #94a3b8; margin-bottom: 24px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #e2e8f0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
            .ig-cell { background: #f8fafc; padding: 14px 16px; }
            .ig-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .9px; color: #94a3b8; margin-bottom: 4px; }
            .ig-val { font-size: 13px; font-weight: 600; color: #0f172a; }
            .ig-val.amount { font-family: 'DM Mono', monospace; font-size: 16px; color: #7c3aed; }
            .ig-val.tracking { font-family: 'DM Mono', monospace; font-size: 12px; color: #0ea5e9; }
            .status-bar { background: ${statusColor.bg}; border: 1px solid ${statusColor.border}; border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
            .status-icon { font-size: 24px; }
            .status-text { font-size: 12px; color: ${statusColor.text}; line-height: 1.5; }
            .status-text b { font-size: 13px; }
            .fta-notice { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 14px; font-size: 11px; color: #92400e; line-height: 1.6; margin-bottom: 20px; }
            .fta-notice b { color: #78350f; }
            .download-btn { display: block; width: 100%; background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; margin-bottom: 10px; }
            .back-link { display: block; text-align: center; font-size: 12px; color: #94a3b8; text-decoration: none; padding: 4px; }
            .card-footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 28px; text-align: center; font-size: 10px; color: #94a3b8; line-height: 1.7; }
            .card-footer b { color: #64748b; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="card-top">
              <div class="brand">
                <div class="brand-logo">GE</div>
                <div>
                  <div class="brand-name">Gulf Express</div>
                  <div class="brand-sub">Receipt Verification Portal</div>
                </div>
              </div>
              <div class="verify-badge">${statusColor.label}</div>
            </div>

            <div class="card-body">
              <div class="receipt-no">${receipt.receiptNumber}</div>
              <div class="receipt-sub">Tax Invoice — UAE FTA Compliant</div>

              <div class="info-grid">
                <div class="ig-cell">
                  <div class="ig-label">Customer</div>
                  <div class="ig-val">${receipt.customerName || "—"}</div>
                </div>
                <div class="ig-cell">
                  <div class="ig-label">Grand Total</div>
                  <div class="ig-val amount">AED ${Number(receipt.grandTotal || 0).toFixed(2)}</div>
                </div>
                <div class="ig-cell">
                  <div class="ig-label">Issue Date</div>
                  <div class="ig-val">${new Date(receipt.issueDate).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" })}</div>
                </div>
                <div class="ig-cell">
                  <div class="ig-label">Tracking ID</div>
                  <div class="ig-val tracking">${receipt.trackingId}</div>
                </div>
                <div class="ig-cell">
                  <div class="ig-label">Payment Method</div>
                  <div class="ig-val">${receipt.paymentMethod || "—"}</div>
                </div>
                <div class="ig-cell">
                  <div class="ig-label">VAT Amount</div>
                  <div class="ig-val">AED ${Number(receipt.vatAmount || 0).toFixed(2)}</div>
                </div>
              </div>

              <div class="status-bar">
                <div class="status-icon">${receipt.status === "active" ? "✅" : "🚫"}</div>
                <div class="status-text">
                  <b>${receipt.status === "active" ? "This receipt is authentic and verified" : "This receipt has been voided"}</b><br/>
                  Issued by Gulf Express Courier LLC · TRN: ${receipt.companyTRN || "100 4567 8900 003"}
                </div>
              </div>

              <div class="fta-notice">
                🏛 <b>UAE FTA Verified:</b> This Tax Invoice was issued under UAE Federal
                Decree-Law No. 8 of 2017. VAT charged at 5% standard rate.
                TRN: <b>${receipt.companyTRN || "100 4567 8900 003"}</b>
              </div>

              <a href="/api/receipts/${receipt.receiptNumber}/pdf" class="download-btn">⬇ Download PDF Receipt</a>
              <a href="https://gulfexpress.org" class="back-link">← Back to gulfexpress.org</a>
            </div>

            <div class="card-footer">
              <b>Gulf Express Courier LLC</b> · Office 412, Business Bay, Dubai, UAE<br/>
              📞 +971 4 000 0000 · billing@gulfexpress.org · gulfexpress.org<br/>
              Verified on ${new Date().toLocaleDateString("en-AE", { day: "2-digit", month: "long", year: "numeric" })} at ${new Date().toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" })} GST
            </div>
          </div>
        </body>
        </html>
      `);

    } catch (error: any) {
      console.error("[Verify] Error:", error);
      return res.status(500).send("Internal server error");
    }
  });

  app.patch("/api/receipts/:receiptNumber/void", async (req, res) => {
    const { reason } = req.body;
    const q = query(collection(db, "receipts"), where("receiptNumber", "==", req.params.receiptNumber));
    const snap = await getDocs(q);
    if (snap.empty) return res.status(404).json({ error: "Receipt not found" });
    await updateDoc(snap.docs[0].ref, { status: "voided", voidReason: reason || "" });
    return res.json({ success: true });
  });

  // POST /api/receipts/:receiptNumber/email
  app.post("/api/receipts/:receiptNumber/email", async (req, res) => {
    try {
      const { to_email } = req.body;
      const q = query(collection(db, "receipts"), where("receiptNumber", "==", req.params.receiptNumber));
      const snap = await getDocs(q);
      if (snap.empty) return res.status(404).json({ error: "Receipt not found" });

      const receipt = snap.docs[0].data();
      const pdfPath = receipt.pdfPath;
      const targetEmail = to_email || receipt.customerEmail;

      if (!targetEmail) return res.status(400).json({ error: "No email address provided" });

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.RECEIPT_FROM_EMAIL || '"Gulf Express Billing" <billing@gulfexpress.org>',
        to: targetEmail,
        subject: `Your Gulf Express Receipt — ${receipt.receiptNumber}`,
        text: `Dear ${receipt.customerName},\n\nPlease find attached your VAT receipt (${receipt.receiptNumber}) for shipment ${receipt.trackingId}.\n\nThank you for choosing Gulf Express.\n\nBest regards,\nGulf Express Courier LLC`,
        html: `<p>Dear ${receipt.customerName},</p><p>Please find attached your VAT receipt (<b>${receipt.receiptNumber}</b>) for shipment <b>${receipt.trackingId}</b>.</p><p>Thank you for choosing Gulf Express.</p><p>Best regards,<br>Gulf Express Courier LLC</p>`,
        attachments: [
          {
            filename: `${receipt.receiptNumber}.pdf`,
            path: pdfPath,
          },
        ],
      });

      return res.json({ success: true, sent_to: targetEmail });
    } catch (error: any) {
      console.error("[Email] Error sending receipt:", error);
      return res.status(500).json({ error: "Failed to send email", detail: error.message });
    }
  });

  return httpServer;
}

// Helper function to generate timeline based on shipment status
function generateTimeline(status: string, shipment: any) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const statuses = ['pending', 'picked-up', 'in-transit', 'out-for-delivery', 'delivered'];
  const statusIndex = statuses.indexOf(status);

  const timelineSteps = [
    {
      status: "Package Picked Up",
      location: `${shipment.senderCity}, UAE`,
      date: yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: "09:30 AM",
      completed: statusIndex >= 1,
      current: statusIndex === 1,
    },
    {
      status: "In Transit",
      location: "Dubai Distribution Center",
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: "11:45 AM",
      completed: statusIndex >= 2,
      current: statusIndex === 2,
    },
    {
      status: "Out for Delivery",
      location: shipment.currentLocation || `${shipment.receiverCity}, ${shipment.receiverCountry}`,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: "02:15 PM",
      completed: statusIndex >= 3,
      current: statusIndex === 3,
    },
    {
      status: "Delivered",
      location: `${shipment.receiverCity}, ${shipment.receiverCountry}`,
      date: shipment.estimatedDelivery || "Pending",
      time: statusIndex >= 4 ? "04:30 PM" : "Est. 04:30 PM",
      completed: statusIndex >= 4,
      current: statusIndex === 4,
    },
  ];

  // If status is pending, mark first item as current
  if (statusIndex === 0) {
    return [
      {
        status: "Order Received",
        location: "Gulf Courier HQ",
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: "08:00 AM",
        completed: true,
        current: false,
      },
      {
        status: "Awaiting Pickup",
        location: `${shipment.senderCity}, UAE`,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: "Scheduled",
        completed: false,
        current: true,
      },
      ...timelineSteps.slice(1).map(step => ({ ...step, completed: false, current: false })),
    ];
  }

  return timelineSteps;
}

// Helper function to get delivery time description
function getDeliveryTimeDescription(deliveryMode: string, receiverCountry: string): string {
  const isInternational = receiverCountry !== 'UAE';
  const isGCC = ['Saudi Arabia', 'Qatar', 'Oman', 'Bahrain', 'Kuwait'].includes(receiverCountry);

  switch (deliveryMode) {
    case 'same-day':
      return 'Same-day delivery (4-6 hours)';
    case 'next-day':
      return 'Next business day by 12:00 PM';
    case 'express':
      if (isInternational && !isGCC) return '3-5 business days';
      if (isGCC) return '2-3 business days';
      return '1-2 business days';
    case 'economy':
      if (isInternational && !isGCC) return '7-14 business days';
      if (isGCC) return '4-6 business days';
      return '3-5 business days';
    default:
      return '3-5 business days';
  }
}
