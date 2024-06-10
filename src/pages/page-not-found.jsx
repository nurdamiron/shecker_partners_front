import { Helmet } from 'react-helmet-async';

import { NotFoundView } from 'src/sections/error';

// ----------------------------------------------------------------------

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title> Ошибка 404 </title>
      </Helmet>

      <NotFoundView />
    </>
  );
}
