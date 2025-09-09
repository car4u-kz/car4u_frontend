import { MoreVert } from '@mui/icons-material'
import { TableCell, Menu, MenuItem } from '@mui/material'
import React, { useState } from 'react'
import { IconButton } from '..'
import { generateReport } from '@/services/ad-services';
import { useFetchWithAuth } from '@/hooks/use-fetch-with-auth';

const menuItems = [{ label: "Сформировать отчёт", value: "generateReport" }];

interface Props {
    index: number,
    itemId: number,
    isOurAd?: boolean
}

export default function GeneratePDFDropdown({ index, itemId, isOurAd }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const fetchWithAuth = useFetchWithAuth();

    const open = Boolean(anchorEl);
    const handleMenuOpen = (
        event: React.MouseEvent<HTMLElement>,
        idx: number
    ) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(idx);
    };


    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const handleMenuItemClick = async (item: {
        label: string;
        value: string;
        id: number;
    }) => {
        if (item.value === "generateReport") {
            await generateReport(item.id, fetchWithAuth, isOurAd);
        }
        handleMenuClose();
    };
    return (
        <TableCell sx={{ padding: '0' }}>
            <IconButton onClick={(e) => handleMenuOpen(e, index)}>
                <MoreVert />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open && selectedRow === index}
                onClose={handleMenuClose}
            >
                {menuItems.map((menuItem, i) => (
                    <MenuItem
                        key={i}
                        onClick={() =>
                            handleMenuItemClick({ ...menuItem, id: itemId })
                        }
                    >
                        {menuItem.label}
                    </MenuItem>
                ))}
            </Menu>
        </TableCell>
    )
}
