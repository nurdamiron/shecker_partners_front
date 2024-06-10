import { Helmet } from 'react-helmet-async';

import { VerificationView } from 'src/sections/verification';

// ----------------------------------------------------------------------

export default function VerificationPage() {
  return (
    <>
      <Helmet>
        <title> Верификация | Shecker Partners </title>
      </Helmet>

      <VerificationView />
    </>
  );
}
