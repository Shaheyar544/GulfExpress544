import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, Clock, Truck, FileText, MapPin } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#7B2FFF', '#A06BFF', '#C084FC', '#E9D5FF'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    delivered: 0,
    pending: 0,
    sameDayActive: 0,
    pendingPickups: 0,
    newQuotations: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [typeData, setTypeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch shipments
      const shipmentsQuery = query(collection(db, "shipments"));
      const shipmentsSnapshot = await getDocs(shipmentsQuery);
      const shipments = shipmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch pickups
      const pickupsQuery = query(collection(db, "pickups"), where("status", "==", "pending"));
      const pickupsSnapshot = await getDocs(pickupsQuery);

      // Fetch quotations
      const quotesQuery = query(collection(db, "quotes"), where("status", "==", "pending"));
      const quotesSnapshot = await getDocs(quotesQuery);

      // Calculate stats
      const totalShipments = shipments.length;
      const delivered = shipments.filter((s: any) => s.status === "delivered").length;
      const pending = shipments.filter((s: any) => s.status === "pending" || s.status === "in-transit").length;
      const sameDayActive = shipments.filter((s: any) => s.serviceType === "same-day" && s.status !== "delivered").length;

      setStats({
        totalShipments,
        delivered,
        pending,
        sameDayActive,
        pendingPickups: pickupsSnapshot.size,
        newQuotations: quotesSnapshot.size,
      });

      // Prepare monthly data (last 6 months)
      const monthlyMap = new Map();
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthlyMap.set(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), 0);
      }

      shipments.forEach((shipment: any) => {
        if (shipment.createdAt) {
          let date: Date;
          if (typeof shipment.createdAt.toDate === 'function') {
            date = shipment.createdAt.toDate();
          } else {
            date = new Date(shipment.createdAt);
          }
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, monthlyMap.get(monthKey) + 1);
          }
        }
      });

      setMonthlyData(Array.from(monthlyMap.entries()).map(([name, value]) => ({ name, shipments: value })));

      // Prepare type distribution
      const typeMap = new Map<string, number>();
      shipments.forEach((shipment: any) => {
        const type = shipment.serviceType || "other";
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      });

      setTypeData(Array.from(typeMap.entries()).map(([name, value]) => ({ name, value })));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome to Gulf Express Admin Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShipments}</div>
            <p className="text-xs text-muted-foreground">All time shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalShipments > 0
                ? Math.round((stats.delivered / stats.totalShipments) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">In progress shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Same-Day</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.sameDayActive}</div>
            <p className="text-xs text-muted-foreground">Same-day deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Pickups</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pendingPickups}</div>
            <p className="text-xs text-muted-foreground">Awaiting pickup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Quotations</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.newQuotations}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipments by Month</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                shipments: {
                  label: "Shipments",
                  color: "#7B2FFF",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="shipments" fill="#7B2FFF" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Type Distribution</CardTitle>
            <CardDescription>By delivery type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Count",
                  color: "#7B2FFF",
                },
              }}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

