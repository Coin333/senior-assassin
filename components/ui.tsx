import { cn } from "@/lib/utils";
import {
  ReactNode,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";

export function PageHeader({
  title,
  subtitle,
  action,
  meta,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="px-6 md:px-10 pt-8 pb-6 border-b border-zinc-800/60">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {meta && (
            <div className="mb-2 text-[10px] font-mono tracking-[0.25em] text-zinc-500">
              {meta}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-50">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-zinc-400 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}

export function PageBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 md:px-10 py-6", className)}>{children}</div>;
}

export function Card({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-zinc-900/60 border border-zinc-800 rounded-xl backdrop-blur",
        glow && "glow-red",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-3 border-b border-zinc-800/80",
        className,
      )}
    >
      <div className="text-[11px] font-mono tracking-[0.2em] text-zinc-400 uppercase">
        {title}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  color?: "red" | "emerald" | "amber" | "indigo";
}) {
  const colorMap = {
    red: "text-red-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    indigo: "text-indigo-400",
  };
  return (
    <div className="px-5 py-4">
      <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 text-2xl font-bold tracking-tight",
          color ? colorMap[color] : "text-zinc-50",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    primary:
      "bg-red-500/15 border border-red-500/40 text-red-300 hover:bg-red-500/25 hover:border-red-500/60",
    secondary:
      "bg-zinc-800/80 border border-zinc-700 text-zinc-100 hover:bg-zinc-700/80",
    ghost:
      "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent",
    danger: "bg-red-600 hover:bg-red-500 text-white border border-red-500",
    outline: "border border-zinc-700 text-zinc-300 hover:bg-zinc-800/60",
  };
  const sizes = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3.5 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-sm gap-2",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-zinc-950/60 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600",
        "focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full bg-zinc-950/60 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 resize-none",
        "focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full bg-zinc-950/60 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100",
        "focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "block text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1.5",
        className,
      )}
    >
      {children}
    </label>
  );
}

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "red" | "emerald" | "amber" | "indigo" | "outline";
}) {
  const variants = {
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
    red: "bg-red-500/10 text-red-400 border-red-500/30",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    outline: "bg-transparent text-zinc-400 border-zinc-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wider uppercase border",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Empty({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: any;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-xl mb-3">
        <Icon className="w-6 h-6 text-zinc-500" />
      </div>
      <h3 className="text-base font-semibold text-zinc-300">{title}</h3>
      {hint && <p className="mt-1 text-sm text-zinc-500 max-w-xs">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="h-px bg-zinc-800/60" />;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-zinc-800/60" />
      <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-600 uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-zinc-800/60" />
    </div>
  );
}
