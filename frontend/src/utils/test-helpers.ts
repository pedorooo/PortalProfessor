
export const TEST_CREDENTIALS = {
  valid: [
    {
      email: "professor@example.com",
      password: "password123",
      role: "PROFESSOR",
      expectedName: "Professor Demo",
    },
    {
      email: "teacher@example.com",
      password: "teacher123",
      role: "PROFESSOR",
      expectedName: "Teacher Example",
    },
    {
      email: "student@example.com",
      password: "student123",
      role: "STUDENT",
      expectedName: "Student Example",
    },
  ],
  invalid: [
    {
      email: "professor@example.com",
      password: "wrongpassword",
      expectedError: "Invalid credentials",
    },
    {
      email: "nonexistent@example.com",
      password: "password123",
      expectedError: "Invalid credentials",
    },
    {
      email: "",
      password: "password123",
      expectedError: "Email e senha são obrigatórios",
    },
  ],
};

export const API_RESPONSES = {
  login: {
    success: {
      status: 200,
      body: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
    failure: {
      status: 401,
      body: {
        statusCode: 401,
        message: "Invalid credentials",
      },
    },
  },
  refreshToken: {
    success: {
      status: 200,
      body: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
    failure: {
      status: 401,
      body: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  },
};

export const MOCK_JWT = {
  header: {
    alg: "HS256",
    typ: "JWT",
  },
  payload: {
    sub: "550e8400-e29b-41d4-a716-446655440000",
    email: "professor@example.com",
    name: "Professor Demo",
    role: "PROFESSOR",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  },
};

export function createMockJWT(payload = MOCK_JWT.payload): string {
  const header = btoa(JSON.stringify(MOCK_JWT.header));
  const body = btoa(JSON.stringify(payload));
  const signature = "mock-signature";
  return `${header}.${body}.${signature}`;
}

export function parseJWT(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    throw new Error("Failed to parse JWT payload");
  }
}

export const testUtils = {
  checkLocalStorage: () => {
    const accessToken = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    return {
      hasAccessToken: !!accessToken,
      hasUser: !!user,
      user: user ? JSON.parse(user) : null,
      token: accessToken,
    };
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  },

  mockLoginResponse: (email: string, password: string) => {
    const isValid = TEST_CREDENTIALS.valid.some(
      (cred) => cred.email === email && cred.password === password
    );

    if (!isValid) {
      return {
        status: 401,
        body: { message: "Invalid credentials" },
      };
    }

    const user = TEST_CREDENTIALS.valid.find((cred) => cred.email === email);
    const payload = {
      ...MOCK_JWT.payload,
      email,
      name: user?.expectedName || "User",
      sub: Math.random().toString(36).substring(7),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    return {
      status: 200,
      body: {
        accessToken: createMockJWT(payload),
      },
    };
  },

  createSoonExpiringToken: (expiresIn = 60000) => {
    const payload = {
      ...MOCK_JWT.payload,
      exp: Math.floor((Date.now() + expiresIn) / 1000),
    };
    return createMockJWT(payload);
  },

  createExpiredToken: () => {
    const payload = {
      ...MOCK_JWT.payload,
      exp: Math.floor((Date.now() - 3600) / 1000),
    };
    return createMockJWT(payload);
  },
};
