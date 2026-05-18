import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 40,
  className,
  status,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  status?: string | null;
}) {
  const statusRing = {
    alive: "ring-emerald-500/60",
    eliminated: "ring-zinc-700",
    eliminated_me: "ring-red-500/60",
  } as Record<string, string>;

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-zinc-200 font-semibold overflow-hidden ring-1",
          status && statusRing[status] ? statusRing[status] : "ring-zinc-800",
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials(name)}</span>
        )}
      </div>
      {status === "alive" && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
      )}
      {status === "eliminated" && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-zinc-600 ring-2 ring-zinc-950" />
      )}
    </div>
  );
}
