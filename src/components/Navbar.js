import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, setCredentials } from "../store/slices/authSlice";
import { API } from "../utils/api";
import {
  FiActivity,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiHeart,
  FiPhoneCall,
  FiDroplet,
  FiGrid,
  FiHome,
  FiSearch,
  FiSettings,
  FiShoppingBag,
  FiShoppingCart,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import AnimatedLogo from "./AnimatedLogo";

export default function Navbar() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDonor, setIsDonor] = useState(false);
  const [typedCount, setTypedCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchWrapRef = useRef(null);
  const brand = "Healtron";
  const typedBrand = brand.slice(0, typedCount);
  const typedHeal = typedBrand.slice(0, 4);
  const typedTron = typedBrand.slice(4);
  const isHighlightedUser =
    user?.role === "doctor" || (user?.role === "patient" && isDonor);
  const isStoreSection =
    location.pathname === "/patient/store" || location.pathname === "/doctor/store";
  const diagnosisPath = user?.role === "doctor" ? "/doctor/prescriptions" : "/patient/upload-prescription";
  const storePath = user?.role === "doctor" ? "/doctor/store" : "/patient/store";
  const navLinkClass = (isActive) =>
    `inline-flex h-12 items-center gap-2 border-b-2 px-1 text-base leading-none transition-transform duration-150 ${
      isActive
        ? "font-bold border-[#2ECC71] text-[#2ECC71] scale-110"
        : "font-medium border-transparent hover:text-blue-200 scale-100"
    }`;
  const isPathActive = (...paths) =>
    paths.some(
      (path) =>
        location.pathname === path ||
        location.pathname.startsWith(`${path}/`)
    );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?query=${search}`);
    setSearchOpen(false);
  };
  const notifications = [
    { id: 1, text: "Your appointment is confirmed" },
    { id: 2, text: "New message from Dr. Roy" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const max = brand.length;
    let delay = isDeleting ? 70 : 110;

    if (typedCount === max && !isDeleting) {
      delay = 700;
    } else if (typedCount === 0 && isDeleting) {
      delay = 350;
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (typedCount < max) {
          setTypedCount((prev) => prev + 1);
        } else {
          setIsDeleting(true);
        }
      } else if (typedCount > 0) {
        setTypedCount((prev) => prev - 1);
      } else {
        setIsDeleting(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [typedCount, isDeleting, brand.length]);

  useEffect(() => {
    let mounted = true;
    const effectiveToken = token || localStorage.getItem("token");

    const hydrateAuthUser = async () => {
      if (!effectiveToken) return;

      try {
        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${effectiveToken}` },
        });
        const latestUser = res?.data?.user;
        if (!mounted || !latestUser) return;

        dispatch(
          setCredentials({
            token: effectiveToken,
            user: {
              ...latestUser,
              id: latestUser?.id || latestUser?._id,
            },
          })
        );
      } catch {
        // Ignore hydration failures; existing auth state remains.
      }
    };

    hydrateAuthUser();

    return () => {
      mounted = false;
    };
  }, [dispatch, token]);

  useEffect(() => {
    let mounted = true;
    const effectiveToken = token || localStorage.getItem("token");
    const userId = user?.id || user?._id || "";
    const donorCacheKey = userId ? `donor:${userId}` : "";

    const checkDonorStatus = async () => {
      if (!user || user.role !== "patient") {
        if (mounted) setIsDonor(false);
        return;
      }

      if (donorCacheKey && localStorage.getItem(donorCacheKey) === "true") {
        if (mounted) setIsDonor(true);
      }

      try {
        if (!effectiveToken) {
          if (mounted) setIsDonor(false);
          return;
        }

        await API.get("/blood/me", {
          headers: { Authorization: `Bearer ${effectiveToken}` },
        });

        if (mounted) {
          setIsDonor(true);
        }
        if (donorCacheKey) localStorage.setItem(donorCacheKey, "true");
      } catch {
        if (mounted) setIsDonor(false);
        if (donorCacheKey) localStorage.removeItem(donorCacheKey);
      }
    };

    checkDonorStatus();

    const refreshDonorStatus = () => {
      checkDonorStatus();
    };

    window.addEventListener("donor-status-changed", refreshDonorStatus);
    return () => {
      mounted = false;
      window.removeEventListener("donor-status-changed", refreshDonorStatus);
    };
  }, [user, token, location.pathname]);

  return (
    <nav className="bg-[#0c3b8c] text-white sticky top-0 z-50 shadow-lg h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-full items-center">
          <Link to="/" className="flex items-center gap-3">
            <AnimatedLogo size={72} />
            <span className="text-3xl font-extrabold min-w-[170px]">
              <span style={{ color: "#2ECC71" }}>{typedHeal}</span>
              <span style={{ color: "#ffffff" }}>{typedTron}</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 font-medium">
            {isStoreSection ? (
              <>
                <Link to="/" className={navLinkClass(location.pathname === "/")}>
                  <FiHome />
                  <span>Home</span>
                </Link>
                <Link to={diagnosisPath} className={navLinkClass(isPathActive("/patient/upload-prescription", "/doctor/prescriptions"))}>
                  <FiActivity />
                  <span>Diagnosis</span>
                </Link>
                <Link to={storePath} className={navLinkClass(isPathActive("/patient/store", "/doctor/store"))}>
                  <FiShoppingBag />
                  <span>Store</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className={navLinkClass(location.pathname === "/")}>
                  <FiHome />
                  <span>Home</span>
                </Link>
                <Link to="/blog" className={navLinkClass(isPathActive("/blog"))}>
                  <FiBookOpen />
                  <span>Blog</span>
                </Link>

                {user?.role === "doctor" && (
                  <>
                    <Link to="/doctor/dashboard" className={navLinkClass(isPathActive("/doctor/dashboard"))}>
                      <FiGrid />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/doctor/appointments" className={navLinkClass(isPathActive("/doctor/appointments"))}>
                      <FiCalendar />
                      <span>Appointments</span>
                    </Link>
                    <Link to="/doctor/prescriptions" className={navLinkClass(isPathActive("/doctor/prescriptions"))}>
                      <FiActivity />
                      <span>Diagnosis</span>
                    </Link>
                    <Link to="/doctor/store" className={navLinkClass(isPathActive("/doctor/store"))}>
                      <FiShoppingBag />
                      <span>Store</span>
                    </Link>
                  </>
                )}

                {user?.role === "patient" && (
                  <>
                    {location.pathname !== "/patient/dashboard" && (
                      <>
                        <Link to="/doctors" className={navLinkClass(isPathActive("/doctors"))}>
                          <FiUsers />
                          <span>Doctors</span>
                        </Link>
                        <Link to="/patient/upload-prescription" className={navLinkClass(isPathActive("/patient/upload-prescription"))}>
                          <FiActivity />
                          <span>Diagnosis</span>
                        </Link>
                        <Link to="/patient/blood" className={navLinkClass(isPathActive("/patient/blood"))}>
                          <FiDroplet />
                          <span>Blood Finder</span>
                        </Link>
                      </>
                    )}
                    <Link to="/patient/store" className={navLinkClass(isPathActive("/patient/store"))}>
                      <FiShoppingBag />
                      <span>Store</span>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-5 relative">
            {isStoreSection && (
              <>
                <button
                  onClick={() => navigate(`${storePath}?view=cart`)}
                  className="group hidden md:inline-flex items-center rounded-lg bg-yellow-300 px-3 py-2 text-sm font-semibold text-yellow-900 hover:bg-yellow-400"
                  title="Add to Cart"
                >
                  <FiShoppingCart />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ml-2 group-hover:max-w-[120px] group-hover:opacity-100">
                    Add to Cart
                  </span>
                </button>

                <button
                  onClick={() => navigate(`${storePath}?view=wishlist`)}
                  className="group hidden md:inline-flex items-center rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                  title="Wishlist"
                >
                  <FiHeart />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ml-2 group-hover:max-w-[80px] group-hover:opacity-100">
                    Wishlist
                  </span>
                </button>
              </>
            )}

            {!isStoreSection && (
            <div className="relative" ref={searchWrapRef}>
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="text-2xl hover:text-blue-200 transition"
                title="Search"
              >
                <FiSearch />
              </button>

              {searchOpen && (
                <form
                  onSubmit={handleSearch}
                  className="absolute right-0 mt-3 w-72 bg-white text-black rounded-lg shadow-xl border border-gray-200 p-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search doctors, products..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-blue-200 focus:border-blue-500 outline-none"
                      autoFocus
                    />
                    <button className="bg-[#0B3D91] text-white px-3 py-2 rounded-md hover:bg-[#1456C8] transition">
                      <FiSearch />
                    </button>
                  </div>
                </form>
              )}
            </div>
            )}

            {!isStoreSection && (
              <Link
                to="/contact"
                className="text-2xl hover:text-blue-200 transition"
                title="Contact Us"
              >
                <FiPhoneCall />
              </Link>
            )}

            {!isStoreSection && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="text-2xl hover:text-blue-200 transition"
                >
                  <FiBell />
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white text-black shadow-xl rounded-lg p-3 border border-gray-200">
                    <h3 className="font-semibold mb-2 text-blue-800">Notifications</h3>
                    {notifications.map((n) => (
                      <p key={n.id} className="text-sm border-b border-gray-200 py-1">
                        {n.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!user && (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full border border-white hover:bg-white hover:text-blue-900 transition shadow"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-blue-900 rounded-full hover:bg-blue-100 transition shadow font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}

            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-12 h-12 rounded-full font-bold shadow flex justify-center items-center ${
                    isHighlightedUser
                      ? "bg-[#0B6B2F] text-white hover:bg-[#095826]"
                      : "bg-white text-[#0B3D91] hover:bg-blue-100"
                  }`}
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className={`w-12 h-12 rounded-full object-cover ${
                        isHighlightedUser ? "ring-2 ring-[#0B6B2F] border-2 border-white" : ""
                      }`}
                    />
                  ) : (
                    user.name ? user.name.charAt(0).toUpperCase() : "U"
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-white text-black shadow-xl rounded-lg border border-gray-200 p-2">
                    <Link
                      to={
                        user.role === "doctor"
                          ? "/doctor/profile"
                          : user.role === "patient"
                            ? "/patient/profile"
                            : "/"
                      }
                      className="flex w-full items-center gap-2 py-2 hover:text-blue-600 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiUser />
                      {(user?.name || "Profile").toUpperCase()}
                    </Link>

                    {user.role === "patient" && (
                      <Link
                        to={isDonor ? "/patient/donor-dashboard" : "/patient/blood"}
                        className="flex w-full items-center gap-2 py-2 hover:text-blue-600 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiDroplet />
                        {isDonor ? "Donor Dashboard" : "Donor Reg"}
                      </Link>
                    )}

                    <Link
                      to={user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"}
                      className="flex w-full items-center gap-2 py-2 hover:text-blue-600 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiGrid />
                      Dashboard
                    </Link>

                    <Link
                      to={user.role === "doctor" ? "/doctor/appointments" : "/patient/appointments"}
                      className="flex w-full items-center gap-2 py-2 hover:text-blue-600 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiCalendar />
                      My Appointment
                    </Link>

                    <Link
                      to={
                        user.role === "doctor"
                          ? "/doctor/profile-settings"
                          : user.role === "patient"
                            ? "/patient/profile-settings"
                            : "/"
                      }
                      className="flex w-full items-center gap-2 py-2 hover:text-blue-600 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiSettings />
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left py-2 text-red-600 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
