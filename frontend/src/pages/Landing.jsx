import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Users, Target } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Target,
      title: 'Personalized Recommendations',
      description: 'Get product suggestions tailored to your unique skin type and concerns'
    },
    {
      icon: Shield,
      title: 'Ingredient Safety',
      description: 'Avoid harmful combinations and get safety warnings for your routine'
    },
    {
      icon: Users,
      title: 'Community Reviews',
      description: 'Benefit from real user experiences and community feedback'
    },
    {
      icon: Sparkles,
      title: 'Smart Routine Builder',
      description: 'Create and track effective skincare routines with AI guidance'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Personal
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {' '}Pecura AI
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover the perfect skincare routine with AI-powered recommendations 
              tailored to your skin type, concerns, and ingredient preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/quiz"
                className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Take Skin Quiz</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/products"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Pecura AI?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our advanced AI analyzes your skin profile to provide personalized, 
              safe, and effective skincare recommendations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Skincare Routine?
          </h2>
          <p className="text-purple-100 mb-8 text-lg">
            Join thousands of users who have discovered their perfect skincare routine with our AI-powered platform.
          </p>
          <Link
            to="/quiz"
            className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">
            <strong>Disclaimer:</strong> This system is not a substitute for professional dermatological advice. 
            Always consult with a healthcare provider for serious skin concerns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;