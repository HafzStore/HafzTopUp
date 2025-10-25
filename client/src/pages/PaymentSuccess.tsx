import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Download, Home, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Game, GamePackage } from "@shared/schema";

export default function PaymentSuccess() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  
  const gameId = params.get("gameId");
  const packageId = params.get("packageId");
  const userId = params.get("userId");
  const server = params.get("server") || "";
  const paymentIntent = params.get("payment_intent");
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState("");

  const { data: game } = useQuery<Game>({
    queryKey: ["/api/games/by-id", gameId],
    enabled: !!gameId,
  });

  const { data: packageData } = useQuery<GamePackage>({
    queryKey: ["/api/packages", packageId],
    enabled: !!packageId,
  });

  useEffect(() => {
    const confirmPayment = async () => {
      if (paymentIntent && !confirmed) {
        try {
          setConfirming(true);
          const response = await apiRequest("POST", "/api/confirm-payment", {
            paymentIntentId: paymentIntent,
          });
          const data = await response.json();
          if (data.success) {
            setConfirmed(true);
          } else {
            setError(data.message || "Payment confirmation failed");
          }
        } catch (error: any) {
          console.error("Failed to confirm payment:", error);
          setError(error.message || "Payment confirmation failed");
        } finally {
          setConfirming(false);
        }
      }
    };
    
    confirmPayment();
  }, [paymentIntent, confirmed]);

  const finalPrice = packageData?.discountPrice || packageData?.price || 0;
  const transactionDate = new Date();

  if (confirming) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Mengonfirmasi pembayaran...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              Konfirmasi Gagal
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/dashboard">
              <Button data-testid="button-view-transactions">
                Lihat Transaksi Saya
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!confirmed) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground">Payment not confirmed yet.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              Pembayaran Berhasil!
            </h1>
            <p className="text-muted-foreground">
              Transaksi Anda telah berhasil diproses
            </p>
          </div>

          {/* Transaction Details */}
          <Card className="border-card-border mb-6">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-4">
                  Detail Transaksi
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Transaksi:</span>
                    <span className="font-mono text-sm font-medium" data-testid="text-transaction-id">
                      {paymentIntent?.slice(-12) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanggal:</span>
                    <span className="font-medium">
                      {transactionDate.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-green-500">Berhasil</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-heading font-bold text-foreground mb-3">
                  Detail Pesanan
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Game:</span>
                    <span className="font-medium">{game?.name || "Loading..."}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paket:</span>
                    <span className="font-medium">{packageData?.name || "Loading..."}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="font-mono text-sm font-medium">{userId}</span>
                  </div>
                  {server && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Server:</span>
                      <span className="font-medium">{server}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center pt-2">
                <span className="font-medium text-muted-foreground">Total Pembayaran:</span>
                <span className="font-heading text-2xl font-bold text-primary">
                  Rp {finalPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="border-primary/50 bg-primary/5 mb-6">
            <CardContent className="p-6">
              <p className="text-sm text-foreground">
                <strong>Penting:</strong> Item game Anda akan segera diproses dan dikirim ke akun game Anda.
                Proses pengiriman biasanya memakan waktu 1-5 menit. Jika belum masuk dalam 15 menit,
                silakan hubungi customer service kami.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full gap-2" data-testid="button-view-history">
                <Download className="h-4 w-4" />
                Lihat Riwayat Transaksi
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full gap-2" data-testid="button-home">
                <Home className="h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
