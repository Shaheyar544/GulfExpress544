import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function WhatsAppButton() {
  const { data: settings } = useQuery({
    queryKey: ["/api/settings/integrations"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/settings/integrations");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const phoneNumber = settings?.whatsappNumber || "971412345678";
  const message = "Hello! I'd like to inquire about Gulf Express services.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Contact us on WhatsApp"
      data-testid="button-whatsapp"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
        <div className="relative w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300">
          <MessageCircle className="w-7 h-7 text-white" />
        </div>
      </div>
      <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Chat with us
        </span>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-white dark:bg-gray-800 rotate-45" />
      </div>
    </a>
  );
}
