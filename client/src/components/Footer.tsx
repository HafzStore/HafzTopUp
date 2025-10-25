import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2 } from "lucide-react";
import type { SiteConfig } from "@shared/schema";


export function Footer() {
  const { data: siteConfig } = useQuery<SiteConfig>({
    queryKey: ["/api/site-config"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <footer className="border-t border-border bg-black/50 backdrop-blur">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-heading text-lg font-bold text-primary mb-4">
              Tentang Kami
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {siteConfig?.siteDescription || "Platform top up game terpercaya di Indonesia. Cepat, aman, dan terpercaya."}
            </p>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-heading text-lg font-bold text-primary mb-4">
              Metode Pembayaran
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {["QRIS", "GoPay", "OVO", "DANA", "ShopeePay", "BCA", "Mandiri", "BNI"].map((method) => (
                <div
                  key={method}
                  className="bg-card border border-card-border rounded-md p-2 flex items-center justify-center hover-elevate transition-all"
                >
                  <span className="text-xs text-muted-foreground font-medium">{method}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-heading font-bold mb-4">Hubungi Kami</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: {siteConfig?.contactEmail || "support@gametopup.com"}</li>
              <li>WhatsApp: {siteConfig?.contactPhone || "+62 812-3456-7890"}</li>
              <li>Jam operasional: 24/7</li>
            </ul>
            <div className="flex gap-2 mt-4">
              <a
                href="#"
                className="w-9 h-9 rounded-md bg-card border border-card-border flex items-center justify-center hover-elevate active-elevate-2 transition-all text-muted-foreground hover:text-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-md bg-card border border-card-border flex items-center justify-center hover-elevate active-elevate-2 transition-all text-muted-foreground hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-md bg-card border border-card-border flex items-center justify-center hover-elevate active-elevate-2 transition-all text-muted-foreground hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-md bg-card border border-card-border flex items-center justify-center hover-elevate active-elevate-2 transition-all text-muted-foreground hover:text-primary"
                aria-label="WhatsApp"
              >
                <SiWhatsapp className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig?.siteName || "GameTopUp"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}