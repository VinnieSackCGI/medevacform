import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RocketLaunchIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  SparklesIcon,
  ChartBarIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export default function AIShowcase() {
  const navigate = useNavigate();

  const metrics = [
    {
      icon: ClockIcon,
      label: "Time Saved",
      value: "87.5%",
      description: "8 weeks → 1 week",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: CurrencyDollarIcon,
      label: "Cost Reduction",
      value: "89.7%",
      description: "$46,800 → $4,839",
      color: "from-green-500 to-green-600"
    },
    {
      icon: CodeBracketIcon,
      label: "Code Generated",
      value: "15,000+",
      description: "Lines of production code",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: RocketLaunchIcon,
      label: "Success Rate",
      value: "85%",
      description: "First-time code accuracy",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const capabilities = [
    {
      icon: SparklesIcon,
      title: "AI-Powered Development",
      description: "Built with Claude Sonnet 4.5, leveraging advanced AI to write production-ready code across full-stack applications."
    },
    {
      icon: ChartBarIcon,
      title: "Enterprise-Grade Quality",
      description: "Production-ready architecture with Azure cloud infrastructure, security best practices, and scalable design patterns."
    },
    {
      icon: ShieldCheckIcon,
      title: "Rapid Deployment",
      description: "From concept to production in days, not months. CI/CD pipelines, automated testing, and cloud deployment included."
    },
    {
      icon: LightBulbIcon,
      title: "Expert Collaboration",
      description: "80/20 partnership model: AI handles code generation while human expertise guides strategy, quality, and business logic."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-500/5 dark:to-purple-500/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <SparklesIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                AI-Powered Development
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
              This entire application was built in <span className="font-bold text-blue-600 dark:text-blue-400">one week</span> using 
              AI-assisted development with Claude Sonnet 4.5
            </p>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Demonstrating the future of software development: faster delivery, lower costs, 
              and enterprise-grade quality through intelligent human-AI collaboration
            </p>

            <button
              onClick={() => navigate('/form')}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <RocketLaunchIcon className="w-6 h-6 mr-2" />
              Start Using the App
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200 border border-gray-100 dark:border-gray-700"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${metric.color} mb-4`}>
                <metric.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {metric.value}
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {metric.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {metric.description}
              </div>
            </div>
          ))}
        </div>

        {/* Development Approach */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 mb-16 border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            The 80/20 Partnership Model
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  AI
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    AI Contribution (80%)
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Code generation across frontend, backend, and database
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Azure cloud architecture and deployment configuration
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      API implementations and integration patterns
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Best practices and security patterns
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  👤
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    Human Expertise (20%)
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Domain expertise and business requirements
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Quality assurance and testing
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Strategic decisions and architecture validation
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      User experience evaluation and refinement
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          What This Means for Your Organization
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <capability.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {capability.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {capability.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technology Stack Highlight */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Full-Stack Application in One Week
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">45+</div>
              <div className="text-blue-100">React Components</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">12</div>
              <div className="text-blue-100">Azure Functions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">5</div>
              <div className="text-blue-100">Database Tables</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-blue-100 mb-6 max-w-3xl mx-auto">
              Complete with authentication, analytics dashboard, external API integrations, 
              documentation system, and production deployment on Azure cloud infrastructure.
            </p>
            
            <button
              onClick={() => navigate('/documentation')}
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <BookOpenIcon className="w-5 h-5 mr-2" />
              View Full Documentation
            </button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Transform Your Development Process?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Experience how AI-assisted development can accelerate your projects while maintaining 
            enterprise-grade quality and security standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/form')}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Explore the Application
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border-2 border-blue-600 dark:border-blue-400 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <ChartBarIcon className="w-6 h-6 mr-2" />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
