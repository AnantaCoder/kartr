import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import KartrLine from "../common/KartrLine";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsAuthenticated, logout } from "../../store/slices/authSlice";
import { selectPerspective, setPerspective } from "../../store/slices/uiSlice";
import type { AppDispatch } from "../../store/store";
import { Sparkles, Briefcase, LayoutDashboard } from "lucide-react";

interface HeaderProps {
  bgClass?: string;
}

const Header: React.FC<HeaderProps> = ({ bgClass }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const perspective = useSelector(selectPerspective);
  const isCreator = perspective === "creator";

  const creatorNav = [
    { label: "Home", href: "/" },
    { label: "Creator Insights", href: "/YoutubeAnalysis" },
    { label: "Virtual AI", href: "/VirtualAi" },
    { label: "Auto Posting", href: "/auto-posting" },
    { label: "Innovation Lab", href: "/innovation-lab" },
  ];

  const sponsorNav = [
    { label: "Home", href: "/" },
    { label: "Brand Analytics", href: "/YoutubeAnalysis" },
    { label: "Ad Studio", href: "/ad-studio" },
    { label: "Marketing Lab", href: "/innovation-lab" },
  ];

  const navItems = isCreator ? creatorNav : sponsorNav;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setMenuOpen(false);
  };

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${bgClass ? bgClass : "bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50"}`}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* LEFT - LOGO */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <KartrLine width={80} color={isCreator ? "#a855f7" : "#3b82f6"} text="Kartr" />
                </motion.div>
              </Link>
            </div>

            {/* CENTER NAV — DESKTOP ONLY (lg+) */}
            <nav className="hidden lg:flex items-center">
              <div className="flex items-center gap-1 rounded-full bg-white/5 backdrop-blur-md p-1.5 border border-white/5 relative">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`
                        relative px-5 py-2 text-xs font-bold uppercase tracking-widest
                        rounded-full transition-all duration-300 z-10
                        ${isActive
                          ? "text-white"
                          : "text-gray-500 hover:text-gray-300"
                        }
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activePill"
                          className={`absolute inset-0 z-[-1] rounded-full shadow-lg ${isCreator ? "bg-purple-600 shadow-purple-500/20" : "bg-blue-600 shadow-blue-500/20"}`}
                          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                        />
                      )}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* RIGHT - AUTH BUTTONS */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Login/Signup buttons - hidden on mobile, show on md+ */}
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-white text-xs font-black uppercase tracking-wider">
                        {user.username}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-[0.1em] ${isCreator ? "text-purple-400 border-purple-500/20 bg-purple-500/5" : "text-blue-400 border-blue-500/20 bg-blue-500/5"}`}>
                        {user.user_type || (isCreator ? "influencer" : "sponsor")}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl h-10 px-4 text-xs font-bold"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login">
                      <Button
                        variant="ghost"
                        className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl h-10 px-5 text-xs font-bold uppercase"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to={isCreator ? "/signup-influencer" : "/signup-sponsor"}>
                      <Button
                        className={`rounded-xl h-10 px-6 text-xs font-bold uppercase shadow-lg transition-transform hover:scale-105 ${isCreator ? "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"}`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Hamburger - visible until lg */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={{ rotate: menuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {menuOpen ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-white" />
                  )}
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE / TABLET MENU */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="bg-slate-900/98 backdrop-blur-xl border-t border-white/5 px-4 sm:px-6 py-8 space-y-8">
                {/* Nav Items */}
                <div className="flex flex-col gap-2">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.href}
                          className={`
                            block px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest
                            transition-all duration-200
                            ${isActive
                              ? (isCreator ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" : "bg-blue-600/10 text-blue-400 border border-blue-500/20")
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }
                          `}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Auth Buttons - visible on mobile */}
                <div className="flex flex-col gap-3 md:hidden">
                  {isAuthenticated && user ? (
                    <div className="space-y-4">
                      <div className="w-full px-6 py-4 text-gray-400 text-xs font-black uppercase tracking-widest border border-white/10 rounded-2xl text-center bg-white/5">
                        SIGNED IN AS {user.username}
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl h-14 font-black uppercase tracking-widest"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Link to="/login">
                          <Button
                            variant="ghost"
                            className="w-full border border-white/10 text-gray-400 hover:text-white h-14 rounded-2xl font-black uppercase tracking-widest"
                          >
                            Login
                          </Button>
                        </Link>
                        <Link to={isCreator ? "/signup-influencer" : "/signup-sponsor"}>
                          <Button
                            className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg ${isCreator ? "bg-purple-600" : "bg-blue-600"}`}
                          >
                            Join
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-18" />
    </>
  );
};

export default Header;
