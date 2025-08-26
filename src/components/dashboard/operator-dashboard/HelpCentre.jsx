"use client"

import { useState, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

const mainContainer = 'min-h-screen w-full flex flex-col py-8 px-4 bg-white'
const cardContainer = 'bg-white p-4 rounded shadow w-full max-w-4xl mx-auto'
const pageTitle = 'mb-6 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center'
const questionText = 'font-medium text-gray-800 font-sfpro cursor-pointer'
const answerText = 'text-gray-600 font-sfpro mt-2 pl-2'
const hrStyle = 'my-3 border-gray-100'
const accordionItem = 'border-b border-gray-200 py-3'
const accordionHeader = 'flex items-center justify-between cursor-pointer'
const accordionContent = 'overflow-hidden transition-all duration-300'

export default function DashboardHelpCentre() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [userType, setUserType] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const userId = localStorage.getItem('userId')
        
        const userResponse = await fetch(`https://services.dcarbon.solutions/api/user/get-one-user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const userData = await userResponse.json()
        if (userData.status === 'success') {
          setUserType(userData.data.userType)
        }

        const faqResponse = await fetch('https://services.dcarbon.solutions/api/faq/faqs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const faqData = await faqResponse.json()
        if (faqData.status === 'success') {
          let filteredFaqs = []
          
          if (userType === 'RESIDENTIAL') {
            filteredFaqs = faqData.data.faqs.filter(faq => 
              faq.target === 'GENERAL' || faq.target === 'RESIDENTIAL'
            )
          } else if (userType === 'COMMERCIAL') {
            filteredFaqs = faqData.data.faqs.filter(faq => 
              faq.target === 'GENERAL' || faq.target === 'COMMERCIAL'
            )
          } else {
            filteredFaqs = faqData.data.faqs
          }
          
          setFaqs(filteredFaqs)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userType])

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
      </div>
    )
  }

  return (
    <div className={mainContainer}>
      <h2 className={pageTitle}>Frequently Asked Questions</h2>
      <div className={cardContainer}>
        {faqs.length === 0 ? (
          <p className="text-center text-gray-500 font-sfpro">No FAQs available</p>
        ) : (
          <div className="space-y-2">
            {faqs.map((faq) => (
              <div key={faq.id} className={accordionItem}>
                <div 
                  className={accordionHeader}
                  onClick={() => toggleAccordion(faq.id)}
                >
                  <h3 className={questionText}>{faq.question}</h3>
                  {expandedId === faq.id ? (
                    <X className="text-[#039994]" size={20} />
                  ) : (
                    <ChevronDown className="text-[#039994]" size={20} />
                  )}
                </div>
                <div 
                  className={accordionContent}
                  style={{
                    maxHeight: expandedId === faq.id ? '500px' : '0px',
                    paddingTop: expandedId === faq.id ? '8px' : '0px'
                  }}
                >
                  <p className={answerText}>{faq.answer}</p>
                  {faq.videoUrl && (
                    <a
                      href={faq.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#039994] text-sm mt-2 inline-block font-sfpro"
                    >
                      Watch video explanation
                    </a>
                  )}
                  <hr className={hrStyle} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}