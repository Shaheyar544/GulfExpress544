import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  FileText,
  MapPin,
  FileEdit,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Truck,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Shipments", href: "/admin/shipments", icon: Package },
  { name: "Quotations", href: "/admin/quotations", icon: FileText },
  { name: "Pickup Requests", href: "/admin/pickups", icon: Truck },
  { name: "Inbox", href: "/admin/inbox", icon: MessageSquare },
  { name: "Locations", href: "/admin/locations", icon: MapPin },
  { name: "CMS", href: "/admin/cms", icon: FileEdit },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="fixed top-4 left-4 z-50 lg:hidden"
            size="icon"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent
            location={location}
            onLogout={handleLogout}
            currentUser={currentUser}
            onNavigate={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <SidebarContent
              location={location}
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  location,
  onLogout,
  currentUser,
  onNavigate,
}: {
  location: string;
  onLogout: () => void;
  currentUser: any;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col flex-grow bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-purple-600 to-purple-800">
        <div className="flex items-center space-x-2">
          <Package className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-white font-bold text-lg">Gulf Express</h1>
            <p className="text-purple-200 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-purple-100 text-purple-900"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive ? "text-purple-600" : "text-gray-400"
                )}
              />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-gray-200">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ExternalLink className="mr-3 h-5 w-5 text-gray-400" />
            View Live Website
          </a>
        </div>
      </nav>

      {/* User info and logout */}
      <div className="border-t border-gray-200 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">
            {currentUser?.email || "Admin"}
          </p>
          <p className="text-xs text-gray-500">
            {currentUser?.role === "super_admin" ? "Super Admin" : "Admin"}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}


