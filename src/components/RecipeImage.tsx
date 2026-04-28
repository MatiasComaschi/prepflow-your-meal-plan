import { useEffect, useState } from "react";
import { getCachedImage, getOrGenerateRecipeImage } from "@/lib/imageCache";

type Props = {
  recipeId: string;
  recipeName: string;
  fallback?: string;
  alt: string;
  eager?: boolean;
  className?: string;
};

export function RecipeImage({
  recipeId,
  recipeName,
  fallback,
  alt,
  eager,
  className,
}: Props) {
  const cached = getCachedImage(recipeId);
  const [src, setSrc] = useState<string | null>(cached);
  const [loaded, setLoaded] = useState<boolean>(Boolean(cached));

  useEffect(() => {
    let cancelled = false;
    const existing = getCachedImage(recipeId);
    if (existing) {
      setSrc(existing);
      return;
    }
    setSrc(null);
    setLoaded(false);
    getOrGenerateRecipeImage(recipeId, recipeName)
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled && fallback) setSrc(fallback);
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId, recipeName, fallback]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {/* Shimmer placeholder */}
      {!loaded && (
        <div className="absolute inset-0 shimmer-bg" aria-hidden="true" />
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          width={832}
          height={1216}
          loading={eager ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
