import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, CheckCircle2, Circle, Clock, User, Trash2, X } from "lucide-react";

const ProjectDetails = () => {
  const { id } = useParams(); // Gets the /projects/:id from the URL
  
  // --- STATE ---
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Task Form State
  const [taskForm, setTaskForm] = useState({
    title: "",
    status: "Todo",
    priority: "Medium",
    assignedTo: ""
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // FIXED: Using Promise.all and properly fetching by the specific Project ID using the Environment Variable!
        const [projRes, tasksRes, actRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/projects/${id}`),
            axios.get(`${import.meta.env.VITE_API_URL}/tasks/project/${id}`),
            axios.get(`${import.meta.env.VITE_API_URL}/activity/project/${id}`)
        ]);
        
        setProject(projRes.data);
        setTasks(tasksRes.data);
        setActivities(actRes.data);
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  // --- CRUD ACTIONS ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/tasks`, {
        ...taskForm,
        projectId: id
      });
      setTasks([data, ...tasks]);
      setIsTaskModalOpen(false);
      setTaskForm({ title: "", status: "Todo", priority: "Medium", assignedTo: "" });
      
      // Refresh activity log quietly
      const actRes = await axios.get(`${import.meta.env.VITE_API_URL}/activity/project/${id}`);
      setActivities(actRes.data);
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if(!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      
      const actRes = await axios.get(`${import.meta.env.VITE_API_URL}/activity/project/${id}`);
      setActivities(actRes.data);
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === "Done" ? "Todo" : "Done";
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? data : t));
      
      const actRes = await axios.get(`${import.meta.env.VITE_API_URL}/activity/project/${id}`);
      setActivities(actRes.data);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) return <div className="text-slate-900 dark:text-white text-center pt-20">Project not found</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
      
      {/* Back Button & Header */}
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand transition-colors mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-slate-900 dark:text-white tracking-tight mb-2">
            {project.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {project.description}
          </p>
        </div>
        <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white">
          Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "None"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT: TASKS MANAGER --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl text-slate-900 dark:text-white">Tasks</h3>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-brand-cyan hover:scale-105 transition-all shadow-lg shadow-brand/20"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="glass-card py-16 text-center text-slate-500 border border-dashed border-slate-300 dark:border-white/10">
                No tasks yet. Break your project down into steps.
              </div>
            ) : (
              tasks.map((task) => (
                <motion.div 
                  key={task._id} 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`glass-card p-4 flex items-center justify-between group transition-all ${task.status === 'Done' ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleTaskStatus(task)} className="text-slate-400 hover:text-brand transition-colors">
                      {task.status === "Done" ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <div>
                      <h4 className={`text-slate-900 dark:text-white font-medium ${task.status === 'Done' ? 'line-through text-slate-500' : ''}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <PriorityBadge priority={task.priority} />
                        {task.assignedTo && (
                          <span className="flex items-center gap-1"><User className="w-3 h-3"/> {task.assignedTo}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTask(task._id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-white/5 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* --- RIGHT: ACTIVITY LOG --- */}
        <div className="glass-card p-6 h-fit max-h-[600px] overflow-y-auto">
          <h3 className="font-serif text-2xl text-slate-900 dark:text-white mb-6">Activity Log</h3>
          
          <div className="relative border-l border-slate-200 dark:border-white/10 ml-3 space-y-8">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-500 pl-6">No activity recorded yet.</p>
            ) : (
              activities.map((act, index) => (
                <motion.div 
                  key={act._id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                  className="relative pl-6"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand ring-4 ring-white dark:ring-[#111]"></div>
                  
                  <p className="text-sm text-slate-900 dark:text-slate-200 font-medium">{act.action}</p>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* --- CREATE TASK MODAL --- */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTaskModalOpen(false)} className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#0a0a0a] border-l border-slate-200 dark:border-white/10 shadow-2xl z-[60] overflow-y-auto flex flex-col">
              <div className="p-6 md:p-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-center shrink-0">
                <h2 className="font-serif text-3xl text-slate-900 dark:text-white">New Task</h2>
                <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto flex-1">
                <form id="task-form" onSubmit={handleCreateTask} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Task Title</label>
                    <input required type="text" value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand" placeholder="e.g. Design database schema" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                      <select value={taskForm.status} onChange={(e) => setTaskForm({...taskForm, status: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand">
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                      <select value={taskForm.priority} onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Assign To</label>
                    <input type="text" value={taskForm.assignedTo} onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})} className="w-full bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand" placeholder="e.g. John Doe" />
                  </div>
                </form>
              </div>
              
              <div className="p-6 md:p-8 border-t border-slate-200 dark:border-white/10 shrink-0 bg-white dark:bg-[#0a0a0a]">
                <button type="submit" form="task-form" className="w-full py-3 px-4 rounded-xl font-medium text-white bg-brand hover:bg-brand-cyan transition-colors shadow-lg shadow-brand/20">
                  Add Task
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Helper Component ---
const PriorityBadge = ({ priority }) => {
  const colors = {
    "High": "text-red-500 bg-red-500/10",
    "Medium": "text-brand-amber bg-brand-amber/10",
    "Low": "text-emerald-500 bg-emerald-500/10"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[priority] || colors["Medium"]}`}>
      {priority}
    </span>
  );
};

export default ProjectDetails;