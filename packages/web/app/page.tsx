import { Header } from "@/components/ui/header-1";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks, Install } from "@/components/landing/how-install";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/blocks/footer-section";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Install />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
