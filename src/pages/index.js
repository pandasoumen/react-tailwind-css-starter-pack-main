import Link from 'react-router-dom/Link';
import { useSelector } from 'react-redux';

export default function Home() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-secondary to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Your Smart Health Companion
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Connect with doctors worldwide, find blood donors, shop medical equipment,
              and get AI-powered health suggestions - all in one platform.
            </p>
            <div className="flex gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    href="/register"
                    className="px-8 py-3 bg-primary text-secondary rounded-lg hover:bg-green-400 transition font-semibold text-lg"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/doctors"
                    className="px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-semibold text-lg"
                  >
                    Find Doctors
                  </Link>
                </>
              ) : (
                <Link
                  href="/profile"
                  className="px-8 py-3 bg-primary text-secondary rounded-lg hover:bg-green-400 transition font-semibold text-lg"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything You Need for Better Health
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition">
              <div className="text-4xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Global Doctors</h3>
              <p className="text-slate-400">
                Consult with verified doctors from around the world, anytime.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition">
              <div className="text-4xl mb-4">🩸</div>
              <h3 className="text-xl font-semibold text-white mb-2">Blood Finder</h3>
              <p className="text-slate-400">
                Find blood donors near you in emergency situations quickly.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-semibold text-white mb-2">Medical Store</h3>
              <p className="text-slate-400">
                Shop for medical equipment and health products online.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Suggestions</h3>
              <p className="text-slate-400">
                Get personalized health recommendations powered by AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-secondary mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-lg text-slate-800 mb-8">
            Join thousands of users who trust Smart AI Health for their healthcare needs.
          </p>
          {!user && (
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-secondary text-white rounded-lg hover:bg-slate-800 transition font-semibold text-lg"
            >
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}