import {
  MentorProfile,
  Mentorship,
  CareerEvent,
} from "../Model/MentorshipModel.js";

// Mentor Profile Controllers
export const createMentorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    // Check if profile already exists
    const existingProfile = await MentorProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({
        error: "Mentor profile already exists for this user",
      });
    }

    const mentorProfile = new MentorProfile({
      userId,
      ...profileData,
    });

    await mentorProfile.save();

    res.status(201).json({
      success: true,
      mentorProfile,
      message: "Mentor profile created successfully",
    });
  } catch (error) {
    console.error("Create Mentor Profile Error:", error);
    res.status(500).json({
      error: "Failed to create mentor profile",
      details: error.message,
    });
  }
};

export const getMentorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const mentorProfile = await MentorProfile.findOne({ userId });

    if (!mentorProfile) {
      return res.status(404).json({
        error: "Mentor profile not found",
      });
    }

    res.json({
      success: true,
      mentorProfile,
    });
  } catch (error) {
    console.error("Get Mentor Profile Error:", error);
    res.status(500).json({
      error: "Failed to retrieve mentor profile",
      details: error.message,
    });
  }
};

export const updateMentorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const mentorProfile = await MentorProfile.findOne({ userId });

    if (!mentorProfile) {
      return res.status(404).json({
        error: "Mentor profile not found",
      });
    }

    // Update profile fields
    Object.keys(updateData).forEach((key) => {
      if (key !== "userId" && key !== "_id") {
        mentorProfile[key] = updateData[key];
      }
    });

    await mentorProfile.save();

    res.json({
      success: true,
      mentorProfile,
      message: "Mentor profile updated successfully",
    });
  } catch (error) {
    console.error("Update Mentor Profile Error:", error);
    res.status(500).json({
      error: "Failed to update mentor profile",
      details: error.message,
    });
  }
};

export const searchMentors = async (req, res) => {
  try {
    const { field, expertise, availability, rating } = req.query;

    let query = { isActive: true, available: true };

    if (field) {
      query["expertise.field"] = { $regex: field, $options: "i" };
    }

    if (expertise) {
      query["expertise.level"] = expertise;
    }

    if (rating) {
      query["rating.average"] = { $gte: parseFloat(rating) };
    }

    const mentors = await MentorProfile.find(query)
      .populate("userId", "name email")
      .limit(20);

    res.json({
      success: true,
      mentors,
      message:
        mentors.length === 0
          ? "No mentors found matching your criteria. Try adjusting your search filters."
          : `${mentors.length} mentors found`,
    });
  } catch (error) {
    console.error("Search Mentors Error:", error);
    res.status(500).json({
      error: "Failed to search mentors",
      details: error.message,
    });
  }
};

// Mentorship Connection Controllers
export const requestMentorship = async (req, res) => {
  try {
    const menteeId = req.user.id;
    const { mentorId, field, message, goals } = req.body;

    // Check if mentor exists and is available
    const mentorProfile = await MentorProfile.findOne({
      userId: mentorId,
      isActive: true,
      available: true,
    });

    if (!mentorProfile) {
      return res.status(404).json({
        error: "Mentor not found or not available",
      });
    }

    // Check if request already exists
    const existingRequest = await Mentorship.findOne({
      mentorId,
      menteeId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        error: "Mentorship request already exists",
      });
    }

    const mentorship = new Mentorship({
      mentorId,
      menteeId,
      field,
      message,
      goals,
    });

    await mentorship.save();

    res.status(201).json({
      success: true,
      mentorship,
      message: "Mentorship request sent successfully",
    });
  } catch (error) {
    console.error("Request Mentorship Error:", error);
    res.status(500).json({
      error: "Failed to send mentorship request",
      details: error.message,
    });
  }
};

export const respondToMentorshipRequest = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const mentorship = await Mentorship.findOne({
      _id: mentorshipId,
      mentorId: userId,
    });

    if (!mentorship) {
      return res.status(404).json({
        error: "Mentorship request not found",
      });
    }

    if (mentorship.status !== "pending") {
      return res.status(400).json({
        error: "Mentorship request has already been responded to",
      });
    }

    mentorship.status = status;
    if (status === "accepted") {
      mentorship.startDate = new Date();
    }

    await mentorship.save();

    res.json({
      success: true,
      mentorship,
      message: `Mentorship request ${status}`,
    });
  } catch (error) {
    console.error("Respond to Mentorship Error:", error);
    res.status(500).json({
      error: "Failed to respond to mentorship request",
      details: error.message,
    });
  }
};

