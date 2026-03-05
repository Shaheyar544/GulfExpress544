import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminRouteWrapper } from "@/components/admin/AdminRouteWrapper";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Locations from "@/pages/Locations";
import Track from "@/pages/Track";
import Quotation from "@/pages/Quotation";
import Contact from "@/pages/Contact";
import Book from "@/pages/Book";
import VerifyReceipt from "@/pages/VerifyReceipt";
import NotFound from "@/pages/not-found";
import TrackingScripts from "@/components/TrackingScripts";
import AdSenseScript from "@/components/AdSenseScript";

// Admin Pages
import AdminLogin from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Shipments from "@/pages/admin/Shipments";
import Receipts from "@/pages/admin/Receipts";
import ShipmentForm from "@/pages/admin/ShipmentForm";
import ShipmentDetail from "@/pages/admin/ShipmentDetail";
import Quotations from "@/pages/admin/Quotations";
import Pickups from "@/pages/admin/Pickups";
import PickupDetail from "@/pages/admin/PickupDetail";
import Inbox from "@/pages/admin/Inbox";
import LocationsAdmin from "@/pages/admin/Locations";
import CMS from "@/pages/admin/CMS";
import Users from "@/pages/admin/Users";
import Settings from "@/pages/admin/Settings";

function Router() {
  return (
    <Switch>
      {/* Admin Login - Public Route */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin Routes - Protected - Must be in order from most specific to least */}
      <Route path="/admin/shipments/new">
        <AdminRouteWrapper>
          <ShipmentForm />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/shipments/:id/edit">
        <AdminRouteWrapper>
          <ShipmentForm />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/shipments/:id">
        <AdminRouteWrapper>
          <ShipmentDetail />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/shipments">
        <AdminRouteWrapper>
          <Shipments />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/receipts">
        <AdminRouteWrapper>
          <Receipts />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/quotations">
        <AdminRouteWrapper>
          <Quotations />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/pickups/:id">
        <AdminRouteWrapper>
          <PickupDetail />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/pickups">
        <AdminRouteWrapper>
          <Pickups />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/inbox">
        <AdminRouteWrapper>
          <Inbox />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/locations">
        <AdminRouteWrapper>
          <LocationsAdmin />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/cms">
        <AdminRouteWrapper>
          <CMS />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/users">
        <AdminRouteWrapper>
          <Users />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin/settings">
        <AdminRouteWrapper>
          <Settings />
        </AdminRouteWrapper>
      </Route>

      <Route path="/admin">
        <AdminRouteWrapper>
          <Dashboard />
        </AdminRouteWrapper>
      </Route>

      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/locations" component={Locations} />
      <Route path="/track" component={Track} />
      <Route path="/verify/:receiptNumber" component={VerifyReceipt} />
      <Route path="/quotation" component={Quotation} />
      <Route path="/contact" component={Contact} />
      <Route path="/book" component={Book} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <TrackingScripts />
          <AdSenseScript />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
