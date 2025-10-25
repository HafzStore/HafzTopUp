import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Package, Clock, CheckCircle2 } from "lucide-react";
import type { Transaction, Game, GamePackage } from "@shared/schema";

interface TransactionWithDetails extends Transaction {
  game?: Game;
  package?: GamePackage;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: transactions, isLoading } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions", user?.uid],
    queryFn: async () => {
      const response = await fetch(`/api/transactions?userId=${user?.uid}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar showAdminButton={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Kelola dan lihat riwayat transaksi Anda
            </p>
          </div>

          {/* User Info Card */}
          <Card className="border-card-border mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-heading font-bold">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    {user.displayName || "User"}
                  </h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Riwayat Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-24" />
                    </div>
                  ))}
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 rounded-lg border border-card-border bg-card hover-elevate transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {transaction.game && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-card-border flex-shrink-0">
                              <img
                                src={transaction.game.imageUrl}
                                alt={transaction.game.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-bold text-foreground mb-1">
                              {transaction.game?.name || "Game"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {transaction.package?.name || "Package"}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(transaction.createdAt).toLocaleDateString("id-ID")}
                              </span>
                              <span>•</span>
                              <span>ID: {transaction.id.slice(-8)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : transaction.status === "pending"
                                ? "outline"
                                : "destructive"
                            }
                            className={transaction.status === "completed" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {transaction.status === "completed" && (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            {transaction.status === "completed"
                              ? "Selesai"
                              : transaction.status === "pending"
                              ? "Pending"
                              : "Gagal"}
                          </Badge>
                          <span className="font-heading font-bold text-primary whitespace-nowrap">
                            Rp {transaction.amount.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                    Belum ada transaksi
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Anda belum memiliki riwayat transaksi
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
