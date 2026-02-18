import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { HeroSection } from "@/components/home/HeroSection";
import { ServiceHighlights } from "@/components/home/ServiceHighlights";
import { TrackingSection } from "@/components/home/TrackingSection";
import { PickupLocationsSection } from "@/components/home/PickupLocationsSection";
import { QuotationFormSection } from "@/components/home/QuotationFormSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { Seo } from "@/components/SEO";

export default function Home() {
  return (
    <div className="min-h-screen" data-testid="page-home">
      <Seo
        title="Gulf Express - Fast & Reliable Delivery Services in UAE"
        description="Gulf Express offers trusted local and international delivery services. Book your shipment now for fast, secure, and affordable courier solutions."
        canonicalUrl="https://gulfexpress.org/"
      />
      <Header />
      <main>
        <HeroSection />
        <ServiceHighlights />
        <TrackingSection />
        <PickupLocationsSection />
        <QuotationFormSection />
        <WhyChooseUsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
