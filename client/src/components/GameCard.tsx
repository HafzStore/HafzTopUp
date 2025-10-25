import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Game } from "@shared/schema";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const isLowStock = game.stock < 10 && game.stock > 0;
  const isOutOfStock = game.stock === 0;

  return (
    <Link href={`/game/${game.slug}`}>
      <Card className="group overflow-hidden border-card-border hover-elevate active-elevate-2 transition-all duration-200 cursor-pointer h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={game.imageUrl}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Stok Habis
              </Badge>
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge
              variant="outline"
              className="absolute top-2 right-2 bg-yellow-500/90 text-black border-yellow-600"
            >
              Stok Terbatas
            </Badge>
          )}
          {game.stock > 100 && (
            <Badge
              variant="outline"
              className="absolute top-2 right-2 bg-green-500/90 text-white border-green-600"
            >
              Tersedia
            </Badge>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            <h3 className="font-heading font-bold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {game.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {game.category}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {game.description}
            </p>
          </div>
          <Button
            className="w-full mt-4"
            disabled={isOutOfStock}
            data-testid={`button-topup-${game.slug}`}
          >
            {isOutOfStock ? "Stok Habis" : "Top Up Sekarang"}
          </Button>
        </div>
      </Card>
    </Link>
  );
}
