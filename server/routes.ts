import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

// Stripe setup - Reference: javascript_stripe blueprint
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== Public Game Routes ====================
  
  // Get all games (public)
  app.get("/api/games", async (_req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get game by slug
  app.get("/api/games/:slug", async (req, res) => {
    try {
      const game = await storage.getGameBySlug(req.params.slug);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get game by ID
  app.get("/api/games/by-id/:id", async (req, res) => {
    try {
      const game = await storage.getGameById(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get game packages
  app.get("/api/games/:slug/packages", async (req, res) => {
    try {
      const game = await storage.getGameBySlug(req.params.slug);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      const packages = await storage.getGamePackages(game.id);
      res.json(packages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get package by ID
  app.get("/api/packages/:id", async (req, res) => {
    try {
      const pkg = await storage.getPackageById(req.params.id);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all banners (public)
  app.get("/api/banners", async (_req, res) => {
    try {
      const banners = await storage.getAllBanners();
      res.json(banners);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get site config (public)
  app.get("/api/site-config", async (_req, res) => {
    try {
      const config = await storage.getSiteConfig();
      res.json(config || {});
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== User Routes ====================

  // Get user transactions (requires auth simulation via Firebase token)
  app.get("/api/transactions", async (req, res) => {
    try {
      // In production, verify Firebase ID token here
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sync Firebase user to database
  app.post("/api/users/sync", async (req, res) => {
    try {
      const { id, email, displayName, photoURL, provider } = req.body;
      
      if (!id || !email) {
        return res.status(400).json({ message: "Missing required fields: id and email" });
      }
      
      let user = await storage.getUser(id);
      if (!user) {
        user = await storage.createUser({
          id,
          email,
          displayName,
          photoURL,
          provider: provider || "email",
        });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== Payment Routes ====================

  // Create payment intent - Reference: javascript_stripe blueprint
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { gameId, packageId, userId, userGameId, server } = req.body;

      if (!userId || !gameId || !packageId || !userGameId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify game and package exist
      const game = await storage.getGameById(gameId);
      const pkg = await storage.getPackageById(packageId);
      
      if (!game || !pkg) {
        return res.status(404).json({ message: "Game or package not found" });
      }

      // Check stock
      if (game.stock <= 0) {
        return res.status(400).json({ message: "Out of stock" });
      }

      // Calculate amount from database (prevent tampering)
      const amount = pkg.discountPrice || pkg.price;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "idr", // Indonesian Rupiah
        metadata: {
          gameId,
          packageId,
          userId,
          userGameId,
          server: server || "",
        },
      });

      // Create pending transaction
      const transaction = await storage.createTransaction({
        userId,
        gameId,
        packageId,
        userGameId,
        userGameServer: server || "",
        amount,
        status: "pending",
        stripePaymentIntentId: paymentIntent.id,
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        transactionId: transaction.id
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Confirm payment (simulated webhook - in production use real Stripe webhook)
  app.post("/api/confirm-payment", async (req, res) => {
    try {
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ message: "Missing payment intent ID" });
      }

      // Get payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === "succeeded") {
        const { gameId, userId } = paymentIntent.metadata;

        // Find transaction and update status
        const transactions = await storage.getUserTransactions(userId);
        const transaction = transactions.find(t => t.stripePaymentIntentId === paymentIntentId);
        
        if (transaction && transaction.status === "pending") {
          await storage.updateTransactionStatus(transaction.id, "completed", paymentIntentId);
          
          // Decrease stock
          await storage.updateGameStock(gameId, -1);
          
          return res.json({ success: true, transaction });
        }
      }

      res.status(400).json({ message: "Payment not successful" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== Admin Routes ====================

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const admin = await storage.getAdminByEmail(email);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session and save it
      req.session.adminId = admin.id;
      
      // Use callback to ensure session is saved before sending response
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ message: "Session error" });
        }
        
        storage.updateAdminLastLogin(admin.id);
        res.json({ success: true });
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Middleware to check admin auth
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Admin: Get all games
  app.get("/api/admin/games", requireAdmin, async (_req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Create game
  app.post("/api/admin/games", requireAdmin, async (req, res) => {
    try {
      const game = await storage.createGame(req.body);
      res.json(game);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update game
  app.put("/api/admin/games/:id", requireAdmin, async (req, res) => {
    try {
      const game = await storage.updateGame(req.params.id, req.body);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Delete game
  app.delete("/api/admin/games/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteGame(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Get all banners
  app.get("/api/admin/banners", requireAdmin, async (_req, res) => {
    try {
      const banners = await storage.getAllBanners();
      res.json(banners);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Create banner
  app.post("/api/admin/banners", requireAdmin, async (req, res) => {
    try {
      const banner = await storage.createBanner(req.body);
      res.json(banner);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update banner
  app.put("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const banner = await storage.updateBanner(req.params.id, req.body);
      if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
      }
      res.json(banner);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Delete banner
  app.delete("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteBanner(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Create package
  app.post("/api/admin/packages", requireAdmin, async (req, res) => {
    try {
      const pkg = await storage.createPackage(req.body);
      res.json(pkg);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update package
  app.put("/api/admin/packages/:id", requireAdmin, async (req, res) => {
    try {
      const pkg = await storage.updatePackage(req.params.id, req.body);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Delete package
  app.delete("/api/admin/packages/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deletePackage(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Get site config
  app.get("/api/admin/site-config", requireAdmin, async (_req, res) => {
    try {
      const config = await storage.getSiteConfig();
      res.json(config || {});
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update site config
  app.put("/api/admin/site-config", requireAdmin, async (req, res) => {
    try {
      const config = await storage.updateSiteConfig(req.body);
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
