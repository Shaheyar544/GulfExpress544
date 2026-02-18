import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Clock, Zap, Globe, Truck, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Zap,
    title: "Same Day Delivery",
    description: "Express delivery within UAE. Your package delivered in hours, not days.",
    href: "/services#same-day",
    color: "from-yellow-400 to-orange-500",
    bgLight: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    icon: Clock,
    title: "Next Day Delivery",
    description: "Reliable overnight shipping across UAE & GCC. Guaranteed delivery by noon.",
    href: "/services#next-day",
    color: "from-blue-400 to-cyan-500",
    bgLight: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Truck,
    title: "Freight & Cargo",
    description: "Heavy cargo solutions via air, road & sea. From small loads to full containers.",
    href: "/services#freight",
    color: "from-green-400 to-emerald-500",
    bgLight: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: Globe,
    title: "International Express",
    description: "Global shipping to 120+ countries. Fast, secure international deliveries.",
    href: "/services#international",
    color: "from-purple-400 to-pink-500",
    bgLight: "bg-purple-50 dark:bg-purple-900/20",
  },
];

export function ServiceHighlights() {
  return (
    <section className="py-20 md:py-32 bg-background" data-testid="section-services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
            Our Services
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Shipping Solutions for{" "}
            <span className="bg-gradient-purple bg-clip-text text-transparent">Every Need</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From same-day express to international freight, we offer comprehensive delivery 
            solutions tailored to your business and personal needs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Link key={service.title} href={service.href}>
              <Card
                className="group relative overflow-visible p-6 h-full border-0 shadow-lg hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                data-testid={`card-service-${index}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {service.description}
                </p>
                
                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:gap-2 transition-all">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                
                <div className={`absolute inset-0 ${service.bgLight} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10`} />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
