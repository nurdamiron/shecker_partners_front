import { Helmet } from 'react-helmet-async';

import FridgeView from 'src/sections/fridge/view/fridge-view';

// ----------------------------------------------------------------------

export default function FridgePage() {
  return (
    <>
      <Helmet>
        <title> Холодильники | Shecker Partners </title>
      </Helmet>

      <FridgeView />
    </>
  );
}
