import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X, Sun, Moon, ChevronDown, FolderKanban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Navbar = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isOpen, setIsOpen] = useState(false);
  const [isHoveringProjects, setIsHoveringProjects] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);

  // Handle Theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch projects strictly for the hover dropdown
  useEffect(() => {
    const fetchDropdownProjects = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/projects`)
        setRecentProjects(data.slice(0, 3)); // Only show the top 3 in the hover menu
      } catch (error) {
        console.error("Error fetching for navbar", error);
      }
    };
    fetchDropdownProjects();
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      
      {/* --- Solid Premium Glass Bar --- */}
      <div className="bg-white/95 dark:bg-[#111111]/95 backdrop-blur-3xl transition-colors duration-500 relative z-20 shadow-sm border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 z-30 relative outline-none">
            <motion.span whileTap={{ scale: 0.95 }} className="font-serif italic text-2xl tracking-wide text-slate-900 dark:text-white cursor-pointer">
              Project<span className="text-brand not-italic ml-1">Flow</span>
            </motion.span>
          </Link>

          {/* --- Desktop Navigation --- */}
          <div className="hidden md:flex items-center gap-8 h-full">
            <NavLink to="/">
              {({ isActive }) => (
                <motion.span whileTap={{ scale: 0.9 }} className={`text-sm tracking-wide transition-colors ${isActive ? "text-brand font-medium" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                  Dashboard
                </motion.span>
              )}
            </NavLink>

            {/* 🔥 Hover Dropdown for Projects 🔥 */}
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setIsHoveringProjects(true)}
              onMouseLeave={() => setIsHoveringProjects(false)}
            >
              <NavLink to="/projects">
                {({ isActive }) => (
                  <motion.span whileTap={{ scale: 0.9 }} className={`flex items-center gap-1 text-sm tracking-wide transition-colors ${isActive || isHoveringProjects ? "text-brand font-medium" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                    Projects
                    <motion.div animate={{ rotate: isHoveringProjects ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </motion.span>
                )}
              </NavLink>

              {/* The Dropdown Menu */}
              <AnimatePresence>
                {isHoveringProjects && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-[60px] left-1/2 -translate-x-1/2 w-72 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-2"
                  >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Recent Projects</span>
                    {recentProjects.length > 0 ? (
                      recentProjects.map(proj => (
                        <Link key={proj._id} to={`/projects/${proj._id}`}>
                          <motion.div whileHover={{ x: 4, backgroundColor: "rgba(124,58,237,0.05)" }} className="px-3 py-2 rounded-xl transition-colors cursor-pointer group">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-brand">{proj.title}</h4>
                            <p className="text-xs text-slate-500 truncate">{proj.status}</p>
                          </motion.div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 px-2">No projects yet.</p>
                    )}
                    
                    <div className="w-full h-px bg-slate-100 dark:bg-white/10 my-1"></div>
                    
                    <Link to="/projects">
                      <motion.div whileHover={{ backgroundColor: "rgba(124,58,237,0.1)" }} className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 dark:bg-white/5 rounded-xl text-brand text-sm font-medium transition-colors">
                        <FolderKanban className="w-4 h-4" /> View All Projects
                      </motion.div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Theme Toggle */}
            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
              className="ml-4 w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <AnimatePresence mode="wait">
                <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {theme === "dark" ? <Sun className="w-4 h-4 text-brand-cyan" /> : <Moon className="w-4 h-4 text-brand" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* --- Mobile Menu Toggle --- */}
          <motion.button whileTap={{ scale: 0.8 }} onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-800 dark:text-white p-2 relative z-30 outline-none">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* --- 🌊 THE FLUID WAVE 🌊 --- */}
      {/* Placed z-10 behind the bar, perfect constant speed, seamless transition */}
      <div className="absolute top-full left-0 w-full h-4 overflow-hidden pointer-events-none -mt-[1px] z-10 opacity-95">
        <div className="w-[200%] h-full animate-wave flex rotate-180">
          {[1, 2].map((i) => (
            <svg key={i} className="w-full h-full text-white dark:text-[#111111]" preserveAspectRatio="none" viewBox="0 0 1440 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h1440v13.63c-231.84 33.36-474.32 38.64-720 0-245.68-38.64-488.16-33.36-720 0V0z"/>
            </svg>
          ))}
        </div>
      </div>

      {/* --- Mobile Menu Dropdown --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-white dark:bg-[#111111] border-b border-slate-200 dark:border-white/5 md:hidden flex flex-col z-0 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-5 flex flex-col">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium text-slate-600 dark:text-slate-300">Dashboard</Link>
              <Link to="/projects" onClick={() => setIsOpen(false)} className="text-lg font-medium text-slate-600 dark:text-slate-300 flex items-center justify-between">
                Projects <FolderKanban className="w-5 h-5 opacity-50" />
              </Link>
              
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Theme</span>
                <button 
                  onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setIsOpen(false); }} 
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5"
                >
                  {theme === "dark" ? <Sun className="w-5 h-5 text-brand-cyan" /> : <Moon className="w-5 h-5 text-brand" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;