import React from 'react';
import { HelpCircle, Mail, MessageCircle, Phone } from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#051126] text-slate-200 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#D4A338]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D4A338]/30">
            <HelpCircle className="w-8 h-8 text-[#D4A338]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Help & Support</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            We are here to help you. Find answers to common questions or reach out to our support team directly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 hover:bg-white/10 transition cursor-pointer">
            <MessageCircle className="w-6 h-6 text-[#8eb6ff]" />
            <h3 className="font-bold text-white">Live Chat</h3>
            <p className="text-xs text-slate-400">Chat with our support team in real-time for quick resolutions.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 hover:bg-white/10 transition cursor-pointer">
            <Mail className="w-6 h-6 text-[#D4A338]" />
            <h3 className="font-bold text-white">Email Support</h3>
            <p className="text-xs text-slate-400">Send us an email anytime and we will get back to you within 24 hours.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 hover:bg-white/10 transition cursor-pointer">
            <Phone className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-white">Call Us</h3>
            <p className="text-xs text-slate-400">Speak directly with our customer success managers during business hours.</p>
          </div>
        </div>

        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400">
            Our comprehensive FAQ section is currently being updated to serve you better. 
            Please check back soon or contact us through the channels above.
          </p>
        </div>
      </div>
    </div>
  );
};
