import FeatureSection from "@/components/home/features";
import Industry from "@/components/home/industry";
import Landing from "@/components/home/landing";
import { TechStack } from "@/components/home/techStack";
import { VelocityScroll } from "@/components/ui/scroll-based-velocity";

export default function Home() {
  return (
    <>
      <Landing />
      <VelocityScroll>• Safety • Protection • Trust</VelocityScroll>
      <FeatureSection />
      <Industry />
      <TechStack />
    </>
  );
}
