import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  email: string;
  role: 'admin' | 'user';
}

export type MembershipPlan = 'FREE' | 'PRO' | 'ULTIMATE';

interface AuthContextType {
  user: AuthUser | null;
  membership: MembershipPlan;
  purchasedProducts: string[];
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string) => void;
  logout: () => void;
  upgradeMembership: (plan: MembershipPlan) => void;
  addPurchasedProduct: (productId: string) => void;
  isPurchased: (productId: string) => boolean;
  canDownload: (productId: string, isFree: boolean) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  membership: 'FREE',
  purchasedProducts: [],
  login: () => false,
  register: () => {},
  logout: () => {},
  upgradeMembership: () => {},
  addPurchasedProduct: () => {},
  isPurchased: () => false,
  canDownload: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('oc-figure-hub-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [membership, setMembershipState] = useState<MembershipPlan>(() => {
    return (localStorage.getItem('oc-figure-hub-membership') as MembershipPlan) || 'FREE';
  });

  const [purchasedProducts, setPurchasedProducts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('oc-figure-hub-purchases');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('oc-figure-hub-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('oc-figure-hub-user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('oc-figure-hub-membership', membership);
  }, [membership]);

  useEffect(() => {
    localStorage.setItem('oc-figure-hub-purchases', JSON.stringify(purchasedProducts));
  }, [purchasedProducts]);

  const login = (email: string, password: string): boolean => {
    if (!email || !password) return false;
    if (email === 'admin@gmail.com' && password === '123123') {
      setUser({ email, role: 'admin' });
      return true;
    }
    // Any other credentials → regular user
    if (email.includes('@') && password.length >= 1) {
      setUser({ email, role: 'user' });
      return true;
    }
    return false;
  };

  const register = (email: string, _password: string) => {
    setUser({ email, role: 'user' });
  };

  const logout = () => {
    setUser(null);
  };

  const upgradeMembership = (plan: MembershipPlan) => {
    setMembershipState(plan);
  };

  const addPurchasedProduct = (productId: string) => {
    setPurchasedProducts((prev) =>
      prev.includes(productId) ? prev : [...prev, productId]
    );
  };

  const isPurchased = (productId: string) => purchasedProducts.includes(productId);

  const canDownload = (productId: string, isFree: boolean): boolean => {
    if (isFree) return true;
    if (membership === 'PRO' || membership === 'ULTIMATE') return true;
    return purchasedProducts.includes(productId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        membership,
        purchasedProducts,
        login,
        register,
        logout,
        upgradeMembership,
        addPurchasedProduct,
        isPurchased,
        canDownload,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
