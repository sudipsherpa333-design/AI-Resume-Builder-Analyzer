// src/components/MaintenanceMode.jsx
export default function MaintenanceMode() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center max-w-2xl p-8">
        <h1 className="text-4xl font-bold mb-4">🚧 Maintenance Mode</h1>
        <p className="text-xl text-gray-300 mb-6">
                    We're currently performing scheduled maintenance to improve your experience.
        </p>
        <p className="text-gray-400">
                    Expected back: <span className="font-semibold">2 hours</span>
        </p>
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm">For urgent inquiries: support@resumebuilder.com</p>
        </div>
      </div>
    </div>
  );
}