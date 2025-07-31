"use client";
import NextLink from "next/link";

type Props = {
  href: string;
  target?: "_blank" | "_parent" | "_self" | "_top";
  children: string | React.ReactElement;
  isActive?: boolean;
};

export default function Link({
  isActive = false,
  children,
  href,
  target = "_blank",
}: Props) {
  const style = isActive ? { backgroundColor: "black", color: "white" } : {};

  return (
    <NextLink
      style={{ ...style, padding: "4px 8px", borderRadius: "8px" }}
      href={href}
      target={target}
    >
      {children}
    </NextLink>
  );
}
