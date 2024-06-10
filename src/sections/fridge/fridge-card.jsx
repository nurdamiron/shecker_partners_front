import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import { useState, useEffect } from 'react';
import { ref, onValue, get, set } from 'firebase/database';
import { database } from 'src/firebase_config'; // Adjust the import path according to your file structure
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Import location icon
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';

export default function FridgeCard({ fridge, index }) {
  const { account, address, id } = fridge;

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
    }, 11000);

    return () => {
      clearInterval(intervalId);
      timerListener();
      doorListener();
    };
  }, [id, lastTimer]);

  const handleToggleDoor = () => {
    const newDoorStatus = doorStatus === 0 ? 1 : 0;
    set(ref(database, `${id}/door/doorOpen`), newDoorStatus);
  };

  const renderAccount = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
    <Typography
      variant="h2"
      sx={{
        height: 50,
        overflow: 'hidden',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        color: 'common.black',
        marginRight: 1, // Add margin to the right
      }}
    >
      {account}
    </Typography>
    <Typography variant="caption">
    {doorStatus ? <LockOpenIcon /> : <LockIcon />}
    </Typography>
    </Box>
  );

  
  const renderInfo = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'left',
        justifyContent: 'left',
        mt: 2,
      }}
    >
      <LocationOnIcon style={{ fontSize: "20px" }} />
      <Typography variant="caption">{address}</Typography>
    </Box>
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
          backgroundPosition: 'left',
          height: 200,
          textAlign: 'left',
          color: isAvailable ? 'black' : 'white', // Adjust text color based on background
        }}
      >
        <Box
          sx={{
            p: 4,
            width: 1,
            bottom: 10,
            position: 'relative',
          }}
        >
          {renderAccount}
          {renderInfo}
          
          {isAvailable ? (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Switch
                checked={doorStatus !== 0}
                onChange={handleToggleDoor}
                name="doorStatusSwitch"
                color="primary"
              />
              
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
