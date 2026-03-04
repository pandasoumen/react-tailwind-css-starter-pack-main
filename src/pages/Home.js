

// function Home() {
//   return (
   
//   );
// }
import React from "react";
import HeroSection from "../components/Herosection";
import DepartmentsSection from "../components/DepartmentsSection";
import FeaturesSection from "../components/FeatureSection";
import ReviewsSection from "../components/ReviewsSection";

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden bg-white">
      <FeaturesSection />
      <HeroSection />
      <DepartmentsSection />
      <ReviewsSection />
    </div>
  );
}

