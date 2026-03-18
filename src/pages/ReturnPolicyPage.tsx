import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ArrowLeft, RotateCcw, Clock, Package, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReturnPolicyPage = () => {
  useDocumentTitle("Return & Refund Policy");
  const navigate = useNavigate();

  return (
    <div className="pb-20 lg:pb-6 bg-background">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <h1 className="text-sm font-bold">Return & Refund Policy</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="bg-accent/5 border border-accent/15 rounded-2xl p-5 text-center">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <RotateCcw className="h-6 w-6 text-accent" />
          </div>
          <h2 className="text-base font-bold text-foreground">Hassle-Free Returns</h2>
          <p className="text-xs text-muted-foreground mt-1">We want you to love what you buy. If not, we've got you covered.</p>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Clock className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-sm font-bold">7 Days</p>
            <p className="text-[10px] text-muted-foreground">Return window</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Package className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-sm font-bold">Original Condition</p>
            <p className="text-[10px] text-muted-foreground">Tags attached</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <CheckCircle className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-sm font-bold">Full Refund</p>
            <p className="text-[10px] text-muted-foreground">Or exchange</p>
          </div>
        </div>

        {/* Detailed Policy */}
        <div className="space-y-5">
          <section>
            <h3 className="text-sm font-bold text-foreground mb-2">Eligibility</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex gap-2"><CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" /> Items must be returned within 7 days of delivery</li>
              <li className="flex gap-2"><CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" /> Products must be unused, unworn, and in original packaging</li>
              <li className="flex gap-2"><CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" /> All tags and labels must be attached</li>
              <li className="flex gap-2"><CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" /> Receipt or proof of purchase is required</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-bold text-foreground mb-2">Non-Returnable Items</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex gap-2"><AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" /> Perfumes and beauty products (hygiene reasons)</li>
              <li className="flex gap-2"><AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" /> Underwear and intimate apparel</li>
              <li className="flex gap-2"><AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" /> Items marked as "Final Sale"</li>
              <li className="flex gap-2"><AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" /> Customized or personalized items</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-bold text-foreground mb-2">How to Return</h3>
            <ol className="space-y-3 text-xs text-muted-foreground">
              <li className="flex gap-3">
                <span className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>Contact us via WhatsApp at <strong className="text-foreground">+232 78 928 111</strong> or email <strong className="text-foreground">info@salonemakitsl.com</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span>Provide your order ID and reason for return</span>
              </li>
              <li className="flex gap-3">
                <span className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <span>We'll arrange pickup or provide a drop-off location in your district</span>
              </li>
              <li className="flex gap-3">
                <span className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                <span>Refund processed within 3-5 business days after inspection</span>
              </li>
            </ol>
          </section>

          <section>
            <h3 className="text-sm font-bold text-foreground mb-2">Refund Methods</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex gap-2"><CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" /> <strong className="text-foreground">Orange Money:</strong> Refund sent to your registered number</li>
              <li className="flex gap-2"><CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" /> <strong className="text-foreground">Cash on Delivery:</strong> Refund via Orange Money or store credit</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-bold text-foreground mb-2">Damaged or Wrong Items</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you receive a damaged, defective, or incorrect item, contact us within 48 hours of delivery with photos. We will arrange a free replacement or full refund — no questions asked.
            </p>
          </section>
        </div>

        {/* Contact CTA */}
        <div className="bg-accent/5 border border-accent/15 rounded-xl p-4 text-center">
          <p className="text-xs font-bold text-foreground mb-1">Need Help?</p>
          <p className="text-[10px] text-muted-foreground mb-3">Our team is ready to assist you</p>
          <a
            href="https://wa.me/23278928111?text=Hi%20SaloneMakitSL%2C%20I%20need%20help%20with%20a%20return"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-xs font-bold"
          >
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
