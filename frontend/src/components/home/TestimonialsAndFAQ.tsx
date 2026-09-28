import React, { useRef, useState } from 'react';
import { Star, ChevronDown, ChevronUp, ShieldCheck, Quote, HelpCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const TestimonialsAndFAQ: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const testimonialsScrollRef = useRef<HTMLDivElement>(null);

  const scrollTestimonials = (direction: 'previous' | 'next') => {
    const container = testimonialsScrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: (direction === 'next' ? 1 : -1) * Math.max(container.clientWidth * 0.88, 280),
      behavior: 'smooth',
    });
  };

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
      quote: "As a food creator, getting direct inquiries from verified restaurants with clear budget expectations was game changing. My verified profile helped me close 14 paid collabs this quarter.",
      author: "Rahul Verma",
      role: "Food & Culinary Creator (@rahulverma)",
      city: "Noida",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
    {
      quote: "The transparency of rate cards and audience signals saved our startup weeks of manual outreach. The side-by-side comparison matrix makes team approvals effortless.",
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
      question: "What metrics are verified on thebrandsstory.?",
      answer: "thebrandsstory. evaluates creator profiles based on audience geography matching, phone/email verification, past campaign delivery track record, and verified brand client reviews.",
    },
    {
      question: "How do brands contact and collaborate with creators?",
      answer: "Brands can browse creator profiles, click 'Contact Creator', and submit a structured campaign brief with deliverables and proposed budget. A unique tracking reference ID is generated, and the brief is delivered directly to the creator.",
    },
    {
      question: "Do creators pay any fees when receiving deals or payments?",
      answer: "No, creators keep 100% of their agreed campaign compensation. thebrandsstory. does not take a percentage cut from creator payouts.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#071328] text-white border-b border-slate-800/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Testimonials */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[#D4A338] text-xs font-extrabold uppercase tracking-wider mb-1.5">
                <Quote className="w-3.5 h-3.5" />
                <span>USER EXPERIENCES</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Trusted by Top Brands & Creators
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollTestimonials('previous')}
                className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollTestimonials('next')}
                className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={testimonialsScrollRef}
            className="flex gap-5 overflow-x-auto snap-x no-scrollbar pb-4"
          >
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="w-[85vw] sm:w-[360px] md:w-[380px] bg-[#091b3b]/70 rounded-3xl p-6 border border-slate-700/80 flex flex-col justify-between shrink-0 snap-start space-y-4"
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{item.quote}"
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-700/50">
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="w-10 h-10 rounded-full object-cover border border-[#D4A338]/40"
                  />
                  <div>
                    <h4 className="font-extrabold text-white text-xs">{item.author}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{item.role} · {item.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A338]/15 text-[#D4A338] text-xs font-bold uppercase tracking-wider border border-[#D4A338]/30">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Everything You Need to Know
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#091b3b]/70 rounded-2xl border border-slate-700/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-white hover:text-[#D4A338] transition cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#D4A338] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-700/50 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
