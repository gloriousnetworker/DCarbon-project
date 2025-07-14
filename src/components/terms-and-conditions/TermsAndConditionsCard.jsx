"use client";

export default function TermsAndConditionsCard() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8">Terms and Conditions</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Introduction</h2>
          <p className="text-gray-700">
            Welcome to DCarbon Solutions. These terms and conditions outline the rules and regulations for the use of our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Intellectual Property Rights</h2>
          <p className="text-gray-700">
            Other than the content you own, under these Terms, DCarbon Solutions owns all the intellectual property rights and materials contained in this Website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. Restrictions</h2>
          <p className="text-gray-700">
            You are specifically restricted from publishing any Website material in any other media, selling or commercializing any Website material, using this Website in damaging ways, or engaging in any data mining activities.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Your Content</h2>
          <p className="text-gray-700">
            By displaying Your Content, you grant DCarbon Solutions a non-exclusive license to use, reproduce, adapt, publish, translate and distribute it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. No Warranties</h2>
          <p className="text-gray-700">
            This Website is provided "as is," with all faults, and DCarbon Solutions expresses no warranties related to this Website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Limitation of Liability</h2>
          <p className="text-gray-700">
            DCarbon Solutions shall not be held liable for anything arising out of your use of this Website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. Governing Law</h2>
          <p className="text-gray-700">
            These Terms will be governed by and interpreted in accordance with applicable laws.
          </p>
        </section>
      </div>
    </div>
  );
}