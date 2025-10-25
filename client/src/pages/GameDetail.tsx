import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, Package } from "lucide-react";
import type { Game, GamePackage } from "@shared/schema";

export default function GameDetail() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [userGameId, setUserGameId] = useState("");
  const [userGameServer, setUserGameServer] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const { data: game, isLoading: gameLoading } = useQuery<Game>({
    queryKey: ["/api/games", slug],
    enabled: !!slug,
  });

  const { data: packages, isLoading: packagesLoading } = useQuery<GamePackage[]>({
    queryKey: ["/api/games", slug, "packages"],
    enabled: !!game?.id,
  });

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Silakan masuk terlebih dahulu",
        description: "Anda harus masuk untuk melakukan pembelian",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (!userGameId.trim()) {
      toast({
        title: "User ID diperlukan",
        description: "Silakan masukkan User ID game Anda",
        variant: "destructive",
      });
      return;
    }

    if (game?.requiresServer && !userGameServer.trim()) {
      toast({
        title: "Server ID diperlukan",
        description: "Silakan masukkan Server ID Anda",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPackage) {
      toast({
        title: "Pilih paket",
        description: "Silakan pilih paket yang ingin dibeli",
        variant: "destructive",
      });
      return;
    }

    // Navigate to checkout with query params
    const params = new URLSearchParams({
      gameId: game!.id,
      packageId: selectedPackage,
      userId: userGameId.trim(),
    });
    
    // Add server if requiresServer is true OR if server has a value
    if (userGameServer.trim()) {
      params.append('server', userGameServer.trim());
    }
    
    setLocation(`/checkout?${params.toString()}`);
  };

  if (gameLoading || !game) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const activePackages = packages?.filter(p => p.isActive) || [];
  const selectedPkg = activePackages.find(p => p.id === selectedPackage);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar showAdminButton={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Info */}
          <div className="space-y-6">
            <div className="aspect-square rounded-xl overflow-hidden border border-card-border">
              <img
                src={game.imageUrl}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-primary border-primary">
                  {game.category}
                </Badge>
                {game.stock > 0 ? (
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    Tersedia
                  </Badge>
                ) : (
                  <Badge variant="destructive">Stok Habis</Badge>
                )}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
                {game.name}
              </h1>
              <p className="text-muted-foreground mb-4">
                Publisher: {game.publisher}
              </p>
              <p className="text-foreground leading-relaxed">
                {game.description}
              </p>
            </div>
          </div>

          {/* Purchase Form */}
          <div className="space-y-6">
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="font-heading">1. Masukkan User ID</CardTitle>
                <CardDescription>
                  Masukkan User ID atau Server ID game Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID <span className="text-destructive">*</span></Label>
                  <Input
                    id="userId"
                    placeholder="Contoh: 123456789"
                    value={userGameId}
                    onChange={(e) => setUserGameId(e.target.value)}
                    className="bg-background border-border"
                    data-testid="input-user-id"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="server">Server ID {game?.requiresServer ? <span className="text-destructive">*</span> : "(opsional)"}</Label>
                  <Input
                    id="server"
                    type="number"
                    placeholder="Contoh: 1234"
                    value={userGameServer}
                    onChange={(e) => setUserGameServer(e.target.value)}
                    className="bg-background border-border"
                    data-testid="input-server-id"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="font-heading">2. Pilih Nominal</CardTitle>
                <CardDescription>
                  Pilih paket yang Anda inginkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {packagesLoading ? (
                  <div className="grid grid-cols-1 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : activePackages.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {activePackages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left hover-elevate ${
                          selectedPackage === pkg.id
                            ? "border-primary bg-primary/10"
                            : "border-card-border bg-card"
                        }`}
                        data-testid={`button-package-${pkg.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-heading font-bold text-foreground">
                                {pkg.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {pkg.amount}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {pkg.discountPrice ? (
                              <>
                                <p className="text-sm text-muted-foreground line-through">
                                  Rp {pkg.price.toLocaleString("id-ID")}
                                </p>
                                <p className="font-bold text-primary">
                                  Rp {pkg.discountPrice.toLocaleString("id-ID")}
                                </p>
                              </>
                            ) : (
                              <p className="font-bold text-foreground">
                                Rp {pkg.price.toLocaleString("id-ID")}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Belum ada paket tersedia
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase Summary */}
            {selectedPkg && (
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Total Pembayaran:</span>
                    <span className="font-heading text-2xl font-bold text-primary">
                      Rp {(selectedPkg.discountPrice || selectedPkg.price).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <Button
                    onClick={handlePurchase}
                    className="w-full h-12 text-base"
                    disabled={game.stock === 0}
                    data-testid="button-checkout"
                  >
                    Lanjutkan ke Pembayaran
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}