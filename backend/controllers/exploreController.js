import ExplorePhoto from "../models/ExplorePhoto.js";

// @desc    Get all explore photos (supports category filter & search)
// @route   GET /api/explore
// @access  Public
export const getExplorePhotos = async (req, res, next) => {
    try {
        const { category, search } = req.query;
        const filter = {};

        if (category && category !== "All") {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { author: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const photos = await ExplorePhoto.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: photos.length,
            photos
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new photo to the explore gallery
// @route   POST /api/explore
// @access  Public (or Authenticated)
export const createExplorePhoto = async (req, res, next) => {
    try {
        const { title, author, category, imageUrl, description } = req.body;

        if (!title || !author || !category || !imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Please provide title, author, category, and imageUrl."
            });
        }

        const photo = await ExplorePhoto.create({
            title: title.trim(),
            author: author.trim(),
            category: category.trim(),
            imageUrl,
            description: (description || "").trim(),
            likes: 0
        });

        res.status(201).json({
            success: true,
            message: "Photo added to gallery successfully!",
            photo
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Increment likes on an explore photo
// @route   PUT /api/explore/:id/like
// @access  Public
export const likeExplorePhoto = async (req, res, next) => {
    try {
        const photo = await ExplorePhoto.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        );

        if (!photo) {
            return res.status(404).json({
                success: false,
                message: "Photo not found."
            });
        }

        res.status(200).json({
            success: true,
            likes: photo.likes
        });
    } catch (error) {
        next(error);
    }
};
