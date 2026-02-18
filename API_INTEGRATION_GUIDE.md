# Gulf Express Tracking API Integration Guide

This document provides the technical details required for third-party tracking aggregators (such as 17TRACK, AfterShip, or Amazon Carrier Integration) to interface with the Gulf Express public tracking system.

## API Endpoint Specification

**Base URL**: `https://gulfexpress.org` (Replace with your live domain)
**Endpoint**: `/api/public/track/{tracking_number}`
**Method**: `GET`
**Authentication**: None (Public API)
**Rate Limit**: Standard 1000 requests per IP per 15 minutes.

### Request Format
Simply append the tracking number to the URL path.
Example: `GET https://gulfexpress.org/api/public/track/GC19614402AE`

### Response Format (JSON)
The API returns a JSON object containing the shipment status, weight, and a chronological list of tracking events (newest first).

```json
{
  "tracking_number": "GC19614402AE",
  "status": "in-transit",
  "carrier": "Gulf Express",
  "weight": 6.96,
  "events": [
    {
      "location": "Dubai Distribution Center",
      "description": "In Transit",
      "time": "2026-02-19T03:08:00.000Z"
    },
    {
      "location": "Dubai, UAE",
      "description": "Order Received",
      "time": "2026-02-18T08:00:00.000Z"
    }
  ]
}
```

### Status Codes
- `200 OK`: Successful retrieval.
- `404 Not Found`: Tracking number does not exist.
- `500 Internal Server Error`: Server-side issue.

## Specific Platform Instructions

### 1. 17TRACK Integration
To register Gulf Express as a carrier on 17TRACK:
1.  Go to the [17TRACK Carrier Suggestion Page](https://www.17track.net/en/contact) or contact `serv@17track.net`.
2.  Provide them with this document.
3.  Provide 2-3 **valid sample tracking numbers** currently in your system (e.g., `GC19614402AE`).
4.  They will add your API pattern to their system.

### 2. Amazon Integration
For Amazon "Buy Shipping" or VTR (Valid Tracking Rate):
1.  **Custom Carrier**: If you are not a major carrier in their dropdown list, you must select **"Other"** when confirming shipment.
2.  **Carrier Name**: Enter `Gulf Express`.
3.  **Tracking ID**: Enter the full tracking number (e.g., `GC19614402AE`).
4.  **Tracking URL**: Provide the direct link to your tracking page:
    `https://gulfexpress.org/track?id=GC19614402AE`

Amazon does not typically integrate custom APIs for small carriers directly. They rely on you providing a valid link where the customer can verify delivery.