export const getUserMentorships = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.query; // 'mentor' or 'mentee'

    let query = {};
    if (role === "mentor") {
      query.mentorId = userId;
    } else if (role === "mentee") {
      query.menteeId = userId;
    } else {
      query.$or = [{ mentorId: userId }, { menteeId: userId }];
    }

    const mentorships = await Mentorship.find(query)
      .populate("mentorId", "name email")
      .populate("menteeId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      mentorships,
    });
  } catch (error) {
    console.error("Get User Mentorships Error:", error);
    res.status(500).json({
      error: "Failed to retrieve mentorships",
      details: error.message,
    });
  }
};

// Career Events Controllers
export const createCareerEvent = async (req, res) => {
  try {
    const eventData = req.body;
    const organizerId = req.user.id;

    const careerEvent = new CareerEvent({
      ...eventData,
      organizer: {
        ...eventData.organizer,
        userId: organizerId,
      },
    });

    await careerEvent.save();

    res.status(201).json({
      success: true,
      careerEvent,
      message: "Career event created successfully",
    });
  } catch (error) {
    console.error("Create Career Event Error:", error);
    res.status(500).json({
      error: "Failed to create career event",
      details: error.message,
    });
  }
};

export const getCareerEvents = async (req, res) => {
  try {
    const { category, eventType, location, startDate, endDate, isFree } =
      req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    if (location) {
      query["location.type"] = location;
    }

    if (startDate && endDate) {
      query["date.start"] = { $gte: new Date(startDate) };
      query["date.end"] = { $lte: new Date(endDate) };
    }

    if (isFree !== undefined) {
      query["price.isFree"] = isFree === "true";
    }

    const events = await CareerEvent.find(query)
      .sort({ "date.start": 1 })
      .limit(50);

    res.json({
      success: true,
      events,
      message:
        events.length === 0
          ? "No career events found matching your criteria. Try adjusting your search filters or create your own events!"
          : `${events.length} events found`,
    });
  } catch (error) {
    console.error("Get Career Events Error:", error);
    res.status(500).json({
      error: "Failed to retrieve career events",
      details: error.message,
    });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const event = await CareerEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    if (!event.isActive) {
      return res.status(400).json({
        error: "Event is not active",
      });
    }

    // Check if user is already registered
    const existingRegistration = event.attendees.find(
      (attendee) => attendee.userId.toString() === userId
    );

    if (existingRegistration) {
      return res.status(400).json({
        error: "Already registered for this event",
      });
    }

    // Check capacity
    if (
      event.capacity.total &&
      event.attendees.length >= event.capacity.total
    ) {
      return res.status(400).json({
        error: "Event is at full capacity",
      });
    }

    event.attendees.push({
      userId,
      registeredAt: new Date(),
      status: "registered",
    });

    event.capacity.registered = event.attendees.length;
    await event.save();

    res.json({
      success: true,
      message: "Successfully registered for event",
    });
  } catch (error) {
    console.error("Register for Event Error:", error);
    res.status(500).json({
      error: "Failed to register for event",
      details: error.message,
    });
  }
};

export const getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await CareerEvent.find({
      "attendees.userId": userId,
    }).sort({ "date.start": 1 });

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get User Events Error:", error);
    res.status(500).json({
      error: "Failed to retrieve user events",
      details: error.message,
    });
  }
};

export const cancelEventRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const event = await CareerEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    const attendeeIndex = event.attendees.findIndex(
      (attendee) => attendee.userId.toString() === userId
    );

    if (attendeeIndex === -1) {
      return res.status(404).json({
        error: "Not registered for this event",
      });
    }

    event.attendees.splice(attendeeIndex, 1);
    event.capacity.registered = event.attendees.length;
    await event.save();

    res.json({
      success: true,
      message: "Event registration cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Event Registration Error:", error);
    res.status(500).json({
      error: "Failed to cancel event registration",
      details: error.message,
    });
  }
};
