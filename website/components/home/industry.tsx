"use client";
import { HoverEffect } from "../ui/card-hover-effect";

export default function Industry() {
    return (
        <div className="mx-auto px-8 max-w-5xl">
            <h2 className="mb-10 md:mb-12 font-extrabold text-3xl md:text-4xl lg:text-5xl text-center">
                Industry Applications
            </h2>
            <HoverEffect items={industryUseCases} />
        </div>
    );
}

export const industryUseCases = [
    {
        title: "Manufacturing Plants",
        description:
            "Monitor PPE compliance on factory floors, detect unsafe machinery zones, and alert in real time to reduce injuries.",
    },
    {
        title: "Construction Sites",
        description:
            "Detect missing helmets and vests, monitor falls or unsafe movements, and ensure workers follow site protocols.",
    },
    {
        title: "Oil & Gas Facilities",
        description:
            "Surveillance in hazardous zones with detection of fire suits, gas masks, and intrusion in restricted pipelines or tanks.",
    },
    {
        title: "Warehousing & Logistics",
        description:
            "Track warehouse personnel safety, detect unauthorized access to storage areas, and analyze worker movement.",
    },
    {
        title: "Chemical & Hazardous Material Zones",
        description:
            "Ensure lab coats, gloves, and goggles are worn in high-risk labs and monitor behavior for chemical safety compliance.",
    },
    {
        title: "Smart Cities & Public Infrastructure",
        description:
            "Deploy in metro stations, bus depots, and power plants to analyze crowd safety, PPE, and emergency responses.",
    },
];