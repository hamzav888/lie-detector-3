import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import HowItWorks from "@/components/HowItWorks";
import WhyFun from "@/components/WhyFun";
import InteractiveTeaser from "@/components/InteractiveTeaser";
import SocialProof from "@/components/SocialProof";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const MARQUEE_WORDS = [
  "CHALLENGE YOUR FRIENDS",
  "WHO’S THE BEST LIAR?",
  "SCREENSHOT THE CHAOS",
  "TWO PEOPLE · ONE PHONE",
  "THE NEEDLE HAS NO CHILL",
  "CAUGHT!!",
];

export default function Home() {
  return (
    <>
      <a
        href="#join"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:border-[3px] focus:border-ink focus:bg-lime focus:px-4 focus:py-2 focus:font-display focus:font-extrabold"
      >
        Skip to waitlist signup
      </a>

      <Nav />
      <main>
        <Hero />
        <Marquee items={MARQUEE_WORDS} className="bg-lime text-ink" />
        <HowItWorks />
        <WhyFun />
        <InteractiveTeaser />
        <Marquee items={MARQUEE_WORDS} className="bg-sun text-ink" />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
