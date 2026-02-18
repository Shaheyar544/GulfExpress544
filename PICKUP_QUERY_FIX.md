# Pickup Request Management Query Fix

## Problem
The Admin Portal's "Pickup Request Management" table was empty despite:
- Customer successfully submitting pickup requests
- Firestore Security Rules correctly configured
- Pickups being created in Firestore

## Root Cause
The query was using `orderBy("createdAt", "desc")` which requires a Firestore composite index. If the index doesn't exist or there's a mismatch, the query fails silently.

## Solution
Updated the query to:
1. **Fetch all documents without `orderBy`** (avoids index requirements)
2. **Sort client-side** after fetching all documents
3. **Enhanced error handling** with detailed error messages
4. **Added debug logging** to help troubleshoot issues

---

## Updated Code

**File:** `client/src/pages/admin/Pickups.tsx`

### Key Changes:

1. **Removed server-side `orderBy`** - Fetches all documents first
2. **Client-side sorting** - Sorts by `createdAt` after fetching
3. **Better error handling** - Shows specific error messages
4. **Added refresh button** - Allows manual refresh
5. **Fixed Timestamp usage** - Uses Firestore `Timestamp` for updates

---

## Complete Updated Component

```typescript
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Truck, RefreshCw } from "lucide-react";

export default function Pickups() {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      
      // Fetch all pickups without orderBy to avoid index requirements
      // This ensures we get all documents regardless of index configuration
      const pickupsCollection = collection(db, "pickups");
      const snapshot = await getDocs(pickupsCollection);
      
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort client-side by createdAt if available
      const sortedData = data.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bDate - aDate; // Descending order (newest first)
      });
      
      setPickups(sortedData);
      
      // Log for debugging
      console.log(`Successfully fetched ${sortedData.length} pickup requests`);
      
      if (sortedData.length === 0) {
        console.warn("No pickup requests found in Firestore collection 'pickups'");
      }
    } catch (error: any) {
      console.error("Error fetching pickups:", error);
      const errorMessage = error?.message || "Unknown error";
      const errorCode = error?.code || "";
      
      toast({
        title: "Error",
        description: errorCode === "permission-denied"
          ? "Permission denied. Please ensure you are logged in as an admin."
          : `Failed to fetch pickup requests: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "pickups", id), {
        status,
        updatedAt: Timestamp.now(),
      });
      toast({
        title: "Success",
        description: "Pickup status updated",
      });
      fetchPickups();
    } catch (error: any) {
      console.error("Error updating pickup:", error);
      const errorMessage = error?.message || "Failed to update pickup";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const filteredPickups = pickups.filter((pickup) => {
    const matchesSearch =
      pickup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.phone?.includes(searchTerm) ||
      pickup.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || pickup.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pickup Request Management</h1>
        <p className="text-gray-600 mt-1">Manage pickup requests and assign drivers</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="picked">Picked</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={fetchPickups}
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Emirate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPickups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No pickup requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredPickups.map((pickup) => (
                <TableRow key={pickup.id}>
                  <TableCell>
                    {pickup.createdAt?.toDate?.()
                      ? new Date(pickup.createdAt.toDate()).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pickup.name || "N/A"}</div>
                      <div className="text-sm text-gray-500">{pickup.phone || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{pickup.address || "N/A"}</TableCell>
                  <TableCell>{pickup.emirate || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        pickup.status === "completed"
                          ? "default"
                          : pickup.status === "pending"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {pickup.status || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={pickup.status || "pending"}
                      onValueChange={(value) => handleStatusUpdate(pickup.id, value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="picked">Picked</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

---

## Key Improvements

### 1. **Removed Server-Side OrderBy**
```typescript
// OLD (requires index):
const pickupsQuery = query(
  collection(db, "pickups"),
  orderBy("createdAt", "desc")
);

// NEW (no index required):
const pickupsCollection = collection(db, "pickups");
const snapshot = await getDocs(pickupsCollection);
```

### 2. **Client-Side Sorting**
```typescript
const sortedData = data.sort((a, b) => {
  const aDate = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
  const bDate = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
  return bDate - aDate; // Descending order (newest first)
});
```

### 3. **Enhanced Error Handling**
```typescript
catch (error: any) {
  console.error("Error fetching pickups:", error);
  const errorMessage = error?.message || "Unknown error";
  const errorCode = error?.code || "";
  
  toast({
    title: "Error",
    description: errorCode === "permission-denied"
      ? "Permission denied. Please ensure you are logged in as an admin."
      : `Failed to fetch pickup requests: ${errorMessage}`,
    variant: "destructive",
  });
}
```

### 4. **Debug Logging**
```typescript
console.log(`Successfully fetched ${sortedData.length} pickup requests`);

if (sortedData.length === 0) {
  console.warn("No pickup requests found in Firestore collection 'pickups'");
}
```

### 5. **Refresh Button**
Added a refresh button to manually reload pickup requests.

---

## Testing

1. **Create a booking with pickup required**
2. **Go to Admin Portal → Pickups**
3. **Check browser console** for log messages:
   - `Successfully fetched X pickup requests`
   - If empty: `No pickup requests found in Firestore collection 'pickups'`
4. **Verify pickup appears in table** with status "pending"

---

## Expected Behavior

- ✅ All pickup requests are fetched from Firestore
- ✅ Requests are sorted by date (newest first)
- ✅ Status filter works correctly (default: "all")
- ✅ Search functionality works
- ✅ Refresh button allows manual reload
- ✅ Error messages are clear and actionable

---

## Troubleshooting

If pickups still don't appear:

1. **Check browser console** for error messages
2. **Verify Firestore Security Rules** allow admin read access
3. **Check Firestore Console** to confirm documents exist in `/pickups` collection
4. **Verify document structure** matches expected fields:
   - `name`, `phone`, `address`, `emirate`, `status`, `createdAt`, etc.

---

## Summary

✅ **Query fixed** - Removed server-side `orderBy` that required index  
✅ **Client-side sorting** - Sorts after fetching all documents  
✅ **Better error handling** - Shows specific error messages  
✅ **Debug logging** - Helps troubleshoot issues  
✅ **Refresh button** - Allows manual reload

The component will now fetch all pickup requests from Firestore and display them correctly in the Admin Portal.


