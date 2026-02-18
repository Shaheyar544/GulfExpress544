# Firestore Security Rules - Fixed Version

## Overview
These are the corrected security rules that fix the update error by optimizing the `isAdmin()` function and ensuring proper write permissions.

## Complete Security Rules (FIXED)

Copy and paste these rules into your Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    // This function checks if the authenticated user exists in the admins collection
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
      // Admin can read shipments
      allow read: if isAdmin();
      
      // Admin can write (create, update, delete) shipments
      allow write: if isAdmin();
      
      // Timeline subcollection - admin only
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
    
    // Inquiries collection - PUBLIC CREATE, ADMIN READ, NO UPDATE/DELETE
    match /inquiries/{messageId} {
      // Anyone (unauthenticated users) can create a new inquiry
      allow create: if true;
      
      // Only admins can read inquiries
      allow read: if isAdmin();
      
      // Prevent all updates and deletes
      allow update, delete: if false;
    }
  }
}
```

## Key Changes Made

1. **Removed conflicting `allow read: if false;` line** - This was causing read operations to always fail
2. **Nested timeline subcollection rule** - Moved inside the shipments match block for better organization
3. **Simplified write permissions** - Uses single `allow write: if isAdmin();` instead of separate conditions

## Troubleshooting Update Errors

If you're still getting "Failed to update" errors:

1. **Check Admin Document**: Ensure your user's UID exists in the `/admins/{uid}` collection
2. **Check Authentication**: Verify you're logged in as an admin user
3. **Check Browser Console**: Look for detailed error messages in the browser console
4. **Verify Security Rules**: Make sure these rules are published in Firebase Console

## Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `gulf-express-f3de8`
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace existing rules with the rules above
5. Click **Publish** to deploy

## Testing

After deploying, test the update functionality:
1. Login to admin panel
2. Navigate to a shipment detail page
3. Update the status and estimated delivery
4. Check browser console for any errors

