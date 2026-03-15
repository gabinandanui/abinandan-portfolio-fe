import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from './components/Navigation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Abinandan G — Tech Lead · Frontend Developer · UI/UX Designer',
  description:
    'Portfolio of Abinandan G — 11 years of experience crafting intuitive interfaces and scalable web applications.',
  themeColor: '#0a0a0a',
  openGraph: {
    title: 'Abinandan G — Portfolio',
    description:
      'Tech Lead · Frontend Developer · UI/UX Designer with 11+ years of experience.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
