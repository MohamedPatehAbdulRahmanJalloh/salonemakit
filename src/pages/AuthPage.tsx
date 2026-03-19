import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRegion } from "@/context/RegionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, LogIn, UserPlus, Mail, Lock, Globe } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const AuthPage = () => {
  useDocumentTitle("Sign In");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState<string>("sl");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = mode === "login" ? await signIn(email, password) : await signUp(email, password, { region: country });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else if (mode === "signup") {
      toast.success("Check your email to verify your account");
    } else {
      toast.success("Welcome back!");
      navigate(redirectTo);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-bold">{mode === "login" ? "Sign In" : "Create Account"}</h1>
        </div>
      </header>

      <div className="px-6 pt-8 max-w-sm mx-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="SaloneMakitSL" className="h-12 w-12 rounded-lg mb-2" />
          <h2 className="text-base font-extrabold text-primary">SaloneMakitSL</h2>
          <p className="text-[10px] text-accent font-bold uppercase tracking-[0.15em]">Di Place Fo Shop</p>
        </div>

        {/* Toggle */}
        <div className="flex gap-0 mb-6 bg-secondary rounded-lg p-0.5">
          <button
            onClick={() => setMode("login")}
            className={cn(
              "flex-1 py-2.5 rounded-md text-xs font-bold transition-all",
              mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={cn(
              "flex-1 py-2.5 rounded-md text-xs font-bold transition-all",
              mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-lg bg-secondary border-none text-sm"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-lg bg-secondary border-none text-sm"
              minLength={6}
            />
          </div>

          {mode === "signup" && (
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="pl-10 h-12 rounded-lg bg-secondary border-none text-sm">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sl">🇸🇱 Sierra Leone</SelectItem>
                  <SelectItem value="dubai">🇦🇪 United Arab Emirates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg text-sm font-bold bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>

          {mode === "login" && (
            <button
              type="button"
              onClick={async () => {
                if (!email) {
                  toast.error("Enter your email first");
                  return;
                }
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) toast.error(error.message);
                else toast.success("Password reset link sent to your email!");
              }}
              className="text-xs text-accent font-medium text-center w-full block pt-1"
            >
              Forgot password?
            </button>
          )}
        </form>

        <p className="text-[10px] text-muted-foreground text-center mt-6 leading-relaxed">
          By continuing, you agree to SaloneMakitSL's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
