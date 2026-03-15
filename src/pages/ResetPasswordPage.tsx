import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setReady(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated! You can now sign in.");
      navigate("/auth");
    }
  };

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-muted-foreground text-sm mb-4">Invalid or expired reset link.</p>
        <Button onClick={() => navigate("/auth")} variant="outline" className="rounded-full">Go to Sign In</Button>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/auth")} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Reset Password</h1>
      </div>
      <div className="px-6 pt-8 max-w-sm mx-auto">
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl h-12" minLength={6} />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-sm font-bold bg-accent hover:bg-accent/90">
            {loading ? "Updating..." : "Set New Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
