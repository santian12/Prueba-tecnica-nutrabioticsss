// Test de import para debug
console.log('🧪 Iniciando test de imports...');

import { loginUser, registerUser } from '../../lib/api-simple';

console.log('📦 Funciones importadas:');
console.log('loginUser:', typeof loginUser);
console.log('registerUser:', typeof registerUser);

if (typeof registerUser === 'function') {
  console.log('✅ registerUser es una función');
} else {
  console.log('❌ registerUser NO es una función:', registerUser);
}

if (typeof loginUser === 'function') {
  console.log('✅ loginUser es una función');
} else {
  console.log('❌ loginUser NO es una función:', loginUser);
}

export default function TestImports() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 Test de Imports</h2>
      <p>loginUser: {typeof loginUser}</p>
      <p>registerUser: {typeof registerUser}</p>
      <p>Revisa la consola para más detalles</p>
    </div>
  );
}
