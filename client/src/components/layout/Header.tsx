import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Package, ChevronDown } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Locations", href: "/locations" },
  { name: "Track", href: "/track" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
        : "bg-transparent"
        }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-logo">
            <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold bg-gradient-purple bg-clip-text text-transparent ${isScrolled ? "" : "text-white md:bg-none md:text-white"
              }`}>
              Gulf Express
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" data-testid="nav-desktop">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                data-testid={`link-nav-${item.name.toLowerCase()}`}
              >
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.href)
                    ? "bg-gradient-purple text-white shadow-glow-sm"
                    : isScrolled
                      ? "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/quotation">
              <Button
                variant="outline"
                className={`rounded-full font-medium transition-all duration-200 ${isScrolled
                  ? "border-purple-500 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400"
                  : "border-white/50 text-white hover:bg-white/10 backdrop-blur-sm"
                  }`}
                data-testid="button-get-quote"
              >
                Get Quote
              </Button>
            </Link>
            <Link href="/track">
              <Button
                className="rounded-full bg-gradient-purple hover:opacity-90 shadow-glow-sm font-medium"
                data-testid="button-track-shipment"
              >
                Track Shipment
              </Button>
            </Link>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={isScrolled ? "" : "text-white hover:bg-white/10"}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white dark:bg-gray-900">
              <div className="flex flex-col h-full pt-8">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-purple bg-clip-text text-transparent">
                    Gulf Express
                  </span>
                </div>

                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      data-testid={`link-mobile-${item.name.toLowerCase()}`}
                    >
                      <span
                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${isActive(item.href)
                          ? "bg-gradient-purple text-white"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto pt-8 space-y-3">
                  <Link href="/quotation" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-purple-500 text-purple-600"
                      data-testid="button-mobile-quote"
                    >
                      Get Quote
                    </Button>
                  </Link>
                  <Link href="/track" onClick={() => setIsOpen(false)}>
                    <Button
                      className="w-full rounded-full bg-gradient-purple"
                      data-testid="button-mobile-track"
                    >
                      Track Shipment
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
