export default function Home() {
  return (
    <>
      {/* Hero with video background — true full screen, ignores all parent padding/max-width */}
      <div
        className="fixed inset-0 flex flex-col items-center justify-center text-center overflow-hidden z-0"
      >
        {/* Video background */}
        <video
          src="https://anvara-production.nyc3.cdn.digitaloceanspaces.com/anvara%20main%20video.webm"
          poster="https://framerusercontent.com/images/KYRjVQomdYUZ2chnyyO3PMxWnY.webp?width=2560&height=1440"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-4xl mx-auto">
          <h1 className="mb-4 text-4xl font-bold text-white">Welcome to Anvara</h1>
          <p className="mb-8 max-w-md text-white/80">
            The sponsorship marketplace connecting sponsors with publishers.
          </p>
          <a
            href="/login"
            className="rounded-2xl bg-[#4057FE] px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity mb-16"
          >
            Get Started
          </a>

          {/* Feature cards — inside the video hero */}
          <div className="grid gap-6 text-left sm:grid-cols-2 w-full">
            <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 text-white">
              <h2 className="mb-2 text-lg font-semibold text-white">For Sponsors</h2>
              <p className="text-sm text-white/70">
                Create campaigns, set budgets, and reach your target audience through premium
                publishers.
              </p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 text-white">
              <h2 className="mb-2 text-lg font-semibold text-white">For Publishers</h2>
              <p className="text-sm text-white/70">
                List your ad slots, set your rates, and connect with sponsors looking for your
                audience.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Spacer so the page has height for footer to scroll below */}
      <div className="h-dvh" />
    </>
  );
}
