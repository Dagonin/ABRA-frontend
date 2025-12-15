const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = `${String(API_BASE).replace(/\/$/, '')}/api`;


let authToken: string | null = localStorage.getItem('abra_token');

export const setAuthToken = (token: string | null) => {
    authToken = token;
    if (token) {
        localStorage.setItem('abra_token', token);
    } else {
        localStorage.removeItem('abra_token');
    }
};

export const getAuthToken = () => authToken;

const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (authToken) {
        headers.append('Authorization', `Bearer ${authToken}`);
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        console.warn('Authentication failed (401/403)');
    }

    return response;
};


export interface EndpointModel {
    endpoint_id?: string;
    url: string;
    active: boolean;
    description?: string;
    alive?: boolean;
    variantModel?: Partial<VariantModel>;
    domainModel?: Partial<DomainModel>;
}

export interface VariantModel {
    variant_id: string;
    name: string;
    active: boolean;
    description?: string;
    weight: number;
    testModel?: Partial<TestModel>;
    endpointModels?: EndpointModel[];
}

export interface TestModel {
    test_id: string;
    name: string;
    active: boolean;
    subpath?: string;
    description?: string;
    variantModels?: VariantModel[];
    domainModel?: Partial<DomainModel>;
}

export interface DomainModel {
    domain_id: string;
    host: string;
    active: boolean;
    defaultEndpoints?: EndpointModel[];
    tests?: TestModel[];
}


export const authAPI = {
    login: async (credentials: { login: string, password: string }) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    }
};

export const domainAPI = {
    getAll: async (): Promise<DomainModel[]> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/domains`);
        if (!response.ok) throw new Error('Failed to fetch domains');
        return response.json();
    },

    getById: async (id: string): Promise<DomainModel> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/domains/${id}`);
        if (!response.ok) throw new Error('Failed to fetch domain');
        return response.json();
    },

    create: async (domain: Omit<DomainModel, 'domain_id'>): Promise<DomainModel> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/domains`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(domain),
        });
        if (!response.ok) throw new Error('Failed to create domain');
        return response.json();
    },

    update: async (id: string, domain: DomainModel): Promise<void> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/domains/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(domain),
        });
        if (!response.ok) throw new Error('Failed to update domain');
    },

    delete: async (id: string): Promise<void> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/domains/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete domain');
    },
};

export const testAPI = {
    getAll: async (): Promise<TestModel[]> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/tests`);
        if (!response.ok) throw new Error('Failed to fetch tests');
        return response.json();
    },

    getById: async (id: string): Promise<TestModel> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/tests/${id}`);
        if (!response.ok) throw new Error('Failed to fetch test');
        return response.json();
    },

    create: async (test: Omit<TestModel, 'test_id'>): Promise<TestModel> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/tests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(test),
        });
        if (!response.ok) throw new Error('Failed to create test');
        return response.json();
    },

    update: async (id: string, test: TestModel): Promise<void> => {
        const url = `${API_BASE_URL}/tests/${id}`;
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(test),
        };
        const response = await authenticatedFetch(url, requestOptions);
        if (!response.ok) throw new Error('Failed to update test');
    },

    delete: async (id: string): Promise<void> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/tests/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete test');
    },
};

export const variantAPI = {
    getAll: async (): Promise<VariantModel[]> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/variants`);
        if (!response.ok) throw new Error('Failed to fetch variants');
        return response.json();
    },

    getById: async (id: string): Promise<VariantModel> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/variants/${id}`);
        if (!response.ok) throw new Error('Failed to fetch variant');
        return response.json();
    },

    getByTestId: async (testId: string): Promise<VariantModel[]> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/variants/byTestId/${testId}`);
        if (!response.ok) throw new Error('Failed to fetch variants for test');
        return response.json();
    },

    create: async (variant: Omit<VariantModel, 'variant_id'>): Promise<VariantModel> => {
        const url = `${API_BASE_URL}/variants`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(variant),
        };
        const response = await authenticatedFetch(url, requestOptions);
        if (!response.ok) throw new Error('Failed to create variant');
        return response.json();
    },

    update: async (id: string, variant: VariantModel): Promise<void> => {
        const url = `${API_BASE_URL}/variants/${id}`;
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(variant),
        };
        const response = await authenticatedFetch(url, requestOptions);
        if (!response.ok) throw new Error('Failed to update variant');
    },

    delete: async (id: string): Promise<void> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/variants/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete variant');
    },
};

export const endpointAPI = {
    getAll: async (): Promise<EndpointModel[]> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/endpoints`);
        if (!response.ok) throw new Error('Failed to fetch endpoints');
        return response.json();
    },

    getById: async (id: string): Promise<EndpointModel> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/endpoints/${id}`);
        if (!response.ok) throw new Error('Failed to fetch endpoint');
        return response.json();
    },

    create: async (endpoint: Partial<EndpointModel> & { url: string }): Promise<EndpointModel> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/endpoints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(endpoint),
        });
        if (!response.ok) throw new Error('Failed to create endpoint');
        return response.json();
    },

    update: async (id: string, endpoint: EndpointModel): Promise<void> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/endpoints/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(endpoint),
        });
        if (!response.ok) throw new Error('Failed to update endpoint');
    },

    delete: async (id: string): Promise<void> => {
        const response = await authenticatedFetch(`${API_BASE_URL}/endpoints/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete endpoint');
    },
};