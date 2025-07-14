"use client";

export default function PrivacyCard() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Introduction</h2>
          <p className="text-gray-700">
            At DCarbon Solutions, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Information We Collect</h2>
          <p className="text-gray-700">
            We may collect personal information that you voluntarily provide to us when you register on the site or contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. How We Use Your Information</h2>
          <p className="text-gray-700">
            We use personal information to provide and operate the site, manage your account, fulfill orders, and for other business purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Sharing Your Information</h2>
          <p className="text-gray-700">
            We may share information with our business partners, service providers, for legal compliance, and in connection with business transfers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. Data Security</h2>
          <p className="text-gray-700">
            We have implemented security measures designed to protect your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Policy for Children</h2>
          <p className="text-gray-700">
            We do not knowingly collect information from children under the age of 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. Contact Us</h2>
          <p className="text-gray-700">
            If you have questions about this Privacy Policy, please contact us at privacy@dcarbon.solutions.
          </p>
        </section>
      </div>
    </div>
  );
}