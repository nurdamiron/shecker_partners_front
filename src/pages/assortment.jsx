import { Helmet } from 'react-helmet-async';

import { AssortmentView } from 'src/sections/assortment/view';

// ----------------------------------------------------------------------

export default function AssortmentPage() {
  return (
    <>
      <Helmet>
        <title> Ассортимент | Shecker Partners </title>
      </Helmet>

      <AssortmentView /> 
    </>
  );
}
