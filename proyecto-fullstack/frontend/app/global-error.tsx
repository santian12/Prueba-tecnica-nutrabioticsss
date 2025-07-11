'use client';

export default function GlobalError() {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900">500</h1>
                <h2 className="mt-4 text-xl font-semibold text-gray-700">Error del servidor</h2>
                <p className="mt-2 text-gray-600">
                  Ha ocurrido un error interno.
                </p>
                <div className="mt-6 space-y-3">
                  <a
                    href="/"
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Volver al inicio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
