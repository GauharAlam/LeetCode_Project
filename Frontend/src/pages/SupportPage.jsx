import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { 
  HelpCircle, MessageSquare, Mail, AlertCircle, 
  ChevronDown, ChevronUp, CheckCircle, Send,
  Cpu, BookOpen, Trophy, Shield
} from 'lucide-react';

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Bug Report',
    subject: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const categories = ['Bug Report', 'Feature Request', 'Account Issue', 'Code Execution / Sandbox', 'Other'];

  const faqs = [
    {
      question: "How does the code execution sandbox work?",
      answer: "When you run or submit code, your solution is compiled and executed securely inside our isolated sandbox via the Judge0 API. We support C++, Java, and JavaScript. Your code is evaluated against visible and hidden test cases, checking execution limits, runtime efficiency, and memory constraints.",
      icon: Cpu
    },
    {
      question: "How do I earn streaks and badges?",
      answer: "Streaks are awarded for consecutive days of solving at least one coding problem. Badges are unlocked automatically as you complete special achievements, like solving 10 Hard problems, reaching a 7-day streak, or completing a full official Study Plan.",
      icon: Trophy
    },
    {
      question: "What are AI-powered study plans?",
      answer: "Our recommendation engine studies your profile's weak categories (tags where you solve fewer problems). It then calls the Gemini API to customize a structured day-by-day learning plan containing specific, unsolved problems to bridge your skills gaps.",
      icon: BookOpen
    },
    {
      question: "How can I report a security vulnerability?",
      answer: "We take platform security very seriously. If you find a security bug or potential leak, please select 'Bug Report' in the form and detail the steps. You can also directly reach out to security@algoforge.com.",
      icon: Shield
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    // Simulate API request
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        category: 'Bug Report',
        subject: '',
        message: ''
      });
    }, 2000);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Navbar />

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-surface border border-border-subtle rounded-2xl text-ember-400 mb-4">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight font-display">
            Help & Support Center
          </h1>
          <p className="mt-3 text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Have questions about AlgoForge? Browse our FAQs or submit a ticket to our support engineering team below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column — Contact Form */}
          <div className="lg:col-span-7 card-af">
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2 font-display">
              <MessageSquare className="text-ember-400" size={20} />
              Submit a Support Ticket
            </h2>

            {isSubmitted ? (
              <div className="bg-easy/10 border border-easy/20 text-easy rounded-card p-6 text-center animate-fade-in-up">
                <CheckCircle className="mx-auto text-easy mb-3" size={48} />
                <h3 className="text-lg font-bold font-display">Ticket Submitted Successfully!</h3>
                <p className="text-sm mt-1 text-text-secondary">
                  Thank you for reaching out. Our support team will review your inquiry and get back to you shortly.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 btn-secondary-af px-5 py-2 text-sm font-semibold"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="micro-label block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      className="input-af"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="micro-label block mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      className="input-af"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="micro-label block mb-1.5">
                    Inquiry Category
                  </label>
                  <select
                    className="input-af cursor-pointer"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-surface">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="micro-label block mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of your query"
                    className="input-af"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="micro-label block mb-1.5">
                    Message Details
                  </label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Describe your issue or request in detail..."
                    className="input-af resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-ember py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Submit Ticket
                </button>
              </form>
            )}
          </div>

          {/* Right Column — FAQs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card-af">
              <h2 className="text-xl font-bold text-text-primary mb-6 font-display">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                {faqs.map((faq, idx) => {
                  const Icon = faq.icon;
                  const isOpen = activeFaq === idx;
                  return (
                    <div 
                      key={idx}
                      className="border-b border-border-subtle pb-3 last:border-0 last:pb-0"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="flex items-center justify-between w-full text-left py-2 text-text-primary hover:text-ember-400 font-medium transition-colors"
                      >
                        <span className="flex items-center gap-2.5 text-sm">
                          <Icon size={18} className="text-text-muted" />
                          {faq.question}
                        </span>
                        {isOpen ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                      </button>
                      
                      {isOpen && (
                        <div className="mt-2.5 pl-7 text-sm text-text-secondary leading-relaxed animate-fade-in-up">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support Info Box */}
            <div className="bg-gradient-to-r from-steel-700/5 to-steel-500/5 border border-steel-500/20 rounded-card p-6 flex items-start gap-4 text-steel-300">
              <Mail className="text-steel-300 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-text-primary font-display">Direct Support Email</h3>
                <p className="text-xs text-text-secondary leading-relaxed mt-1">
                  Prefer directly emailing us? Reach out at <strong className="text-text-primary">support@algoforge.com</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportPage;
