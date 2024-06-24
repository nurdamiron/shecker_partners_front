import PropTypes from 'prop-types';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

FridgeSort.propTypes = {
  options: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired,
};

export default function FridgeSort({ options, value, onSort }) {
  return (
    <TextField select size="small" value={value} onChange={onSort}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
