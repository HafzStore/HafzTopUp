import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Package, CreditCard } from "lucide-react";
import type { Game, GamePackage } from "@shared/schema";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm({ gameId, packageId, userId, server }: {
  gameId: string;
  packageId: string;
  userId: string;
  server: string | undefined;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?gameId=${gameId}&packageId=${packageId}&userId=${userId}&server=${server}`,
        },
      });

      if (error) {
        toast({
          title: "Pembayaran gagal",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Terjadi kesalahan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Metode Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full h-12 text-base"
        disabled={!stripe || processing}
        data-testid="button-confirm-payment"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Memproses...
          </>
        ) : (
          "Bayar Sekarang"
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

  const params = new URLSearchParams(location.split("?")[1] || "");
  const gameId = params.get("gameId");
  const packageId = params.get("packageId");
  const userId = params.get("userId");
  const server = params.get("server") || undefined;

  const { data: game } = useQuery<Game>({
    queryKey: ["/api/games/by-id", gameId],
    enabled: !!gameId,
  });

  const { data: packageData } = useQuery<GamePackage>({
    queryKey: ["/api/packages", packageId],
    enabled: !!packageId,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        gameId,
        packageId,
        userId: user?.uid,
        userGameId: userId,
        server,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal membuat pembayaran",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Silakan masuk terlebih dahulu",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (!gameId || !packageId || !userId) {
      toast({
        title: "Data tidak lengkap",
        description: "Silakan kembali dan lengkapi data",
        variant: "destructive",
      });
      setLocation(`/game/${game?.slug || ''}`);
      return;
    }

    if (packageData && !createPaymentMutation.isPending && !clientSecret && !createPaymentMutation.isSuccess) {
      createPaymentMutation.mutate();
    }
  }, [user, gameId, packageId, userId, packageData, clientSecret, createPaymentMutation.isPending, createPaymentMutation.isSuccess]);

  if (!game || !packageData || !clientSecret) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat halaman pembayaran...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const finalPrice = packageData.discountPrice || packageData.price;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-card-border sticky top-20">
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Ringkasan Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden border border-card-border">
                    <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-foreground mb-1">
                      {game.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {packageData.name}
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-medium">{userId}</span>
                    </div>
                    {server && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Server:</span>
                        <span className="font-medium">{server}</span>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Total:</span>
                    <span className="font-heading text-2xl font-bold text-primary">
                      Rp {finalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  gameId={gameId}
                  packageId={packageId}
                  userId={userId}
                  server={server}
                />
              </Elements>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}