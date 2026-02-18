import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Target, Eye, Globe, Users, Award, Shield, CheckCircle2 } from "lucide-react";

const team = [
  { name: "Khalid Al Rashid", role: "CEO & Founder", initials: "KR" },
  { name: "Sarah Thompson", role: "Operations Director", initials: "ST" },
  { name: "Ahmed Mohamed", role: "Logistics Manager", initials: "AM" },
  { name: "Maria Santos", role: "Customer Success Lead", initials: "MS" },
];

const milestones = [
  { year: "2014", title: "Founded in Dubai", desc: "Started operations with just 5 delivery vehicles" },
  { year: "2016", title: "GCC Expansion", desc: "Extended services to all GCC countries" },
  { year: "2019", title: "International Network", desc: "Launched international express to 50+ countries" },
  { year: "2022", title: "Tech Innovation", desc: "Introduced real-time GPS tracking system" },
  { year: "2024", title: "120+ Countries", desc: "Now serving over 120 international destinations" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-about">
      <Header />
      <main>
        <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              About Gulf Express
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Your trusted delivery partner in the UAE, connecting businesses and individuals
              across the Emirates, GCC, and the world.
            </p>
          </div>
        </section>

        <section className="py-20" data-testid="section-company-story">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
                  Our Story
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  A Decade of Excellence in{" "}
                  <span className="bg-gradient-purple bg-clip-text text-transparent">Logistics</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Founded in 2014 in Dubai, Gulf Courier started with a simple mission: to provide
                  fast, reliable, and affordable delivery services across the UAE. What began as a
                  small operation with just five vehicles has grown into one of the region's most
                  trusted courier companies.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  Today, we operate a fleet of over 200 vehicles, employ more than 500 dedicated
                  professionals, and serve thousands of customers daily. Our commitment to excellence
                  has earned us a reputation for reliability that businesses and individuals across
                  the UAE have come to depend on.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="text-3xl font-bold bg-gradient-purple bg-clip-text text-transparent">10+</div>
                    <div className="text-sm text-muted-foreground">Years in Business</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="text-3xl font-bold bg-gradient-purple bg-clip-text text-transparent">500+</div>
                    <div className="text-sm text-muted-foreground">Team Members</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl blur-3xl" />
                <div className="relative bg-card rounded-3xl p-8 shadow-xl border border-border">
                  <h3 className="text-xl font-semibold text-foreground mb-6">Our Journey</h3>
                  <div className="space-y-6">
                    {milestones.map((milestone, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center text-white font-semibold text-sm">
                            {milestone.year.slice(-2)}
                          </div>
                          {index < milestones.length - 1 && (
                            <div className="w-0.5 flex-1 bg-purple-200 dark:bg-purple-800 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="font-semibold text-foreground">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground">{milestone.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30" data-testid="section-mission-vision">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-0 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To provide exceptional courier and logistics services that connect people and
                  businesses across the UAE and beyond. We strive to deliver every package with
                  speed, care, and reliability, making shipping seamless for our customers.
                </p>
              </Card>
              <Card className="p-8 border-0 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To be the most trusted and innovative courier company in the Middle East, setting
                  new standards in logistics technology and customer experience. We envision a future
                  where every delivery is fast, transparent, and sustainable.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20" data-testid="section-values">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                What We{" "}
                <span className="bg-gradient-purple bg-clip-text text-transparent">Stand For</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: "Reliability", desc: "99.8% on-time delivery rate" },
                { icon: Users, title: "Customer First", desc: "24/7 dedicated support" },
                { icon: Globe, title: "Global Reach", desc: "120+ countries served" },
                { icon: Award, title: "Excellence", desc: "Award-winning service" },
              ].map((value, index) => (
                <Card key={index} className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-purple flex items-center justify-center mb-4 shadow-lg">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30" data-testid="section-coverage">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Our{" "}
                <span className="bg-gradient-purple bg-clip-text text-transparent">Coverage</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                From every corner of the UAE to destinations worldwide, we've got you covered.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </span>
                  UAE Coverage
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>All 7 Emirates</li>
                  <li>Same-day & next-day delivery</li>
                  <li>Multiple pickup centers</li>
                  <li>Door-to-door service</li>
                </ul>
              </Card>
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </span>
                  GCC Countries
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Saudi Arabia</li>
                  <li>Qatar</li>
                  <li>Oman</li>
                  <li>Bahrain & Kuwait</li>
                </ul>
              </Card>
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </span>
                  International
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>120+ Countries</li>
                  <li>Express & Economy options</li>
                  <li>Full customs support</li>
                  <li>Door-to-door tracking</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20" data-testid="section-team">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Leadership{" "}
                <span className="bg-gradient-purple bg-clip-text text-transparent">Team</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Meet the experienced professionals driving Gulf Express's success.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-purple-200 dark:border-purple-800">
                    <AvatarFallback className="bg-gradient-purple text-white text-xl font-semibold">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
