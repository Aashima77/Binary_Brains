import Link from "next/link";

import { subtitle, title } from "@/components/primitives";

export default function Landing() {
  return (
    <section className="flex flex-col justify-center items-center gap-4 py-8 md:py-10"
      style={{
      minHeight:"calc(100vh - 65px)"
    }}
    >
      <div className="inline-block justify-center max-w-xl font-roboto text-center">
        <span className={title()}>Make industries&nbsp;</span>
        <span className={title({ color: "green", class: "font-grotesk" })}>
          safer&nbsp;
        </span>
        <br />
        <span className={title()}> without manual monitoring. </span>
        <div className={subtitle({ class: "mt-4 max-w-md mx-auto" })}>
          Real-time, AI-powered CCTV analysis for PPE compliance and accident
          prevention.
        </div>
      </div>
      <div>
        <Link href="/login" className="bg-primary px-4 py-2 rounded-3xl font-grotesk text-secondary text-xl cursor-pointer">
          Get Started
        </Link>
      </div>
    </section>
  );
}
