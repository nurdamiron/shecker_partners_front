import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'Дэшборд',
    path: '/',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Пользователи',
    path: '/user',
    icon: icon('ic_user'),
  },
  {
    title: 'Продукты',
    path: '/products',
    icon: icon('ic_cart'),
  },
  {
    title: 'Холодильники',
    path: '/fridge',
    icon: icon('ic_blog'),
  },
];

export default navConfig;
