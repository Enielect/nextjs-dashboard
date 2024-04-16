//Inter below would be our primary font
import { Inter, Lusitana } from 'next/font/google';

//then specify the subsets you want to use
export const inter = Inter({ subsets: ['latin'] });
export const lusitana = Lusitana({ weight: ['400', '700'], subsets: ['latin'] });
