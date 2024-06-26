import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// Function to refresh access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post('https://shecker-admin.com/api/auth/sign-in/refresh', {
      refresh: refreshToken,
    });
    const { access } = response.data;
    localStorage.setItem('accessToken', access);
    return access;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

// Function to verify access token
const verifyAccessToken = async (token) => {
  try {
    await axios.post('https://shecker-admin.com/api/auth/sign-in/verify', {
      token,
    });
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

// Function to fetch all refrigerators
const fetchRefrigerators = async (setRefrigerators) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    const response = await axios.get('https://shecker-admin.com/api/fridge/admin/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    setRefrigerators(response.data);
  } catch (error) {
    if (error.response) {
      if (error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      }
    } else if (error.request) {
      console.error('Error fetching refrigerators: No response received');
    } else {
      console.error('Error fetching refrigerators:', error.message);
    }
  }
};

// Function to add a new user
const addUser = async (userData) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    await axios.post('https://shecker-admin.com/api/fridge/admin/', userData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    alert('User added successfully!');
  } catch (error) {
    if (error.response) {
      if (error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      }
    } else if (error.request) {
      console.error('Error adding user: No response received');
    } else {
      console.error('Error adding user:', error.message);
    }
  }
};

// Function to update a user
const updateUser = async (userData) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    await axios.put(`https://shecker-admin.com/api/fridge/admin/${userData.account}/`, userData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    alert('User updated successfully!');
  } catch (error) {
    if (error.response) {
      if (error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      }
    } else if (error.request) {
      console.error('Error updating user: No response received');
    } else {
      console.error('Error updating user:', error.message);
    }
  }
};

// Function to delete a user
const deleteUser = async (accountId) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const isTokenValid = await verifyAccessToken(accessToken);

    if (!isTokenValid) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Unable to refresh access token');
      }
    }

    await axios.delete(`https://shecker-admin.com/api/fridge/admin/${accountId}/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    alert('User deleted successfully!');
  } catch (error) {
    if (error.response) {
      if (error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      }
    } else if (error.request) {
      console.error('Error deleting user: No response received');
    } else {
      console.error('Error deleting user:', error.message);
    }
  }
};

export default function UserPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('account');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refrigerators, setRefrigerators] = useState([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ account: '', address: '', owner: '' });
  const [editUser, setEditUser] = useState({ account: '', address: '', owner: '' });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchRefrigerators(setRefrigerators);
  }, []);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = refrigerators.map((n) => n.account);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleAddUserOpen = () => {
    setIsAddUserOpen(true);
  };

  const handleAddUserClose = () => {
    setIsAddUserOpen(false);
    setNewUser({ account: '', address: '', owner: '' });
  };

  const handleEditUserOpen = (user) => {
    setEditUser(user);
    setIsEditUserOpen(true);
  };

  const handleEditUserClose = () => {
    setIsEditUserOpen(false);
    setEditUser({ account: '', address: '', owner: '' });
  };

  const handleUserChange = (event) => {
    const { id, value } = event.target;
    setNewUser({ ...newUser, [id]: value });
  };

  const handleEditUserChange = (event) => {
    const { id, value } = event.target;
    setEditUser({ ...editUser, [id]: value });
  };

  const handleAddUser = async () => {
    await addUser(newUser);
    handleAddUserClose();
    fetchRefrigerators(setRefrigerators);
  };

  const handleEditUser = async () => {
    await updateUser(editUser);
    handleEditUserClose();
    fetchRefrigerators(setRefrigerators);
  };

  const handleDeleteUser = async (account) => {
    await deleteUser(account);
    fetchRefrigerators(setRefrigerators);
  };

  const dataFiltered = applyFilter({
    inputData: refrigerators,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Пользователи</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleAddUserOpen}
        >
          Добавить
        </Button>
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          onDelete={() => selected.forEach(handleDeleteUser)}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: isSmallScreen ? 200 : 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={refrigerators.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'account', label: 'ID' },
                  { id: 'address', label: 'Адрес' },
                  { id: 'owner', label: 'Владелец', align: 'center' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <UserTableRow
                      key={row.account}
                      account={row.account}
                      address={row.address}
                      owner={row.owner}
                      selected={selected.indexOf(row.account) !== -1}
                      handleClick={(event) => handleClick(event, row.account)}
                      handleEdit={() => handleEditUserOpen(row)}
                      handleDelete={() => handleDeleteUser(row.account)}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, refrigerators.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={refrigerators.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onClose={handleAddUserClose}>
        <DialogTitle>Добавить пользователя</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="ID"
              id="account"
              value={newUser.account}
              onChange={handleUserChange}
            />
            <TextField
              label="Адрес"
              id="address"
              value={newUser.address}
              onChange={handleUserChange}
            />
            <TextField
              label="Владелец"
              id="owner"
              value={newUser.owner}
              onChange={handleUserChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddUserClose} color="primary">
            Отмена
          </Button>
          <Button onClick={handleAddUser} color="primary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserOpen} onClose={handleEditUserClose}>
        <DialogTitle>Изменить данные пользователя</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="ID"
              id="account"
              value={editUser.account}
              onChange={handleEditUserChange}
            />
            <TextField
              label="Адрес"
              id="address"
              value={editUser.address}
              onChange={handleEditUserChange}
            />
            <TextField
              label="Владелец"
              id="owner"
              value={editUser.owner}
              onChange={handleEditUserChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditUserClose} color="primary">
            Отмена
          </Button>
          <Button onClick={handleEditUser} color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
