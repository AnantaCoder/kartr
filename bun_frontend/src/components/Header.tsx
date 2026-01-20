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
      className="fixed top-0 left-0 w-full z-50 bg-white backdrop-blur-xl border-b mb-12"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LEFT: Logo + Search */}
        <div className="flex items-center gap-4">
          <KartrLine width={90} color="#ec4899" text="Kartr" />

          {/* Search (hidden on small screens) */}
          <div className="hidden md:flex items-center gap-2">
            <Input placeholder="Search..." className="w-56" />
            <Button>Search</Button>
          </div>
        </div>

        {/* CENTER: Desktop Nav */}
        {/* CENTER: Desktop Nav */}
<nav className="hidden md:flex items-center gap-1 rounded-full bg-purple-200 p-1">
  {navItems.map((item) => (
    <a
      key={item}
      href="#"
      className="
        px-6 py-1.5 text-sm font-medium
        rounded-full
        text-gray-700
        hover:bg-white hover:text-black
        transition-all
      "
    >
      {item}
    </a>
  ))}
</nav>


        {/* RIGHT: Logout + Mobile Menu */}
        <div className="flex items-center gap-3">
          <Button variant="destructive" className="hidden md:flex gap-2 bg-indigo-500">
            <LogOut className="w-4 h-4 " />
            Logout
          </Button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-6 py-4 space-y-4">
          
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
            <LogOut className="w-4 h-4 " />
            Logout
          </Button>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
