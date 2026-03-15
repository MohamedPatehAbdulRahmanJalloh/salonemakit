import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = mode === "login" ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else if (mode === "signup") {
      toast.success("Check your email to verify your account");
    } else {
      toast.success("Welcome back!");
      navigate("/admin");
    }
  };

  return (
    <div className="pb-20 min-h-screen">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">{mode === "login" ? "Sign In" : "Create Account"}</h1>
      </div>

      <div className="px-6 pt-8 max-w-sm mx-auto">
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setMode("login")}
            className={cn(
              "flex-1 py-2.5 rounded-full text-sm font-semibold transition-all",
              mode === "login" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={cn(
              "flex-1 py-2.5 rounded-full text-sm font-semibold transition-all",
              mode === "signup" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl h-12"
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-sm font-bold bg-accent hover:bg-accent/90">
            {loading ? "Please wait..." : mode === "login" ? (
              <><LogIn className="h-4 w-4 mr-2" /> Sign In</>
            ) : (
              <><UserPlus className="h-4 w-4 mr-2" /> Create Account</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
