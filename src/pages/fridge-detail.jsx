import { Helmet } from 'react-helmet-async';

import FridgeDetail from 'src/sections/fridge-details/view/fridge-detail';

// ----------------------------------------------------------------------

export default function FridgeDetailPage() {
  return (
    <>
      <Helmet>
        <title> Данные  | Shecker Partners </title>
      </Helmet>

      <FridgeDetail />
    </>
  );
}
