import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import { ref, onValue, get, set } from 'firebase/database';
import { database } from 'src/firebase_config'; // Adjust the import path according to your file structure
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Import location icon

export default function FridgeCard({ fridge, index }) {
  const { account, address, owner, id } = fridge;

  const [doorStatus, setDoorStatus] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [lastTimer, setLastTimer] = useState(0);

  useEffect(() => {
    const fridgeRef = ref(database, `${id}/timer/timer`);
    const doorRef = ref(database, `${id}/door/doorOpen`);

    // Function to handle timer updates
    const handleTimerUpdate = (snapshot) => {
      const currentTimer = snapshot.val();
      setLastTimer(currentTimer);
      setIsAvailable(true);
    };

    // Listen to timer changes
    const timerListener = onValue(fridgeRef, handleTimerUpdate);

    // Listen to door status changes
    const doorListener = onValue(doorRef, (snapshot) => {
      const doorValue = snapshot.val();
      setDoorStatus(doorValue);
    });

    // Set interval to check the timer every 15 seconds
    const intervalId = setInterval(() => {
      get(fridgeRef).then((snapshot) => {
        const currentTimer = snapshot.val();
        if (currentTimer === lastTimer) {
          setIsAvailable(false);
        }
      }).catch((error) => {
        console.error('Error fetching timer:', error);
      });
    }, 15000);

    return () => {
      clearInterval(intervalId);
      timerListener();
      doorListener();
    };
  }, [id, lastTimer]);

  const handleOpenDoor = () => {
    set(ref(database, `${id}/door/doorOpen`), 1);
  };

  const handleCloseDoor = () => {
    set(ref(database, `${id}/door/doorOpen`), 0);
  };

  const renderAccount = (
    <Typography
      variant="h4"
      sx={{
        color: 'black',
      }}
    >
      {account}
    </Typography>
  );

  const renderInfo = (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      justifyContent="flex-start"
      sx={{ mt: 1 }}
    >
      <LocationOnIcon />
      <Typography 
        variant="h6"
        sx={{
          color: '#F873FB',
        }}
      
      >{address}</Typography>
    </Stack>
  );

  const renderStatus = (
    <Typography variant="caption">{doorStatus ? 'Открыт' : 'Закрыт'}</Typography>
  );

  return (
    <Grid xs={12} sm={6} md={3}>
      <Card
        sx={{
          backgroundColor: isAvailable ? 'white' : 'grey.300',
          backgroundImage: isAvailable
            ? 'url(/assets/background/fridge_background.png)'
            : 'url(/assets/background/fridge_gray.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 200,
          textAlign: 'center',
          color: isAvailable ? 'black' : 'white', // Adjust text color based on background
        }}
      >
        <Box
          sx={{
            p: 4,
            width: 1,
            bottom: 0,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            {renderAccount}
            {renderInfo}
          </Box>
          {renderStatus}
          {isAvailable ? (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleOpenDoor}>
                Открыть
              </Button>
              <Button variant="contained" color="secondary" onClick={handleCloseDoor}>
                Закрыть
              </Button>
            </Stack>
          ) : (
            <Typography variant="h6" color="error">
              Недоступен
            </Typography>
          )}
        </Box>
      </Card>
    </Grid>
  );
}

FridgeCard.propTypes = {
  fridge: PropTypes.object.isRequired,
  index: PropTypes.number,
};
