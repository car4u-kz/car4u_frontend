"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { usePathname } from "next/navigation";

import { Box, Stack } from "@mui/material";

import { Image, Button, Link, Typography } from "@/components";

export default function AppHeader() {
  const pathname = usePathname();
  const showNavigation = ["/ads", "/search", "/my-ads"].includes(pathname);
  const phoneNumber = (pathname === "/about_us" || pathname === "/") && (
    <Typography>+7 701 127 7607</Typography>
  );

  return (
    <Box
      sx={{
        py: 2.5,
        px: 10,
        mb: 5,
        borderBottom: "1px solid",
        borderColor: "grey.400",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        gap={1}
      >
        <Image height={36.5} src="/logo.jpeg" />
        <Box>
          <Stack direction="row" alignItems="center" gap={3}>
            {phoneNumber}
            <SignedOut>
              <SignInButton>
                <span>
                  <Button variant="contained" sx={{ bgcolor: "common.black" }}>
                    Войти
                  </Button>
                </span>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Stack
                direction="row"
                justifyContent="space-around"
                alignItems="center"
                gap={1}
              >
                {showNavigation && (
                  <>
                    <Link
                      target="_self"
                      href="/ads"
                      isActive={pathname === "/ads"}
                    >
                      Объявления
                    </Link>
                    <Link
                      target="_self"
                      href="/search"
                      isActive={pathname === "/search"}
                    >
                      Поиски
                    </Link>
                    <Link
                      target="_self"
                      href="/my-ads"
                      isActive={pathname === "/my-ads"}
                    >
                      Мои Объявления
                    </Link>
                  </>
                )}
                <UserButton />
              </Stack>
            </SignedIn>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
