import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signInWithEmail } from "@/lib/firebase";
import { SiGoogle } from "react-icons/si";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Berhasil masuk!",
        description: "Selamat datang di GameTopUp",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Gagal masuk",
        description: error.message || "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast({
        title: "Berhasil masuk!",
        description: "Selamat datang kembali",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Gagal masuk",
        description: error.message || "Email atau password salah",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, hsl(var(--primary)) 50px, hsl(var(--primary)) 51px),
                           repeating-linear-gradient(90deg, transparent, transparent 50px, hsl(var(--primary)) 50px, hsl(var(--primary)) 51px)`
        }} />
      </div>

      <Card className="w-full max-w-md relative z-10 border-card-border">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-2xl">G</span>
            </div>
          </div>
          <CardTitle className="font-heading text-2xl font-bold">
            Masuk ke Akun Anda
          </CardTitle>
          <CardDescription>
            Pilih metode masuk yang Anda inginkan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign In */}
          <Button
            variant="outline"
            className="w-full gap-2 h-11"
            onClick={handleGoogleSignIn}
            disabled={loading}
            data-testid="button-google-signin"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <SiGoogle className="h-5 w-5" />
                Masuk dengan Google
              </>
            )}
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              ATAU
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card border-card-border"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-card border-card-border"
                data-testid="input-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
              data-testid="button-email-signin"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Belum punya akun? </span>
            <Link href="/register">
              <a className="text-primary hover:underline font-medium" data-testid="link-register">
                Daftar sekarang
              </a>
            </Link>
          </div>

          <div className="text-center">
            <Link href="/">
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Kembali ke beranda
              </a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
