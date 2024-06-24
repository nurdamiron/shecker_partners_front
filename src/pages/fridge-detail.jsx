import { Helmet } from 'react-helmet-async';

import FridgeDetail from 'src/sections/fridge-detail/view/fridge-detail';

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
