# Guide d'Intégration Frontend ↔️ Backend

Ce guide explique comment connecter le frontend React avec le backend Express API.

## 📋 Configuration Requise

### Backend
- ✅ API démarrée sur `http://localhost:5000`
- ✅ Base de données initialisée avec `node src/scripts/seed.js`
- ✅ CORS configuré pour `http://localhost:3000`

### Frontend
- Installation d'axios : `npm install axios`

## 🔧 Étape 1 : Créer le Service API

Créez `src/services/api.ts` dans le frontend :

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Créer une instance axios avec configuration par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: 'owner' | 'tenant';
}

export interface Property {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  type: 'Sale' | 'Rent';
  beds: number;
  baths: number;
  sqft: number;
  image_url: string;
  status: 'available' | 'rented' | 'sold';
  created_at: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
}

export interface Payment {
  id: number;
  contract_id: number;
  tenant_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: 'Payé' | 'En Attente' | 'En Retard' | 'Annulé';
  transaction_id?: string;
  notes?: string;
  property_title?: string;
  tenant_name?: string;
}

// API Methods

// Authentication
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'owner' | 'tenant';
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },
};

// Properties
export const propertiesAPI = {
  getAll: async (filters?: {
    type?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }) => {
    const response = await api.get('/properties', { params: filters });
    return response.data.properties;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/properties/${id}`);
    return response.data.property;
  },

  create: async (formData: FormData) => {
    const response = await api.post('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: number, formData: FormData) => {
    const response = await api.put(`/properties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  getOwnerProperties: async (ownerId: number) => {
    const response = await api.get(`/properties/owner/${ownerId}`);
    return response.data.properties;
  },
};

// Payments
export const paymentsAPI = {
  getAll: async () => {
    const response = await api.get('/payments');
    return response.data.payments;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/payments/${id}`);
    return response.data.payment;
  },

  getByContract: async (contractId: number) => {
    const response = await api.get(`/payments/contract/${contractId}`);
    return response.data.payments;
  },

  create: async (data: {
    contract_id: number;
    amount: number;
    payment_date?: string;
    payment_method: string;
    status?: string;
    transaction_id?: string;
    notes?: string;
  }) => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      status?: string;
      transaction_id?: string;
      notes?: string;
    }
  ) => {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },
};

// Users
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data.users;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
  },

  update: async (
    id: number,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    }
  ) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getOwners: async () => {
    const response = await api.get('/users/owners/list');
    return response.data.owners;
  },

  getTenants: async () => {
    const response = await api.get('/users/tenants/list');
    return response.data.tenants;
  },
};

export default api;
```

## 🔐 Étape 2 : Modifier App.tsx pour Charger les Données Réelles

Remplacez les données mockées par des appels API :

```typescript
import { useEffect, useState } from 'react';
import { propertiesAPI, authAPI, type Property, type User } from './services/api';

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger les propriétés
      const props = await propertiesAPI.getAll();
      setProperties(props);

      // Vérifier si l'utilisateur est connecté
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authAPI.getProfile();
          setUser(profile);
        } catch (error) {
          // Token invalide
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Chargement...</div>
    </div>;
  }

  return (
    // ... reste du composant
  );
}
```

## 🔑 Étape 3 : Créer un Composant de Connexion

Créez `src/components/LoginModal.tsx` :

```typescript
import { useState } from 'react';
import { authAPI } from '../services/api';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'tenant' as 'owner' | 'tenant',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Connexion
        const response = await authAPI.login(formData.email, formData.password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onSuccess(response.user, response.token);
      } else {
        // Inscription
        const response = await authAPI.register(formData);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onSuccess(response.user, response.token);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          {isLogin ? 'Connexion' : 'Inscription'}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Nom complet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'owner' | 'tenant' })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="tenant">Locataire</option>
                <option value="owner">Propriétaire</option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded"
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-orange-500 hover:underline"
        >
          {isLogin ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </button>

        <button
          onClick={onClose}
          className="mt-2 text-gray-500 hover:underline block"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
```

## 📱 Étape 4 : Tester l'Intégration

1. **Démarrer le backend :**
```bash
cd kushtati-immo-api
node src/server.js
```

2. **Démarrer le frontend :**
```bash
cd kushtati-immo
npm run dev
```

3. **Tester la connexion :**
- Ouvrir http://localhost:3000
- Cliquer sur "Se connecter"
- Utiliser : `mamadou@kushtati.com` / `password123`
- Vérifier que les données sont chargées depuis l'API

## ✅ Points de Vérification

- [ ] Le backend fonctionne sur port 5000
- [ ] Le frontend fonctionne sur port 3000
- [ ] Les propriétés s'affichent depuis l'API (et non plus mockées)
- [ ] La connexion fonctionne
- [ ] Le token JWT est stocké dans localStorage
- [ ] Les appels API incluent le token dans Authorization header
- [ ] La déconnexion supprime le token
- [ ] Les erreurs 401 redirigent vers la page de connexion

## 🐛 Dépannage

### Erreur CORS
Si vous avez une erreur CORS, vérifiez :
- Le backend a `FRONTEND_URL=http://localhost:3000` dans `.env`
- CORS est configuré dans `server.js`

### Token expiré
Le token JWT expire après 7 jours. Pour se reconnecter :
```javascript
localStorage.removeItem('token');
// Puis se reconnecter via l'interface
```

### Base de données vide
Si aucune propriété ne s'affiche :
```bash
cd kushtati-immo-api
rm database/kushtati.db
node src/scripts/seed.js
```

## 🚀 Prochaines Étapes

Une fois l'intégration frontend-backend fonctionnelle :

1. **Ajouter l'upload d'images** pour les propriétés
2. **Créer le dashboard propriétaire** avec ses propriétés
3. **Créer le dashboard locataire** avec ses paiements
4. **Implémenter les paiements** avec Orange Money/Wave
5. **Ajouter la recherche avancée** et filtres
6. **Créer un système de messagerie** propriétaire-locataire

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
- Les logs du backend dans le terminal
- La console du navigateur (F12)
- L'onglet Network pour voir les requêtes HTTP
