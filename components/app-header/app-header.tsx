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
import OrganizationSwitcherModal from "../organization-switcher/organization-switcher";
import { useState } from "react";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { useOrganization } from "@/context/organization-context";

export default function AppHeader() {
  const pathname = usePathname();
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const { myOrganizations } = useOrganization();

  const hasMultipleOrgs = myOrganizations && myOrganizations.length > 1;

  const showNavigation = ["/ads", "/search", "/my-ads", "/proxies"].includes(
    pathname,
  );
  const phoneNumber = (pathname === "/about_us" || pathname === "/") && (
    <Typography>+7 701 127 7607</Typography>
  );

  return (
    <Box
      sx={{
        width: "100%",
        py: 2.5,
        px: { xs: 3, md: 5 },
        mb: 5,
        borderBottom: "1px solid",
        borderColor: "grey.400",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
      >
        <Image height={36.5} src="/logo.jpeg" />
        <Box>
          <Stack direction="row" alignItems="center" gap={3}>
            <SignedOut>
              {phoneNumber}
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
                  <Link
                    target="_self"
                    href="/proxies"
                    isActive={pathname === "/proxies"}
                  >
                    Прокси
                  </Link>
                </>

                {!hasMultipleOrgs && <UserButton></UserButton>}

                {hasMultipleOrgs && (
                  <UserButton>
                    <UserButton.MenuItems>
                      <UserButton.Action
                        label="Сменить организацию"
                        labelIcon={<ApartmentIcon fontSize="small" />}
                        onClick={() => setOrgModalOpen(true)}
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                )}

                <OrganizationSwitcherModal
                  open={orgModalOpen}
                  onClose={() => setOrgModalOpen(false)}
                />
              </Stack>
            </SignedIn>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
