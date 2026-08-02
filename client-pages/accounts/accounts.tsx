"use client";

import { useMemo, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Modal, Table } from "@/components";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import {
  deleteAccount,
  getManagedAccounts,
  type AccountManagementItem,
} from "@/services/account-services";

import TableRows from "./components/table-rows";

const headerLabels = ["ID", "Логин", "Активное объявление", "Объявление", ""];

const AccountsPage = () => {
  const fetchWithAuth = useFetchWithAuth();
  const [selectedAccount, setSelectedAccount] =
    useState<AccountManagementItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accountsQuery = useQuery({
    queryKey: ["managed-accounts"],
    queryFn: () => getManagedAccounts(fetchWithAuth),
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (accountId: number) => deleteAccount(accountId, fetchWithAuth),
    onSuccess: async () => {
      handleCloseDelete();
      await accountsQuery.refetch();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
    },
  });

  const sortedItems = useMemo(
    () =>
      [...(accountsQuery.data ?? [])].sort((a, b) =>
        a.login.localeCompare(b.login, "ru"),
      ),
    [accountsQuery.data],
  );

  const handleOpenDelete = (item: AccountManagementItem) => {
    setSelectedAccount(item);
    setError(null);
  };

  const handleCloseDelete = () => {
    setSelectedAccount(null);
    setError(null);
  };

  const handleDelete = () => {
    if (!selectedAccount) {
      return;
    }

    deleteMutation.mutate(selectedAccount.id);
  };

  return (
    <>
      <Table
        title="Аккаунты"
        isFetching={accountsQuery.isPending}
        headerLabels={headerLabels}
        tableRows={
          <TableRows items={sortedItems} onDelete={handleOpenDelete} />
        }
        tableButtons={
          <Box sx={{ p: 0.5, pl: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Всего аккаунтов: {sortedItems.length}
            </Typography>
          </Box>
        }
      />

      <Modal
        open={!!selectedAccount}
        title="Удалить аккаунт"
        submitLabel="Удалить"
        cancelLabel="Отмена"
        onClose={handleCloseDelete}
        onSubmit={handleDelete}
        isLoading={deleteMutation.isPending}
      >
        <Stack direction="column" gap={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {selectedAccount?.hasActiveOurAd ? (
            <Alert severity="warning">
              У аккаунта есть активное мое объявление. При удалении аккаунта
              связанные данные объявления также будут удалены.
            </Alert>
          ) : null}
          <Typography>
            Удалить аккаунт <strong>{selectedAccount?.login}</strong>?
          </Typography>
        </Stack>
      </Modal>
    </>
  );
};

export default AccountsPage;
