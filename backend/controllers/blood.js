import BloodDonor from "../models/BloodDonor.js";
import { getCompatibleBloodGroups } from "../utils/bloodCompatibility.js";
import { getEligibilityStatus } from "../utils/eligibility.js";
import { getDistanceKm } from "../utils/distance.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
};

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const registerOrUpdateDonor = async (req, res) => {
  try {
    const { bloodGroup, city, latitude, longitude, lastDonatedAt, isAvailable } = req.body || {};

    if (!bloodGroup || !BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ success: false, message: "Valid bloodGroup is required" });
    }
    if (!city || typeof city !== "string") {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    const lat = toNumberOrNull(latitude);
    const lng = toNumberOrNull(longitude);
    if (lat !== null && (lat < -90 || lat > 90)) {
      return res.status(400).json({ success: false, message: "latitude must be between -90 and 90" });
    }
    if (lng !== null && (lng < -180 || lng > 180)) {
      return res.status(400).json({ success: false, message: "longitude must be between -180 and 180" });
    }

    const donor = await BloodDonor.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          bloodGroup,
          city: city.trim(),
          latitude: lat ?? 0,
          longitude: lng ?? 0,
          lastDonatedAt: lastDonatedAt ? new Date(lastDonatedAt) : null,
          isAvailable: isAvailable === undefined ? true : Boolean(isAvailable),
          isActive: true,
        },
      },
      { upsert: true, new: true, runValidators: true }
    ).populate("user", "name email profile.phone");

    return res.status(200).json({ success: true, donor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMyDonorAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body || {};
    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({ success: false, message: "isAvailable must be boolean" });
    }

    const donor = await BloodDonor.findOneAndUpdate(
      { user: req.user._id, isActive: true },
      { $set: { isAvailable } },
      { new: true }
    );

    if (!donor) return res.status(404).json({ success: false, message: "Donor profile not found" });
    return res.status(200).json({ success: true, donor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyDonorProfile = async (req, res) => {
  try {
    const donor = await BloodDonor.findOne({ user: req.user._id }).populate("user", "name email profile.phone");
    if (!donor) return res.status(404).json({ success: false, message: "Donor profile not found" });
    return res.status(200).json({ success: true, donor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const searchDonors = async (req, res) => {
  try {
    const { bloodGroup = "", city = "", radiusKm = "", latitude = "", longitude = "", urgent = false } = req.query || {};

    if (!bloodGroup || !BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ success: false, message: "Valid bloodGroup query is required" });
    }

    const compatibleGroups = getCompatibleBloodGroups(bloodGroup);
    const query = {
      isActive: true,
      bloodGroup: { $in: compatibleGroups },
    };

    if (city && typeof city === "string") {
      query.city = { $regex: city.trim(), $options: "i" };
    }

    const lat = toNumberOrNull(latitude);
    const lng = toNumberOrNull(longitude);
    const radius = toNumberOrNull(radiusKm);
    const hasGeoInput = lat !== null && lng !== null;

    const donors = await BloodDonor.find(query).populate("user", "name email profile.phone");
    const now = new Date();

    let mapped = donors
      .map((donor) => {
        const eligibility = getEligibilityStatus(donor.lastDonatedAt, now);
        const distance = hasGeoInput
          ? getDistanceKm(lat, lng, Number(donor.latitude || 0), Number(donor.longitude || 0))
          : null;

        return {
          _id: donor._id,
          user: donor.user,
          bloodGroup: donor.bloodGroup,
          city: donor.city,
          latitude: donor.latitude,
          longitude: donor.longitude,
          lastDonatedAt: donor.lastDonatedAt,
          eligible: eligibility.eligible,
          eligibilityStatus: eligibility.eligible ? "Eligible" : "Not Eligible",
          daysSinceDonation: eligibility.daysSinceDonation,
          isAvailable: donor.isAvailable,
          availabilityStatus: donor.isAvailable ? "Available" : "Not Available",
          totalDonations: donor.totalDonations || 0,
          responseScore: donor.responseScore || 0,
          highlyResponsive: (donor.responseScore || 0) >= 80,
          distanceKm: distance === null ? null : Number(distance.toFixed(2)),
          urgent: toBoolean(urgent),
        };
      })
      .filter((donor) => donor.eligible);

    if (hasGeoInput && radius !== null && radius > 0) {
      mapped = mapped.filter((donor) => donor.distanceKm !== null && donor.distanceKm <= radius);
    }

    mapped.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;

      const da = a.distanceKm === null ? Number.MAX_SAFE_INTEGER : a.distanceKm;
      const db = b.distanceKm === null ? Number.MAX_SAFE_INTEGER : b.distanceKm;
      if (da !== db) return da - db;

      return (b.responseScore || 0) - (a.responseScore || 0);
    });

    return res.status(200).json({
      success: true,
      urgent: toBoolean(urgent),
      compatibleGroups,
      count: mapped.length,
      donors: mapped,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
