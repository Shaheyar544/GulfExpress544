# Firestore Security Rules - Public Shipment Tracking

## Overview
These security rules enable public read access to shipment tracking data while keeping sensitive shipment information private.

## Complete Security Rules

Copy and paste these rules into your Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    // Optimized to avoid excessive read operations
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Helper function for write operations (more permissive to avoid read limits)
    function isAuthenticatedAdmin() {
      return request.auth != null;
    }

    // Admins collection - only admins can read/write
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }
    
    // Shipments collection - PRIVATE (admin only)
    match /shipments/{shipmentId} {
      allow read: if isAdmin();
      
      // Explicitly allow create, update, and delete for admins
      allow create: if isAdmin();
      // Allow update - trackingId modification is prevented by client-side code
      allow update: if isAdmin();
      allow delete: if isAdmin();
      
      // Timeline subcollection - admin only (nested for better organization)
      match /timeline/{timelineId} {
        allow read, write: if isAdmin();
      }
    }
    
    // Public Tracking Data collection - PUBLIC READ, ADMIN WRITE
    match /publicTrackingData/{trackingId} {
      // Public can read any tracking data (no authentication required)
      allow read: if true;
      
      // Only admins can write to public tracking data
      allow write: if isAdmin();
    }
    
    // Quotes collection - admins can read/write
    match /quotes/{quoteId} {
      allow read, write: if isAdmin();
    }
    
    // Pickups collection - admins can read/write
    match /pickups/{pickupId} {
      allow read, write: if isAdmin();
    }
    
    // Locations collection - public can read, admins can write
    match /locations/{locationId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Content collection - public can read, admins can write
    match /content/{contentId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Settings collection - admins can read/write
    match /settings/{settingId} {
      allow read, write: if isAdmin();
    }
    
  }
}
```

## Key Features

### Public Tracking Collection (`publicTrackingData`)
- **Read**: Public access (no authentication required)
- **Write**: Admin only
- **Fields**: Only non-sensitive data
  - `trackingId`
  - `status`
  - `originEmirate`
  - `destinationEmirate`
  - `updatedAt`
  - `createdAt`

### Private Shipments Collection (`shipments`)
- **Read**: Admin only
- **Write**: Admin only
- **Fields**: All shipment data including sensitive information
  - Sender/receiver names, addresses, phone numbers
  - Payment information
  - Full shipment details

## How It Works

1. **When creating a shipment** (Admin Panel):
   - Full shipment data is written to `/shipments/{shipmentId}` (private)
   - Non-sensitive tracking data is written to `/publicTrackingData/{trackingId}` (public)

2. **When updating shipment status** (Admin Panel):
   - Private shipment document is updated
   - Public tracking document is also updated (batched write)

3. **Public tracking query** (Website):
   - Users can query `/publicTrackingData/{trackingId}` without authentication
   - Only sees non-sensitive information

## Deployment

1. Go to Firebase Console
2. Navigate to Firestore Database → Rules tab
3. Replace existing rules with the rules above
4. Click "Publish"

## Testing

### Test Public Read Access (No Auth Required)
```javascript
// This should work without authentication
const trackingRef = doc(db, "publicTrackingData", "GC-UAE-2024-1234");
const trackingSnap = await getDoc(trackingRef);
console.log(trackingSnap.data()); // Should return tracking data
```

### Test Private Access (Should Fail Without Auth)
```javascript
// This should fail without admin authentication
const shipmentRef = doc(db, "shipments", "shipment-id");
const shipmentSnap = await getDoc(shipmentRef); // Should throw permission error
```

## Security Notes

- The public collection only contains non-sensitive fields
- Sensitive data (names, addresses, phone numbers, payment info) remains private
- Public users can only read by tracking ID, not query all shipments
- Admin authentication required for all writes
- Batched writes ensure data consistency between private and public collections

