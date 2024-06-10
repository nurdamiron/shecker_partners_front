import { Helmet } from 'react-helmet-async';

import { AppView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function AppPage() {
  return (
    <>
      <Helmet>
        <title> Дэшборд | Shecker Partners </title>
      </Helmet>

      <AppView />
    </>
  );
}
