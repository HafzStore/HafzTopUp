import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  Gamepad2,
  Image,
  Settings,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Package,
} from "lucide-react";
import type { Game, GamePackage, Banner, SiteConfig } from "@shared/schema";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Queries
  const { data: games } = useQuery<Game[]>({ queryKey: ["/api/admin/games"] });
  const { data: banners } = useQuery<Banner[]>({ queryKey: ["/api/admin/banners"] });
  const { data: siteConfig } = useQuery<SiteConfig>({ queryKey: ["/api/admin/site-config"] });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout", {});
      toast({ title: "Berhasil keluar" });
      setLocation("/");
    } catch (error) {
      toast({ title: "Gagal keluar", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card p-6 flex flex-col">
        <div className="mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3">
            <span className="text-primary-foreground font-heading font-bold text-xl">G</span>
          </div>
          <h1 className="font-heading text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">GameTopUp</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("dashboard")}
            data-testid="nav-dashboard"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "games" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("games")}
            data-testid="nav-games"
          >
            <Gamepad2 className="h-4 w-4" />
            Kelola Game
          </Button>
          <Button
            variant={activeTab === "banners" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("banners")}
            data-testid="nav-banners"
          >
            <Image className="h-4 w-4" />
            Kelola Banner
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("settings")}
            data-testid="nav-settings"
          >
            <Settings className="h-4 w-4" />
            Pengaturan
          </Button>
        </nav>

        <Button
          variant="outline"
          className="w-full justify-start gap-2 mt-auto"
          onClick={handleLogout}
          data-testid="button-admin-logout"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {activeTab === "dashboard" && <DashboardTab games={games} />}
        {activeTab === "games" && <GamesTab games={games} />}
        {activeTab === "banners" && <BannersTab banners={banners} />}
        {activeTab === "settings" && <SettingsTab siteConfig={siteConfig} />}
      </div>
    </div>
  );
}

