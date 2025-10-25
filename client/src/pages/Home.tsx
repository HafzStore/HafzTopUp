import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import { GameCard } from "@/components/GameCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Shield, Clock, Star } from "lucide-react";
import type { Game, Banner } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: banners, isLoading: bannersLoading } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });

  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const filteredGames = games?.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || game.category === categoryFilter;
    return matchesSearch && matchesCategory && game.isActive;
  });

  const categories = Array.from(new Set(games?.map((g) => g.category) || []));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onSearch={setSearchQuery} showAdminButton={true} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8">
          {bannersLoading ? (
            <Skeleton className="w-full h-64 md:h-96 rounded-xl" />
          ) : (
            <HeroBanner banners={banners || []} />
          )}
        </section>

        {/* Features Section */}
        <section className="border-y border-border bg-card/30 backdrop-blur">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Proses Cepat",
                  description: "Top up selesai dalam hitungan detik",
                },
                {
                  icon: Shield,
                  title: "Aman & Terpercaya",
                  description: "Transaksi dijamin 100% aman",
                },
                {
                  icon: Clock,
                  title: "Layanan 24/7",
                  description: "Customer service siap membantu kapan saja",
                },
                {
                  icon: Star,
                  title: "Harga Terbaik",
                  description: "Harga termurah dengan kualitas terjamin",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-card border border-card-border hover-elevate transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Games Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
              Pilih Game Favoritmu
            </h2>
            <p className="text-muted-foreground">
              Top up game favoritmu dengan harga terbaik dan proses tercepat
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Cari game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card border-card-border"
                data-testid="input-game-search"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-card border-card-border" data-testid="select-category">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Games Grid */}
          {gamesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : filteredGames && filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                Tidak ada game ditemukan
              </h3>
              <p className="text-muted-foreground">
                Coba ubah filter pencarian Anda
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
