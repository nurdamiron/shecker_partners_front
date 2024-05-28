import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import { ref, onValue, off, set } from 'firebase/database';
import { database } from 'src/firebase_config'; // Adjust the import path according to your file structure

export default function FridgeCard({ fridge, index }) {
  const { account, address, owner, id } = fridge;
  const latestFridgeLarge = index === 0;
  const latestFridge = index === 1 || index === 2;

  const [doorStatus, setDoorStatus] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const fridgeRef = ref(database, `${id}/timer/timer`);
    const doorRef = ref(database, `${id}/door/doorOpen`);

    const timerListener = (snapshot) => {
      const timerValue = snapshot.val();
      setTimer(timerValue);
      setIsAvailable(Date.now() - timerValue < 20000);
    };

    const doorListener = (snapshot) => {
      const doorValue = snapshot.val();
      setDoorStatus(doorValue);
    };

    onValue(fridgeRef, timerListener);
    onValue(doorRef, doorListener);

    return () => {
      off(fridgeRef, 'value', timerListener);
      off(doorRef, 'value', doorListener);
    };
  }, [id]);

  const handleOpenDoor = () => {
    set(ref(database, `${id}/door/doorOpen`), 1);
  };

  const handleCloseDoor = () => {
    set(ref(database, `${id}/door/doorOpen`), 0);
  };

  const renderAccount = (
    <Link
      color="inherit"
      variant="subtitle2"
      underline="hover"
      sx={{
        height: 44,
        overflow: 'hidden',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        ...(latestFridgeLarge && { typography: 'h5', height: 60 }),
        ...((latestFridgeLarge || latestFridge) && {
          color: 'common.white',
        }),
      }}
    >
      {account}
    </Link>
  );

  const renderInfo = (
    <Stack
      direction="row"
      flexWrap="wrap"
      spacing={1.5}
      justifyContent="space-between"
      sx={{
        mt: 3,
        color: 'text.disabled',
      }}
    >
      <Typography variant="caption">Address: {address}</Typography>
      <Typography variant="caption">Owner: {owner}</Typography>
      <Typography variant="caption">Status: {isAvailable ? 'Available' : 'Not Available'}</Typography>
      <Typography variant="caption">Door: {doorStatus ? 'Open' : 'Closed'}</Typography>
    </Stack>
  );

  return (
    <Grid xs={12} sm={latestFridgeLarge ? 12 : 6} md={latestFridgeLarge ? 6 : 3}>
      <Card>
        <Box
          sx={{
            p: (theme) => theme.spacing(4, 3, 3, 3),
            ...((latestFridgeLarge || latestFridge) && {
              width: 1,
              bottom: 0,
              position: 'absolute',
            }),
          }}
        >
          {renderAccount}
          {renderInfo}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="contained" color="primary" onClick={handleOpenDoor}>
              Открыть дверь
            </Button>
            <Button variant="contained" color="secondary" onClick={handleCloseDoor}>
              Закрыть дверь
            </Button>
          </Stack>
        </Box>
      </Card>
    </Grid>
  );
}

FridgeCard.propTypes = {
  fridge: PropTypes.object.isRequired,
  index: PropTypes.number,
};
