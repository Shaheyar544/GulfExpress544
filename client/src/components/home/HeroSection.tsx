import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Package, Truck, Globe, Clock, ArrowRight, Search } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero"
      data-testid="section-hero"
    >
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full" />
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white rounded-full" />
          <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white rounded-full" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Trusted by 50,000+ customers in UAE
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up">
              Fast. Reliable.{" "}
              <span className="relative">
                Global.
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M2 10C50 2 150 2 198 10"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              <span className="text-purple-200">Your UAE Delivery Partner.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Domestic, GCC & International courier services with same-day and next-day delivery. 
              Track your shipments in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <Link href="/book">
                <Button
                  size="lg"
                  className="rounded-full bg-white text-purple-700 hover:bg-white/90 shadow-xl font-semibold text-base px-8 h-14 gap-2 w-full sm:w-auto"
                  data-testid="button-hero-book"
                >
                  <Package className="w-5 h-5" />
                  Book a Shipment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/quotation">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold text-base px-8 h-14 gap-2 w-full sm:w-auto"
                  data-testid="button-hero-quote"
                >
                  Get a Quotation
                </Button>
              </Link>
              <Link href="/track">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold text-base px-8 h-14 gap-2 w-full sm:w-auto"
                  data-testid="button-hero-track"
                >
                  <Search className="w-5 h-5" />
                  Track Shipment
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 mt-12 pt-12 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-sm text-white/60">Deliveries</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">7</div>
                <div className="text-sm text-white/60">Emirates</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">120+</div>
                <div className="text-sm text-white/60">Countries</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">99.8%</div>
                <div className="text-sm text-white/60">On-Time</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block animate-slide-in-right">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-500/20 rounded-3xl blur-3xl" />
              
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-purple rounded-xl flex items-center justify-center shadow-glow-sm">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Express Delivery</h3>
                    <p className="text-white/60 text-sm">In Transit to Dubai</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-white/80 text-sm">
                    <span>Abu Dhabi</span>
                    <div className="flex-1 mx-4 border-t-2 border-dashed border-white/30 relative">
                      <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-neon-blue rounded-full animate-pulse" />
                    </div>
                    <span>Dubai</span>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Tracking ID</span>
                      <span className="text-white font-mono text-sm">GC-UAE-2024-1234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Status</span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        On Track
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">ETA</span>
                      <span className="text-white text-sm">Today, 4:30 PM</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Same Day Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Globe className="w-4 h-4" />
                    <span>Real-time Tracking</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-neon-blue/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-neon-blue/30 animate-float">
                <Globe className="w-8 h-8 text-neon-blue" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-green-500/30 animate-float" style={{ animationDelay: "1s" }}>
                <Package className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
