// Template configurations for different store types
import {
  Laptop,
  Phone,
  Headphones,
  Watch,
  ShoppingCart,
  House,
  Lightning,
  MagnifyingGlass,
  Star,
  EnvelopeSimple,
  Question,
  Storefront,
} from 'phosphor-react';

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  storeName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  categories: string[];
  categoryIcons?: Record<string, React.ComponentType>;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    description: string;
    badge?: string;
  }>;
  aboutText: string;
  contactEmail: string;
  navItems: Array<{
    label: string;
    page: 'home' | 'shop' | 'about' | 'contact';
    icon: React.ComponentType;
  }>;
  heroGradient?: string;
  navGradient?: string;
}

export const TEMPLATES: Record<string, TemplateConfig> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design',
    storeName: 'Minimal Store',
    heroTitle: 'Curated Goods for a Simpler Life',
    heroSubtitle: 'Discover handpicked products that celebrate craftsmanship and quality',
    heroImage: 'https://images.unsplash.com/photo-1556740730-a0fbc0454d0a?w=1200&h=600&fit=crop',
    primaryColor: '#ffffff',
    secondaryColor: '#f8f8f8',
    accentColor: '#c97a5a',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    categories: ['All', 'Ceramics', 'Textiles', 'Furniture'],
    products: [],
    aboutText: 'We believe in craftsmanship and quality.',
    contactEmail: 'hello@store.com',
    navItems: [
      { label: 'HOME', page: 'home', icon: House },
      { label: 'SHOP', page: 'shop', icon: Storefront },
      { label: 'ABOUT', page: 'about', icon: Question },
      { label: 'CONTACT', page: 'contact', icon: EnvelopeSimple },
    ],
  },

  tech: {
    id: 'tech',
    name: 'Tech Store',
    description: 'Modern tech product store',
    storeName: 'TechHub',
    heroTitle: 'Next-Gen Technology',
    heroSubtitle: 'Cutting-edge devices. Unbeatable prices.',
    heroImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop',
    primaryColor: '#0a0e27',
    secondaryColor: '#1a1f3a',
    accentColor: '#ffffff',
    backgroundColor: '#0a0e27',
    textColor: '#e8eaed',
    categories: ['All', 'Laptops', 'Smartphones', 'Audio', 'Wearables'],
    categoryIcons: {
      Laptops: Laptop,
      Smartphones: Phone,
      Audio: Headphones,
      Wearables: Watch,
    },
    products: [],
    aboutText: 'Discover cutting-edge technology at unbeatable prices. We offer the latest gadgets and devices from trusted brands.',
    contactEmail: 'support@techhub.com',
    navItems: [
      { label: 'HOME', page: 'home', icon: House },
      { label: 'SHOP', page: 'shop', icon: Storefront },
      { label: 'DEALS', page: 'shop', icon: Lightning },
      { label: 'ABOUT', page: 'about', icon: Question },
      { label: 'CONTACT', page: 'contact', icon: EnvelopeSimple },
    ],
    heroGradient: 'linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(26, 31, 58, 0.6) 100%)',
    navGradient: 'linear-gradient(90deg, #0a0e27 0%, #1a1f3a 100%)',
  },
};

export const DEFAULT_TEMPLATE = TEMPLATES.minimal;
