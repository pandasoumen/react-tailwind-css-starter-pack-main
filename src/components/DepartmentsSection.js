import React from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";
import { departments } from "../data/departments";

export default function DepartmentsSection() {
  return (
    <section className="bg-[#d7edf0] py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          <div className="lg:sticky lg:top-24">
            <p className="inline-flex items-center gap-2 text-[#4ba4b6] font-semibold text-xl">
              <FiPlus />
              your health, our priority
            </p>
            <h2 className="mt-4 text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
              Explore Our Medical Healthcare Departments
            </h2>
            <p className="mt-8 text-slate-700 text-lg leading-9 max-w-xl">
              Our medical clinic is dedicated to providing top-tier healthcare with a
              focus on innovation, expertise, and patient comfort. Explore each
              department to find doctors, blogs, and treatment guidance.
            </p>
            <Link
              to="/doctors"
              className="mt-10 inline-flex items-center justify-center px-10 py-4 rounded-full bg-[#133f88] text-white text-2xl font-semibold hover:bg-[#0f3370] transition"
            >
              View All Departments
            </Link>
          </div>

          <div className="w-full space-y-6 max-h-[760px] overflow-y-auto overflow-x-hidden pr-2">
            {departments.map((department) => (
              <Link
                key={department.slug}
                to={`/departments/${department.slug}`}
                className="block w-full rounded-3xl bg-white p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                  <img
                    src={department.image}
                    alt={department.name}
                    className="w-28 h-28 md:w-44 md:h-44 rounded-full object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex justify-between gap-3">
                      <h3 className="text-3xl md:text-4xl font-semibold text-slate-900 break-words">
                        {department.name}
                      </h3>
                      <FiArrowUpRight className="text-[#133f88] text-3xl mt-2 flex-shrink-0" />
                    </div>
                    <p className="mt-4 text-slate-600 text-lg md:text-xl leading-8 break-words">
                      {department.short}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
