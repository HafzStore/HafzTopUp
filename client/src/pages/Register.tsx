import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signUpWithEmail } from "@/lib/firebase";
import { SiGoogle } from "react-icons/si";
import { Loader2 } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Berhasil mendaftar!",
        description: "Selamat datang di GameTopUp",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Gagal mendaftar",
        description: error.message || "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Pastikan password dan konfirmasi password sama",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password terlalu pendek",
        description: "Password minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password, displayName);
      toast({
        title: "Berhasil mendaftar!",
        description: "Akun Anda telah dibuat, silakan masuk",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Gagal mendaftar",
        description: error.message || "Terjadi kesalahan, silakan coba lagi",
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
            Buat Akun Baru
          </CardTitle>
          <CardDescription>
            Daftar untuk mulai top up game favoritmu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign Up */}
          <Button
            variant="outline"
            className="w-full gap-2 h-11"
            onClick={handleGoogleSignUp}
            disabled={loading}
            data-testid="button-google-signup"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <SiGoogle className="h-5 w-5" />
                Daftar dengan Google
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
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nama Lengkap</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="bg-card border-card-border"
                data-testid="input-displayname"
              />
            </div>
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
                minLength={6}
                className="bg-card border-card-border"
                data-testid="input-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="bg-card border-card-border"
                data-testid="input-confirm-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
              data-testid="button-email-signup"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Daftar"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Sudah punya akun? </span>
            <Link href="/login">
              <a className="text-primary hover:underline font-medium" data-testid="link-login">
                Masuk sekarang
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
