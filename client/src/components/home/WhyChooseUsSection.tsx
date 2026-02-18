import { Shield, MapPin, Clock, Users, DollarSign, Headphones } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Reliable Delivery Network",
    description: "Extensive network across UAE with 99.8% on-time delivery rate. Your packages are in safe hands.",
    color: "from-blue-400 to-blue-600",
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description: "Track your shipment every step of the way with GPS-enabled real-time updates.",
    color: "from-purple-400 to-purple-600",
  },
  {
    icon: Users,
    title: "Experienced Team",
    description: "Professional operations team with 10+ years of logistics experience in the UAE market.",
    color: "from-green-400 to-green-600",
  },
  {
    icon: Clock,
    title: "GCC + International Reach",
    description: "Seamless delivery to all GCC countries and 120+ international destinations.",
    color: "from-orange-400 to-orange-600",
  },
  {
    icon: DollarSign,
    title: "Affordable Rates",
    description: "Competitive pricing without compromising on service quality. Best rates guaranteed.",
    color: "from-cyan-400 to-cyan-600",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer support via phone, email, and WhatsApp. We're always here to help.",
    color: "from-pink-400 to-pink-600",
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30" data-testid="section-why-choose">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
            Why Gulf Express
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Why Choose{" "}
            <span className="bg-gradient-purple bg-clip-text text-transparent">Gulf Express?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We're committed to providing exceptional delivery services that exceed your expectations.
            Here's what sets us apart from the rest.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card"
              data-testid={`card-feature-${index}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap justify-center items-center gap-8 md:gap-16 py-8 px-12 bg-card rounded-2xl shadow-lg">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-purple bg-clip-text text-transparent">50K+</div>
              <div className="text-sm text-muted-foreground mt-1">Packages Delivered</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-purple bg-clip-text text-transparent">10+</div>
              <div className="text-sm text-muted-foreground mt-1">Years Experience</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-purple bg-clip-text text-transparent">99.8%</div>
              <div className="text-sm text-muted-foreground mt-1">On-Time Delivery</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-purple bg-clip-text text-transparent">120+</div>
              <div className="text-sm text-muted-foreground mt-1">Countries Served</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
