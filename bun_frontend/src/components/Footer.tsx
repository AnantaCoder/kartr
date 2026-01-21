import React from "react";
import { motion } from "framer-motion";
import virtualImg from "../assets/auth/robot_img.png";

const VirtualInfluencerSection: React.FC = () => {
  return (
    <motion.section
      className="relative bg-white py-4 md:py-6 w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* CONTENT CONTAINER */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          className="max-w-xl space-y-1 z-10"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h4 className="text-xl md:text-2xl font-semibold text-gray-900">
            Meet Your Virtual Influencer
          </h4>

          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            AI-generated creators built for your brand. Engage audiences,
            scale campaigns, and collaborate without limits.
          </p>

          <motion.div
            className="inline-flex items-center bg-white border border-gray-200 rounded-xl px-4 py-1 shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm md:text-base text-gray-700 font-medium">
              partnerships@katr.ai
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* IMAGE — SAME PARAMETERS, JUST RESPONSIVE VISIBILITY */}
      <motion.img
        src={virtualImg}
        alt="Virtual Influencer"
        className="
          hidden sm:block
          absolute
          right-0
          top-[55%]
          -translate-y-1/2
          max-w-[420px]
          md:max-w-[600px]
          lg:max-w-[670px]
          pointer-events-none
          opacity-95
          [mask-image:linear-gradient(to_right,transparent,black_35%)]
        "
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        style={{ filter: 'drop-shadow(-20px 0 60px rgba(139,92,246,0.25))' }}
      />
    </motion.section>
  );
};

export default VirtualInfluencerSection;
