# Booking Firestore Integration - Complete Fixes

## Overview
This document shows the fixes for two critical issues:
1. Pickup requests from customer bookings not appearing in Admin Portal
2. Tracking IDs from customer bookings not traceable on public tracking page

---

## Task 1: Fixed Pickup Request Visibility in Admin Portal

### Updated Pickup Request Management Component

**File:** `client/src/pages/admin/Pickups.tsx`

The component query is already correct - it fetches all pickups without status filtering. The issue was that pickups weren't being created in Firestore.

**Current Query (Lines 38-60):**
```typescript
const fetchPickups = async () => {
  try {
    const pickupsQuery = query(
      collection(db, "pickups"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(pickupsQuery);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPickups(data);
  } catch (error) {
    console.error("Error fetching pickups:", error);
    toast({
      title: "Error",
      description: "Failed to fetch pickup requests",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

**Note:** The query correctly fetches all pickups. The fix was ensuring pickups are created in Firestore (see Task 2).

---

## Task 2: Ensure Public Tracking Data is Created

### Updated Booking Submission to Write to Firestore

**File:** `client/src/pages/Book.tsx`

**Key Changes:**

1. **Added Firestore imports:**
```typescript
import { collection, doc, setDoc, writeBatch, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
```

2. **Updated `onSubmit` function to write to Firestore:**

```typescript
const onSubmit = async (data: BookingFormData) => {
  setIsSubmitting(true);
  try {
    // 1. Create booking via API (for backward compatibility)
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        weight: parseFloat(data.weight),
        length: data.length ? parseFloat(data.length) : null,
        width: data.width ? parseFloat(data.width) : null,
        height: data.height ? parseFloat(data.height) : null,
      }),
    });

    if (!response.ok) throw new Error("Failed to create booking");

    const result = await response.json();
    const trackingId = result.trackingNumber;
    
    // 2. Write to Firestore: Create pickup request, shipment, and public tracking data
    const batch = writeBatch(db);
    const now = Timestamp.now();
    
    // Map senderCity to emirate
    const cityToEmirate: Record<string, string> = {
      "Dubai": "Dubai",
      "Abu Dhabi": "Abu Dhabi",
      "Sharjah": "Sharjah",
      "Ajman": "Ajman",
      "Ras Al Khaimah": "Ras Al Khaimah",
      "Fujairah": "Fujairah",
      "Umm Al Quwain": "Umm Al Quwain",
    };
    const originEmirate = cityToEmirate[data.senderCity] || data.senderCity;
    const destinationEmirate = data.receiverCountry === "UAE" 
      ? (cityToEmirate[data.receiverCity] || data.receiverCity)
      : data.receiverCountry;
    
    // Step 2A: Create pickup request if pickup is required
    if (data.pickupRequired) {
      const pickupRef = doc(collection(db, "pickups"));
      batch.set(pickupRef, {
        name: data.senderName,
        phone: data.senderPhone,
        email: data.senderEmail,
        address: data.senderAddress,
        emirate: originEmirate,
        city: data.senderCity,
        status: "pending",
        pickupDate: data.pickupDate || null,
        specialInstructions: data.specialInstructions || null,
        trackingNumber: trackingId,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    // Step 2B: Create shipment document (sensitive data)
    const shipmentRef = doc(collection(db, "shipments"));
    const shipmentData = {
      trackingId: trackingId,
      senderName: data.senderName,
      senderPhone: data.senderPhone,
      senderEmail: data.senderEmail,
      senderAddress: data.senderAddress,
      originEmirate: originEmirate,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      receiverEmail: data.receiverEmail || null,
      receiverAddress: data.receiverAddress,
      destinationEmirate: destinationEmirate,
      receiverCountry: data.receiverCountry,
      serviceType: data.deliveryMode,
      parcelWeight: parseFloat(data.weight),
      shipmentType: data.shipmentType,
      deliveryMode: data.deliveryMode,
      pickupRequired: data.pickupRequired || false,
      status: "pending",
      estimatedDelivery: result.estimatedDelivery,
      amountPaid: 0,
      notes: data.specialInstructions || null,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(shipmentRef, shipmentData);
    
    // Step 2C: Create public tracking data (non-sensitive fields only)
    const publicTrackingRef = doc(db, "publicTrackingData", trackingId);
    batch.set(publicTrackingRef, {
      trackingId: trackingId,
      status: "pending",
      originEmirate: originEmirate,
      destinationEmirate: destinationEmirate,
      createdAt: now,
      updatedAt: now,
    });
    
    // Commit all writes atomically
    await batch.commit();
    
    setBookingFormData(data);
    setBookingResult(result);
    toast({
      title: "Booking Confirmed!",
      description: `Your tracking number is ${result.trackingNumber}`,
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to create booking. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Data Flow

```
Customer Books Shipment
         ↓
1. API Call: POST /api/bookings
   → Creates booking in MemStorage (backward compatibility)
         ↓
2. Firestore Batched Write:
   ├─→ /pickups/{id} (if pickupRequired = true)
   │   └─ Status: "pending"
   │   └─ Includes: name, phone, address, emirate, trackingNumber
   │
   ├─→ /shipments/{id}
   │   └─ Full shipment data (sensitive)
   │   └─ Status: "pending"
   │
   └─→ /publicTrackingData/{trackingId}
       └─ Non-sensitive fields only
       └─ Status: "pending"
       └─ Publicly readable
```

---

## What Gets Created

### 1. Pickup Request (`/pickups/{id}`)
- **Created when:** `pickupRequired === true`
- **Fields:**
  - `name`: Customer name
  - `phone`: Customer phone
  - `email`: Customer email
  - `address`: Pickup address
  - `emirate`: Origin emirate
  - `city`: Origin city
  - `status`: "pending"
  - `trackingNumber`: Associated tracking ID
  - `pickupDate`: Preferred pickup date (if provided)
  - `specialInstructions`: Special instructions (if provided)
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

### 2. Shipment Document (`/shipments/{id}`)
- **Always created**
- **Fields:** All shipment data including sensitive information
- **Access:** Admin only (private collection)

### 3. Public Tracking Data (`/publicTrackingData/{trackingId}`)
- **Always created**
- **Fields (non-sensitive only):**
  - `trackingId`: Tracking number
  - `status`: "pending"
  - `originEmirate`: Origin emirate
  - `destinationEmirate`: Destination emirate
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp
- **Access:** Public read, admin write

---

## Testing

### Test Pickup Visibility:
1. Create a booking with `pickupRequired: true`
2. Go to Admin Portal → Pickups
3. Verify the pickup request appears in the table with status "pending"

### Test Public Tracking:
1. Create a booking
2. Note the tracking number
3. Go to public tracking page: `/track?id={trackingNumber}`
4. Verify tracking information is displayed

---

## Files Modified

1. ✅ `client/src/pages/Book.tsx` - Added Firestore writes after booking creation
2. ✅ `client/src/pages/admin/Pickups.tsx` - Verified query is correct (no changes needed)

---

## Summary

✅ **Task 1 Fixed:** Pickup requests now appear in Admin Portal  
✅ **Task 2 Fixed:** Public tracking data is created for all bookings  
✅ **Batched Writes:** All Firestore writes are atomic (all succeed or all fail)  
✅ **Data Consistency:** Pickup, shipment, and public tracking data are synchronized

The implementation ensures that:
- Pickup requests are visible in the admin panel
- Tracking IDs are traceable on the public tracking page
- All data is written atomically using Firestore batched writes


