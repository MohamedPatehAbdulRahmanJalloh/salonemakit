import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="hidden lg:block bg-card border-t border-border mt-8">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-lg font-bold text-primary mb-3">SaloneMakitSL</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sierra Leone's favourite online fashion store. Quality clothing, shoes & accessories delivered nationwide.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://facebook.com/salonemakitsl" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://instagram.com/salonemakitsl" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://tiktok.com/@salonemakitsl" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <span className="text-sm">🎵</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/search" className="text-xs text-muted-foreground hover:text-accent transition-colors">All Products</Link></li>
              <li><Link to="/search?category=men" className="text-xs text-muted-foreground hover:text-accent transition-colors">Men</Link></li>
              <li><Link to="/search?category=women" className="text-xs text-muted-foreground hover:text-accent transition-colors">Women</Link></li>
              <li><Link to="/search?category=kids" className="text-xs text-muted-foreground hover:text-accent transition-colors">Kids</Link></li>
              <li><Link to="/search?category=shoes" className="text-xs text-muted-foreground hover:text-accent transition-colors">Shoes</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/orders" className="text-xs text-muted-foreground hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link to="/about" className="text-xs text-muted-foreground hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/privacy" className="text-xs text-muted-foreground hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li>
                <a href="https://wa.me/23278928111" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-accent transition-colors">
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-accent" />
                +232 78 928 111
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-accent" />
                info@salonemakitsl.com
              </li>
              <li className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-accent mt-0.5" />
                Freetown, Sierra Leone
              </li>
            </ul>
            {/* Payment badges */}
            <div className="mt-4 flex gap-2">
              <span className="inline-flex items-center gap-1 bg-accent/10 px-2.5 py-1.5 rounded text-[10px] font-semibold text-accent">💵 COD</span>
              <span className="inline-flex items-center gap-1 bg-orange/10 px-2.5 py-1.5 rounded text-[10px] font-semibold text-orange">📱 Orange Money</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} SaloneMakitSL. All rights reserved.</p>
          <p className="text-[11px] text-muted-foreground">🇸🇱 Made in Sierra Leone</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
