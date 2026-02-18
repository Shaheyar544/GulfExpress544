# Gulf Courier Admin Dashboard - Setup Guide

## Overview

This is a fully functional admin dashboard for Gulf Courier, built with React, TypeScript, Firebase (Auth + Firestore + Storage), and Tailwind CSS.

## Features Implemented

### ✅ 1. Admin Authentication
- Firebase Authentication with email/password
- Admin-only access control
- Role-based authorization (admin/super_admin)
- Protected routes requiring authentication

### ✅ 2. Dashboard Overview
- Real-time statistics (Total Shipments, Delivered, Pending, etc.)
- Charts showing shipments by month
- Service type distribution pie chart
- Quick stats cards

### ✅ 3. Shipment Management
- **List View**: Search and filter shipments by status
- **Add Shipment**: Complete form with all required fields
- **Edit Shipment**: Update shipment details
- **Shipment Detail**: View full details and update status
- Auto-generates tracking IDs in format: `GC-UAE-YEAR-XXXX`

### ✅ 4. Quotation Management
- View all quotation requests
- Approve/Reject quotations
- Status tracking

### ✅ 5. Pickup Request Management
- List all pickup requests
- Filter by status (Pending, Assigned, Picked, Completed)
- Update pickup status

### ✅ 6. Locations Management
- Add/edit/delete pickup points and branches
- Store coordinates for mapping
- Full CRUD operations

### ✅ 7. CMS Module
- Edit homepage hero content
- Update contact information
- Upload banner images to Firebase Storage
- Manage website content dynamically

### ✅ 8. User Management
- Add new admin users
- Remove admins (with protection for root admin)
- Role management (admin/super_admin)

### ✅ 9. Settings
- Configure delivery settings (cut-off times, policies)
- Notification preferences
- Email template customization

## Firebase Collections Structure

```
admins/
  {uid}/
    - uid: string
    - email: string
    - role: "admin" | "super_admin"
    - createdAt: Timestamp

shipments/
  {id}/
    - trackingId: string
    - senderName: string
    - senderPhone: string
    - receiverName: string
    - receiverPhone: string
    - originEmirate: string
    - destinationEmirate: string
    - serviceType: "same-day" | "next-day" | "economy" | "international"
    - status: "pending" | "in-transit" | "out-for-delivery" | "delivered" | "returned"
    - parcelWeight: number
    - amountPaid: number
    - createdAt: Timestamp
    - updatedAt: Timestamp

quotes/
  {id}/
    - senderName: string
    - email: string
    - phone: string
    - serviceType: string
    - status: "pending" | "approved" | "rejected"
    - estimatedPrice: number
    - createdAt: Timestamp

pickups/
  {id}/
    - name: string
    - phone: string
    - address: string
    - emirate: string
    - status: "pending" | "assigned" | "picked" | "completed"
    - createdAt: Timestamp

locations/
  {id}/
    - name: string
    - city: string
    - address: string
    - phone: string
    - hours: string
    - type: "pickup" | "branch"
    - coordinates: { lat: number, lng: number }

content/
  landing/
    - heroTitle: string
    - heroSubtitle: string
    - heroDescription: string
    - contactEmail: string
    - contactPhone: string
    - contactAddress: string
    - bannerImage: string (Firebase Storage URL)

settings/
  general/
    - sameDayCutoff: string
    - nextDayPolicy: string
    - defaultETA: string
    - emailNotifications: boolean
    - smsNotifications: boolean
    - emailTemplate: string
```

## Initial Setup

### 1. Firebase Configuration
The Firebase config is already set up in `client/src/lib/firebase.ts` with your project credentials.

### 2. Create First Admin User

You need to create the first admin user manually:

1. Go to Firebase Console → Authentication
2. Enable Email/Password authentication
3. Create a user with email and password
4. Go to Firestore Database
5. Create a document in the `admins` collection:
   - Document ID: Use the user's UID from Authentication
   - Fields:
     ```
     uid: {user_uid}
     email: "admin@gulfcourier.ae"
     role: "super_admin"
     createdAt: (current timestamp)
     ```

### 3. Firestore Security Rules

Set up security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins collection - only admins can read/write
    match /admins/{adminId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Shipments - admins can read/write, public can read by tracking ID
    match /shipments/{shipmentId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
        || resource.data.trackingId == request.query.trackingId;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Quotes - admins can read/write
    match /quotes/{quoteId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Pickups - admins can read/write
    match /pickups/{pickupId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Locations - admins can read/write, public can read
    match /locations/{locationId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Content - admins can read/write, public can read
    match /content/{contentId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Settings - admins can read/write
    match /settings/{settingId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

### 4. Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /banners/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }
  }
}
```

## Running the Application

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Access the admin panel**:
   - Public site: http://localhost:5000
   - Admin login: http://localhost:5000/admin/login
   - Admin dashboard: http://localhost:5000/admin

## Admin Routes

- `/admin/login` - Admin login page
- `/admin` - Dashboard overview
- `/admin/shipments` - Shipment list
- `/admin/shipments/new` - Add new shipment
- `/admin/shipments/:id` - Shipment details
- `/admin/shipments/:id/edit` - Edit shipment
- `/admin/quotations` - Quotation management
- `/admin/pickups` - Pickup requests
- `/admin/locations` - Location management
- `/admin/cms` - Content management
- `/admin/users` - User management
- `/admin/settings` - Settings

## Local Firebase Emulator (Optional)

For local testing without affecting production data:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize emulators:
   ```bash
   firebase init emulators
   ```

3. Start emulators:
   ```bash
   firebase emulators:start
   ```

The app will automatically connect to local emulators in development mode.

## Notes

- The admin panel uses Firebase Authentication for user management
- All admin users must be added to the `admins` collection in Firestore
- Only users in the `admins` collection can access the admin panel
- The root/admin user (the one who created the system) should have `role: "super_admin"`

## Next Steps

1. Set up Firebase Firestore collections as described above
2. Create the first admin user
3. Configure Firestore security rules
4. Test all features in the admin panel
5. Customize colors and branding as needed

## Support

For issues or questions, refer to the Firebase documentation or contact the development team.



