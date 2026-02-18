import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation, ExternalLink } from "lucide-react";

const locations = [
  {
    id: 1,
    city: "Dubai",
    area: "Business Bay",
    address: "Tower A, Level 3, Business Bay, Dubai, UAE",
    phone: "+971 4 123 4567",
    hours: "8:00 AM - 8:00 PM (Mon-Sat)",
    isMain: true,
    services: ["Same Day", "Next Day", "International", "Freight"],
    coordinates: { lat: 25.1865, lng: 55.2730 },
  },
  {
    id: 2,
    city: "Dubai",
    area: "Al Quoz Industrial",
    address: "Al Quoz Industrial Area 3, Dubai, UAE",
    phone: "+971 4 234 5678",
    hours: "7:00 AM - 10:00 PM (Daily)",
    isMain: false,
    services: ["Same Day", "Freight", "Warehouse"],
    coordinates: { lat: 25.1385, lng: 55.2245 },
  },
  {
    id: 3,
    city: "Abu Dhabi",
    area: "Al Maryah Island",
    address: "Abu Dhabi Global Market, Tower 2, Level 5",
    phone: "+971 2 234 5678",
    hours: "9:00 AM - 6:00 PM (Sun-Thu)",
    isMain: true,
    services: ["Same Day", "Next Day", "International", "Corporate"],
    coordinates: { lat: 24.5008, lng: 54.3930 },
  },
  {
    id: 4,
    city: "Abu Dhabi",
    area: "Musaffah",
    address: "Musaffah Industrial Area, M-37, Abu Dhabi",
    phone: "+971 2 345 6789",
    hours: "7:00 AM - 9:00 PM (Daily)",
    isMain: false,
    services: ["Freight", "Warehouse", "Cargo"],
    coordinates: { lat: 24.3662, lng: 54.4958 },
  },
  {
    id: 5,
    city: "Sharjah",
    area: "Industrial Area",
    address: "Sharjah Industrial Area 12, Sharjah, UAE",
    phone: "+971 6 345 6789",
    hours: "8:00 AM - 7:00 PM (Mon-Sat)",
    isMain: true,
    services: ["Same Day", "Next Day", "Freight"],
    coordinates: { lat: 25.2925, lng: 55.4697 },
  },
  {
    id: 6,
    city: "Ajman",
    area: "Al Jurf",
    address: "Al Jurf Industrial Area 2, Ajman, UAE",
    phone: "+971 6 456 7890",
    hours: "9:00 AM - 6:00 PM (Mon-Sat)",
    isMain: true,
    services: ["Same Day", "Next Day"],
    coordinates: { lat: 25.4186, lng: 55.4958 },
  },
  {
    id: 7,
    city: "Ras Al Khaimah",
    area: "Al Hamra",
    address: "Al Hamra Village, RAK, UAE",
    phone: "+971 7 567 8901",
    hours: "9:00 AM - 5:00 PM (Sun-Thu)",
    isMain: true,
    services: ["Next Day", "GCC Express"],
    coordinates: { lat: 25.6730, lng: 55.7853 },
  },
  {
    id: 8,
    city: "Fujairah",
    area: "Industrial Area",
    address: "Fujairah Industrial Zone, Fujairah, UAE",
    phone: "+971 9 678 9012",
    hours: "9:00 AM - 5:00 PM (Sun-Thu)",
    isMain: true,
    services: ["Next Day", "Freight"],
    coordinates: { lat: 25.1288, lng: 56.3264 },
  },
  {
    id: 9,
    city: "Umm Al Quwain",
    area: "Industrial Area",
    address: "UAQ Industrial Zone, UAQ, UAE",
    phone: "+971 6 789 0123",
    hours: "9:00 AM - 5:00 PM (Sun-Thu)",
    isMain: true,
    services: ["Next Day"],
    coordinates: { lat: 25.5647, lng: 55.7323 },
  },
];

const emirateColors: Record<string, string> = {
  "Dubai": "from-blue-400 to-blue-600",
  "Abu Dhabi": "from-green-400 to-green-600",
  "Sharjah": "from-purple-400 to-purple-600",
  "Ajman": "from-orange-400 to-orange-600",
  "Ras Al Khaimah": "from-cyan-400 to-cyan-600",
  "Fujairah": "from-pink-400 to-pink-600",
  "Umm Al Quwain": "from-yellow-400 to-yellow-600",
};

