import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, ChevronDown, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import KartrLine from "../common/KartrLine";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsAuthenticated, logout } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store/store";

const navItems = [
  { label: "Home", href: "/" },
  { label: "YouTube Analysis", href: "/YoutubeAnalysis" },
  // { label: "Demo", href: "#demo" },
  { label: "Virtual AI", href: "/VirtualAi" },
  { label: "Enable Auto Posting", href: "/auto-posting" },

];

interface HeaderProps {
  bgClass?: string;
}

const Header: React.FC<HeaderProps> = ({ bgClass }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Get profile route based on user type
  const getProfileRoute = () => {
    if (user?.user_type === 'sponsor') return '/sponsor/profile';
    if (user?.user_type === 'influencer') return '/influencer/profile';
    if (user?.user_type === 'admin') return '/admin';
    return '/';
  };

  // Get dashboard route based on user type
  const getDashboardRoute = () => {
    if (user?.user_type === 'sponsor') return '/sponsor';
    if (user?.user_type === 'influencer') return '/influencer';
    if (user?.user_type === 'admin') return '/admin';
    return '/';
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setMenuOpen(false);
    setUserDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserDropdownOpen(false);
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
                  <div className="relative" ref={dropdownRef}>
                    {/* Username Button */}
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.full_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-gray-200 text-sm font-medium max-w-[100px] truncate">
                        {user.username}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {userDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden"
                        >
                          {/* User Info Header */}
                          <div className="px-4 py-3 border-b border-white/10">
                            <p className="text-sm font-medium text-white truncate">{user.full_name || user.username}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs capitalize">
                              {user.user_type}
                            </span>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            <Link
                              to={getDashboardRoute()}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              <span className="text-sm">Dashboard</span>
                            </Link>
                            <Link
                              to={getProfileRoute()}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span className="text-sm">My Profile</span>
                            </Link>
                          </div>

                          {/* Logout */}
                          <div className="p-2 border-t border-white/10">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm">Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
