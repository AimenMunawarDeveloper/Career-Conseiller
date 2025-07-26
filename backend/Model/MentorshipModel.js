import mongoose from "mongoose";

const mentorshipSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    field: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      maxlength: 1000,
    },
    sessions: [
      {
        date: Date,
        duration: Number, // in minutes
        type: { type: String, enum: ["chat", "video", "in-person"] },
        notes: String,
        completed: { type: Boolean, default: false },
      },
    ],
    startDate: Date,
    endDate: Date,
    goals: [String],
    feedback: {
      menteeRating: { type: Number, min: 1, max: 5 },
      menteeReview: String,
      mentorRating: { type: Number, min: 1, max: 5 },
      mentorReview: String,
    },
  },
  {
    timestamps: true,
  }
);

const careerEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    organizer: {
      name: String,
      email: String,
      website: String,
    },
    eventType: {
      type: String,
      enum: [
        "webinar",
        "workshop",
        "networking",
        "conference",
        "bootcamp",
        "hackathon",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "technology",
        "business",
        "healthcare",
        "finance",
        "education",
        "marketing",
        "design",
        "other",
      ],
      required: true,
    },
    date: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    location: {
      type: {
        type: String,
        enum: ["online", "in-person", "hybrid"],
        default: "online",
      },
      address: String,
      city: String,
      country: String,
      virtualLink: String,
    },
    price: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      isFree: { type: Boolean, default: true },
    },
    capacity: {
      total: Number,
      registered: { type: Number, default: 0 },
    },
    speakers: [
      {
        name: String,
        title: String,
        company: String,
        bio: String,
        image: String,
      },
    ],
    tags: [String],
    registrationRequired: {
      type: Boolean,
      default: true,
    },
    registrationDeadline: Date,
    attendees: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        registeredAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["registered", "attended", "cancelled"],
          default: "registered",
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const mentorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    expertise: [
      {
        field: String,
        yearsOfExperience: Number,
        level: { type: String, enum: ["beginner", "intermediate", "expert"] },
      },
    ],
    currentRole: {
      title: String,
      company: String,
      industry: String,
    },
    availability: {
      available: { type: Boolean, default: true },
      maxMentees: { type: Number, default: 3 },
      preferredMeetingTypes: [
        { type: String, enum: ["chat", "video", "in-person"] },
      ],
      timezone: String,
      availableHours: {
        start: String, // "09:00"
        end: String, // "17:00"
      },
    },
    hourlyRate: {
      amount: Number,
      currency: { type: String, default: "USD" },
      isFree: { type: Boolean, default: true },
    },
    languages: [String],
    certifications: [
      {
        name: String,
        issuer: String,
        date: Date,
      },
    ],
    achievements: [String],
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String,
      github: String,
    },
    rating: {
      average: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate average rating
mentorProfileSchema.methods.updateRating = function () {
  // This would be called when new reviews are added
  // Implementation depends on how reviews are stored
};

export const Mentorship = mongoose.model("Mentorship", mentorshipSchema);
export const CareerEvent = mongoose.model("CareerEvent", careerEventSchema);
export const MentorProfile = mongoose.model(
  "MentorProfile",
  mentorProfileSchema
);
