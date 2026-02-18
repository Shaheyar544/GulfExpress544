import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator, ArrowRight, Package, Clock, Truck, Plane } from "lucide-react";

const uaeCities = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];
const countries = ["UAE", "Saudi Arabia", "Qatar", "Oman", "Bahrain", "Kuwait", "United States", "United Kingdom", "Germany", "France", "India", "Pakistan", "Philippines", "Other"];
const shipmentTypes = [
  { value: "documents", label: "Documents", icon: Package },
  { value: "parcels", label: "Parcels", icon: Package },
  { value: "freight", label: "Freight", icon: Truck },
];
const deliveryModes = [
  { value: "same-day", label: "Same Day", description: "Within hours", icon: Zap },
  { value: "next-day", label: "Next Day", description: "By tomorrow noon", icon: Clock },
  { value: "express", label: "Express", description: "2-3 business days", icon: Plane },
  { value: "economy", label: "Economy", description: "5-7 business days", icon: Package },
];

function Zap(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

export function QuotationFormSection() {
  const [, setLocation] = useLocation();
  const [pickupRequired, setPickupRequired] = useState(true);
  const [formData, setFormData] = useState({
    senderName: "",
    senderCity: "",
    receiverCountry: "",
    shipmentType: "",
    weight: "",
    deliveryMode: "",
    phone: "",
    email: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/quotation");
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-muted/30 to-background" data-testid="section-quotation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
              <Calculator className="w-4 h-4" />
              Quick Quote
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Get an Instant{" "}
              <span className="bg-gradient-purple bg-clip-text text-transparent">Price Quote</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Fill in your shipment details and get an instant price estimate. 
              No hidden fees, transparent pricing for all destinations.
            </p>

            <div className="space-y-4">
              {[
                { title: "Transparent Pricing", desc: "No hidden charges or surprise fees" },
                { title: "Instant Estimates", desc: "Get your quote in seconds" },
                { title: "Best Rates Guaranteed", desc: "Competitive pricing across all services" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-purple flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-8 shadow-xl border-0 bg-card" data-testid="form-quick-quote">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Your Name</Label>
                  <Input
                    id="senderName"
                    placeholder="Enter your name"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    className="h-12 rounded-xl"
                    data-testid="input-sender-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderCity">From City</Label>
                  <Select
                    value={formData.senderCity}
                    onValueChange={(value) => setFormData({ ...formData, senderCity: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl" data-testid="select-sender-city">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {uaeCities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiverCountry">Destination Country</Label>
                  <Select
                    value={formData.receiverCountry}
                    onValueChange={(value) => setFormData({ ...formData, receiverCountry: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl" data-testid="select-receiver-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipmentType">Shipment Type</Label>
                  <Select
                    value={formData.shipmentType}
                    onValueChange={(value) => setFormData({ ...formData, shipmentType: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl" data-testid="select-shipment-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {shipmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 2.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="h-12 rounded-xl"
                    data-testid="input-weight"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryMode">Delivery Speed</Label>
                  <Select
                    value={formData.deliveryMode}
                    onValueChange={(value) => setFormData({ ...formData, deliveryMode: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl" data-testid="select-delivery-mode">
                      <SelectValue placeholder="Select speed" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label} - {mode.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <Label htmlFor="pickup" className="text-base font-medium">Pickup Required?</Label>
                  <p className="text-sm text-muted-foreground">We'll collect the package from your location</p>
                </div>
                <Switch
                  id="pickup"
                  checked={pickupRequired}
                  onCheckedChange={setPickupRequired}
                  data-testid="switch-pickup-required"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+971 XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 rounded-xl"
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 rounded-xl"
                    data-testid="input-email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 rounded-xl bg-gradient-purple hover:opacity-90 shadow-glow-sm font-semibold text-lg"
                data-testid="button-get-instant-quote"
              >
                Get Instant Quote
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}
