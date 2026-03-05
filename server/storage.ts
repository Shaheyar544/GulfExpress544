import {
  type User, type InsertUser,
  type Shipment, type InsertShipment,
  type Quotation, type InsertQuotation,
  type ContactMessage, type InsertContactMessage,
  type NewsletterSubscription, type InsertNewsletterSubscription,
  type Booking, type InsertBooking
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Shipments
  getShipment(id: string): Promise<Shipment | undefined>;
  getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | undefined>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment | undefined>;

  // Quotations
  getQuotation(id: string): Promise<Quotation | undefined>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;

  // Contact Messages
  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Newsletter
  getNewsletterSubscription(email: string): Promise<NewsletterSubscription | undefined>;
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;

  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingByTrackingNumber(trackingNumber: string): Promise<Booking | undefined>;
  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingByTrackingNumber(trackingNumber: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;

  // Site Configs
  getSiteConfig(key: string): Promise<string | undefined>;
  setSiteConfig(key: string, value: string): Promise<void>;
}



// Helper function to calculate estimated price
function calculatePrice(
  shipmentType: string,
  weight: number,
  deliveryMode: string,
  receiverCountry: string,
  pickupRequired: boolean
): {
  estimatedPrice: number;
  breakdown: { basePrice: number; weightCharge: number; speedCharge: number; pickupCharge: number }
} {
  // Base prices by shipment type
  const basePrices: Record<string, number> = {
    'documents': 20,
    'parcels': 35,
    'freight': 100,
  };

  // Weight charges per kg
  const weightRates: Record<string, number> = {
    'documents': 5,
    'parcels': 8,
    'freight': 3,
  };

  // Speed multipliers
  const speedMultipliers: Record<string, number> = {
    'same-day': 2.0,
    'next-day': 1.5,
    'express': 1.2,
    'economy': 1.0,
  };

  // International surcharge
  const isInternational = receiverCountry !== 'UAE';
  const isGCC = ['Saudi Arabia', 'Qatar', 'Oman', 'Bahrain', 'Kuwait'].includes(receiverCountry);

  let basePrice = basePrices[shipmentType] || 35;
  let weightCharge = (weightRates[shipmentType] || 8) * weight;
  let speedCharge = 0;

  // Apply speed multiplier to base + weight
  const speedMultiplier = speedMultipliers[deliveryMode] || 1.0;
  speedCharge = (basePrice + weightCharge) * (speedMultiplier - 1);

  // International/GCC surcharge
  if (isInternational && !isGCC) {
    basePrice += 100; // International surcharge
  } else if (isGCC) {
    basePrice += 40; // GCC surcharge
  }

  const pickupCharge = pickupRequired ? 15 : 0;

  const estimatedPrice = basePrice + weightCharge + speedCharge + pickupCharge;

  return {
    estimatedPrice: Math.round(estimatedPrice * 100) / 100,
    breakdown: {
      basePrice: Math.round(basePrice * 100) / 100,
      weightCharge: Math.round(weightCharge * 100) / 100,
      speedCharge: Math.round(speedCharge * 100) / 100,
      pickupCharge,
    }
  };
}

// Helper to get estimated delivery time
function getEstimatedDelivery(deliveryMode: string, receiverCountry: string): string {
  const isInternational = receiverCountry !== 'UAE';
  const isGCC = ['Saudi Arabia', 'Qatar', 'Oman', 'Bahrain', 'Kuwait'].includes(receiverCountry);

  const now = new Date();
  let daysToAdd = 1;

  switch (deliveryMode) {
    case 'same-day':
      // Same day delivery - today
      const hours = now.getHours();
      if (hours < 12) {
        return `Today, ${5 + Math.floor(Math.random() * 3)}:00 PM`;
      } else {
        return `Today, ${7 + Math.floor(Math.random() * 2)}:00 PM`;
      }
    case 'next-day':
      daysToAdd = 1;
      break;
    case 'express':
      daysToAdd = isInternational ? 5 : isGCC ? 3 : 2;
      break;
    case 'economy':
      daysToAdd = isInternational ? 10 : isGCC ? 5 : 3;
      break;
  }

  const deliveryDate = new Date(now);
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);

  return deliveryDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private shipments: Map<string, Shipment>;
  private quotations: Map<string, Quotation>;
  private contactMessages: Map<string, ContactMessage>;
  private newsletterSubscriptions: Map<string, NewsletterSubscription>;
  private bookings: Map<string, Booking>;
  private siteConfigs: Map<string, string>;

  constructor() {
    this.users = new Map();
    this.shipments = new Map();
    this.quotations = new Map();
    this.contactMessages = new Map();
    this.newsletterSubscriptions = new Map();
    this.bookings = new Map();
    this.siteConfigs = new Map();

    // Check for local storage file
    // Check for local storage file
    // this.loadFromLocal();

    // Initialize with sample shipments ONLY if we have no data
    if (this.shipments.size === 0) {
      this.initializeSampleData();
    }
  }



  private initializeSampleData() {
    // Add sample shipments that users can track
    const sampleShipments: Shipment[] = [
      {
        id: randomUUID(),
        trackingNumber: 'GC-UAE-2024-1234',
        senderName: 'Ahmed Al Maktoum',
        senderCity: 'Abu Dhabi',
        senderPhone: '+971 50 123 4567',
        senderEmail: 'ahmed@example.com',
        receiverName: 'Sarah Johnson',
        receiverCountry: 'UAE',
        receiverCity: 'Dubai',
        receiverAddress: 'Business Bay, Tower A',
        receiverPhone: '+971 55 987 6543',
        shipmentType: 'parcels',
        weight: 2.5,
        dimensions: '30x20x15',
        deliveryMode: 'same-day',
        pickupRequired: true,
        status: 'out-for-delivery',
        currentLocation: 'Dubai, Business Bay',
        estimatedDelivery: 'Today, 4:30 PM',
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        trackingNumber: 'GC-UAE-2024-5678',
        senderName: 'Gulf Trading Co.',
        senderCity: 'Dubai',
        senderPhone: '+971 4 234 5678',
        senderEmail: 'shipping@gulftrade.ae',
        receiverName: 'Mohammed Hassan',
        receiverCountry: 'Saudi Arabia',
        receiverCity: 'Riyadh',
        receiverAddress: 'King Fahd Road',
        receiverPhone: '+966 50 123 4567',
        shipmentType: 'freight',
        weight: 150,
        dimensions: '100x80x60',
        deliveryMode: 'express',
        pickupRequired: true,
        status: 'in-transit',
        currentLocation: 'Dubai International Airport',
        estimatedDelivery: 'Thu, Dec 7',
        createdAt: new Date(),
      },
    ];

    sampleShipments.forEach(shipment => {
      this.shipments.set(shipment.id, shipment);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Shipment methods
  async getShipment(id: string): Promise<Shipment | undefined> {
    return this.shipments.get(id);
  }

  async getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | undefined> {
    return Array.from(this.shipments.values()).find(
      (shipment) => shipment.trackingNumber.toLowerCase() === trackingNumber.toLowerCase(),
    );
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const id = randomUUID();
    const trackingNumber = await this.generateTrackingNumber();
    const shipment: Shipment = {
      ...insertShipment,
      id,
      trackingNumber,
      dimensions: insertShipment.dimensions || null,
      currentLocation: insertShipment.currentLocation || null,
      estimatedDelivery: insertShipment.estimatedDelivery || null,
      pickupRequired: insertShipment.pickupRequired ?? false,
      status: 'pending',
      createdAt: new Date(),
    };
    this.shipments.set(id, shipment);
    return shipment;
  }

  async updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment | undefined> {
    const shipment = this.shipments.get(id);
    if (!shipment) return undefined;

    const updatedShipment = { ...shipment, ...updates };
    this.shipments.set(id, updatedShipment);
    return updatedShipment;
  }

  // Quotation methods
  async getQuotation(id: string): Promise<Quotation | undefined> {
    return this.quotations.get(id);
  }

  async createQuotation(insertQuotation: InsertQuotation): Promise<Quotation> {
    const id = randomUUID();
    const { estimatedPrice } = calculatePrice(
      insertQuotation.shipmentType,
      insertQuotation.weight,
      insertQuotation.deliveryMode,
      insertQuotation.receiverCountry,
      insertQuotation.pickupRequired || false
    );

    const quotation: Quotation = {
      ...insertQuotation,
      id,
      estimatedPrice: estimatedPrice || null,
      length: insertQuotation.length || null,
      width: insertQuotation.width || null,
      height: insertQuotation.height || null,
      pickupRequired: insertQuotation.pickupRequired ?? false,
      createdAt: new Date(),
    };
    this.quotations.set(id, quotation);
    return quotation;
  }

  // Contact Message methods
  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  // Newsletter methods
  async getNewsletterSubscription(email: string): Promise<NewsletterSubscription | undefined> {
    return Array.from(this.newsletterSubscriptions.values()).find(
      (sub) => sub.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const id = randomUUID();
    const subscription: NewsletterSubscription = {
      ...insertSubscription,
      id,
      createdAt: new Date(),
    };
    this.newsletterSubscriptions.set(id, subscription);
    return subscription;
  }

  // Booking methods
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingByTrackingNumber(trackingNumber: string): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(
      (booking) => booking.trackingNumber?.toLowerCase() === trackingNumber.toLowerCase(),
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const trackingNumber = await this.generateTrackingNumber();
    const booking: Booking = {
      ...insertBooking,
      id,
      trackingNumber,
      receiverEmail: insertBooking.receiverEmail || null,
      length: insertBooking.length || null,
      width: insertBooking.width || null,
      height: insertBooking.height || null,
      pickupRequired: insertBooking.pickupRequired ?? true,
      pickupDate: insertBooking.pickupDate || null,
      specialInstructions: insertBooking.specialInstructions || null,
      status: 'pending',
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);

    // Also create a corresponding shipment
    const shipment: Shipment = {
      id: randomUUID(),
      trackingNumber,
      senderName: insertBooking.senderName,
      senderCity: insertBooking.senderCity,
      senderPhone: insertBooking.senderPhone,
      senderEmail: insertBooking.senderEmail,
      receiverName: insertBooking.receiverName,
      receiverCountry: insertBooking.receiverCountry,
      receiverCity: insertBooking.receiverCity,
      receiverAddress: insertBooking.receiverAddress,
      receiverPhone: insertBooking.receiverPhone,
      shipmentType: insertBooking.shipmentType,
      weight: insertBooking.weight,
      dimensions: insertBooking.length && insertBooking.width && insertBooking.height
        ? `${insertBooking.length}x${insertBooking.width}x${insertBooking.height}`
        : null,
      deliveryMode: insertBooking.deliveryMode,
      pickupRequired: insertBooking.pickupRequired || false,
      status: 'pending',
      currentLocation: insertBooking.senderCity,
      estimatedDelivery: getEstimatedDelivery(insertBooking.deliveryMode, insertBooking.receiverCountry),
      createdAt: new Date(),
    };
    this.shipments.set(shipment.id, shipment);

    return booking;
  }

  // Site Config methods
  async getSiteConfig(key: string): Promise<string | undefined> {
    return this.siteConfigs.get(key);
  }

  async setSiteConfig(key: string, value: string): Promise<void> {
    this.siteConfigs.set(key, value);
    // this.saveToLocal(); // Removed to rely on Firebase rules update
  }

  async generateTrackingNumber(): Promise<string> {
    const pattern = await this.getSiteConfig('tracking_number_pattern') || 'GC-UAE-{year}-{random}';

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const uuid = randomUUID().split('-')[0].toUpperCase();

    return pattern
      .replace('{year}', year)
      .replace('{month}', month)
      .replace('{day}', day)
      .replace('{random}', random)
      .replace('{uuid}', uuid);
  }
}

// Export utility functions for use in routes
export { calculatePrice, getEstimatedDelivery };

// ... (keeping MemStorage for fallback)

import { db } from "./firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";

export class FirebaseStorage extends MemStorage {
  constructor() {
    super();
  }

  // Override Site Config methods to persist in Firebase
  async getSiteConfig(key: string): Promise<string | undefined> {
    try {
      const docRef = doc(db, "site_configs", key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const value = docSnap.data().value;
        console.log(`[FirebaseStorage] Loaded config '${key}' from Firestore:`, value);
        await super.setSiteConfig(key, value);
        return value;
      } else {
        console.log(`[FirebaseStorage] Config '${key}' not found in Firestore`);
      }
    } catch (error) {
      console.error(`[FirebaseStorage] Error fetching config ${key} from Firebase:`, error);
    }
    return super.getSiteConfig(key);
  }

  async setSiteConfig(key: string, value: string): Promise<void> {
    console.log(`[FirebaseStorage] Saving config '${key}' to Firestore:`, value);
    await super.setSiteConfig(key, value);
    try {
      const docRef = doc(db, "site_configs", key);
      await setDoc(docRef, { key, value, updatedAt: new Date() });
      console.log(`[FirebaseStorage] Successfully saved config '${key}' to Firestore`);
    } catch (error) {
      console.error(`[FirebaseStorage] Error saving config ${key} to Firebase:`, error);
    }
  }

  // SHIPMENT METHODS
  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const id = randomUUID();
    const trackingNumber = await this.generateTrackingNumber();

    const shipment: Shipment = {
      ...insertShipment,
      id,
      trackingNumber,
      dimensions: insertShipment.dimensions || null,
      currentLocation: insertShipment.currentLocation || null,
      estimatedDelivery: insertShipment.estimatedDelivery || null,
      pickupRequired: insertShipment.pickupRequired ?? false,
      status: 'pending',
      createdAt: new Date(),
    };

    // Save to Firebase (both collections)
    try {
      await setDoc(doc(db, "shipments", id), {
        ...shipment,
        createdAt: shipment.createdAt?.toISOString()
      });

      await setDoc(doc(db, "publicTrackingData", trackingNumber), {
        trackingId: trackingNumber,
        status: shipment.status,
        originEmirate: shipment.senderCity,
        destinationEmirate: shipment.receiverCity,
        updatedAt: new Date(),
        senderName: shipment.senderName,
        receiverName: shipment.receiverName,
        weight: shipment.weight
      });
      console.log(`Created shipment ${trackingNumber} in Firestore`);
    } catch (e) {
      console.error("Error creating shipment in Firebase:", e);
    }

    // Update local memory
    (this as any).shipments.set(id, shipment);
    return shipment;
  }

  async updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment | undefined> {
    const shipment = await this.getShipment(id);
    if (!shipment) return undefined;

    const updatedShipment = { ...shipment, ...updates };

    try {
      await updateDoc(doc(db, "shipments", id), {
        ...updates
      });

      if (updatedShipment.trackingNumber) {
        const publicUpdates: any = {
          status: updatedShipment.status,
          updatedAt: new Date()
        };
        if (updates.senderName) publicUpdates.senderName = updates.senderName;
        if (updates.receiverName) publicUpdates.receiverName = updates.receiverName;
        if (updates.weight) publicUpdates.weight = updates.weight;
        if (updates.currentLocation) publicUpdates.currentLocation = updates.currentLocation;

        await updateDoc(doc(db, "publicTrackingData", updatedShipment.trackingNumber), publicUpdates);
      }
      console.log(`Updated shipment ${id} in Firestore`);
    } catch (e) {
      console.error("Error updating shipment in Firebase:", e);
    }

    (this as any).shipments.set(id, updatedShipment);
    return updatedShipment;
  }

  async getShipment(id: string): Promise<Shipment | undefined> {
    // Try Memory First
    let shipment = (this as any).shipments.get(id);
    if (shipment) return shipment;

    // Try Firebase
    try {
      const snap = await getDoc(doc(db, "shipments", id));
      if (snap.exists()) {
        const data = snap.data();
        shipment = {
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
        } as Shipment;
        (this as any).shipments.set(id, shipment);
        return shipment;
      }
    } catch (e) {
      console.error("Error getting shipment from Firebase:", e);
    }
    return undefined;
  }

  async getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | undefined> {
    // Try Memory
    const memShipment = Array.from((this as any).shipments.values()).find(
      (s: any) => s.trackingNumber === trackingNumber
    );
    if (memShipment) return memShipment as Shipment;

    // Try Firebase
    try {
      const q = query(collection(db, "shipments"), where("trackingNumber", "==", trackingNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const shipment = {
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
        } as Shipment;
        (this as any).shipments.set(shipment.id, shipment);
        return shipment;
      }
    } catch (e) {
      console.error("Error finding shipment by tracking number:", e);
    }
    return undefined;
  }

  async createApiShipment(data: {
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    originEmirate: string;
    destinationEmirate: string;
    serviceType: string;
    parcelWeight?: number;
    amountPaid?: number;
    notes?: string;
    shipmentMode?: "standard" | "return";
    linkedOrderId?: string;
    itemName?: string;
    itemValue?: number;
  }): Promise<{ trackingId: string; shipmentId: string }> {
    const trackingId = await this.generateTrackingNumber();
    const shipmentId = randomUUID();
    const now = new Date();

    const shipmentDoc = {
      id: shipmentId,
      trackingId,
      trackingNumber: trackingId,
      senderName: data.senderName,
      senderPhone: data.senderPhone,
      senderAddress: data.senderAddress,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      receiverAddress: data.receiverAddress,
      originEmirate: data.originEmirate,
      destinationEmirate: data.destinationEmirate,
      serviceType: data.serviceType,
      parcelWeight: data.parcelWeight ?? 0,
      amountPaid: data.amountPaid ?? 0,
      notes: data.notes ?? null,
      shipmentMode: data.shipmentMode ?? "standard",
      linkedOrderId: data.linkedOrderId ?? null,
      itemName: data.itemName ?? null,
      itemValue: data.itemValue ?? null,
      status: "pending",
      createdAt: now.toISOString(),
    };

    try {
      const { setDoc, doc: fsDoc } = await import("firebase/firestore");
      await setDoc(fsDoc(db, "shipments", shipmentId), shipmentDoc);
      await setDoc(fsDoc(db, "publicTrackingData", trackingId), {
        trackingId,
        status: "pending",
        originEmirate: data.originEmirate,
        destinationEmirate: data.destinationEmirate,
        senderName: data.senderName,
        receiverName: data.receiverName,
        weight: data.parcelWeight ?? 0,
        shipmentMode: data.shipmentMode ?? "standard",
        linkedOrderId: data.linkedOrderId ?? null,
        itemName: data.itemName ?? null,
        updatedAt: now,
      });
      console.log(`[API] Created shipment ${trackingId}`);
    } catch (e) {
      console.error("[API] Error creating shipment in Firebase:", e);
      throw e;
    }

    return { trackingId, shipmentId };
  }

  async generateTrackingNumber(): Promise<string> {
    // Hardcoded pattern as per user request
    const pattern = 'GC{day}{random}{month}AE';
    // const pattern = await this.getSiteConfig('tracking_number_pattern') || 'GC-UAE-{year}-{random}';
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const uuid = randomUUID().split('-')[0].toUpperCase();

    return pattern
      .replace('{year}', year)
      .replace('{month}', month)
      .replace('{day}', day)
      .replace('{random}', random)
      .replace('{uuid}', uuid);
  }
}

export const storage = new FirebaseStorage();
