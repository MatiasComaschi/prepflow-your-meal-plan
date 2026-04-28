import { useEffect, useState } from "react";
import { getCachedImage, getOrGenerateRecipeImage, setCachedImage } from "@/lib/imageCache";

type Props = {
  recipeId: string;
  recipeName: string;
  /** Pre-generated image URL from server cache (Supabase storage). Preferred. */
  preferred?: string;
  fallback?: string;
  alt: string;
  eager?: boolean;
  className?: string;
};

function isUsable(url?: string | null): url is string {
  return !!url && url.length > 0 && !url.startsWith("data:");
}

export function RecipeImage({
  recipeId,
  recipeName,
  preferred,
  fallback,
  alt,
  eager,
  className,
}: Props) {
  const initial =
    (isUsable(preferred) ? preferred : null) ?? getCachedImage(recipeId);
  const [src, setSrc] = useState<string | null>(initial);
  const [loaded, setLoaded] = useState<boolean>(Boolean(initial));

  useEffect(() => {
    let cancelled = false;
    if (isUsable(preferred)) {
      setCachedImage(recipeId, preferred);
      setSrc(preferred);
      return;
    }
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
  }, [recipeId, recipeName, preferred, fallback]);

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
