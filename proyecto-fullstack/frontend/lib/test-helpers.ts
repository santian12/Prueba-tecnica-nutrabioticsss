// Helper para generar datos de prueba únicos
export const generateTestUser = () => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);
  
  return {
    name: `Usuario Test ${randomId}`,
    email: `test${timestamp}${randomId}@nutrabiotics.com`,
    password: 'test123456',
    role: 'developer' as const
  };
};

export const generateTestEmail = () => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);
  return `test${timestamp}${randomId}@nutrabiotics.com`;
};
