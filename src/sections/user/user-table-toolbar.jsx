import { useState } from 'react';
import PropTypes from 'prop-types';

import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableToolbar({ numSelected, filterName, onFilterName, onDelete }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleOpenDeleteModal = () => {
    setIsDeleteOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const handleConfirmDelete = () => {
    onDelete();
    handleCloseDeleteModal();
  };

  return (
    <>
      <Toolbar
        sx={{
          height: 96,
          display: 'full',
          justifyContent: 'space-between',
          p: (theme) => theme.spacing(0, 1, 0, 3),
          ...(numSelected > 0 && {
            color: 'primary.main',
            bgcolor: 'primary.lighter',
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography component="div" variant="subtitle1">
            {numSelected} selected
          </Typography>
        ) : (
          <OutlinedInput
            value={filterName}
            onChange={onFilterName}
            placeholder="Поиск..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled', width: 20, height: 20 }}
                />
              </InputAdornment>
            }
          />
        )}

        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton onClick={handleOpenDeleteModal}>
              <Iconify icon="eva:trash-2-fill" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton>
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onClose={handleCloseDeleteModal}>
        <DialogTitle>Удалить информацию</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы уверены, что хотите удалить выбранные элементы?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} color="primary">
            Отмена
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

UserTableToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onDelete: PropTypes.func,
};
