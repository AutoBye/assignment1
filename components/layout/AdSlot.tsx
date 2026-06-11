import Image from "next/image";
import Link from "next/link";

type AdSlotProps = {
  position: "left" | "right";
};

export default function AdsSlot({ position }: AdSlotProps) {
  const imageSrc =
    position === "left" ? "/ads/sidebar-left.gif" : "/ads/sidebar-right.png";
  return (
      <aside
          className="sticky top-20 hidden h-150 w-80 shrink-0 overflow-hidden rounded-md border bg-background xl:block mr-10"
          aria-label={`${position} advertisement`}
      >
        <Link href="/posts">
          <Image
              src={imageSrc}
              alt="광고"
              width={648}
              height={2458}
              unoptimized
              className="h-150 w-80 object-cover"
          />
        </Link>
      </aside>
  );
}
