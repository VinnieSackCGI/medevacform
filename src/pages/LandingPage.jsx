import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, StarIcon, ShieldCheckIcon, GlobeAmericasIcon } from '@heroicons/react/24/outline';
import { ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: "Medical Case Tracking",
      description: "Complete lifecycle management of medical evacuation cases with secure documentation"
    },
    {
      icon: <GlobeAmericasIcon className="w-8 h-8" />,
      title: "Worldwide Coverage",
      description: "Supporting U.S. diplomatic personnel and families at posts around the globe"
    },
    {
      icon: <StarIcon className="w-8 h-8" />,
      title: "Per Diem Integration",
      description: "Automated per diem calculations and financial tracking for medical evacuations"
    }
  ];

  const backgroundSlides = [
    "var(--gradient-1)",
    "var(--gradient-2)", 
    "var(--gradient-3)"
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{ background: backgroundSlides[currentSlide] }}
      >
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary-foreground/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col">
        {/* Main Hero Content */}
        <div className="flex items-center justify-center px-6 py-20 min-h-[80vh]">
          <div className="text-center max-w-6xl mx-auto">
            <div 
              className={`transform transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
            >
              <h1 className="text-6xl md:text-8xl font-bold text-primary-foreground mb-6 leading-tight">
                <span className="inline-block transform hover:scale-105 transition-transform duration-300">
                  Medical
                </span>
                <br />
                <span 
                  className="inline-block transform hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent"
                  style={{ animationDelay: '0.2s' }}
                >
                  Evacuation
                </span>
              </h1>
              
              <p 
                className={`text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed transform transition-all duration-1000 delay-300 font-open-sans ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                Comprehensive medical evacuation management system supporting U.S. diplomatic personnel 
                and their families worldwide with secure, efficient healthcare coordination.
              </p>

              <div 
                className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-1000 delay-500 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                {user ? (
                  <>
                    <Link 
                      to="/form"
                      className="group bg-accent text-accent-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-accent/90 transform hover:scale-105 transition-all duration-300 shadow-2xl inline-flex items-center font-open-sans"
                    >
                      Start New Case
                      <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                    
                    <Link
                      to="/dashboard"
                      className="group bg-transparent border-2 border-primary-foreground text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-foreground hover:text-primary transform hover:scale-105 transition-all duration-300 font-open-sans"
                    >
                      View Dashboard
                    </Link>
                    
                    <Link
                      to="/database"
                      className="group bg-transparent border-2 border-primary-foreground/60 text-primary-foreground/80 px-6 py-3 rounded-full font-semibold text-base hover:bg-primary-foreground/20 hover:text-primary-foreground transform hover:scale-105 transition-all duration-300 font-open-sans"
                    >
                      View Database
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login"
                      className="group bg-accent text-accent-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-accent/90 transform hover:scale-105 transition-all duration-300 shadow-2xl inline-flex items-center font-open-sans"
                    >
                      Login to System
                      <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                    
                    <Link
                      to="/request-account"
                      className="group bg-transparent border-2 border-primary-foreground text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-foreground hover:text-primary transform hover:scale-105 transition-all duration-300 font-open-sans"
                    >
                      Request Access
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-background py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-garamond">
              MEDEVAC Management System
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-open-sans">
              Streamlined medical evacuation processing for State Department personnel and families
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group bg-card p-8 rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:scale-105 border border-border ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200 + 800}ms` }}
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300 font-garamond">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-open-sans">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 bg-secondary py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "275+", label: "Diplomatic Posts" },
              { number: "24/7", label: "Emergency Response" },
              { number: "98%", label: "Case Success Rate" },
              { number: "50K+", label: "Personnel Protected" }
            ].map((stat, index) => (
              <div 
                key={index}
                className={`transform transition-all duration-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150 + 1200}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-secondary-foreground mb-2 hover:text-accent transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-secondary-foreground/70 text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 bg-primary py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Need Medical Evacuation Support?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Access our secure MEDEVAC management system for immediate case processing
          </p>
          <Link 
            to="/form"
            className="bg-accent text-accent-foreground px-12 py-4 rounded-full font-bold text-lg hover:bg-accent/90 transform hover:scale-105 transition-all duration-300 shadow-2xl inline-block"
          >
            Submit New Case
          </Link>
        </div>
      </div>
      
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default LandingPage;