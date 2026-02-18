import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, Clock, Globe, Truck, Plane, Ship, ShoppingBag, Building2, 
  CheckCircle2, ArrowRight, Package, Timer
} from "lucide-react";

const services = [
  {
    id: "same-day",
    icon: Zap,
    title: "Same Day Delivery",
    subtitle: "UAE Express",
    description: "Need it there today? Our same-day delivery service ensures your packages reach their destination within hours.",
    color: "from-yellow-400 to-orange-500",
    features: [
      "Delivery within 4-6 hours",
      "Available across all 7 Emirates",
      "Real-time GPS tracking",
      "Proof of delivery",
      "Priority handling",
      "Dedicated courier assignment",
    ],
    pricing: "Starting from AED 35",
    bestFor: "Urgent documents, time-sensitive packages, same-city deliveries",
  },
  {
    id: "next-day",
    icon: Clock,
    title: "Next Day Delivery",
    subtitle: "UAE & GCC",
    description: "Reliable overnight shipping across UAE and GCC countries. Your package delivered by noon the next business day.",
    color: "from-blue-400 to-cyan-500",
    features: [
      "Delivery by 12:00 PM next day",
      "Coverage across UAE & GCC",
      "Competitive rates",
      "Online booking",
      "SMS & Email notifications",
      "Signature on delivery",
    ],
    pricing: "Starting from AED 25",
    bestFor: "E-commerce orders, regular shipments, business documents",
  },
  {
    id: "gcc",
    icon: Timer,
    title: "GCC Express",
    subtitle: "Regional Shipping",
    description: "Fast and reliable delivery to all GCC countries. Seamless cross-border shipping with customs clearance.",
    color: "from-green-400 to-emerald-500",
    features: [
      "2-3 business days delivery",
      "All GCC countries covered",
      "Full customs handling",
      "Door-to-door service",
      "Insurance included",
      "Track across borders",
    ],
    pricing: "Starting from AED 75",
    bestFor: "Regional business shipping, personal packages to GCC",
  },
  {
    id: "international",
    icon: Globe,
    title: "International Courier",
    subtitle: "Worldwide Express",
    description: "Send packages to 120+ countries worldwide. Fast, secure, and fully tracked international shipping.",
    color: "from-purple-400 to-pink-500",
    features: [
      "Express: 3-5 business days",
      "Economy: 7-14 business days",
      "120+ countries",
      "Full customs documentation",
      "Import/Export handling",
      "Duty & tax calculation",
    ],
    pricing: "Starting from AED 150",
    bestFor: "International business, e-commerce exports, personal shipments abroad",
  },
  {
    id: "freight",
    icon: Truck,
    title: "Freight & Cargo",
    subtitle: "Heavy Loads",
    description: "From small pallets to full container loads. Air, road, and sea freight solutions for all your cargo needs.",
    color: "from-gray-500 to-gray-700",
    features: [
      "Air freight services",
      "Road freight (UAE & GCC)",
      "Sea freight worldwide",
      "Full & partial container loads",
      "Warehousing options",
      "Project cargo handling",
    ],
    pricing: "Custom quotes",
    bestFor: "Large shipments, bulk orders, industrial equipment, commercial goods",
  },
  {
    id: "ecommerce",
    icon: ShoppingBag,
    title: "E-commerce Solutions",
    subtitle: "Fulfillment Services",
    description: "Complete logistics solutions for online businesses. From warehousing to last-mile delivery.",
    color: "from-indigo-400 to-indigo-600",
    features: [
      "Warehouse storage",
      "Pick and pack services",
      "Same-day dispatch",
      "Returns management",
      "API integration",
      "White-label delivery",
    ],
    pricing: "Custom packages",
    bestFor: "Online stores, marketplace sellers, D2C brands",
  },
  {
    id: "corporate",
    icon: Building2,
    title: "Corporate Shipping",
    subtitle: "Business Solutions",
    description: "Tailored logistics solutions for businesses. Volume discounts, dedicated support, and custom SLAs.",
    color: "from-teal-400 to-teal-600",
    features: [
      "Dedicated account manager",
      "Volume-based pricing",
      "Custom billing cycles",
      "Integration with your systems",
      "Priority handling",
      "Monthly reporting",
    ],
    pricing: "Enterprise pricing",
    bestFor: "Large corporations, regular business shipments, contract logistics",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-services">
      <Header />
      <main>
        <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our Services
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Comprehensive courier and logistics solutions tailored to meet every delivery need, 
              from local same-day to global freight.
            </p>
          </div>
        </section>

        <section className="py-20" data-testid="section-services-grid">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <Card
                  key={service.id}
                  id={service.id}
                  className="overflow-visible p-0 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                  data-testid={`card-service-${index}`}
                >
                  <div className={`p-6 bg-gradient-to-r ${service.color}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <service.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                        <p className="text-white/80">{service.subtitle}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-muted-foreground mb-6">{service.description}</p>
                    
                    <div className="grid sm:grid-cols-2 gap-3 mb-6">
                      {service.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold text-foreground">{service.pricing}</p>
                      </div>
                      <Link href="/quotation">
                        <Button className="rounded-full bg-gradient-purple" data-testid={`button-quote-${service.id}`}>
                          Get Quote
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Best for:</span> {service.bestFor}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30" data-testid="section-comparison">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Compare{" "}
                <span className="bg-gradient-purple bg-clip-text text-transparent">Delivery Options</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Find the right delivery option for your needs.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-card rounded-xl shadow-lg">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left font-semibold text-foreground">Feature</th>
                    <th className="p-4 text-center font-semibold text-foreground">Same Day</th>
                    <th className="p-4 text-center font-semibold text-foreground">Next Day</th>
                    <th className="p-4 text-center font-semibold text-foreground">GCC Express</th>
                    <th className="p-4 text-center font-semibold text-foreground">International</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Delivery Time</td>
                    <td className="p-4 text-center text-muted-foreground">4-6 hours</td>
                    <td className="p-4 text-center text-muted-foreground">Next day noon</td>
                    <td className="p-4 text-center text-muted-foreground">2-3 days</td>
                    <td className="p-4 text-center text-muted-foreground">3-14 days</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Coverage</td>
                    <td className="p-4 text-center text-muted-foreground">UAE</td>
                    <td className="p-4 text-center text-muted-foreground">UAE & GCC</td>
                    <td className="p-4 text-center text-muted-foreground">GCC</td>
                    <td className="p-4 text-center text-muted-foreground">120+ countries</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Max Weight</td>
                    <td className="p-4 text-center text-muted-foreground">30 kg</td>
                    <td className="p-4 text-center text-muted-foreground">50 kg</td>
                    <td className="p-4 text-center text-muted-foreground">100 kg</td>
                    <td className="p-4 text-center text-muted-foreground">No limit</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Tracking</td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Insurance</td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-foreground">Starting Price</td>
                    <td className="p-4 text-center font-semibold text-foreground">AED 35</td>
                    <td className="p-4 text-center font-semibold text-foreground">AED 25</td>
                    <td className="p-4 text-center font-semibold text-foreground">AED 75</td>
                    <td className="p-4 text-center font-semibold text-foreground">AED 150</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-hero">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Need a Custom Solution?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Our team can create tailored logistics solutions for your unique requirements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="rounded-full bg-white text-purple-700 hover:bg-white/90 font-semibold px-8">
                  Contact Our Team
                </Button>
              </Link>
              <Link href="/quotation">
                <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 font-semibold px-8">
                  Get a Quote
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
