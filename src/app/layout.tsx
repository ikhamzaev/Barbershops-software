import type { Metadata } from 'next'
import { Playfair_Display, Roboto } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' })
const roboto = Roboto({
    weight: ['400', '500', '700'],
    subsets: ['latin'],
    variable: '--font-body'
})

export const metadata: Metadata = {
    title: 'Uzbek Barbers - Book Your Style',
    description: 'Find and book the best barbershops in Uzbekistan',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${playfair.variable} ${roboto.variable} font-body bg-barber-cream`}>
                <div className="min-h-screen flex flex-col">
                    <header className="bg-barber-dark text-barber-gold py-4">
                        <div className="container mx-auto px-4">
                            <h1 className="font-display text-3xl text-center">Uzbek Barbers</h1>
                        </div>
                    </header>
                    <main className="flex-grow">
                        {children}
                    </main>
                    <footer className="bg-barber-dark text-barber-gold py-4">
                        <div className="container mx-auto px-4 text-center">
                            <p className="font-display">© 2024 Uzbek Barbers. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    )
} 