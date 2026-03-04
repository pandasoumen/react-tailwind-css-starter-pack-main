import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiCheckCircle } from "react-icons/fi";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-[#3d9fbc] to-[#2f88ad] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-[28px] overflow-hidden relative min-h-[420px] md:min-h-[520px]"
        >
          <img
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1800&q=80"
            alt="Healthcare doctor"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f3b8ca6] to-[#0f3b8c4f]" />

          <div className="relative z-10 p-6 md:p-10 text-white max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white mb-4">
              Care About Your Health
            </h1>
            <p className="text-lg md:text-xl mb-4 md:mb-6">
              Our team of experienced doctors, specialists, and healthcare professionals is
              committed to delivering personalized treatments.
            </p>

            <Link
              to="/doctors"
              className="inline-flex bg-white text-slate-900 px-8 py-3 rounded-full text-xl font-semibold hover:bg-slate-100 transition"
            >
              Choose Your Doctor
            </Link>

            <div className="mt-14 flex flex-col md:flex-row md:flex-wrap gap-6 text-2xl font-semibold">
              <p className="inline-flex items-center gap-3">
                <FiCheckCircle />
                State-of-the-Art Facilities
              </p>
              <p className="inline-flex items-center gap-3">
                <FiCheckCircle />
                Expert Medical Team
              </p>
              <p className="inline-flex items-center gap-3">
                <FiCheckCircle />
                Personalized Care
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid md:grid-cols-3 gap-5">
          {[
            {
              title: "See a Doctor",
              desc: "Meet experienced doctors and specialists for complete healthcare support.",
            },
            {
              title: "Book An Appointment",
              desc: "Schedule your consultation in minutes with flexible date and time slots.",
            },
            {
              title: "Online Consultation",
              desc: "Connect with professionals remotely for quick and secure medical guidance.",
            },
          ].map((card) => (
            <article key={card.title} className="rounded-3xl bg-[#67b3c6] p-6 md:p-8 text-white">
              <div className="flex justify-between items-start gap-3">
                <h3 className="text-4xl font-bold leading-tight">{card.title}</h3>
                <FiArrowUpRight className="text-4xl flex-shrink-0" />
              </div>
              <p className="mt-4 text-2xl leading-10 text-blue-50">{card.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