export default function Locations() {
  const emirates = [...new Set(locations.map(l => l.city))];

  return (
    <div className="min-h-screen bg-background" data-testid="page-locations">
      <Header />
      <main>
        <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Pickup & Drop-off Locations
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              With locations across all 7 Emirates, we're always nearby. 
              Drop off your package or schedule a pickup at your convenience.
            </p>
          </div>
        </section>

        <section className="py-8 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              {emirates.map((emirate) => (
                <a
                  key={emirate}
                  href={`#${emirate.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-4 py-2 bg-card rounded-full text-sm font-medium text-foreground shadow hover:shadow-md transition-shadow"
                >
                  {emirate}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" data-testid="section-locations-list">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                {locations.map((location, index) => (
                  <Card
                    key={location.id}
                    id={location.city.toLowerCase().replace(/\s+/g, "-")}
                    className={`p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                      location.isMain ? "ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-background" : ""
                    }`}
                    data-testid={`card-location-${index}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${emirateColors[location.city]} flex items-center justify-center shadow-lg`}>
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">{location.city}</h3>
                            {location.isMain && (
                              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                                Main Hub
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{location.area}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm mb-4">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{location.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{location.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{location.hours}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {location.services.map((service) => (
                        <span
                          key={service}
                          className="px-2 py-1 bg-muted text-xs font-medium text-muted-foreground rounded"
                        >
                          {service}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full flex-1"
                        onClick={() => window.open(`tel:${location.phone.replace(/\s+/g, "")}`)}
                        data-testid={`button-call-${index}`}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full flex-1"
                        onClick={() => window.open(`https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`, "_blank")}
                        data-testid={`button-directions-${index}`}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="lg:sticky lg:top-24 h-fit">
                <Card className="overflow-hidden border-0 shadow-xl">
                  <div className="p-4 bg-gradient-purple text-white">
                    <h3 className="text-lg font-semibold">UAE Coverage Map</h3>
                    <p className="text-sm text-white/80">All 7 Emirates covered</p>
                  </div>
                  <div className="h-96 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 relative">
                    <svg viewBox="0 0 500 400" className="w-full h-full">
                      <path
                        d="M100,200 Q150,100 250,150 T400,180 Q450,250 400,300 T250,350 Q150,330 100,280 T100,200"
                        fill="none"
                        stroke="url(#mapGradientLoc)"
                        strokeWidth="2"
                        opacity="0.3"
                      />
                      <defs>
                        <linearGradient id="mapGradientLoc" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#4B2EFF" />
                          <stop offset="100%" stopColor="#A767FF" />
                        </linearGradient>
                      </defs>
                      
                      {[
                        { x: 320, y: 180, label: "Dubai", count: 2 },
                        { x: 180, y: 200, label: "Abu Dhabi", count: 2 },
                        { x: 360, y: 150, label: "Sharjah", count: 1 },
                        { x: 380, y: 130, label: "Ajman", count: 1 },
                        { x: 420, y: 100, label: "RAK", count: 1 },
                        { x: 450, y: 170, label: "Fujairah", count: 1 },
                        { x: 390, y: 140, label: "UAQ", count: 1 },
                      ].map((city) => (
                        <g key={city.label}>
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r="16"
                            className="fill-purple-500/20"
                          />
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r="10"
                            className="fill-purple-500"
                          />
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r="5"
                            className="fill-white"
                          />
                          <text
                            x={city.x}
                            y={city.y + 28}
                            textAnchor="middle"
                            className="fill-foreground text-xs font-medium"
                          >
                            {city.label}
                          </text>
                          <text
                            x={city.x}
                            y={city.y + 40}
                            textAnchor="middle"
                            className="fill-muted-foreground text-[10px]"
                          >
                            {city.count} {city.count === 1 ? "location" : "locations"}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </Card>

                <Card className="mt-6 p-6 border-0 shadow-xl">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Operating Hours</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Main Hubs</span>
                      <span className="font-medium text-foreground">8:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Industrial Centers</span>
                      <span className="font-medium text-foreground">7:00 AM - 10:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Regional Offices</span>
                      <span className="font-medium text-foreground">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <p className="text-muted-foreground">
                        24/7 Customer Support: <span className="font-medium text-foreground">+971 4 123 4567</span>
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