// Dashboard Tab
function DashboardTab({ games }: { games?: Game[] }) {
  const totalGames = games?.length || 0;
  const activeGames = games?.filter(g => g.isActive).length || 0;
  const totalStock = games?.reduce((sum, g) => sum + g.stock, 0) || 0;

  return (
    <div>
      <h2 className="font-heading text-3xl font-bold text-foreground mb-8">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Game</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold text-primary">{totalGames}</p>
          </CardContent>
        </Card>
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Game Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold text-primary">{activeGames}</p>
          </CardContent>
        </Card>
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold text-primary">{totalStock}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Games Tab
function GamesTab({ games }: { games?: Game[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [packagesDialogOpen, setPackagesDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const { data: packages } = useQuery<GamePackage[]>({
    queryKey: ["/api/games", selectedGameId, "packages"],
    enabled: !!selectedGameId && packagesDialogOpen,
  });

  const deleteGameMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/games/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      toast({ title: "Game berhasil dihapus" });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-3xl font-bold text-foreground">Kelola Game</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingGame(null)} data-testid="button-add-game">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Game
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <GameForm
              game={editingGame}
              onClose={() => {
                setDialogOpen(false);
                setEditingGame(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-card-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games?.map((game) => (
              <TableRow key={game.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={game.imageUrl}
                      alt={game.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <span className="font-medium">{game.name}</span>
                  </div>
                </TableCell>
                <TableCell>{game.category}</TableCell>
                <TableCell>
                  <Badge variant={game.stock > 10 ? "default" : "destructive"}>
                    {game.stock}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={game.isActive ? "default" : "secondary"}>
                    {game.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedGameId(game.id);
                        setPackagesDialogOpen(true);
                      }}
                      data-testid={`button-packages-${game.id}`}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingGame(game);
                        setDialogOpen(true);
                      }}
                      data-testid={`button-edit-${game.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGameMutation.mutate(game.id)}
                      data-testid={`button-delete-${game.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Packages Dialog */}
      <Dialog open={packagesDialogOpen} onOpenChange={setPackagesDialogOpen}>
        <DialogContent className="max-w-3xl">
          <PackagesManager gameId={selectedGameId} packages={packages} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Game Form Component
function GameForm({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: game?.name || "",
    slug: game?.slug || "",
    description: game?.description || "",
    imageUrl: game?.imageUrl || "",
    category: game?.category || "",
    publisher: game?.publisher || "",
    stock: game?.stock || 0,
    isActive: game?.isActive ?? true,
    requiresServer: game?.requiresServer ?? false,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (game) {
        return apiRequest("PUT", `/api/admin/games/${game.id}`, formData);
      } else {
        return apiRequest("POST", "/api/admin/games", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      toast({ title: game ? "Game diupdate" : "Game ditambahkan" });
      onClose();
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{game ? "Edit Game" : "Tambah Game Baru"}</DialogTitle>
        <DialogDescription>
          Lengkapi form di bawah untuk {game ? "mengedit" : "menambahkan"} game
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="col-span-2">
          <Label htmlFor="name">Nama Game</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            data-testid="input-game-name"
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            data-testid="input-game-slug"
          />
        </div>
        <div>
          <Label htmlFor="category">Kategori</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            data-testid="input-game-category"
          />
        </div>
        <div>
          <Label htmlFor="publisher">Publisher</Label>
          <Input
            id="publisher"
            value={formData.publisher}
            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            data-testid="input-game-publisher"
          />
        </div>
        <div>
          <Label htmlFor="stock">Stok</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
            data-testid="input-game-stock"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="imageUrl">URL Gambar</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            data-testid="input-game-image"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            data-testid="input-game-description"
          />
        </div>
        <div className="col-span-2 flex items-center space-x-2">
          <input
            type="checkbox"
            id="requiresServer"
            checked={formData.requiresServer}
            onChange={(e) => setFormData({ ...formData, requiresServer: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
            data-testid="checkbox-requires-server"
          />
          <Label htmlFor="requiresServer" className="cursor-pointer">
            Game ini memerlukan Server ID
          </Label>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button onClick={() => saveMutation.mutate()} data-testid="button-save-game">
          Simpan
        </Button>
      </div>
    </>
  );
}

// Packages Manager Component  
function PackagesManager({ gameId, packages }: { gameId: string | null; packages?: GamePackage[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<GamePackage | null>(null);

  const deletePackageMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/packages/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId, "packages"] });
      toast({ title: "Paket berhasil dihapus" });
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Kelola Paket Game</DialogTitle>
        <DialogDescription>Atur paket nominal untuk game ini</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Button onClick={() => { setEditingPackage(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Paket
        </Button>
        <div className="space-y-2">
          {packages?.map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between p-3 border border-card-border rounded">
              <div>
                <p className="font-medium">{pkg.name}</p>
                <p className="text-sm text-muted-foreground">
                  Rp {pkg.price.toLocaleString("id-ID")}
                  {pkg.discountPrice && ` → Rp ${pkg.discountPrice.toLocaleString("id-ID")}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditingPackage(pkg); setDialogOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deletePackageMutation.mutate(pkg.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <PackageForm
            gameId={gameId}
            package={editingPackage}
            onClose={() => { setDialogOpen(false); setEditingPackage(null); }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Package Form
function PackageForm({ gameId, package: pkg, onClose }: { gameId: string | null; package: GamePackage | null; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: pkg?.name || "",
    amount: pkg?.amount || "",
    price: pkg?.price || 0,
    discountPrice: pkg?.discountPrice || undefined,
    isActive: pkg?.isActive ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = { ...formData, gameId };
      if (pkg) {
        return apiRequest("PUT", `/api/admin/packages/${pkg.id}`, data);
      } else {
        return apiRequest("POST", "/api/admin/packages", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId, "packages"] });
      toast({ title: pkg ? "Paket diupdate" : "Paket ditambahkan" });
      onClose();
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{pkg ? "Edit Paket" : "Tambah Paket Baru"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <Label>Nama Paket</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div>
          <Label>Jumlah</Label>
          <Input value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
        </div>
        <div>
          <Label>Harga</Label>
          <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })} />
        </div>
        <div>
          <Label>Harga Diskon (opsional)</Label>
          <Input type="number" value={formData.discountPrice || ""} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value ? parseInt(e.target.value) : undefined })} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button onClick={() => saveMutation.mutate()}>Simpan</Button>
      </div>
    </>
  );
}

// Banners Tab
function BannersTab({ banners }: { banners?: Banner[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const deleteBannerMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/banners/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Banner berhasil dihapus" });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-3xl font-bold text-foreground">Kelola Banner</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBanner(null)} data-testid="button-add-banner">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Banner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <BannerForm banner={editingBanner} onClose={() => { setDialogOpen(false); setEditingBanner(null); }} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners?.map((banner) => (
          <Card key={banner.id} className="border-card-border">
            <img src={banner.imageUrl} alt={banner.title} className="w-full h-48 object-cover" />
            <CardContent className="p-4">
              <h3 className="font-heading font-bold mb-2">{banner.title}</h3>
              <div className="flex items-center justify-between">
                <Badge variant={banner.isActive ? "default" : "secondary"}>
                  {banner.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingBanner(banner); setDialogOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteBannerMutation.mutate(banner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Banner Form
function BannerForm({ banner, onClose }: { banner: Banner | null; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: banner?.title || "",
    imageUrl: banner?.imageUrl || "",
    linkUrl: banner?.linkUrl || "",
    order: banner?.order || 0,
    isActive: banner?.isActive ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (banner) {
        return apiRequest("PUT", `/api/admin/banners/${banner.id}`, formData);
      } else {
        return apiRequest("POST", "/api/admin/banners", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: banner ? "Banner diupdate" : "Banner ditambahkan" });
      onClose();
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{banner ? "Edit Banner" : "Tambah Banner Baru"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <Label>Judul Banner</Label>
          <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>
        <div>
          <Label>URL Gambar</Label>
          <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
        </div>
        <div>
          <Label>Link URL (opsional)</Label>
          <Input value={formData.linkUrl} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} />
        </div>
        <div>
          <Label>Urutan</Label>
          <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button onClick={() => saveMutation.mutate()}>Simpan</Button>
      </div>
    </>
  );
}

// Settings Tab
function SettingsTab({ siteConfig }: { siteConfig?: SiteConfig }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    siteName: siteConfig?.siteName || "GameTopUp",
    siteIcon: siteConfig?.siteIcon || "/favicon.png",
    siteDescription: siteConfig?.siteDescription || "",
    contactEmail: siteConfig?.contactEmail || "",
    contactPhone: siteConfig?.contactPhone || "",
  });

  // Sync formData with siteConfig when it loads
  useEffect(() => {
    if (siteConfig) {
      setFormData({
        siteName: siteConfig.siteName || "GameTopUp",
        siteIcon: siteConfig.siteIcon || "/favicon.png",
        siteDescription: siteConfig.siteDescription || "",
        contactEmail: siteConfig.contactEmail || "",
        contactPhone: siteConfig.contactPhone || "",
      });
    }
  }, [siteConfig]);

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/admin/site-config", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-config"] });
      toast({ title: "Pengaturan berhasil disimpan" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Gagal menyimpan pengaturan", 
        description: error.message || "Terjadi kesalahan",
        variant: "destructive" 
      });
    },
  });

  return (
    <div>
      <h2 className="font-heading text-3xl font-bold text-foreground mb-8">Pengaturan Website</h2>
      <Card className="border-card-border max-w-2xl">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Nama Website</Label>
            <Input value={formData.siteName} onChange={(e) => setFormData({ ...formData, siteName: e.target.value })} />
          </div>
          <div>
            <Label>Ikon Website</Label>
            <Input value={formData.siteIcon} onChange={(e) => setFormData({ ...formData, siteIcon: e.target.value })} />
          </div>
          <div>
            <Label>Deskripsi Website</Label>
            <Textarea value={formData.siteDescription} onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })} rows={3} />
          </div>
          <div>
            <Label>Email Kontak</Label>
            <Input value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} />
          </div>
          <div>
            <Label>Telepon Kontak</Label>
            <Input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} />
          </div>
          <Button onClick={() => saveMutation.mutate()} className="w-full">
            Simpan Pengaturan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
