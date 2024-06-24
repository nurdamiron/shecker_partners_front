import { Helmet } from 'react-helmet-async';

import FridgeProducts from 'src/sections/fridge-product/view';

// ----------------------------------------------------------------------

export default function FridgeProductsPage() {
  return (
    <>
      <Helmet>
        <title> Управление холодильником | Shecker Partners </title>
      </Helmet>

      <FridgeProducts /> 
    </>
  );
}
