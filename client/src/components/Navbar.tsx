import { Link, useLocation } from "wouter";
import { Search, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/firebase";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SiteConfig } from "@shared/schema";

interface NavbarProps {
  onSearch?: (query: string) => void;
  showAdminButton?: boolean;
}

export function Navbar({ onSearch, showAdminButton }: NavbarProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: siteConfig } = useQuery<SiteConfig>({
    queryKey: ["/api/site-config"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setLocation("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-all cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-lg">G</span>
              </div>
              <span className="font-heading text-xl font-bold text-primary hidden sm:inline">
                {siteConfig?.siteName || "GameTopUp"}
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari game..."
                className="pl-10 bg-card border-card-border focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Admin Button - Only show if showAdminButton is true */}
            {showAdminButton && (
              <Link href="/admin/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                  data-testid="button-admin"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}

            {user ? (
              <>
                {/* User Dashboard Link */}
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    data-testid="link-dashboard"
                  >
                    Riwayat
                  </Button>
                </Link>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      data-testid="button-user-menu"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{user.displayName || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <a className="flex items-center gap-2 w-full cursor-pointer">
                          <User className="h-4 w-4" />
                          Dashboard
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive cursor-pointer"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" data-testid="button-login">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" data-testid="button-register">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari game..."
              className="pl-10 bg-card border-card-border focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-mobile"
            />
          </form>
        </div>
      </div>
    </header>
  );
}