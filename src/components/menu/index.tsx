'use client';

import Link from 'next/link';
import styles from './styles.module.scss';
import { usePathname  } from 'next/navigation';

export default function Menu() {
  const pathname = usePathname()
  const list = [
    { name: 'IMU', path: '/imu' },
    { name: 'Maps', path: '/maps' },
  ];
  return (
    <div className={`${styles.container} }`}>
      <ul className={`${styles.menu}`}>
       {list.map((item) => (
          <Link key={item.path} href={item.path}>
            <li className={`${styles.menuItem} ${pathname === item.path ? styles.active : ''}`}>
              {item.name}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}