import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  SwatchIcon,
  CpuChipIcon,
  TableCellsIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Import images
import ExcelExample1 from '../assets/images/presentation/Excel Example 1.png';
import ExcelExample2 from '../assets/images/presentation/Excel Example pt 2.png';
import FormPt1 from '../assets/images/presentation/Medevac Form Pt 1.png';
import FormPt2 from '../assets/images/presentation/Medevac Form pt 2.png';
import FormPt3 from '../assets/images/presentation/Medevac Form pt 3.png';

export default function Presentation() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1: Title
    {
      type: 'title',
      title: 'Building Enterprise Applications with AI',
      subtitle: 'A Case Study in AI-Assisted Development',
      description: 'How we built a full-stack MEDEVAC application in one week using Claude Sonnet 4.5'
    },
    
    // Slide 2: The Challenge
    {
      type: 'content',
      title: 'The Challenge',
      icon: DocumentTextIcon,
      content: [
        {
          heading: 'The Request',
          text: 'Build a comprehensive medical evacuation tracking system that can replace a complex Excel form'
        },
        {
          heading: 'Traditional Timeline',
          text: '2/3 months with a full development team (lead, developer, DevOps, DBA)'
        },
        {
          heading: 'The Constraint',
          text: 'Solo developer with limited time and budget'
        }
      ]
    },

    // Slide 3: What I Provided
    {
      type: 'input',
      title: 'What I Provided to the AI',
      icon: DocumentTextIcon,
      inputs: [
        {
          icon: DocumentTextIcon,
          label: 'Business Rules',
          description: 'MEDEVAC workflows, funding calculations, user experience requirements',
          color: 'bg-blue-500'
        },
        {
          icon: SwatchIcon,
          label: 'Branding',
          description: 'Official colors (Matisse Blue, Gold Accent), typography (Garamond, Open Sans), design standards',
          color: 'bg-gold-accent'
        },
        {
          icon: CpuChipIcon,
          label: 'Tech Stack Guidance',
          description: 'React frontend, Azure Functions backend, Azure SQL Database, Static Web Apps hosting',
          color: 'bg-matisse'
        },
        {
          icon: TableCellsIcon,
          label: 'Excel Form Template',
          description: 'Existing MEDEVAC form with 100+ fields, complex calculations, multi-section structure',
          color: 'bg-green-600'
        }
      ]
    },

    // Slide 4: Visual Transformation
    {
      type: 'transformation',
      title: 'From Excel to Enterprise Web App',
      before: {
        title: 'Starting Point: Excel Template*',
        images: [ExcelExample1, ExcelExample2],
        description: 'Manual Excel form with complex calculations and formatting'
      },
      after: {
        title: 'Result: Modern Web Application',
        images: [FormPt1, FormPt2, FormPt3],
        description: 'Interactive React application with State Department branding, real-time validation, and cloud deployment'
      }
    },

    // Slide 5: The AI Partnership
    {
      type: 'partnership',
      title: 'The 80/20 Partnership Model',
      ai: {
        percentage: '80%',
        label: 'AI Contribution',
        items: [
          'Code generation across frontend, backend, database',
          'Azure cloud architecture and deployment',
          'API implementations and security patterns',
          'Best practices and optimization',
          'Documentation and error handling'
        ]
      },
      human: {
        percentage: '20%',
        label: 'Human Expertise',
        items: [
          'Domain knowledge and business rules',
          'Quality assurance and testing',
          'Strategic decisions and priorities',
          'User experience evaluation',
          'Error diagnosis and refinement'
        ]
      }
    },

    // Slide 5: The Process
    {
      type: 'process',
      title: 'The Development Process',
      steps: [
        {
          number: '1',
          title: 'Requirements & Context',
          description: 'Provided business rules, Excel template, and branding guidelines to Claude',
          time: '4 hours'
        },
        {
          number: '2',
          title: 'Database & Backend',
          description: 'AI generated Azure SQL schema and Functions API with authentication',
          time: '6 hours'
        },
        {
          number: '3',
          title: 'Frontend Development',
          description: 'AI built React components matching State Department branding',
          time: '2 days'
        },
        {
          number: '4',
          title: 'Integration & Testing',
          description: 'Human tested, AI fixed bugs, iterative refinement',
          time: '1 day'
        },
        {
          number: '5',
          title: 'Deployment',
          description: 'AI configured Azure Static Web Apps with CI/CD pipeline',
          time: '6 hours'
        }
      ]
    },

    // Slide 6: What We Built
    {
      type: 'features',
      title: 'What We Built in One Week',
      features: [
        {
          icon: DocumentTextIcon,
          title: 'MEDEVAC Form System',
          description: '100+ fields, real-time calculations, 10 extension periods'
        },
        {
          icon: CheckCircleIcon,
          title: 'Authentication & Access Control',
          description: 'Secure login, session management, access request workflow'
        },
        {
          icon: TableCellsIcon,
          title: 'Data Management',
          description: 'Full CRUD operations, user filtering, advanced search'
        },
        {
          icon: ChartBarIcon,
          title: 'Analytics Dashboard',
          description: 'Real-time metrics, geographic distribution, cost analysis'
        },
        {
          icon: CpuChipIcon,
          title: 'External Integrations',
          description: 'State Department per diem scraper, documentation API'
        },
        {
          icon: RocketLaunchIcon,
          title: 'Cloud Infrastructure',
          description: 'Azure Static Web Apps, Functions, SQL Database, CI/CD'
        }
      ]
    },

    // Slide 7: The Results
    {
      type: 'results',
      title: 'The Results',
      metrics: [
        {
          icon: ClockIcon,
          value: '87.5%',
          label: 'Time Saved',
          description: '8 weeks → 1 week',
          color: 'from-blue-500 to-blue-600'
        },
        {
          icon: CurrencyDollarIcon,
          value: '89.7%',
          label: 'Cost Reduction',
          description: '$46,800 → $4,839',
          color: 'from-green-500 to-green-600'
        },
        {
          icon: DocumentTextIcon,
          value: '15,000+',
          label: 'Lines of Code',
          description: 'Production-ready',
          color: 'from-purple-500 to-purple-600'
        },
        {
          icon: CheckCircleIcon,
          value: '85%',
          label: 'First-Time Success',
          description: 'Code accuracy',
          color: 'from-orange-500 to-orange-600'
        }
      ],
      technical: [
        '45+ React Components',
        '12 Azure Functions',
        '5 Database Tables',
        'Full CI/CD Pipeline',
        'Production Deployment'
      ]
    },

    // Slide 8: Key Takeaways
    {
      type: 'takeaways',
      title: 'Key Takeaways',
      points: [
        {
          title: 'AI Amplifies Expertise',
          description: 'AI doesn\'t replace developers—it multiplies their impact. You still need domain knowledge, quality assurance, and strategic thinking.'
        },
        {
          title: 'Provide Rich Context',
          description: 'The more context you give (business rules, examples, branding), the better the output. Excel templates, style guides, and workflows are gold.'
        },
        {
          title: 'Iterate Quickly',
          description: 'AI enables rapid prototyping and refinement. Test, provide feedback, and iterate in minutes instead of days.'
        },
        {
          title: 'Enterprise Quality',
          description: 'With proper guidance, AI can generate production-ready code with security, error handling, and best practices built in.'
        },
        {
          title: 'Cost-Effective Innovation',
          description: 'Deliver enterprise applications at 10% of traditional cost while maintaining quality and security standards.'
        }
      ]
    },

    // Slide 9: Live Demo
    {
      type: 'demo',
      title: 'See It In Action',
      description: 'Experience the application built through AI-assisted development',
      actions: [
        {
          label: 'Explore MEDEVAC Form',
          path: '/form',
          icon: DocumentTextIcon,
          description: 'See the 100+ field form with real-time calculations'
        },
        {
          label: 'View Analytics Dashboard',
          path: '/analytics',
          icon: ChartBarIcon,
          description: 'Interactive charts and geographic distribution'
        },
        {
          label: 'Check Documentation',
          path: '/documentation',
          icon: DocumentTextIcon,
          description: 'Complete technical documentation and architecture'
        }
      ]
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const renderSlide = () => {
    const slide = slides[currentSlide];

    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <SparklesIcon className="w-24 h-24 text-gold-accent mb-8 animate-pulse" />
            <h1 className="text-6xl font-bold text-white font-garamond mb-6">
              {slide.title}
            </h1>
            <h2 className="text-3xl text-gold-accent mb-8 font-garamond">
              {slide.subtitle}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl">
              {slide.description}
            </p>
          </div>
        );

      case 'transformation':
        return (
          <div className="flex flex-col h-full px-12 py-16">
            <h2 className="text-5xl font-bold text-white font-garamond mb-8 text-center">
              {slide.title}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 flex-1">
              {/* Before: Excel */}
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-gold-accent mb-4 text-center">
                  {slide.before.title}
                </h3>
                <div className="flex-1 space-y-4 overflow-auto">
                  {slide.before.images.map((img, index) => (
                    <div key={index} className="bg-theme-bg-secondary rounded-lg p-2 border border-theme-border-primary">
                      <img 
                        src={img} 
                        alt={`Excel example ${index + 1}`}
                        className="w-full h-auto rounded shadow-lg"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-gray-300 text-center mt-4 text-sm">
                  {slide.before.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-matisse rounded-full p-4 shadow-2xl">
                  <ArrowRightIcon className="w-12 h-12 text-gold-accent" />
                </div>
              </div>

              {/* After: Web App */}
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-matisse mb-4 text-center">
                  {slide.after.title}
                </h3>
                <div className="flex-1 space-y-4 overflow-auto">
                  {slide.after.images.map((img, index) => (
                    <div key={index} className="bg-theme-bg-secondary rounded-lg p-2 border-2 border-matisse">
                      <img 
                        src={img} 
                        alt={`Form iteration ${index + 1}`}
                        className="w-full h-auto rounded shadow-lg"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-gray-300 text-center mt-4 text-sm">
                  {slide.after.description}
                </p>
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="flex flex-col h-full px-12 py-16">
            <div className="flex items-center mb-12">
              <slide.icon className="w-16 h-16 text-gold-accent mr-6" />
              <h2 className="text-5xl font-bold text-white font-garamond">
                {slide.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              {slide.content.map((item, index) => (
                <div key={index} className="bg-theme-bg-secondary rounded-xl p-8 border border-theme-border-primary">
                  <h3 className="text-2xl font-bold text-gold-accent mb-4">{item.heading}</h3>
                  <p className="text-xl text-gray-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="flex flex-col h-full px-12 py-16">
            <h2 className="text-5xl font-bold text-white font-garamond mb-12 text-center">
              {slide.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {slide.inputs.map((input, index) => (
                <div key={index} className="bg-theme-bg-secondary rounded-xl p-8 border-2 border-matisse hover:border-gold-accent transition-colors">
                  <div className={`inline-flex p-4 rounded-lg ${input.color} mb-4`}>
                    <input.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{input.label}</h3>
                  <p className="text-lg text-gray-300">{input.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'partnership':
        return (
          <div className="flex flex-col h-full px-12 py-16">
            <h2 className="text-5xl font-bold text-white font-garamond mb-12 text-center">
              {slide.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-12 flex-1">
              <div className="bg-matisse/20 rounded-2xl p-8 border-2 border-matisse">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-matisse rounded-lg flex items-center justify-center text-white font-bold text-2xl mr-4">
                    AI
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white">{slide.ai.percentage}</div>
                    <div className="text-xl text-gold-accent">{slide.ai.label}</div>
                  </div>
                </div>
                <ul className="space-y-4">
                  {slide.ai.items.map((item, index) => (
                    <li key={index} className="flex items-start text-gray-200">
                      <span className="text-gold-accent mr-3 text-xl">•</span>
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gold-accent/10 rounded-2xl p-8 border-2 border-gold-accent">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gold-accent rounded-lg flex items-center justify-center text-black-pearl font-bold text-2xl mr-4">
                    👤
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white">{slide.human.percentage}</div>
                    <div className="text-xl text-gold-accent">{slide.human.label}</div>
                  </div>
                </div>
                <ul className="space-y-4">
                  {slide.human.items.map((item, index) => (
                    <li key={index} className="flex items-start text-gray-200">
                      <span className="text-matisse mr-3 text-xl">•</span>
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'process':
        return (
          <div className="flex flex-col h-full px-12 py-16">
            <h2 className="text-5xl font-bold text-white font-garamond mb-12 text-center">
              {slide.title}
            </h2>
            <div className="space-y-6">
              {slide.steps.map((step, index) => (
                <div key={index} className="flex items-start bg-theme-bg-secondary rounded-xl p-6 border border-theme-border-primary hover:border-gold-accent transition-colors">
                  <div className="flex-shrink-0 w-16 h-16 bg-matisse rounded-full flex items-center justify-center text-white font-bold text-2xl mr-6">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                      <span className="text-gold-accent font-semibold text-lg">{step.time}</span>
                    </div>
                    <p className="text-lg text-gray-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="flex flex-col h-full px-12 py-16">
            <h2 className="text-5xl font-bold text-white font-garamond mb-12 text-center">
              {slide.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slide.features.map((feature, index) => (
                <div key={index} className="bg-theme-bg-secondary rounded-xl p-6 border border-theme-border-primary hover:border-matisse transition-colors">
                  <div className="w-14 h-14 bg-matisse rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="flex flex-col h-full px-12 py-16">
            <h2 className="text-5xl font-bold text-white font-garamond mb-12 text-center">
              {slide.title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {slide.metrics.map((metric, index) => (
                <div key={index} className="bg-theme-bg-secondary rounded-xl p-6 text-center border border-theme-border-primary">
                  <div className="inline-flex p-3 rounded-lg bg-matisse mb-4">
                    <metric.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{metric.value}</div>
                  <div className="text-sm font-semibold text-gold-accent mb-1">{metric.label}</div>
                  <div className="text-xs text-gray-400">{metric.description}</div>
                </div>
              ))}
            </div>
            <div className="bg-matisse/20 rounded-xl p-8 border-2 border-matisse">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Technical Achievement</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {slide.technical.map((item, index) => (
                  <span key={index} className="px-4 py-2 bg-matisse rounded-lg text-white font-semibold">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'takeaways':
        return (
          <div className="flex flex-col h-full px-12 py-16">
            <h2 className="text-5xl font-bold text-white font-garamond mb-12 text-center">
              {slide.title}
            </h2>
            <div className="space-y-6">
              {slide.points.map((point, index) => (
                <div key={index} className="bg-theme-bg-secondary rounded-xl p-8 border-l-4 border-gold-accent">
                  <h3 className="text-2xl font-bold text-gold-accent mb-3">{point.title}</h3>
                  <p className="text-lg text-gray-300">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'demo':
        return (
          <div className="flex flex-col items-center justify-center h-full px-12 text-center">
            <RocketLaunchIcon className="w-24 h-24 text-gold-accent mb-8" />
            <h2 className="text-5xl font-bold text-white font-garamond mb-6">
              {slide.title}
            </h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-2xl">
              {slide.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              {slide.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="bg-matisse hover:bg-gold-accent hover:text-black-pearl text-white rounded-xl p-8 transition-all duration-200 transform hover:scale-105 border-2 border-matisse hover:border-gold-accent"
                >
                  <action.icon className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">{action.label}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-pearl via-gray-900 to-black-pearl">
      {/* Main Slide Area */}
      <div className="relative h-screen flex flex-col">
        {/* Slide Content */}
        <div className="flex-1 overflow-auto">
          {renderSlide()}
        </div>

        {/* Navigation Controls */}
        <div className="bg-black-pearl/80 border-t border-gold-accent/30 py-6 px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                currentSlide === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-matisse text-white hover:bg-gold-accent hover:text-black-pearl'
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" />
              Previous
            </button>

            {/* Slide Indicators */}
            <div className="flex items-center space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all rounded-full ${
                    index === currentSlide
                      ? 'w-12 h-3 bg-gold-accent'
                      : 'w-3 h-3 bg-gray-600 hover:bg-matisse'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                currentSlide === slides.length - 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-matisse text-white hover:bg-gold-accent hover:text-black-pearl'
              }`}
            >
              Next
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </button>
          </div>

          {/* Slide Counter */}
          <div className="text-center mt-4 text-gray-400 text-sm">
            Slide {currentSlide + 1} of {slides.length}
          </div>
        </div>
      </div>
    </div>
  );
}
