import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { CtaBand, Faq, Features, HowItWorks, Trust } from "@/components/landing/Sections";

export default function Landing() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Trust />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
