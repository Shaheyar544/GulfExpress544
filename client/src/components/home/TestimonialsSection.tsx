import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Ahmed Al Maktoum",
    role: "E-commerce Owner",
    company: "Dubai Luxury Goods",
    content: "Gulf Express has transformed our delivery operations. Same-day delivery across UAE has increased our customer satisfaction by 40%. Their tracking system is outstanding!",
    rating: 5,
    initials: "AM",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Operations Manager",
    company: "Tech Solutions MENA",
    content: "We've been using Gulf Express for all our international shipments. Their express service to Europe and US is reliable and cost-effective. Highly recommended!",
    rating: 5,
    initials: "SJ",
  },
  {
    id: 3,
    name: "Mohammed Hassan",
    role: "Supply Chain Director",
    company: "Gulf Trading Co.",
    content: "The freight services are exceptional. From documentation to delivery, everything is handled professionally. Best courier service in the UAE without a doubt.",
    rating: 5,
    initials: "MH",
  },
  {
    id: 4,
    name: "Lisa Chen",
    role: "Retail Store Owner",
    company: "Fashion Hub Abu Dhabi",
    content: "Quick, reliable, and affordable. Gulf Express picks up from my store daily and delivers across the Emirates. My customers love the fast delivery!",
    rating: 5,
    initials: "LC",
  },
  {
    id: 5,
    name: "Omar Khalid",
    role: "CEO",
    company: "Startup Ventures",
    content: "The 24/7 support is what sets Gulf Express apart. Any issue is resolved within minutes. Their team genuinely cares about customer experience.",
    rating: 5,
    initials: "OK",
  },
  {
    id: 6,
    name: "Priya Sharma",
    role: "Logistics Coordinator",
    company: "MedTech UAE",
    content: "For our sensitive medical equipment shipments, Gulf Express provides the careful handling we need. Temperature-controlled options are excellent.",
    rating: 5,
    initials: "PS",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-background overflow-hidden" data-testid="section-testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
            Customer Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Trusted by{" "}
            <span className="bg-gradient-purple bg-clip-text text-transparent">Thousands</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't just take our word for it. Here's what our customers have to say
            about their experience with Gulf Express.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="relative p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card"
              data-testid={`card-testimonial-${index}`}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-purple-200 dark:text-purple-800" />

              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-purple-200 dark:border-purple-800">
                  <AvatarFallback className="bg-gradient-purple text-white font-semibold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
