import React from "react";
export default function Footer() {
  return (
    <footer className="bg-[#eef2f7] text-blue-900 py-10 border-t border-slate-300 mt-10">
      <div className="max-w-6xl mx-auto text-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">Smart AI Health</h3>
            <p className="text-slate-400 text-sm">
              Your comprehensive healthcare platform powered by AI technology.
            </p>
          </div>

          <div>
            <h4 className="text-black font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/doctors" className="text-slate-400 hover:text-primary">Find Doctors</a></li>
              <li><a href="/blood-finder" className="text-slate-400 hover:text-primary">Blood Finder</a></li>
              <li><a href="/store" className="text-slate-400 hover:text-primary">Medical Store</a></li>
              <li><a href="/blog" className="text-slate-400 hover:text-primary">Health Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-black font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/help" className="text-slate-500 hover:text-[#0B3D91]">Help Center</a></li>
              <li><a href="/contact" className="text-slate-500 hover:text-[#0B3D91]">Contact Us</a></li>
              <li><a href="/privacy" className="text-slate-500 hover:text-[#0B3D91]">Privacy Policy</a></li>
              <li><a href="/terms" className="text-slate-500 hover:text-[#0B3D91]">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-black font-semibold mb-4">Connect</h4>
            <p className="text-slate-400 text-sm mb-2">Email: support@smartaihealth.com</p>
            <p className="text-slate-400 text-sm">Phone: +1 (555) 123-4567</p>
          </div>
        </div>

        <div className="border-t border-slate-300 mt-8 pt-6 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Smart AI Health. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
