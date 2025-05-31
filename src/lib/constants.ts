export type RegionId = 'tashkent' | 'andijan' | 'samarkand' | 'bukhara' | 'namangan' | 'fergana' | 'karakalpakstan' | 'khorezm' | 'navoi' | 'jizzakh' | 'sirdarya' | 'surkhandarya' | 'kashkadarya';

export type CityId = string;

export interface City {
    id: CityId;
    name: string;
    regionId: RegionId;
}

export interface Region {
    id: RegionId;
    name: string;
    cities: City[];
}

export const REGIONS: Region[] = [
    {
        id: 'tashkent',
        name: 'Toshkent',
        cities: [
            { id: 'tashkent-city', name: 'Toshkent shahri', regionId: 'tashkent' },
            { id: 'angren', name: 'Angren', regionId: 'tashkent' },
            { id: 'bekabad', name: 'Bekobod', regionId: 'tashkent' },
            { id: 'chirchik', name: 'Chirchiq', regionId: 'tashkent' },
            { id: 'gazalkent', name: 'Gazalkent', regionId: 'tashkent' },
            { id: 'kibray', name: 'Kibray', regionId: 'tashkent' },
            { id: 'parkent', name: 'Parkent', regionId: 'tashkent' },
            { id: 'piskent', name: 'Piskent', regionId: 'tashkent' },
            { id: 'yangiyul', name: 'Yangiyo\'l', regionId: 'tashkent' },
            { id: 'yangiyangi', name: 'Yangiyangi', regionId: 'tashkent' },
        ]
    },
    {
        id: 'andijan',
        name: 'Andijon',
        cities: [
            { id: 'andijan-city', name: 'Andijon shahri', regionId: 'andijan' },
            { id: 'asaka', name: 'Asaka', regionId: 'andijan' },
            { id: 'markhamat', name: 'Marhamat', regionId: 'andijan' },
            { id: 'shahrixon', name: 'Shahrixon', regionId: 'andijan' },
            { id: 'xonobod', name: 'Xonobod', regionId: 'andijan' },
            { id: 'baliqli', name: 'Baliqli', regionId: 'andijan' },
            { id: 'buloqboshi', name: 'Buloqboshi', regionId: 'andijan' },
            { id: 'izboskan', name: 'Izboskan', regionId: 'andijan' },
            { id: 'jalolquduq', name: 'Jalolquduq', regionId: 'andijan' },
            { id: 'qorgontepa', name: 'Qo\'rg\'ontepa', regionId: 'andijan' },
            { id: 'ulugnor', name: 'Ulug\'nor', regionId: 'andijan' },
        ]
    },
    {
        id: 'samarkand',
        name: 'Samarqand',
        cities: [
            { id: 'samarkand-city', name: 'Samarqand shahri', regionId: 'samarkand' },
            { id: 'kattaqorgon', name: 'Kattaqo\'rg\'on', regionId: 'samarkand' },
            { id: 'urgut', name: 'Urgut', regionId: 'samarkand' },
            { id: 'bulungur', name: 'Bulung\'ur', regionId: 'samarkand' },
            { id: 'jomboy', name: 'Jomboy', regionId: 'samarkand' },
            { id: 'ishtixon', name: 'Ishtixon', regionId: 'samarkand' },
            { id: 'koshrabot', name: 'Koshrabot', regionId: 'samarkand' },
            { id: 'narpay', name: 'Narpay', regionId: 'samarkand' },
            { id: 'nurobod', name: 'Nurobod', regionId: 'samarkand' },
            { id: 'obod', name: 'Oqdaryo', regionId: 'samarkand' },
            { id: 'pastdargom', name: 'Pastdarg\'om', regionId: 'samarkand' },
            { id: 'paxtachi', name: 'Paxtachi', regionId: 'samarkand' },
            { id: 'qumqorgon', name: 'Qumqo\'rg\'on', regionId: 'samarkand' },
            { id: 'toyloq', name: 'Toyloq', regionId: 'samarkand' },
        ]
    },
    // Add other regions with their cities...
];

// Helper function to get all cities
export const ALL_CITIES: City[] = REGIONS.flatMap(region => region.cities);

// Helper function to get cities by region
export const getCitiesByRegion = (regionId: RegionId): City[] => {
    const region = REGIONS.find(r => r.id === regionId);
    return region ? region.cities : [];
};

// Helper function to get region by city
export const getRegionByCity = (cityId: CityId): Region | undefined => {
    const city = ALL_CITIES.find(c => c.id === cityId);
    return city ? REGIONS.find(r => r.id === city.regionId) : undefined;
};

export const UZBEKISTAN_CITIES = [
    'Tashkent',
    'Samarkand',
    'Bukhara',
    'Namangan',
    'Andijan',
    'Nukus',
    'Fergana',
    'Jizzakh',
    'Navoi',
    'Termez',
    'Urgench',
    'Karshi',
    'Gulistan',
    'Nukus',
    'Chirchik',
    'Angren',
    'Bekabad',
    'Denau',
    'Kokand',
    'Margilan'
];

export const BUSINESS_HOURS = {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: { open: '09:00', close: '18:00' }
};

export const DEFAULT_SERVICES = [
    {
        name: 'Haircut',
        description: 'Professional haircut service',
        duration: 30, // minutes
        price: 50000, // in UZS
        category: 'Hair'
    },
    {
        name: 'Beard Trim',
        description: 'Professional beard trimming and shaping',
        duration: 20,
        price: 30000,
        category: 'Beard'
    },
    {
        name: 'Hair & Beard Combo',
        description: 'Complete haircut and beard service',
        duration: 45,
        price: 70000,
        category: 'Combo'
    }
]; 