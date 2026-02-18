import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Package, Headphones, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-hero relative overflow-hidden" data-testid="section-cta">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ship Smarter With Gulf Express.
          <br />
          <span className="text-purple-200">Start Today.</span>
        </h2>

        <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Join thousands of satisfied customers who trust Gulf Express for their delivery needs.
          Experience the difference with our premium courier services.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/book">
            <Button
              size="lg"
              className="rounded-full bg-white text-purple-700 hover:bg-white/90 shadow-xl font-semibold text-base px-8 h-14 gap-2"
              data-testid="button-cta-book"
            >
              <Package className="w-5 h-5" />
              Book Shipment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold text-base px-8 h-14 gap-2"
              data-testid="button-cta-contact"
            >
              <Headphones className="w-5 h-5" />
              Contact Support
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">Free</div>
            <div className="text-sm text-white/60">Pickup Service</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">24/7</div>
            <div className="text-sm text-white/60">Customer Support</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">Live</div>
            <div className="text-sm text-white/60">Tracking Updates</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">Secure</div>
            <div className="text-sm text-white/60">Delivery Guaranteed</div>
          </div>
        </div>
      </div>
    </section>
  );
}
