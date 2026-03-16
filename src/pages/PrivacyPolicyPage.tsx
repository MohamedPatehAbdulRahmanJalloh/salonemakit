import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const PrivacyPolicyPage = () => {
  useDocumentTitle("Privacy Policy");
  const navigate = useNavigate();

  return (
    <div className="pb-20 bg-background">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-bold">Privacy Policy</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 text-xs text-muted-foreground leading-relaxed">
        <p className="text-[10px]">Last updated: March 2026</p>

        <section>
          <h2 className="text-sm font-bold text-foreground mb-1">1. Introduction</h2>
          <p>SaloneMakitSL ("we", "our", or "us") operates the SaloneMakitSL mobile application. This Privacy Policy explains how we collect, use, and protect your personal information when you use our app.</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-foreground mb-1">2. Information We Collect</h2>
          <p className="mb-1">We collect the following information when you use our app:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><strong>Account Information:</strong> Email address and password when you create an account.</li>
            <li><strong>Order Information:</strong> Name, phone number, delivery address, and district for processing orders.</li>
            <li><strong>Usage Data:</strong> How you interact with the app, including products viewed and searches made.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-bold text-foreground mb-1">3. How We Use Your Information</h2>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>To process and deliver your orders</li>
            <li>To manage your account</li>
            <li>To send order updates and notifications</li>
            <li>To improve our app and services</li>
            <li>To provide customer support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-bold text-foreground mb-1">4. Data Sharing</h2>
          <p>We do not sell your personal information. We may share your data only with delivery partners to fulfill your orders and with payment processors (Orange Money) to process payments.</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-foreground mb-1">5. Data Security</h2>
          <p>We use industry-standard security measures to protect your personal information, including encrypted connections and secure data storage.</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-foreground mb-1">6. Your Rights</h2>
          <p>You can request to view, update, or delete your personal data at any time by contacting us.</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-foreground mb-1">7. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, contact us:</p>
          <ul className="list-disc pl-4 space-y-0.5 mt-1">
            <li>WhatsApp: +232 78 928 111</li>
            <li>Email: info@salonemakitsl.com</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
