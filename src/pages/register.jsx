import { Helmet } from 'react-helmet-async';

import { RegisterView } from 'src/sections/register';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Регистрация | Shecker Partners </title>
      </Helmet>

      <RegisterView />
    </>
  );
}
