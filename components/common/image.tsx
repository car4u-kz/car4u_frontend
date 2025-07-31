import NextImage from "next/image";

type Props = {
  width?: number;
  height?: number;
  src: string;
  alt?: string;
  style?: Record<string, string | number>;
};

export default function Image({
  width = 160,
  height = 120,
  src = "/no-image.png",
  alt = "image-photo",
  style,
}: Props) {
  return (
    <NextImage
      style={{ borderRadius: "2px", ...style }}
      width={width}
      height={height}
      src={src}
      alt={alt}
    />
  );
}
