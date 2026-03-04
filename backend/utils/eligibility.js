const DAY_MS = 24 * 60 * 60 * 1000;
const ELIGIBILITY_DAYS = 90;

export const getEligibilityStatus = (lastDonatedAt, now = new Date()) => {
  if (!lastDonatedAt) {
    return {
      eligible: true,
      daysSinceDonation: null,
      requiredDays: ELIGIBILITY_DAYS,
    };
  }

  const donatedAt = new Date(lastDonatedAt);
  const diffDays = Math.floor((now.getTime() - donatedAt.getTime()) / DAY_MS);
  const eligible = diffDays >= ELIGIBILITY_DAYS;

  return {
    eligible,
    daysSinceDonation: diffDays,
    requiredDays: ELIGIBILITY_DAYS,
  };
};

export const isDonorEligible = (lastDonatedAt, now = new Date()) =>
  getEligibilityStatus(lastDonatedAt, now).eligible;
