import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import KartrLine from "./KartrLine";

const navItems = ["Stats", "Demo", "Virtual AI", "Visualization"];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-2xl"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <KartrLine width={90} color="#f8f2f2" text="Kartr" />

          {/* Search ONLY on large screens */}
          <div className="hidden lg:flex items-center gap-2">
            <Input placeholder="Search..." className="w-56" />
            <Button>Search</Button>
          </div>
        </div>

        {/* CENTER NAV — DESKTOP ONLY */}
        <nav className="hidden lg:flex items-center gap-6 rounded-full bg-purple-200/70 backdrop-blur-md p-1">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="
                px-6 py-1.5 text-sm font-medium
                rounded-full
                text-gray-700
                hover:bg-white/80 hover:text-black
                transition-all
              "
            >
              {item}
            </a>
          ))}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {/* Logout ONLY on large screens */}
          <Button
            variant="destructive"
            className="hidden lg:flex gap-2 bg-indigo-500/90 backdrop-blur-md"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>

          {/* Hamburger ALWAYS until lg */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET MENU */}
      {menuOpen && (
        <div className="lg:hidden bg-white/90 backdrop-blur-xl border-t border-white/30 px-6 py-4 space-y-4">
          <Input placeholder="Search..." />
          <Button className="w-full">Search</Button>

          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                {item}
              </a>
            ))}
          </div>

          <Button variant="destructive" className="w-full gap-2 bg-indigo-500">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
