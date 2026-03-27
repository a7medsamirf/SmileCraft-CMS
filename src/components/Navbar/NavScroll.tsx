"use client";
import { useEffect, useState } from 'react';

const NavScroll = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Show at top when scrolled past middle of viewport
        setIsScrolled(scrollPosition > windowHeight / 2);
      };
  
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    return (
        <div className={`transition-all duration-300 ${
            isScrolled 
              ? 'fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg shadow-lg border-b border-gray-800' 
              : 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 px-1.5 py-1.5 rounded-full bg-react-dark/80 backdrop-blur-lg shadow-lg border border-react/20 w-auto'
        }`}>
            <div className={`${isScrolled ? 'container mx-auto px-4' : ''}`}>
                <nav className={`flex items-center justify-center ${isScrolled ? 'py-4' : 'gap-1'}`}>
                    <a href="#product" className={`text-white hover:bg-white/10 ${isScrolled ? 'px-4 py-2' : 'rounded-full px-4 py-2'} transition-colors`}>Product</a>
                    <a href="#integration" className={`text-white hover:bg-white/10 ${isScrolled ? 'px-4 py-2' : 'rounded-full px-4 py-2'} transition-colors`}>Integration</a>
                    <a href="#demo" className={`text-white hover:bg-white/10 ${isScrolled ? 'px-4 py-2' : 'rounded-full px-4 py-2'} transition-colors`}>Demo</a>
                    <a href="#pricing" className={`text-white hover:bg-white/10 ${isScrolled ? 'px-4 py-2' : 'rounded-full px-4 py-2'} transition-colors`}>Pricing</a>
                    <a href="#login" className={`bg-white text-black font-medium ${isScrolled ? 'rounded' : 'rounded-full'} px-4 py-2 transition-colors hover:bg-gray-100`}>Login</a>
                </nav>
            </div>
        </div>
    );
};

export default NavScroll;