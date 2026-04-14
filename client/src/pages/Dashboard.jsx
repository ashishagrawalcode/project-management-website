import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FolderKanban, CheckCircle2, Activity, Zap, ArrowUpRight, Plus, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Dashboard = () => {
  const navigate = useNavigate();

  // --- Real Database State ---
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Fetch Everything on Load (Bulletproof Version) ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [projRes, taskRes, actRes] = await Promise.allSettled([
            // Notice the backticks (`) instead of quotes!
            axios.get(`${import.meta.env.VITE_API_URL}/projects`),
            axios.get(`${import.meta.env.VITE_API_URL}/tasks`),
            axios.get(`${import.meta.env.VITE_API_URL}/activity`)
        ]);
        
        // Safely extract data, ensuring it is ALWAYS an array even if the backend fails
        const safeProjects = projRes.status === "fulfilled" && Array.isArray(projRes.value.data) ? projRes.value.data : [];
        const safeTasks = taskRes.status === "fulfilled" && Array.isArray(taskRes.value.data) ? taskRes.value.data : [];
        const safeActivities = actRes.status === "fulfilled" && Array.isArray(actRes.value.data) ? actRes.value.data : [];

        setProjects(safeProjects);
        setTasks(safeTasks);
        setActivities(safeActivities);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- 🧮 CRASH-PROOF DYNAMIC CALCULATIONS ---
  // Using optional chaining (?.) and fallbacks to prevent React from crashing
  const activeProjectsCount = (projects || []).filter(p => p?.status !== "Completed").length;
  const completedTasks = (tasks || []).filter(t => t?.status === "Done").length;
  const totalTasks = (tasks || []).length;
  const totalActivities = (activities || []).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate dynamic chart data for the last 7 days
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d,
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      activityCount: 0,
      tasksDone: 0
    };
  });

  // Populate chart with real database timestamps (Safe Iteration)
  if (activities && activities.length > 0) {
    activities.forEach(act => {
      if (!act?.createdAt) return;
      const actDate = new Date(act.createdAt).toDateString();
      const targetDay = last7Days.find(d => d.date.toDateString() === actDate);
      if (targetDay) targetDay.activityCount += 1;
    });
  }

  // --- 📄 HIGH-QUALITY PDF GENERATION ---
  const generatePDFReport = async () => {
    setIsGenerating(true);
    const dashboardElement = document.getElementById("dashboard-content");
    
    try {
      const canvas = await html2canvas(dashboardElement, {
        scale: 2, 
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0a0a0a" : "#ffffff",
        useCORS: true
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ProjectFlow_Report_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-8 pb-12"
      id="dashboard-content" 
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-slate-900 dark:text-white tracking-tight">
            Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Real-time telemetry across your workspace.
          </p>
        </div>
        
        {/* Actionable Report Button */}
        <button 
          onClick={generatePDFReport}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-full font-medium text-sm hover:scale-105 transition-all shadow-xl shadow-brand/10 disabled:opacity-50 disabled:scale-100"
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Download className="w-4 h-4 text-brand-amber" />
          )}
          {isGenerating ? "Compiling..." : "Generate Report"}
        </button>
      </motion.div>

      {/* Dynamic KPI Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Projects" value={loading ? "-" : activeProjectsCount} icon={FolderKanban} trend="Live Total" color="text-brand" bg="bg-brand/10" />
        <StatCard title="Tasks Completed" value={loading ? "-" : completedTasks} icon={CheckCircle2} trend={`Out of ${totalTasks}`} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard title="Workspace Actions" value={loading ? "-" : totalActivities} icon={Activity} trend="Event Logs" color="text-brand-cyan" bg="bg-brand-cyan/10" />
        <StatCard title="Completion Rate" value={loading ? "-" : `${completionRate}%`} icon={Zap} trend="Efficiency" color="text-brand-amber" bg="bg-brand-amber/10" />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-time Glowing Chart Section */}
        <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-2 flex flex-col min-h-[400px]">
          <h3 className="font-serif text-2xl text-slate-900 dark:text-white mb-6 flex justify-between items-center">
            7-Day Velocity
            <span className="text-xs font-sans font-medium px-3 py-1 bg-brand/10 text-brand rounded-full">Live DB Sync</span>
          </h3>
          <div className="flex-1 w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" name="Actions" dataKey="activityCount" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorAct)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Actionable Recent Projects Sidebar */}
        <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col h-full max-h-[450px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-2xl text-slate-900 dark:text-white">Recent Projects</h3>
            <Link to="/projects" className="text-sm text-brand hover:text-brand-cyan transition-colors">View All</Link>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Syncing database...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <FolderKanban className="w-12 h-12 mb-3 text-slate-400" />
                <p className="text-sm font-medium text-slate-500">No projects found.</p>
              </div>
            ) : (
              projects.slice(0, 4).map((project) => (
                <Link to={`/projects/${project._id}`} key={project._id} className="block group">
                  <RecentProjectItem 
                    title={project?.title || "Untitled"} 
                    status={project?.status || "Planning"} 
                    time={project?.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Recently"} 
                  />
                </Link>
              ))
            )}
          </div>

          <button 
            onClick={() => navigate('/projects')}
            className="w-full mt-6 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-brand dark:hover:text-brand hover:border-brand transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Go to Projects
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
};

// --- Sub-Components ---

const StatCard = ({ title, value, icon: Icon, trend, color, bg }) => (
  <div className="glass-card p-6 flex flex-col relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-2xl ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
        {trend}
      </span>
    </div>
    <div className="relative z-10">
      <h4 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h4>
      <span className="font-serif text-3xl text-slate-900 dark:text-white">{value}</span>
    </div>
  </div>
);

const RecentProjectItem = ({ title, status, time }) => (
  <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/5 group-hover:bg-brand/5 dark:group-hover:bg-brand/10 transition-colors flex justify-between items-center cursor-pointer">
    <div>
      <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">{title}</h5>
      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Completed' ? 'bg-emerald-500' : status === 'Planning' ? 'bg-brand-amber' : 'bg-brand'}`}></span>
        {status} • {time}
      </div>
    </div>
    <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
  </div>
);

export default Dashboard;