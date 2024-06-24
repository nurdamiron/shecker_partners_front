import { Helmet } from 'react-helmet-async';

import { ProductView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function ProductPage() {
  return (
    <>
      <Helmet>
        <title> Управление холодильниками | Shecker Partners </title>
      </Helmet>

      <ProductView /> 
    </>
  );
}
