import '../styles/globals.css'
import { Geist } from 'next/font/google'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

function MyApp({ Component, pageProps }) {
  return (
    <div className={geistSans.variable}>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
