"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import { useOrganizationManager } from "@/hooks/use-organization-manager";
import { useBackendAuthContext } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { UserRole } from "@/types/user";
import { usePathname, useSearchParams } from "next/navigation";

interface Organization {
  id: string | number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OrganizationSwitcherModal({ open, onClose }: Props) {
  const {
    myOrganizations,
    activeOrganizationId,
    allOrganizations,
    setActiveOrganization,
  } = useOrganizationManager();
  const { userRole } = useBackendAuthContext();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [tab, setTab] = useState(0);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    if (!activeOrganizationId) return;

    const isInMy = myOrganizations?.some(
      (org) => org.id.toString() === activeOrganizationId
    );
    const isInAll = allOrganizations?.some(
      (org) => org.id.toString() === activeOrganizationId
    );

    if (!isInMy && isInAll) {
      setTab(1);
    } else {
      setTab(0);
    }
  }, [activeOrganizationId, myOrganizations, allOrganizations]);

  const handleSelect = (orgId: string) => {
    if (orgId !== activeOrganizationId) {
      const params = new URLSearchParams(searchParams);
  
      params.delete("templateId");
      const newUrl = `${pathname}?${params.toString()}`;
      window.history.pushState({}, "", newUrl);
      setActiveOrganization(orgId);
      onClose();
    }
  };

  const renderList = (orgs: Organization[], isMy: boolean) => {
    if (!orgs?.length) {
      return (
        <Typography variant="body2" color="text.secondary">
          Организации не найдены
        </Typography>
      );
    }

    const sortedOrgs = [...orgs].sort((a, b) => {
      if (a.id.toString() === activeOrganizationId) return -1;
      if (b.id.toString() === activeOrganizationId) return 1;
      return 0;
    });

    return (
      <List disablePadding>
        {sortedOrgs.map((org) => {
          const isActive = org.id.toString() === activeOrganizationId;
          return (
            <ListItemButton
              key={org.id}
              onClick={() => handleSelect(org.id.toString())}
              disabled={isActive}
              sx={{
                borderRadius: 1.5,
                mb: 1,
                bgcolor: isActive ? "grey.100" : "background.paper",
                color: "text.primary",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: isActive ? "grey.50" : "grey.200",
                },
                "&.Mui-disabled": {
                  opacity: 1,
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{ bgcolor: "primary.light", color: "text.primary" }}
                >
                  {org.name?.[0]?.toUpperCase() || "O"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={org.name}
                secondary={isActive ? "Текущая организация" : null}
              />
            </ListItemButton>
          );
        })}
      </List>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{ fontSize: 18, fontWeight: 500, color: "text.primary" }}
      >
        Сменить организацию
      </DialogTitle>

      {userRole === UserRole.Admin ? (
        <>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Мои организации" />
            <Tab label="Все организации" />
          </Tabs>
          <DialogContent dividers>
            {tab === 0 && myOrganizations && renderList(myOrganizations, true)}
            {tab === 1 &&
              allOrganizations &&
              (loadingAll ? (
                <Typography variant="body2">Загрузка...</Typography>
              ) : (
                renderList(allOrganizations, false)
              ))}
          </DialogContent>
        </>
      ) : (
        <DialogContent dividers>
          {myOrganizations && renderList(myOrganizations, true)}
        </DialogContent>
      )}

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" size="small">
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
}
