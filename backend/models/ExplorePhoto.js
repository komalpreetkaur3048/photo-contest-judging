import mongoose from "mongoose";

const explorePhotoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true
        },
        author: {
            type: String,
            required: [true, "Author name is required"],
            trim: true
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true
        },
        imageUrl: {
            type: String,
            required: [true, "Image URL is required"]
        },
        likes: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const ExplorePhoto = mongoose.model("ExplorePhoto", explorePhotoSchema);

export default ExplorePhoto;
