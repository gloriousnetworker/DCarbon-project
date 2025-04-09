// src/components/dashboard/Transaction.jsx
import React, { useState } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';

const DashboardHelpCentre = () => {
  // Mock FAQ data (8 items)
  const faqs = [
    {
      id: 1,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 2,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 3,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 4,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 5,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 6,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 7,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 8,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    }
  ];

  // State to track which FAQ item is open
  const [openIndex, setOpenIndex] = useState(null);

  // Toggle open/close
  const handleToggle = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      {/* Heading in #039994 */}
      <h2 className="text-2xl font-semibold text-[#039994]">
        Frequently Asked Questions
      </h2>

      <div className="mt-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.id} className="py-2">
              {/* Question row */}
              <div
                onClick={() => handleToggle(index)}
                className="flex items-center justify-between cursor-pointer"
              >
                <p className="font-medium text-gray-800">
                  {faq.question}
                </p>
                {isOpen ? (
                  <FiX className="text-[#039994]" size={20} />
                ) : (
                  <FiChevronDown className="text-[#039994]" size={20} />
                )}
              </div>

              {/* Answer (only rendered if open) */}
              {isOpen && (
                <div className="mt-2">
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                  <hr className="my-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHelpCentre;
