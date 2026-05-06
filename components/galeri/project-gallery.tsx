'use client';

import * as React from 'react';
import Image from 'next/image';
import { Lightbox } from './lightbox';

interface Props {
  images: string[];
  alt: string;
}

export function ProjectGallery({ images, alt }: Props) {
  const [open, setOpen] = React.useState(false);
  const [idx, setIdx] = React.useState(0);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setIdx(i);
              setOpen(true);
            }}
            className="relative aspect-square overflow-hidden rounded-xl"
            aria-label={`Görsel ${i + 1} önizle`}
          >
            <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="(max-width:640px) 50vw, 33vw" className="object-cover transition-transform hover:scale-105" />
          </button>
        ))}
      </div>
      <Lightbox open={open} images={images} index={idx} alt={alt} onClose={() => setOpen(false)} onChangeIndex={setIdx} />
    </>
  );
}
