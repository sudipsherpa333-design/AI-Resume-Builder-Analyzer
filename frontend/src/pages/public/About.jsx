// src/pages/About.jsx
import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
                        About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ResumeCraft</span>
          </h1>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                                ResumeCraft is an AI-powered resume builder designed to help job seekers create professional,
                                ATS-optimized resumes that stand out. Our platform combines cutting-edge AI technology with
                                human-centered design to make resume creation fast, easy, and effective.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="font-bold text-blue-700 mb-2">AI-Powered Builder</h3>
                  <p className="text-gray-600">Smart suggestions and real-time formatting powered by advanced AI algorithms.</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="font-bold text-purple-700 mb-2">ATS Optimization</h3>
                  <p className="text-gray-600">Ensure your resume passes through Applicant Tracking Systems used by 99% of Fortune 500 companies.</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-xl">
                  <h3 className="font-bold text-emerald-700 mb-2">Professional Templates</h3>
                  <p className="text-gray-600">Choose from dozens of professionally designed templates for every industry and career level.</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl">
                  <h3 className="font-bold text-amber-700 mb-2">Career Analytics</h3>
                  <p className="text-gray-600">Get detailed insights and improvement suggestions based on industry best practices.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Free to Start:</strong> Create your first resume completely free with no time limits</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Data Privacy:</strong> Your data is encrypted and never shared with third parties</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Mobile Friendly:</strong> Create and edit resumes on any device, anywhere</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Instant Download:</strong> Export your resume as PDF, Word, or plain text in one click</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Live Support:</strong> Get help from our team whenever you need it</span>
                </li>
              </ul>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
                <p className="text-gray-600">
                                    Founded in 2023, ResumeCraft was born from a simple observation: most job seekers struggle
                                    with resume creation. We believe that everyone deserves a professional resume that accurately
                                    represents their skills and experience. Our mission is to democratize access to career tools
                                    and help people land their dream jobs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;