import aretesImg from "../assets/categories/aretes.jpg";
import collaresImg from "../assets/categories/collares.jpg";
import anillosImg from "../assets/categories/anillos.jpg";
import pulserasImg from "../assets/categories/pulseras.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: any;
  description: string;
  isNew?: boolean;
}

export const PRODUCTS: Product[] = [
  // ARETES
  {
    id: 'a1',
    name: 'Pendientes Brisa Marina',
    price: 45.00,
    category: 'aretes',
    image: aretesImg,
    description: 'Elegantes aretes inspirados en la brisa del mar.',
    isNew: true
  },
  {
    id: 'a2',
    name: 'Argollas Atardecer',
    price: 38.00,
    category: 'aretes',
    image: aretesImg,
    description: 'Argollas bañadas en oro con detalles sutiles.'
  },
  // COLLARES
  {
    id: 'c1',
    name: 'Collar Sol de Verano',
    price: 65.00,
    category: 'collares',
    image: collaresImg,
    description: 'Una pieza central que captura la luz del sol.',
    isNew: true
  },
  {
    id: 'c2',
    name: 'Choker Perla Natural',
    price: 55.00,
    category: 'collares',
    image: collaresImg,
    description: 'Collar ajustado con una perla de río seleccionada.'
  },
  // ANILLOS
  {
    id: 'an1',
    name: 'Anillo Ola Infinita',
    price: 32.00,
    category: 'anillos',
    image: anillosImg,
    description: 'Anillo ajustable con diseño minimalista de ola.'
  },
  // PULSERAS
  {
    id: 'p1',
    name: 'Pulsera Arena Blanca',
    price: 28.00,
    category: 'pulseras',
    image: pulserasImg,
    description: 'Pulsera tejida con cuentas de nácar.'
  }
];

export const CATEGORIES = [
  { id: 'todos', name: 'Todos' },
  { id: 'aretes', name: 'Aretes' },
  { id: 'collares', name: 'Collares' },
  { id: 'anillos', name: 'Anillos' },
  { id: 'pulseras', name: 'Pulseras' },
  { id: 'personalizacion', name: 'Personalización' }
];
