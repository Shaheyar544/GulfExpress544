import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, calculatePrice, getEstimatedDelivery } from "./storage";
import { insertQuotationSchema, insertContactMessageSchema, insertBookingSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./firebase";
import { doc, getDoc, collection, getDocs, query, where, updateDoc, orderBy, limit } from "firebase/firestore";
import { apiKeyMiddleware } from "./middleware/apiKeyMiddleware";


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
    } catch (error) {
      console.error("[API v1] Error creating shipment:", error);
      return res.status(500).json({ error: "Failed to create shipment" });
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
