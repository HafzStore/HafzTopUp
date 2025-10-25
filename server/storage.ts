// Storage layer with DatabaseStorage implementation
// Reference: javascript_database blueprint
import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  games,
  gamePackages,
  transactions,
  banners,
  siteConfig,
  adminUsers,
  type User,
  type InsertUser,
  type Game,
  type InsertGame,
  type GamePackage,
  type InsertGamePackage,
  type Transaction,
  type InsertTransaction,
  type Banner,
  type InsertBanner,
  type SiteConfig,
  type InsertSiteConfig,
  type AdminUser,
  type InsertAdminUser,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Games
  getAllGames(): Promise<Game[]>;
  getGameById(id: string): Promise<Game | undefined>;
  getGameBySlug(slug: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: string, game: Partial<InsertGame>): Promise<Game | undefined>;
  deleteGame(id: string): Promise<void>;
  updateGameStock(id: string, stockChange: number): Promise<Game | undefined>;

  // Game Packages
  getGamePackages(gameId: string): Promise<GamePackage[]>;
  getPackageById(id: string): Promise<GamePackage | undefined>;
  createPackage(pkg: InsertGamePackage): Promise<GamePackage>;
  updatePackage(id: string, pkg: Partial<InsertGamePackage>): Promise<GamePackage | undefined>;
  deletePackage(id: string): Promise<void>;

  // Transactions
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string, paymentIntentId?: string): Promise<Transaction | undefined>;

  // Banners
  getAllBanners(): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: string, banner: Partial<InsertBanner>): Promise<Banner | undefined>;
  deleteBanner(id: string): Promise<void>;

  // Site Config
  getSiteConfig(): Promise<SiteConfig | undefined>;
  updateSiteConfig(config: Partial<InsertSiteConfig>): Promise<SiteConfig | undefined>;

  // Admin Users
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  updateAdminLastLogin(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Games
  async getAllGames(): Promise<Game[]> {
    return db.select().from(games).orderBy(desc(games.createdAt));
  }

  async getGameById(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getGameBySlug(slug: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.slug, slug));
    return game || undefined;
  }

  async createGame(game: InsertGame): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async updateGame(id: string, game: Partial<InsertGame>): Promise<Game | undefined> {
    const [updated] = await db
      .update(games)
      .set({ ...game, updatedAt: new Date() })
      .where(eq(games.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteGame(id: string): Promise<void> {
    await db.delete(games).where(eq(games.id, id));
  }

  async updateGameStock(id: string, stockChange: number): Promise<Game | undefined> {
    const game = await this.getGameById(id);
    if (!game) return undefined;
    
    const newStock = Math.max(0, game.stock + stockChange);
    return this.updateGame(id, { stock: newStock });
  }

  // Game Packages
  async getGamePackages(gameId: string): Promise<GamePackage[]> {
    return db.select().from(gamePackages).where(eq(gamePackages.gameId, gameId));
  }

  async getPackageById(id: string): Promise<GamePackage | undefined> {
    const [pkg] = await db.select().from(gamePackages).where(eq(gamePackages.id, id));
    return pkg || undefined;
  }

  async createPackage(pkg: InsertGamePackage): Promise<GamePackage> {
    const [newPkg] = await db.insert(gamePackages).values(pkg).returning();
    return newPkg;
  }

  async updatePackage(id: string, pkg: Partial<InsertGamePackage>): Promise<GamePackage | undefined> {
    const [updated] = await db
      .update(gamePackages)
      .set(pkg)
      .where(eq(gamePackages.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePackage(id: string): Promise<void> {
    await db.delete(gamePackages).where(eq(gamePackages.id, id));
  }

  // Transactions
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransactionStatus(
    id: string,
    status: string,
    paymentIntentId?: string
  ): Promise<Transaction | undefined> {
    const updateData: any = {
      status,
      ...(status === "completed" && { completedAt: new Date() }),
      ...(paymentIntentId && { stripePaymentIntentId: paymentIntentId }),
    };

    const [updated] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();
    return updated || undefined;
  }

  // Banners
  async getAllBanners(): Promise<Banner[]> {
    return db.select().from(banners).orderBy(banners.order);
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const [newBanner] = await db.insert(banners).values(banner).returning();
    return newBanner;
  }

  async updateBanner(id: string, banner: Partial<InsertBanner>): Promise<Banner | undefined> {
    const [updated] = await db
      .update(banners)
      .set(banner)
      .where(eq(banners.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBanner(id: string): Promise<void> {
    await db.delete(banners).where(eq(banners.id, id));
  }

  // Site Config
  async getSiteConfig(): Promise<SiteConfig | undefined> {
    const [config] = await db.select().from(siteConfig).limit(1);
    return config || undefined;
  }

  async updateSiteConfig(config: Partial<InsertSiteConfig>): Promise<SiteConfig | undefined> {
    const existing = await this.getSiteConfig();
    
    if (existing) {
      const [updated] = await db
        .update(siteConfig)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(siteConfig.id, existing.id))
        .returning();
      return updated || undefined;
    } else {
      const [newConfig] = await db.insert(siteConfig).values(config as InsertSiteConfig).returning();
      return newConfig;
    }
  }

  // Admin Users
  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || undefined;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, id));
  }
}

export const storage = new DatabaseStorage();
