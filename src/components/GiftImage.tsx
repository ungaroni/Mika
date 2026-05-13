import { useState } from 'react';

export function GiftImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div className="aspect-square w-full bg-gradient-to-br from-cream-100 to-peach-100 flex items-center justify-center text-5xl">
        🎁
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className="aspect-square w-full object-cover"
      loading="lazy"
    />
  );
}
