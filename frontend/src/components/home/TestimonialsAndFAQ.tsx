import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, ShieldCheck, Quote, HelpCircle, CheckCircle2 } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const TestimonialsAndFAQ: React.FC = () => {
  const { openTrustScoreModal } = usePlatform();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const testimonials = [
    {
      quote: "thebrandsstory. transformed our D2C launch. We shortlisted 12 verified fashion creators across Delhi NCR and Mumbai in under 30 minutes, without paying heavy agency commissions.",
      author: "Aditi Rao",
      role: "VP Marketing, Aura Indo-Western",
      city: "Delhi NCR",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    },
    {
      quote: "As a food creator, getting direct inquiries from verified restaurants with clear budget expectations was game changing. My thebrandsstory. Trust Score helped me close 14 paid collabs this quarter.",
      author: "Rahul Verma",
      role: "Food & Culinary Creator (@rahulverma)",
      city: "Noida",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
    {
      quote: "The transparency of rate cards and Trust Score signals saved our startup weeks of manual outreach. The side-by-side comparison matrix makes team approvals effortless.",
      author: "Vikram Malhotra",
      role: "Founder & CEO, Pulse Nutrition Tech",
      city: "Bangalore",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    },
  ];

  const faqs = [
    {
      question: "Is it really 100% free for influencers and creators to list on thebrandsstory.?",
      answer: "Yes! Any Indian creator can create and publish their public marketplace profile completely free of cost. We believe in democratizing discovery for talent across all Indian cities without charging registration or monthly listing fees.",
    },
    {
      question: "How is thebrandsstory. different from a traditional influencer marketing agency?",
      answer: "thebrandsstory. operates as an open technology marketplace (akin to Justdial and IndiaMART for the creator economy) rather than a closed agency. Brands get direct access to search, compare metrics, view rate cards, and contact creators with zero opaque commission markups.",
    },
    {
      question: "What is the thebrandsstory. Trust Score (0-100) and how is it determined?",
      answer: "The thebrandsstory. Trust Score is our proprietary reliability index evaluating 11 platform signals including comment authenticity (detecting engagement pods), audience geography matching, phone/email OTP verification, past campaign delivery track record, and verified brand client reviews.",
    },
    {
      question: "How do brands contact and collaborate with creators?",
      answer: "Brands can browse creator profiles, click 'Contact Creator', and submit a structured campaign brief with deliverables and proposed budget. A unique tracking reference ID (e.g. SC-ENQ-102938) is generated, and the brief is delivered directly to the creator.",
    },
    {
      question: "Can startups and local businesses hire creators for Barter or Gifting collaborations?",
      answer: "Absolutely. Many creators on thebrandsstory. explicitly display the 'Barter Available' badge. Brands can filter specifically for barter-friendly influencers in their city for restaurant launches, product unboxings, and gifting campaigns.",
    },
    {
      question: "Does thebrandsstory. take a commission cut from creator fees?",
      answer: "For standard direct marketplace connections and free creator profiles, thebrandsstory. charges 0% commission. Full commercial payments agreed upon between the brand and creator go directly to the creator.",
    },
  ];

  return (
    <div className="py-16 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Testimonials */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Verified Brand & Creator Stories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Trusted by India's Top Marketers & Creators
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-white/10 transition duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex text-amber-400 text-sm">
                    {'★'.repeat(test.rating)}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
                    "{test.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <img
                    src={test.avatar}
                    alt={test.author}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {test.author}
                    </h4>
                    <p className="text-[11px] text-slate-400">{test.role}</p>
                    <span className="text-[10px] text-blue-400 font-semibold">{test.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8 pt-8 border-t border-white/10 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Clear Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-blue-300 transition cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {openFaqIndex === idx && (
                  <div className="p-5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/5 font-normal">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
