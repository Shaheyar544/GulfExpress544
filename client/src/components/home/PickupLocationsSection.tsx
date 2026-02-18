import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Phone, ArrowRight, Building2 } from "lucide-react";

const locations = [
  {
    city: "Dubai",
    area: "Business Bay",
    address: "Tower A, Level 3, Dubai",
    phone: "+971 4 123 4567",
    hours: "8:00 AM - 8:00 PM",
    isMain: true,
  },
  {
    city: "Abu Dhabi",
    area: "Al Maryah Island",
    address: "Abu Dhabi Global Market, Tower 2",
    phone: "+971 2 234 5678",
    hours: "9:00 AM - 6:00 PM",
  },
  {
    city: "Sharjah",
    area: "Industrial Area",
    address: "Sharjah Industrial Area 12",
    phone: "+971 6 345 6789",
    hours: "9:00 AM - 6:00 PM",
  },
  {
    city: "Ajman",
    area: "Al Jurf",
    address: "Al Jurf Industrial Area 2",
    phone: "+971 6 456 7890",
    hours: "9:00 AM - 6:00 PM",
  },
];

const allEmirates = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"];

export function PickupLocationsSection() {
  return (
    <section className="py-20 md:py-32 bg-background" data-testid="section-locations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              Our Locations
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Pickup & Drop-off{" "}
              <span className="bg-gradient-purple bg-clip-text text-transparent">Centers</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              With locations across all 7 Emirates, we're always nearby. 
              Drop off your package or schedule a pickup at your convenience.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {allEmirates.map((emirate) => (
                <span
                  key={emirate}
                  className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground"
                >
                  {emirate}
                </span>
              ))}
            </div>

            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <svg viewBox="0 0 400 300" className="w-full h-full">
                    <path
                      d="M50,150 Q100,50 200,100 T350,150 Q300,250 200,200 T50,150"
                      fill="none"
                      stroke="url(#mapGradient)"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                    <defs>
                      <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4B2EFF" />
                        <stop offset="100%" stopColor="#A767FF" />
                      </linearGradient>
                    </defs>
                    
                    {[
                      { x: 280, y: 140, label: "Dubai" },
                      { x: 150, y: 120, label: "Abu Dhabi" },
                      { x: 310, y: 100, label: "Sharjah" },
                      { x: 330, y: 80, label: "Ajman" },
                      { x: 360, y: 60, label: "RAK" },
                      { x: 370, y: 100, label: "Fujairah" },
                      { x: 340, y: 120, label: "UAQ" },
                    ].map((city) => (
                      <g key={city.label}>
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r="8"
                          className="fill-purple-500 animate-pulse"
                        />
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r="4"
                          className="fill-white"
                        />
                        <text
                          x={city.x}
                          y={city.y + 20}
                          textAnchor="middle"
                          className="fill-foreground text-xs font-medium"
                        >
                          {city.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {locations.map((location, index) => (
              <Card
                key={location.city}
                className={`p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  location.isMain ? "ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900" : ""
                }`}
                data-testid={`card-location-${index}`}
              >
                <div className="flex items-start justify-between mb-4">
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
                  <div className="w-10 h-10 bg-gradient-purple rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span>{location.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{location.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{location.hours}</span>
                  </div>
                </div>
              </Card>
            ))}

            <Link href="/locations">
              <Button
                variant="outline"
                className="w-full rounded-full mt-4 border-purple-500 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20"
                data-testid="button-view-all-locations"
              >
                View All Locations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
