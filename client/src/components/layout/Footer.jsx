import { Globe, Mail, Link2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-white/10 bg-white/30 dark:bg-[#0a0a0a]/30 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-xl tracking-wide text-slate-900 dark:text-white">
            Project<span className="text-brand not-italic ml-1">Flow</span>
          </span>
        </div>

        {/* Copyright */}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} ProjectFlow. Built for Nexus Assignment.
        </p>

        {/* Placeholder Links for now */}
        <div className="flex items-center gap-4 text-slate-400">
          <a href="#" className="hover:text-brand transition-colors"><Globe className="w-5 h-5" /></a>
          <a href="#" className="hover:text-brand-cyan transition-colors"><Mail className="w-5 h-5" /></a>
          <a href="#" className="hover:text-brand-amber transition-colors"><Link2 className="w-5 h-5" /></a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;