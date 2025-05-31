import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

// This would come from your database/API in a real application
const barbershops = [
    {
        id: 'uncle-barbers',
        name: 'Uncle Barbers',
        address: '123 Main Street, Asaka',
        image: '/images/barbershop-1.jpg',
        services: ['Haircut', 'Beard Trim', 'Hot Towel Shave'],
        goHighLevelLink: 'https://api.leadconnectorhq.com/widget/group/dICmIp9i4RoLAssKRKJ6'
    },
    // Add more barbershops as needed
]

export default function CityPage({ params }: { params: { cityId: string } }) {
    const cityName = params.cityId.charAt(0).toUpperCase() + params.cityId.slice(1)

    return (
        <div className="container mx-auto px-4 py-8">
            <Link
                href="/"
                className="inline-flex items-center text-barber-brown hover:text-barber-red mb-8"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Cities
            </Link>

            <div className="text-center mb-12">
                <h2 className="font-display text-4xl text-barber-brown mb-4">
                    Barbershops in {cityName}
                </h2>
                <p className="text-barber-dark text-lg">
                    Select a barbershop to book your appointment
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {barbershops.map((shop) => (
                    <div
                        key={shop.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                        <div className="aspect-w-16 aspect-h-9 bg-barber-dark">
                            {/* Add actual image here */}
                            <div className="w-full h-48 bg-barber-dark" />
                        </div>
                        <div className="p-6">
                            <h3 className="font-display text-2xl text-barber-dark mb-2">
                                {shop.name}
                            </h3>
                            <p className="text-barber-brown mb-4">{shop.address}</p>
                            <div className="mb-4">
                                <h4 className="font-display text-lg text-barber-dark mb-2">Services:</h4>
                                <ul className="list-disc list-inside text-barber-brown">
                                    {shop.services.map((service) => (
                                        <li key={service}>{service}</li>
                                    ))}
                                </ul>
                            </div>
                            <a
                                href={shop.goHighLevelLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-barber-red text-white py-2 rounded-md hover:bg-barber-brown transition-colors duration-300"
                            >
                                Book Appointment
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 