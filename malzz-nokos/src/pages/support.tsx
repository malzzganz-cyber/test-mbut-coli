import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, MessageCircle } from "lucide-react";

export default function Support() {
  const faqs = [
    { q: "How fast is the OTP delivery?", a: "OTPs are delivered in real-time. Our system polls the provider every 5 seconds. Usually it arrives within 10-30 seconds." },
    { q: "What if the OTP doesn't arrive?", a: "You can cancel the order if the OTP doesn't arrive within the expected timeframe. Your balance will be fully refunded automatically." },
    { q: "How to top up my balance?", a: "Go to the Deposit page, enter the amount, and scan the generated QRIS with any Indonesian e-wallet or banking app. Your balance will be credited instantly upon successful payment." },
    { q: "Can I withdraw my balance?", a: "Balance withdrawals are not supported for regular users. Make sure to only deposit what you plan to use." }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background pb-32">
      <div className="max-w-[420px] mx-auto p-4 pt-8 flex flex-col gap-6">
        <h1 className="text-3xl font-black border-b-4 border-black pb-2 inline-block self-start">Support</h1>

        <div className="flex flex-col gap-4">
          <a href="mailto:support@malzznokos.com" className="brutal-card bg-secondary p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 bg-white rounded-full border-2 border-black flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg">Email Us</p>
              <p className="text-sm font-medium">support@malzznokos.com</p>
            </div>
          </a>
          
          <a href="#" className="brutal-card bg-green-300 p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 bg-white rounded-full border-2 border-black flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg">WhatsApp / Telegram</p>
              <p className="text-sm font-medium">Coming soon</p>
            </div>
          </a>
        </div>

        <h2 className="text-2xl font-bold mt-4">FAQ</h2>
        
        <div className="brutal-card bg-white p-2">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b-2 border-black last:border-0">
                <AccordionTrigger className="font-bold text-left hover:no-underline py-4 px-2 text-lg">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-medium text-gray-700 px-2 pb-4 text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
    </motion.div>
  );
}
