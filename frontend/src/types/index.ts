export interface User {
  id: string;
  walletAddress: string;
  name?: string;
  email?: string;
  createdAt: Date;
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  description?: string;
  templateId: string;
  customization: StoreCustomization;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// export interface StoreCustomization {
//   primaryColor: string;
//   secondaryColor: string;
//   layout: LayoutElement[];
//   fonts: {
//     heading: string;
//     body: string;
//   };
// }

export interface StoreCustomization {
  storeName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  products: Product[];
  categories: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor?: string;
  aboutText: string;
  contactEmail: string;
}

export interface LayoutElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'container' | 'hero' | 'features';
  content?: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  styling?: ElementStyling;
  children?: LayoutElement[];
}

export interface ElementStyling {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
}

export interface StoreTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  defaultLayout: LayoutElement[];
  category: 'fashion' | 'electronics' | 'home' | 'beauty' | 'custom';
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  images: string[]; // IPFS hashes
  metadata: {
    sku?: string;
    category?: string;
    tags?: string[];
  };
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  ipfsHash?: string;
}

export interface Order {
  buyer: string;
  itemId: number;
  quantity: number;
  totalPrice: number;
  timestamp: number;
  isDelivered: boolean;
}

export interface CartItem {
  id: string;
  quantity: number;
}

export interface CanvasElement extends LayoutElement {
  isSelected?: boolean;
  isLocked?: boolean;
}

export interface Web3AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  walletAddress: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}
