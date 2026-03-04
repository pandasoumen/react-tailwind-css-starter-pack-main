import React from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiUsers } from "react-icons/fi";
import { getDepartmentBySlug } from "../data/departments";

export default function DepartmentDetail() {
  const { slug } = useParams();
  const department = getDepartmentBySlug(slug);

  if (!department) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-slate-900">Department not found</h1>
        <p className="mt-3 text-slate-600">
          The department you are looking for does not exist.
        </p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-[#0B3D91] font-semibold">
          <FiArrowLeft />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[#0B3D91] font-semibold">
          <FiArrowLeft />
          Back to Home
        </Link>

        <div className="mt-6 grid lg:grid-cols-2 gap-8">
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <img src={department.image} alt={department.name} className="w-full h-full object-cover min-h-[320px]" />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="text-4xl font-bold text-slate-900">{department.name}</h1>
            <p className="mt-4 text-slate-700 text-lg leading-8">{department.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/doctors" className="px-5 py-3 rounded-lg bg-[#0B3D91] text-white font-semibold">
                Find Doctors
              </Link>
              <Link to="/blog" className="px-5 py-3 rounded-lg border border-[#0B3D91] text-[#0B3D91] font-semibold">
                Read Blogs
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <article className="bg-white rounded-2xl p-6 shadow-sm md:col-span-1">
            <h2 className="text-xl font-semibold text-slate-900">Key Topics</h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              {department.topics.map((topic) => (
                <li key={topic}>- {topic}</li>
              ))}
            </ul>
          </article>

          <article className="bg-white rounded-2xl p-6 shadow-sm md:col-span-1">
            <h2 className="text-xl font-semibold text-slate-900 inline-flex items-center gap-2">
              <FiUsers />
              Doctors
            </h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              {department.doctors.map((doctor) => (
                <li key={doctor}>{doctor}</li>
              ))}
            </ul>
          </article>

          <article className="bg-white rounded-2xl p-6 shadow-sm md:col-span-1">
            <h2 className="text-xl font-semibold text-slate-900 inline-flex items-center gap-2">
              <FiBookOpen />
              Blogs
            </h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              {department.blogs.map((blog) => (
                <li key={blog}>{blog}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </div>
  );
}
