import { useState } from 'react';
import { Button, Dialog, DialogContent } from '@mui/material';
import AccountPage from '../pages/AccountPage';

export default function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button color="inherit" onClick={() => setOpen(true)}>
        {user.username}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogContent>
          <AccountPage user={user} onLogout={onLogout} />
        </DialogContent>
      </Dialog>
    </>
  );
}