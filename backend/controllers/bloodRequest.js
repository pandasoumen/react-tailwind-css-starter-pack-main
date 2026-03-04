import BloodRequest from "../models/BloodRequest.js";
import BloodDonor from "../models/BloodDonor.js";
import Notification from "../models/Notification.js";
import { notifyUser } from "../utils/notifications.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const computeResponseScore = (acceptCount, requestCount) => {
  if (!requestCount || requestCount <= 0) return 0;
  return Math.round((acceptCount / requestCount) * 100);
};

export const createBloodRequest = async (req, res) => {
  try {
    const { donorId, bloodGroup, hospital, city, urgency = false } = req.body || {};

    if (!donorId || !bloodGroup || !hospital || !city) {
      return res.status(400).json({
        success: false,
        message: "donorId, bloodGroup, hospital and city are required",
      });
    }
    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ success: false, message: "Invalid bloodGroup" });
    }

    const donor = await BloodDonor.findOne({ _id: donorId, isActive: true }).populate("user", "name email profile.phone");
    if (!donor) return res.status(404).json({ success: false, message: "Donor not found" });
    if (String(donor.user?._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "You cannot send request to yourself" });
    }

    const request = await BloodRequest.create({
      requester: req.user._id,
      donor: donor.user._id,
      donorProfile: donor._id,
      bloodGroup,
      hospital: hospital.trim(),
      city: city.trim(),
      urgency: Boolean(urgency),
      status: "pending",
    });

    await notifyUser({
      recipientId: donor.user._id,
      type: urgency ? "urgent_request" : "new_request",
      title: urgency ? "Urgent Blood Request" : "New Blood Request",
      message: `You have a ${urgency ? "high-priority " : ""}blood request for ${bloodGroup} in ${city}.`,
      relatedId: request._id,
      emailSubject: urgency ? "Urgent Blood Request Received" : "New Blood Request Received",
      emailText: `Please review request ${request._id} for blood group ${bloodGroup} at ${hospital}, ${city}.`,
    });

    return res.status(201).json({ success: true, request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ donor: req.user._id })
      .populate("requester", "name email profile.phone")
      .populate("donor", "name email profile.phone")
      .sort({ urgency: -1, createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMySentRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user._id })
      .populate("requester", "name email profile.phone")
      .populate("donor", "name email profile.phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const respondBloodRequest = async (req, res) => {
  try {
    const { action } = req.body || {};
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "action must be accept or reject" });
    }

    const request = await BloodRequest.findById(req.params.id).populate("requester", "name email profile.phone");
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (String(request.donor) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only assigned donor can respond" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending requests can be responded" });
    }

    request.status = action === "accept" ? "accepted" : "rejected";
    if (request.status === "accepted") request.acceptedAt = new Date();
    await request.save();

    const donor = await BloodDonor.findOne({ user: req.user._id });
    if (donor) {
      donor.requestCount = (donor.requestCount || 0) + 1;
      if (action === "accept") donor.acceptCount = (donor.acceptCount || 0) + 1;
      donor.responseScore = computeResponseScore(donor.acceptCount || 0, donor.requestCount || 0);
      await donor.save();
    }

    if (request.status === "accepted") {
      await notifyUser({
        recipientId: request.requester?._id,
        type: "request_accepted",
        title: "Blood Request Accepted",
        message: "A donor accepted your blood request. Contact details are now available.",
        relatedId: request._id,
        emailSubject: "Your Blood Request Was Accepted",
        emailText: "A donor accepted your request. Please login to view donor contact details.",
      });
    }

    return res.status(200).json({
      success: true,
      request,
      contactDetails:
        request.status === "accepted"
          ? {
              donor: {
                name: req.user?.name || "",
                email: req.user?.email || "",
                phone: req.user?.profile?.phone || "",
              },
              requester: {
                name: request.requester?.name,
                email: request.requester?.email,
                phone: request.requester?.profile?.phone || "",
              },
            }
          : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const completeBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    const isRequester = String(request.requester) === String(req.user._id);
    const isDonor = String(request.donor) === String(req.user._id);
    if (!isRequester && !isDonor) {
      return res.status(403).json({ success: false, message: "Not allowed to complete this request" });
    }
    if (request.status !== "accepted") {
      return res.status(400).json({ success: false, message: "Only accepted request can be completed" });
    }

    request.status = "completed";
    request.completedAt = new Date();
    await request.save();

    const donor = await BloodDonor.findOne({ user: request.donor });
    if (donor) {
      donor.totalDonations = (donor.totalDonations || 0) + 1;
      donor.lastDonatedAt = new Date();
      await donor.save();
    }

    await notifyUser({
      recipientId: request.donor,
      type: "request_completed",
      title: "Blood Request Completed",
      message: "A blood donation request linked to you has been marked completed.",
      relatedId: request._id,
      emailSubject: "Blood Request Completed",
      emailText: "A request has been marked completed. Thank you for donating.",
    });

    return res.status(200).json({ success: true, request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getDonationHistory = async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      donor: req.user._id,
      status: "completed",
    })
      .populate("requester", "name email")
      .sort({ completedAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ success: true, notifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
