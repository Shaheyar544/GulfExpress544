# Firestore Security Rules - Fixed for Update Operations

## Problem
The update operation was failing because the security rules need explicit validation to prevent `trackingId` field modifications after creation.

## Solution
Updated security rules with explicit update permissions and field-level validation.

## Updated Security Rules for `/shipments/{shipmentId}`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Admins collection - only admins can read/write
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }
    
    // Shipments collection - PRIVATE (admin only)
    match /shipments/{shipmentId} {
      allow read: if isAdmin();
      
      // Explicitly allow create, update, and delete operations
      allow create: if isAdmin();
      
      // Allow update but prevent trackingId field from being modified after creation
      allow update: if isAdmin() && 
        // Ensure trackingId cannot be changed once set
        (resource.data.trackingId == request.resource.data.trackingId || 
         !('trackingId' in request.resource.data.diff(resource.data).affectedKeys()));
      
      allow delete: if isAdmin();
      
      // Timeline subcollection - admin only (nested for better organization)
      match /timeline/{timelineId} {
        allow read, write: if isAdmin();
      }
    }
    
    // Public Tracking Data collection - PUBLIC READ, ADMIN WRITE
    match /publicTrackingData/{trackingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ... (other collections remain the same)
  }
}
```

## Simplified Alternative (Recommended)

If the above validation is too complex, use this simpler approach:

```javascript
// Shipments collection - PRIVATE (admin only)
match /shipments/{shipmentId} {
  allow read: if isAdmin();
  
  // Explicitly allow all write operations for admins
  allow create, update, delete: if isAdmin();
  
  // Timeline subcollection - admin only
  match /timeline/{timelineId} {
    allow read, write: if isAdmin();
  }
}
```

**Note:** Client-side code should handle preventing `trackingId` updates. The security rule ensures only admins can update.

## Deployment

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the rules above
3. Click "Publish"


