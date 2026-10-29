import mongoose from "mongoose";
import dotenv from "dotenv";
import Contest from "../models/Contest.js";
import ExplorePhoto from "../models/ExplorePhoto.js";

dotenv.config();

const initialContests = [
    {
        id: "nature-2026",
        title: "Nature Through My Lens",
        category: "Nature",
        description: "Capture the raw beauty, subtle emotion, and breathtaking diversity of nature through your lens.",
        deadline: "2026-11-30",
        startDate: new Date("2026-08-01T00:00:00.000Z"),
        endDate: new Date("2026-11-30T23:59:59.999Z"),
        status: "active",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 40, technical: 30, themeFit: 30 }
    },
    {
        id: "minimalism-2026",
        title: "Minimalist Compositions",
        category: "Minimal & Artistic",
        description: "Find elegance in simplicity through negative space, clean geometric forms, and color balance.",
        deadline: "2026-10-30",
        startDate: new Date("2026-10-01T00:00:00.000Z"),
        endDate: new Date("2026-10-30T23:59:59.999Z"),
        status: "active",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 45, technical: 25, themeFit: 30 }
    },
    {
        id: "seasons-2026",
        title: "Seasons in Focus",
        category: "Seasonal",
        description: "Celebrate the changing light, vibrant colors, weather, and mood of seasonal transitions.",
        deadline: "2026-11-30",
        startDate: new Date("2026-11-01T00:00:00.000Z"),
        endDate: new Date("2026-11-30T23:59:59.999Z"),
        status: "upcoming",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 35, technical: 30, themeFit: 35 }
    },
    {
        id: "portraits-2026",
        title: "Portraits & Soul",
        category: "Portrait",
        description: "Capture personality, candid emotion, human identity, and authentic character.",
        deadline: "2026-10-10",
        startDate: new Date("2026-09-01T00:00:00.000Z"),
        endDate: new Date("2026-10-10T23:59:59.999Z"),
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 40, technical: 30, themeFit: 30 }
    },
    {
        id: "night-light-2026",
        title: "Night & Light Play",
        category: "Night Photography",
        description: "Explore the mood, neon reflections, long exposures, and atmosphere after dark.",
        deadline: "2026-10-20",
        startDate: new Date("2026-09-15T00:00:00.000Z"),
        endDate: new Date("2026-10-20T23:59:59.999Z"),
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 30, technical: 45, themeFit: 25 }
    },
    {
        id: "urban-stories-2026",
        title: "Urban Stories & Architecture",
        category: "Architecture & Urban",
        description: "Tell stories through architectural lines, dynamic city streets, shadows, and urban life.",
        deadline: "2026-09-30",
        startDate: new Date("2026-08-15T00:00:00.000Z"),
        endDate: new Date("2026-09-30T23:59:59.999Z"),
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 35, technical: 35, themeFit: 30 }
    },
    {
        id: "travel-2026",
        title: "Travel & Culture",
        category: "Travel",
        description: "Document iconic places, vibrant cultural traditions, landscapes, and journey experiences.",
        deadline: "2026-09-20",
        startDate: new Date("2026-08-01T00:00:00.000Z"),
        endDate: new Date("2026-09-20T23:59:59.999Z"),
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 40, technical: 30, themeFit: 30 }
    },
    {
        id: "wildlife-2026",
        title: "Wildlife Wonders",
        category: "Wildlife",
        description: "Showcase the behavior, habitats, and spirit of animals in their natural environment.",
        deadline: "2026-09-10",
        startDate: new Date("2026-07-15T00:00:00.000Z"),
        endDate: new Date("2026-09-10T23:59:59.999Z"),
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 30, technical: 40, themeFit: 30 }
    },
    {
        id: "monochrome-mastery",
        title: "Monochrome & Shadow",
        category: "Black & White",
        description: "Pure contrast, light mastery, and timeless emotional tones without color distraction.",
        deadline: "2025-12-15",
        startDate: new Date("2025-10-01T00:00:00.000Z"),
        endDate: new Date("2025-12-15T23:59:59.999Z"),
        status: "completed",
        maxSubmissions: 3,
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=85",
        criteria: { creativity: 40, technical: 30, themeFit: 30 }
    }
];

const initialExplorePhotos = [
    {
        title: "Misty Sunrise",
        author: "Elena",
        category: "Nature",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        likes: 24,
        description: "Morning mist over the mountains."
    },
    {
        title: "Tokyo Street Rain",
        author: "Kenji",
        category: "Street",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        likes: 45,
        description: "Neon reflections on a rainy night."
    },
    {
        title: "Wild Lion",
        author: "Marcus",
        category: "Wildlife",
        imageUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80",
        likes: 80,
        description: "Lion in the African savanna."
    },
    {
        title: "Modern Architecture",
        author: "Sophie",
        category: "Architecture",
        imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        likes: 19,
        description: "Clean geometric curves and lines."
    },
    {
        title: "Coastal Sunset",
        author: "Dara",
        category: "Travel",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        likes: 62,
        description: "Warm golden hour by the sea."
    },
    {
        title: "Studio Portrait",
        author: "Liam",
        category: "Portraits",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        likes: 31,
        description: "Natural light portrait."
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB for seeding...");

        // Seed Contests
        for (const contest of initialContests) {
            await Contest.findOneAndUpdate({ id: contest.id }, contest, { upsert: true });
        }
        console.log(`✓ Seeded ${initialContests.length} default contests.`);

        // Seed Explore Photos if empty
        const exploreCount = await ExplorePhoto.countDocuments();
        if (exploreCount === 0) {
            await ExplorePhoto.insertMany(initialExplorePhotos);
            console.log(`✓ Seeded ${initialExplorePhotos.length} explore photos.`);
        } else {
            console.log(`ℹ Explore photos collection already has ${exploreCount} items. Skipping.`);
        }

        console.log("🎉 Database seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("✗ Seeding failed:", error.message);
        process.exit(1);
    }
};

seedDB();
