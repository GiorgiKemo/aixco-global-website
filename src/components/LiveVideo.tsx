type LiveVideoProps = {
  src: string;
  title: string;
  poster?: string;
  className?: string;
  videoClassName?: string;
};

export function LiveVideo({
  src,
  title,
  poster,
  className = "",
  videoClassName = "",
}: LiveVideoProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-black shadow-soft ${className}`}>
      <video
        src={src}
        poster={poster}
        aria-label={title}
        title={title}
        className={`h-full w-full object-cover ${videoClassName}`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onCanPlay={(event) => {
          if (event.currentTarget.paused) {
            void event.currentTarget.play().catch(() => undefined);
          }
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      <div className="pointer-events-none absolute left-4 top-4 h-2 w-2 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.75)]" />
    </div>
  );
}
