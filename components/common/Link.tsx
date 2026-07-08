"use client";
import NextLink from "next/link";

type Props = {
  href: string;
  target?: "_blank" | "_parent" | "_self" | "_top";
  children: string | React.ReactElement;
  isActive?: boolean;
  disablePadding?: boolean;
};

export default function Link({
  isActive = false,
  disablePadding = false,
  children,
  href,
  target = "_blank",
}: Props) {
  const style = isActive ? { backgroundColor: "black", color: "white" } : {};

  return (
    <NextLink
      style={{
        ...style,
        padding: disablePadding ? 0 : "4px 8px",
        borderRadius: disablePadding ? 0 : "8px",
      }}
      href={href}
      target={target}
    >
      {children}
    </NextLink>
  );
}
