import { ArrowLeft, MapPin, Phone, Mail, Clock, Heart, Truck, Shield, MessageCircle, Instagram, Facebook, Target, Users, Globe, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import logo from "@/assets/logo.png";

const TIMELINE = [
  { year: "2026", title: "Founded", desc: "Mohamed Pateh Abdul R Jalloh launches SaloneMakitSL from Freetown with a vision to democratize fashion across Sierra Leone." },
  { year: "2026", title: "Nationwide Delivery", desc: "Expanded delivery to all 16 districts — from the Western Area to Kailahun, making fashion accessible everywhere." },
  { year: "2026", title: "Going Digital", desc: "Launched web app and mobile app with Orange Money & Cash on Delivery payment options." },
];

const AboutPage = () => {
  const navigate = useNavigate();
  useDocumentTitle("About Us", "Learn about SaloneMakitSL, Sierra Leone's premier online fashion store founded by Mohamed Pateh Abdul R Jalloh.");

  return (
    <div className="pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-8 w-8 rounded-full bg-accent flex items-center justify-center" aria-label="Go back">
            <ArrowLeft className="h-4 w-4 text-accent-foreground" />
          </button>
          <h1 className="text-sm font-bold">About Us</h1>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-primary px-6 py-10 text-center">
        <img src={logo} alt="SaloneMakitSL logo" className="h-20 w-20 rounded-2xl mx-auto mb-4 shadow-lg" />
        <h2 className="text-xl font-extrabold text-primary-foreground">SaloneMakitSL</h2>
        <p className="text-xs text-accent font-bold uppercase tracking-[0.15em] mt-1">Di Place Fo Shop 🇸🇱</p>
        <p className="text-xs text-primary-foreground/80 mt-4 max-w-xs mx-auto leading-relaxed">
          Sierra Leone's premier online fashion destination — quality clothing, shoes, bags & beauty products delivered to all 16 districts.
        </p>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Founder */}
        <section className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Our Founder</h3>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-accent">MJ</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Mohamed Pateh Abdul R Jalloh</p>
              <p className="text-[11px] text-accent font-semibold">Founder & CEO</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                A young Sierra Leonean entrepreneur with a passion for African fashion and technology. 
                Mohamed founded SaloneMakitSL with the belief that every Sierra Leonean — from Freetown to the most remote district — deserves access to quality, affordable fashion.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Our Mission</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-accent/5 border border-accent/15 rounded-lg p-3">
              <p className="text-xs font-bold text-foreground mb-1">🎯 Mission</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To make quality, affordable fashion accessible to every Sierra Leonean, regardless of where they live. We bridge the gap between urban fashion trends and nationwide delivery.
              </p>
            </div>
            <div className="bg-accent/5 border border-accent/15 rounded-lg p-3">
              <p className="text-xs font-bold text-foreground mb-1">🌍 Vision</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To become West Africa's most trusted online fashion platform — empowering Sierra Leonean youth through e-commerce and creating economic opportunities across the nation.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story / Timeline */}
        <section className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Our Journey</h3>
          </div>
          <div className="space-y-4 relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-accent/20" />
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0 z-10 text-[10px] font-bold">
                  {i + 1}
                </div>
                <div className="pt-1">
                  <p className="text-[10px] text-accent font-bold">{item.year}</p>
                  <p className="text-xs font-bold text-foreground">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What We Offer */}
        <section className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">What We Offer</h3>
          </div>
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
        <section className="bg-card border border-border rounded-xl p-5">
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
        <section className="bg-card border border-border rounded-xl p-5">
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
        <section className="bg-card border border-border rounded-xl p-5">
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
          <p className="text-[9px] text-muted-foreground mt-3">
            SaloneMakitSL © 2026 • Founded by Mohamed Pateh Abdul R Jalloh • Made with ❤️ in Sierra Leone 🇸🇱
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
