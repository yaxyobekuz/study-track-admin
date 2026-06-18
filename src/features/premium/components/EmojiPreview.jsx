// Lottie
import Lottie from "lottie-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

/**
 * Renders a lottie-react animation fetched from a public URL (S3).
 * @param {object} props
 * @param {string} props.url - Animation .json URL.
 * @param {string} [props.className] - Size/styling classes.
 */
const EmojiPreview = ({ url, className = "size-10" }) => {
  const { data: animationData } = useQuery({
    enabled: !!url,
    queryKey: ["lottie", url],
    staleTime: Infinity,
    queryFn: () => fetch(url).then((res) => res.json()),
  });

  if (!url) return null;
  if (!animationData) {
    return <div className={`${className} rounded-md bg-gray-100 animate-pulse`} />;
  }

  return (
    <Lottie
      loop
      autoplay
      animationData={animationData}
      className={`shrink-0 ${className}`}
    />
  );
};

export default EmojiPreview;
