import { ArrowLeft, MapPin, Phone, Mail, Clock, Heart, Truck, Shield, MessageCircle, Instagram, Facebook } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-bold">About SaloneMakitSL</h1>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-primary px-6 py-8 text-center">
        <img src={logo} alt="SaloneMakitSL" className="h-16 w-16 rounded-xl mx-auto mb-3" />
        <h2 className="text-lg font-extrabold text-primary-foreground">SaloneMakitSL</h2>
        <p className="text-xs text-accent font-bold uppercase tracking-[0.15em] mt-0.5">Di Place Fo Shop 🇸🇱</p>
        <p className="text-xs text-primary-foreground/70 mt-3 max-w-sm mx-auto leading-relaxed">
          Sierra Leone's premier online fashion store — bringing quality clothing, shoes, bags, and beauty products to all 16 districts.
        </p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Our Story */}
        <section className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-bold text-foreground mb-2">Our Story</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            SaloneMakitSL was born out of a simple idea: everyone in Sierra Leone deserves access to quality, affordable fashion — no matter where they live. 
            From Freetown to Kailahun, from Bo to Kambia, we deliver style to your doorstep.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            We started in 2025 with a passion for African fashion and a commitment to making online shopping easy, safe, and accessible for all Sierra Leoneans. 
            Whether you prefer Cash on Delivery or Orange Money, we've got you covered.
          </p>
        </section>

        {/* What We Offer */}
        <section className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">What We Offer</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { emoji: "👗", label: "Women's Fashion" },
              { emoji: "👔", label: "Men's Fashion" },
              { emoji: "👟", label: "Shoes & Sneakers" },
              { emoji: "👜", label: "Bags & Accessories" },
              { emoji: "💄", label: "Beauty & Perfumes" },
              { emoji: "💍", label: "Jewelry & More" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 bg-secondary rounded-lg p-2.5">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-[11px] font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Why Choose SaloneMakitSL?</h3>
          <div className="space-y-3">
            {[
              { icon: Truck, title: "Nationwide Delivery", desc: "We deliver to all 16 districts in Sierra Leone" },
              { icon: Shield, title: "Secure Shopping", desc: "Your payments and data are always protected" },
              { icon: Heart, title: "Quality Products", desc: "Carefully curated fashion at the best prices" },
              { icon: Clock, title: "Fast Processing", desc: "Orders processed and shipped within 24-48 hours" },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Contact Us</h3>
          <div className="space-y-2.5">
            <a href="https://wa.me/23278928111" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-accent transition-colors">
              <MessageCircle className="h-4 w-4 text-accent" />
              <span>WhatsApp: +232 78 928 111</span>
            </a>
            <a href="tel:+23278928111" className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-accent transition-colors">
              <Phone className="h-4 w-4 text-accent" />
              <span>Phone: +232 78 928 111</span>
            </a>
            <a href="mailto:info@salonemakitsl.com" className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-accent transition-colors">
              <Mail className="h-4 w-4 text-accent" />
              <span>info@salonemakitsl.com</span>
            </a>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 text-accent" />
              <span>Freetown, Western Area, Sierra Leone</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 text-accent" />
              <span>Open daily: 8:00 AM - 10:00 PM</span>
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Follow Us</h3>
          <div className="flex gap-3">
            <a href="https://instagram.com/salonemakitsl" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 hover:bg-accent/10 transition-colors">
              <Instagram className="h-4 w-4 text-accent" />
              <span className="text-[11px] font-medium">Instagram</span>
            </a>
            <a href="https://facebook.com/salonemakitsl" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 hover:bg-accent/10 transition-colors">
              <Facebook className="h-4 w-4 text-accent" />
              <span className="text-[11px] font-medium">Facebook</span>
            </a>
            <a href="https://tiktok.com/@salonemakitsl" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 hover:bg-accent/10 transition-colors">
              <span className="text-sm">🎵</span>
              <span className="text-[11px] font-medium">TikTok</span>
            </a>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-2 pb-4">
          <Link to="/search">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg h-11 px-8 text-xs font-bold">
              Start Shopping 🛍️
            </Button>
          </Link>
          <p className="text-[9px] text-muted-foreground mt-3">SaloneMakitSL v1.0 • Made with ❤️ in Sierra Leone 🇸🇱</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;