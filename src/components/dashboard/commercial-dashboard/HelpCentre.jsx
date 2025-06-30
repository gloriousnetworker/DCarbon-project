"use client"

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white'
const cardContainer = 'bg-white p-4 rounded shadow w-full max-w-4xl'
const headingContainer = 'relative w-full flex flex-col items-center mb-2'
const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center'
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

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const response = await fetch('https://services.dcarbon.solutions/api/faq/faqs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (data.status === 'success') {
          setFaqs(data.data.faqs)
        }
      } catch (error) {
        console.error('Failed to fetch FAQs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFaqs()
  }, [])

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
      <div className={cardContainer}>
        <div className={headingContainer}>
          <h2 className={pageTitle}>Frequently Asked Questions</h2>
        </div>
        
        <div className="mt-6">
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
    </div>
  )
}