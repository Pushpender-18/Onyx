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

const TECH_PRODUCTS = [
  {
    id: '1',
    name: 'Pro Ultrabook',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
    category: 'Laptops',
    description: '16" display, 32GB RAM, 1TB SSD - Professional grade laptop',
    badge: 'HOT DEAL',
  },
  {
    id: '2',
    name: 'Flagship Phone',
    price: 849.99,
    image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop',
    category: 'Smartphones',
    description: '6.7" AMOLED, 256GB, 5G - Latest generation',
    badge: 'TOP RATED',
  },
  {
    id: '3',
    name: 'Premium Earbuds',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    category: 'Audio',
    description: 'ANC, 48hr battery, Hi-Res audio',
    badge: 'NEW',
  },
  {
    id: '4',
    name: 'Smart Watch Pro',
    price: 649.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    category: 'Wearables',
    description: '2" AMOLED, GPS, 5G Ready',
    badge: 'FAST',
  },
  {
    id: '5',
    name: 'Gaming Laptop',
    price: 1799.99,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop',
    category: 'Laptops',
    description: 'High-performance gaming with RTX GPU',
  },
  {
    id: '6',
    name: 'Budget Smartphone',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&h=500&fit=crop',
    category: 'Smartphones',
    description: 'All the features, half the price',
  },
];

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
    products: [
      {
        id: '1',
        name: 'Ceramic Bowl',
        price: 45.99,
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop',
        category: 'Ceramics',
        description: 'Beautiful handmade ceramic bowl',
      },
      {
        id: '2',
        name: 'Woven Textile',
        price: 32.99,
        image: 'https://images.unsplash.com/photo-1611087620459-cd7cea4ae4a0?w=500&h=500&fit=crop',
        category: 'Textiles',
        description: 'Premium handwoven textile',
      },
      {
        id: '3',
        name: 'Wooden Furniture',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
        category: 'Furniture',
        description: 'Solid wood furniture piece',
      },
      {
        id: '4',
        name: 'Decorative Vase',
        price: 67.50,
        image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop',
        category: 'Ceramics',
        description: 'Modern decorative vase',
      },
    ],
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
    products: TECH_PRODUCTS,
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
