import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (lng) => {
        if (lng) {
            i18n.changeLanguage(lng);
        }
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title="Change Language">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={open ? 'language-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <LanguageIcon sx={{ width: 32, height: 32 }} />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                id="language-menu"
                open={open}
                onClose={() => handleClose()}
                onClick={() => handleClose()}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => handleClose('en')} selected={i18n.language === 'en'}>
                    <span style={{ marginRight: '10px', fontSize: '1.2em' }}>🇺🇸</span> English
                </MenuItem>
                <MenuItem onClick={() => handleClose('es')} selected={i18n.language === 'es'}>
                    <span style={{ marginRight: '10px', fontSize: '1.2em' }}>🇪🇸</span> Español
                </MenuItem>
                <MenuItem onClick={() => handleClose('fr')} selected={i18n.language === 'fr'}>
                    <span style={{ marginRight: '10px', fontSize: '1.2em' }}>🇫🇷</span> Français
                </MenuItem>
            </Menu>
        </>
    );
};

export default LanguageSwitcher;
