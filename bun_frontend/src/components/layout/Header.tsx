import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import KartrLine from "../common/KartrLine";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsAuthenticated, logout } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store/store";

const navItems = [
  { label: "Home", href: "/" },
  { label: "YouTube Analysis", href: "/YoutubeAnalysis" },
  { label: "Demo", href: "#demo" },
  { label: "Virtual AI", href: "/VirtualAi" },
  { label: "Enable Auto Posting", href: "/auto-posting" },
  { label: "My Campaigns", href: "/sponsor/campaigns/campaign_400cbdc66d28" },

];

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
        className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md ${bgClass ? bgClass : "bg-white/5"}`}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">

            {/* LEFT - LOGO */}
            <Link to="/" className="flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <KartrLine width={80} color="#a855f7" text="Kartr" />
              </motion.div>
            </Link>

            {/* CENTER NAV — DESKTOP ONLY (lg+) */}
            <nav className="hidden lg:flex items-center">
              <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-md p-1.5 border border-white/10">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`
                        px-5 py-2 text-sm font-medium
                        rounded-full
                        transition-all duration-200
                        ${isActive
                          ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                        }
                      `}
                    >
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
                    <span className="text-gray-300 text-sm font-medium">
                      Hello, {user.username}
                    </span>
                    <Button
                      variant="ghost"
                      className="text-gray-300 hover:text-white hover:bg-white/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/login">
                      <Button
                        variant="ghost"
                        className="text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup-influencer">
                      <Button
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </>
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
              <div className="bg-slate-900/98 backdrop-blur-xl border-t border-white/10 px-4 sm:px-6 py-6 space-y-4">
                {/* Nav Items */}
                <div className="flex flex-col gap-1">
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
                            block px-4 py-3 rounded-xl text-base font-medium
                            transition-all duration-200
                            ${isActive
                              ? "bg-purple-500/20 text-purple-400 border-l-4 border-purple-500"
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
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
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Auth Buttons - visible on mobile */}
                <div className="flex flex-col sm:flex-row gap-3 md:hidden">
                  {isAuthenticated && user ? (
                    <>
                      <div className="w-full px-4 py-2 text-gray-300 text-sm font-medium border border-white/10 rounded-lg text-center">
                        Signed in as {user.username}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full border-white/20 text-white hover:bg-white/10"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link to="/signup-influencer" className="flex-1">
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        >
                          Get Started
                        </Button>
                      </Link>
                    </>
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
