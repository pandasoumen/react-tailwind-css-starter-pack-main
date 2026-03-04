import React, { useState } from "react";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";

export default function ContactPage() {
  const [form, setForm] = useState({ email: "", phone: "", message: "" });
  const [status, setStatus] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setStatus("Message sent. Our team will contact you soon.");
    setForm({ email: "", phone: "", message: "" });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-[#0B3D91]">About Healtron</h1>
        <p className="mt-3 text-slate-700">
          Healtron is a healthcare platform that connects patients with doctors, appointments,
          health tracking, blood donor discovery, and digital care tools in one place.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-center text-2xl font-bold text-[#0B3D91]">Message Us</h2>
        <p className="mt-2 text-center text-slate-600">
          Share your details and our support team will reach out to you.
        </p>
        <form onSubmit={onSubmit} className="mx-auto mt-5 grid max-w-2xl gap-3">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="Your email"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#0B3D91]"
          />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="Your phone number"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#0B3D91]"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            placeholder="Type your message"
            rows={4}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#0B3D91]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#0B3D91] px-4 py-2 font-semibold text-white transition hover:brightness-110"
          >
            Send Message
          </button>
          {status && <p className="text-sm text-emerald-700">{status}</p>}
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#0B3D91]">Contact Us</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 p-4">
            <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
              <FiMail />
              Email
            </p>
            <p className="mt-2 text-slate-600">support@healtron.com</p>
          </article>
          <article className="rounded-xl border border-slate-200 p-4">
            <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
              <FiPhone />
              Phone
            </p>
            <p className="mt-2 text-slate-600">+1 (555) 123-4567</p>
          </article>
          <article className="rounded-xl border border-slate-200 p-4">
            <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
              <FiMapPin />
              Address
            </p>
            <p className="mt-2 text-slate-600">Healtron Care Center, New York, USA</p>
          </article>
        </div>
      </section>
    </div>
  );
}
