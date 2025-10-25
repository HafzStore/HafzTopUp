// Seed script to create initial admin user and sample data
import bcrypt from "bcryptjs";
import { db } from "./db";
import { adminUsers, games, gamePackages, banners, siteConfig } from "@shared/schema";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(adminUsers).values({
      email: "admin@gametopup.com",
      password: hashedPassword,
      isActive: true,
    }).onConflictDoNothing();
    console.log("✅ Admin user created (email: admin@gametopup.com, password: admin123)");

    // Create sample games
    const gamesList = [
      {
        name: "Mobile Legends: Bang Bang",
        slug: "mobile-legends",
        description: "5v5 MOBA game paling populer di Indonesia dengan gameplay seru dan kompetitif",
        imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop",
        category: "MOBA",
        publisher: "Moonton",
        stock: 500,
        isActive: true,
      },
      {
        name: "Free Fire",
        slug: "free-fire",
        description: "Battle Royale game terbaik dengan 50 pemain bertarung di pulau terpencil",
        imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop",
        category: "Battle Royale",
        publisher: "Garena",
        stock: 750,
        isActive: true,
      },
      {
        name: "PUBG Mobile",
        slug: "pubg-mobile",
        description: "Game Battle Royale realistis dengan grafis memukau dan gameplay intens",
        imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=400&fit=crop",
        category: "Battle Royale",
        publisher: "Tencent",
        stock: 600,
        isActive: true,
      },
      {
        name: "Genshin Impact",
        slug: "genshin-impact",
        description: "Action RPG open world dengan dunia fantasi yang luas dan karakter menarik",
        imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop",
        category: "RPG",
        publisher: "miHoYo",
        stock: 400,
        isActive: true,
      },
    ];

    for (const game of gamesList) {
      const [insertedGame] = await db.insert(games).values(game).onConflictDoNothing().returning();
      
      if (insertedGame) {
        // Create packages for each game
        const packages = [
          { name: "50 Diamonds", amount: "50 Diamonds", price: 15000, gameId: insertedGame.id },
          { name: "100 Diamonds", amount: "100 Diamonds", price: 28000, discountPrice: 25000, gameId: insertedGame.id },
          { name: "250 Diamonds", amount: "250 Diamonds", price: 70000, discountPrice: 65000, gameId: insertedGame.id },
          { name: "500 Diamonds", amount: "500 Diamonds", price: 140000, discountPrice: 125000, gameId: insertedGame.id },
          { name: "1000 Diamonds", amount: "1000 Diamonds", price: 280000, discountPrice: 245000, gameId: insertedGame.id },
        ];

        await db.insert(gamePackages).values(packages).onConflictDoNothing();
      }
    }
    console.log("✅ Sample games and packages created");

    // Create sample banners
    const bannersList = [
      {
        title: "Promo Spesial Hari Ini!",
        imageUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1920&h=600&fit=crop",
        linkUrl: "",
        order: 0,
        isActive: true,
      },
      {
        title: "Top Up Hemat Setiap Hari",
        imageUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=1920&h=600&fit=crop",
        linkUrl: "",
        order: 1,
        isActive: true,
      },
    ];

    await db.insert(banners).values(bannersList).onConflictDoNothing();
    console.log("✅ Sample banners created");

    // Create site config
    await db.insert(siteConfig).values({
      siteName: "GameTopUp",
      siteIcon: "/favicon.png",
      siteDescription: "Platform top up game terpercaya dengan harga termurah dan proses tercepat. Top up Mobile Legends, Free Fire, PUBG Mobile, Genshin Impact, dan game lainnya dengan mudah dan aman.",
      contactEmail: "support@gametopup.com",
      contactPhone: "+62 812-3456-7890",
    }).onConflictDoNothing();
    console.log("✅ Site config created");

    console.log("🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
