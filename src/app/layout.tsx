import type { Metadata } from 'next'
import { Cinzel, Raleway } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['600', '800', '900'], variable: '--font-cinzel' })
const raleway = Raleway({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-raleway' })

export const metadata: Metadata = {
  title: 'אירוע בזמן – השואה ומלחמת העולם השנייה',
  description: 'משחק ציר זמן היסטורי',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-7PL4MS7Y3Z" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer=window.dataLayer||[];
          function gtag(){dataLayer.push(arguments);}
          gtag('js',new Date());
          gtag('config','G-7PL4MS7Y3Z');
        `}} />
      </head>
      <body className={`${cinzel.variable} ${raleway.variable}`}>
        {children}
      </body>
    </html>
  )
}
