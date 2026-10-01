import React from 'react';

const REVIEWS = [
  {
    name: "Elena Rostova",
    title: "Lead OSINT Researcher",
    review: "The ELA opacity blend slider is a game-changer. It effortlessly reveals spliced document headers that other tools missed."
  },
  {
    name: "Marcus Vance",
    title: "Digital Forensics Examiner",
    review: "The 2D FFT spectrum flawlessly exposes high-frequency diffusion upsampling grids. Absolutely vital for modern synthetic detection."
  },
  {
    name: "Sarah Lin",
    title: "Investigative Photojournalist",
    review: "I value the non-definitive uncertainty callout. It prevents reckless false accusations on social media photos while still providing solid evidence."
  },
  {
    name: "Dr. Aris Thorne",
    title: "Computer Vision Researcher",
    review: "Commendable multi-signal fusion model. It's a massive leap forward compared to the typical single-detector black boxes."
  },
  {
    name: "David K.",
    title: "Fact-Checking Lead, Global Newsroom",
    review: "The speed of the in-memory analysis pipeline is incredible. We can verify breaking news images almost instantly."
  },
  {
    name: "Maya Patel",
    title: "Digital Preservation Specialist",
    review: "The zero-retention privacy policy and in-browser JSON evidence export make this the most secure tool in our arsenal."
  }
];

export default function ReviewScroll() {
  return (
    <div className="w-full overflow-hidden space-y-8 py-10 mt-16 max-w-7xl mx-auto">
      <div className="text-center px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Trusted by Investigative & Forensic Professionals</h2>
        <p className="text-slate-600 mt-3 text-sm md:text-base max-w-2xl mx-auto">See how analysts use TrueLens's multi-signal verification to audit digital imagery.</p>
      </div>

      <div className="relative flex overflow-x-hidden w-full group py-4">
        <div className="flex w-max animate-marquee space-x-6 px-3">
          {[...REVIEWS, ...REVIEWS].map((review, idx) => (
            <div 
              key={idx}
              className="bg-white/75 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-sm min-w-[340px] max-w-[380px] flex-shrink-0 flex flex-col justify-between"
            >
              <p className="text-slate-700 leading-relaxed text-sm italic mb-4">"{review.review}"</p>
              <div>
                <p className="text-slate-900 font-bold text-sm">{review.name}</p>
                <p className="text-blue-600 text-xs font-semibold">{review.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
