import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, Trash2, Edit3, X, Search, Loader2, FolderKanban, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Projects = () => {
  // --- STATE MANAGEMENT ---
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Planning",
    deadline: ""
  });

  // --- 1. READ: Fetch Real Data ---
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/projects");
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. CREATE: Submit New Project ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/projects", formData);
      setProjects([data, ...projects]); 
      setIsModalOpen(false);
      setFormData({ title: "", description: "", status: "Planning", deadline: "" });
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. DELETE: Remove Project ---
  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation(); // CRITICAL: Stops the click from triggering the wrapper <Link>
    if(!window.confirm("Are you sure you want to delete this project? All associated tasks will be orphaned.")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  // --- DYNAMIC FILTERING ---
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-12">
      
      {/* --- HEADER & CONTROLS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-slate-900 dark:text-white tracking-tight">
            Projects Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Manage your active initiatives, deadlines, and workspace progress.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-[#111111]/50 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
            />
          </div>

          {/* New Project Button */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-brand text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-brand-cyan transition-all shadow-lg shadow-brand/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Project
          </motion.button>
        </div>
      </div>

      {/* --- PROJECTS GRID --- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => <ProjectSkeleton key={n} />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-xl font-serif text-slate-900 dark:text-white mb-2">No projects found</p>
          <p className="text-slate-500">
            {searchQuery ? `No results matching "${searchQuery}"` : "Click 'New Project' to kick off your first initiative."}
          </p>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="mt-4 text-brand text-sm font-medium hover:underline">Clear Search</button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden" animate="visible" 
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }} 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project) => (
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} key={project._id}>
              <Link to={`/projects/${project._id}`} className="block h-full outline-none">
                <div className="glass-card p-6 group flex flex-col h-full hover:-translate-y-1 hover:shadow-xl hover:border-brand/30 dark:hover:border-brand/30 transition-all duration-300 relative overflow-hidden">
                  
                  {/* Subtle Top Gradient Based on Status */}
                  <div className={`absolute top-0 left-0 w-full h-1 opacity-50 ${project.status === 'Completed' ? 'bg-emerald-500' : project.status === 'Planning' ? 'bg-brand-amber' : 'bg-brand'}`}></div>

                  <div className="flex justify-between items-start mb-4">
                    <StatusBadge status={project.status} />
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="p-2 text-slate-400 hover:text-brand bg-slate-100 dark:bg-white/5 rounded-full transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => handleDelete(e, project._id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-white/5 rounded-full transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-serif text-slate-900 dark:text-white mb-2 group-hover:text-brand transition-colors">{project.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10 mt-auto">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "No deadline"}
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* --- CREATION MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setIsModalOpen(false)} className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60]" />
            
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#0a0a0a] border-l border-slate-200 dark:border-white/10 shadow-2xl z-[60] flex flex-col">
              
              <div className="p-6 md:p-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-center shrink-0">
                <h2 className="font-serif text-3xl text-slate-900 dark:text-white">New Project</h2>
                <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto flex-1">
                <form id="project-form" onSubmit={handleCreateProject} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Project Title</label>
                    <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all" placeholder="e.g. Q3 Marketing Campaign" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                    <textarea required rows="5" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all resize-none" placeholder="Detail the core objectives..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand transition-all appearance-none cursor-pointer">
                        <option value="Planning">Planning</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Deadline</label>
                      <input required type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand transition-all dark:[color-scheme:dark]" />
                    </div>
                  </div>
                </form>
              </div>

              {/* Sticky Bottom Footer for Form Actions */}
              <div className="p-6 md:p-8 border-t border-slate-200 dark:border-white/10 shrink-0 bg-white dark:bg-[#0a0a0a]">
                <div className="flex gap-4">
                  <button type="button" onClick={() => !isSubmitting && setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" form="project-form" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-brand hover:bg-brand-cyan transition-all shadow-lg shadow-brand/20 disabled:opacity-70 flex items-center justify-center gap-2">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Create Project"}
                  </button>
                </div>
              </div>
              
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Helper Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    "Completed": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    "In Progress": "bg-brand/10 text-brand border-brand/20",
    "Planning": "bg-brand-amber/10 text-brand-amber border-brand-amber/20"
  };
  return (
    <span className={`px-3 py-1 text-[11px] uppercase tracking-wider font-bold rounded-full border ${styles[status] || styles["Planning"]}`}>
      {status}
    </span>
  );
};

// Skeleton Loader for smooth data fetching UX
const ProjectSkeleton = () => (
  <div className="glass-card p-6 h-[220px] flex flex-col border border-slate-200 dark:border-white/5 animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="w-20 h-6 bg-slate-200 dark:bg-white/10 rounded-full"></div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-full"></div>
        <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-full"></div>
      </div>
    </div>
    <div className="w-3/4 h-6 bg-slate-200 dark:bg-white/10 rounded-md mb-4"></div>
    <div className="w-full h-4 bg-slate-200 dark:bg-white/10 rounded-md mb-2"></div>
    <div className="w-5/6 h-4 bg-slate-200 dark:bg-white/10 rounded-md mb-auto"></div>
    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/10">
      <div className="w-1/3 h-4 bg-slate-200 dark:bg-white/10 rounded-md"></div>
    </div>
  </div>
);

export default Projects;