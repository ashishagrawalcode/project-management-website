import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <>
      {/* The Fluid Background behind everything */}
      <div className="fluid-bg">
        <div className="fluid-blob-1"></div>
        <div className="fluid-blob-2"></div>
      </div>

      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        
        {/* THE UNBREAKABLE SPACER: This physical block forces the content down below the wave */}
        <div className="h-28 w-full shrink-0"></div>
        
        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-12 relative z-10">
          <Outlet />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Layout;