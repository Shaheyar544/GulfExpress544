import { ProtectedRoute } from "./ProtectedRoute";
import { AdminLayout } from "./AdminLayout";

interface AdminRouteWrapperProps {
  children: React.ReactNode;
}

export function AdminRouteWrapper({ children }: AdminRouteWrapperProps) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}


