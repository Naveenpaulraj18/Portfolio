"use client";

export default function LandingPage() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
      >
        <source src="/bird.mp4" type="video/mp4" />
      </video>

      {/* Overlay (dark gradient for text contrast) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent -z-10"></div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-20 text-white">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            TRANSFORM YOUR <span className="text-blue-500">BODY</span>,<br />
            EMPOWER YOUR LIFE
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            Join BluePulse Fitness and start your journey to a healthier,
            stronger you.
          </p>

          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition">
              BOOK A FREE TRIAL
            </button>
            <button className="border border-white hover:bg-white hover:text-black font-semibold px-6 py-3 rounded-lg transition">
              VIEW PLANS
            </button>
          </div>
        </div>
      </div>

      {/* Bottom shape (angled white design like in your image) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          viewBox="0 0 500 100"
          preserveAspectRatio="none"
          className="w-full h-24 fill-white"
        >
          <path d="M0,100 C150,0 350,0 500,100 L500,100 L0,100 Z"></path>
        </svg>
      </div>
    </section>
  );
}
