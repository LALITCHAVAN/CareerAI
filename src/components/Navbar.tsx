import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  Cpu,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sparkles,
  Video,
  ShieldAlert,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = user
    ? [
        { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
        { name: "Resume Builder", path: "/resume", icon: FileText },
        { name: "Interview Qs", path: "/questions", icon: Cpu },
        { name: "Mock Interview", path: "/interview", icon: Video },
        { name: "Analytics", path: "/analytics", icon: BarChart3 },
      ]
    : [];

  const isActive = (path: string) => location.pathname === path;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  const logoVariants = {
    hover: {
      scale: 1.05,
      rotate: 5,
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.95,
    },
  };

  const navItemVariants = {
    hover: {
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      transition: { duration: 0.2 },
    },
  };

  const userProfileVariants = {
    hover: {
      scale: 1.02,
      y: -2,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <motion.nav
      id="app-navbar"
      className="sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link to="/" className="flex items-center gap-2">
              <motion.div
                className="bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-2 rounded-xl text-white shadow-lg shadow-purple-500/20"
                animate={{
                  backgroundPosition: ["0%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                  <Briefcase className="h-5 w-5 text-white" />
                </motion.div>
              </motion.div>

              <span className="text-xl font-bold text-white">
                Career<motion.span className="text-purple-400 inline-block" animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }}>AI</motion.span>
              </span>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <motion.div
            className="hidden md:flex items-center gap-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <motion.div
                  key={item.path}
                  variants={itemVariants}
                  whileHover={navItemVariants.hover}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all relative group text-sm font-medium ${
                      active
                        ? "bg-purple-500/20 text-purple-400"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <motion.div
                      animate={{ rotate: active ? 360 : 0 }}
                      transition={{ duration: active ? 2 : 0, repeat: active ? Infinity : 0, ease: "linear" }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>
                    {item.name}

                    {/* Active Indicator */}
                    {active && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 380, damping: 40 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}

            {user?.role === "admin" && (
              <motion.div variants={itemVariants}>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-pink-400 hover:bg-pink-500/10 text-sm font-medium transition-all"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <ShieldAlert className="h-4 w-4" />
                  </motion.div>
                  Admin Panel
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* User Area */}
          <motion.div
            className="hidden md:flex items-center gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {user ? (
              <>
                <motion.div
                  variants={itemVariants}
                  whileHover={userProfileVariants.hover}
                  whileTap={userProfileVariants.tap}
                  className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl cursor-pointer group"
                >
                  <motion.div
                    className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </motion.div>

                  <motion.span
                    className="text-sm text-slate-300 font-medium"
                    animate={{ opacity: [1, 0.8, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {user?.name || "User"}
                  </motion.span>
                </motion.div>

                <motion.button
                  id="btn-logout-desktop"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  variants={itemVariants}
                  whileHover={buttonVariants.hover}
                  whileTap={buttonVariants.tap}
                >
                  <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <LogOut className="h-4 w-4" />
                  </motion.div>
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <Link
                    to="/auth"
                    className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={buttonVariants.hover}
                  whileTap={buttonVariants.tap}
                >
                  <Link
                    to="/auth?signup=true"
                    className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 px-4 py-2 rounded-xl text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 text-sm transition-all"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Mobile Button / Avatar Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <motion.div
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </motion.div>
            )}
            <motion.button
              id="btn-mobile-menu"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? <X /> : <Menu />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden overflow-hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-4 bg-slate-950 space-y-2">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {user ? (
                  <>
                    {navItems.map((item, index) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);

                      return (
                        <motion.div
                          key={item.path}
                          variants={itemVariants}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${
                              active
                                ? "bg-purple-500/20 text-purple-400"
                                : "text-slate-300 hover:bg-slate-900"
                            }`}
                          >
                            <motion.div
                              animate={{ rotate: active ? 360 : 0 }}
                              transition={{ duration: active ? 2 : 0, repeat: active ? Infinity : 0, ease: "linear" }}
                            >
                              <Icon className="h-5 w-5" />
                            </motion.div>
                            {item.name}
                          </Link>
                        </motion.div>
                      );
                    })}

                    {user?.role === "admin" && (
                      <motion.div variants={itemVariants}>
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 py-3 px-4 rounded-lg text-pink-400 hover:bg-pink-500/10 transition-all"
                        >
                          <ShieldAlert className="h-5 w-5" />
                          Admin Panel
                        </Link>
                      </motion.div>
                    )}

                    <motion.button
                      id="btn-logout-mobile"
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 py-3 px-4 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                      variants={itemVariants}
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <div className="space-y-3 pt-2">
                    <motion.div variants={itemVariants}>
                      <Link
                        to="/auth"
                        onClick={() => setIsOpen(false)}
                        className="block text-center text-slate-300 hover:text-white py-3 rounded-xl hover:bg-white/5 transition-all font-medium"
                      >
                        Login
                      </Link>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      whileHover={buttonVariants.hover}
                      whileTap={buttonVariants.tap}
                    >
                      <Link
                        to="/auth?signup=true"
                        onClick={() => setIsOpen(false)}
                        className="block text-center text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        Get Started
                      </Link>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
