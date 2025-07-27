import { IconCloud } from "@/components/ui/icon-cloud";

const slugs = [
    "typescript",
    "python",
    "react",
    "html5",
    "css3",
    "nodedotjs",
    "express",
    "nextdotjs",
    "postgresql",
    "vercel",
    "docker",
    "git",
    "github",
    "yolo",
    "twilio",
    "huggingface",
    "jsonwebtokens",
    "webrtc",
    "redis",
    "opencv",
];


export function TechStack() {
    const shuffledSlugs = [...slugs].sort(() => Math.random() - 0.5);
    const images = shuffledSlugs.map(
        (slug) => `https://cdn.simpleicons.org/${slug}/${slug}`,
    );

    return (
        <div className="relative flex flex-col justify-center items-center overflow-hidden">
            <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl text-center">
                Tech Stack
            </h2>
            <IconCloud images={images} />
        </div>
    );
}
