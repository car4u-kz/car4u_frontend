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
} from "@mui/material";
import { useOrganizationManager } from "@/hooks/use-organization-manager";
import { useBackendAuthContext } from "@/context/auth-context";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OrganizationSwitcherModal({ open, onClose }: Props) {
  const { organizations, activeOrganizationId, setActiveOrganization } =
    useOrganizationManager();

  const { userRole } = useBackendAuthContext();

  const handleSelect = (orgId: string) => {
    debugger;
    console.log(userRole)
    if (orgId !== activeOrganizationId) {
      setActiveOrganization(orgId);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{ fontSize: 18, fontWeight: 500, color: "text.primary" }}
      >
        Сменить организацию
      </DialogTitle>

      <DialogContent dividers>
        {organizations?.length ? (
          <List disablePadding>
            {organizations.map((org) => {
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
                      {org.name?.[0].toUpperCase() || "O"}
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
        ) : (
          <Typography variant="body2" color="text.secondary">
            Организации не найдены
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" size="small">
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
}
