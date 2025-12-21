import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, Phone, Mail, MessageCircle, Clock, FileText, Shield, CreditCard, User, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function HotelSupport() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('help');
    
    const supportOptions = [
        {
            id: 'booking',
            icon: <FileText size={24} />,
            title: 'Booking Issues',
            description: 'Help with reservations, cancellations, and modifications'
        },
        {
            id: 'payment',
            icon: <CreditCard size={24} />,
            title: 'Payment & Billing',
            description: 'Questions about payments, refunds, and invoices'
        },
        {
            id: 'account',
            icon: <User size={24} />,
            title: 'Account Support',
            description: 'Profile, login, and account management issues'
        },
        {
            id: 'location',
            icon: <MapPin size={24} />,
            title: 'Location & Navigation',
            description: 'Help finding hotels and directions'
        },
        {
            id: 'safety',
            icon: <Shield size={24} />,
            title: 'Safety & Security',
            description: 'Safety concerns and security measures'
        },
        {
            id: 'other',
            icon: <HelpCircle size={24} />,
            title: 'Other Questions',
            description: 'Any other assistance you may need'
        }
    ];
    
    const faqs = [
        {
            question: "How do I modify or cancel my booking?",
            answer: "You can modify or cancel your booking through the 'My Bookings' section in your account. Cancellation policies vary by hotel."
        },
        {
            question: "When will I receive my refund?",
            answer: "Refunds are typically processed within 5-7 business days after cancellation, depending on your payment method."
        },
        {
            question: "How do I contact the hotel directly?",
            answer: "Hotel contact information is available in your booking confirmation email and in the 'My Bookings' section."
        },
        {
            question: "What if I don't receive a booking confirmation?",
            answer: "Check your spam folder first. If you still can't find it, contact our support team with your booking details."
        }
    ];
    
    const contactMethods = [
        {
            icon: <Phone size={20} />,
            title: 'Phone Support',
            detail: '+91 98765 43210',
            availability: '24/7'
        },
        {
            icon: <Mail size={20} />,
            title: 'Email Support',
            detail: 'support@superapp.com',
            availability: 'Within 24 hours'
        },
        {
            icon: <MessageCircle size={20} />,
            title: 'Live Chat',
            detail: 'Available now',
            availability: '9AM - 9PM IST'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50 p-4">
                <div className="relative flex items-center justify-center max-w-2xl mx-auto px-4">
                    <button onClick={() => navigate(-1)} className="absolute left-0">
                        <ArrowLeft size={24} className="text-gray-700 hover:text-sky-600" />
                    </button>
                    <h1 className="text-lg font-bold text-sky-600">Support</h1>
                </div>
            </header>
            
            <div className="pt-20 pb-24 max-w-2xl mx-auto px-4">
                {/* Support Header */}
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-white/20 p-3 rounded-full">
                            <HelpCircle size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">How can we help you?</h2>
                            <p className="text-sky-100">We're here to assist with your hotel booking needs</p>
                        </div>
                    </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm">
                    <button 
                        className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${activeTab === 'help' ? 'bg-sky-100 text-sky-700' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('help')}
                    >
                        Help Center
                    </button>
                    <button 
                        className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${activeTab === 'contact' ? 'bg-sky-100 text-sky-700' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        Contact Us
                    </button>
                    <button 
                        className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${activeTab === 'faq' ? 'bg-sky-100 text-sky-700' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('faq')}
                    >
                        FAQs
                    </button>
                </div>
                
                {/* Help Center Tab */}
                {activeTab === 'help' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800">Select a topic to get help</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {supportOptions.map((option) => (
                                <div 
                                    key={option.id}
                                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-sky-200 hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => {
                                        // In a real app, this would navigate to a specific help page
                                        alert(`You selected: ${option.title}. In a full implementation, this would take you to detailed help for this topic.`);
                                    }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="bg-sky-100 text-sky-600 p-3 rounded-lg">
                                            {option.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-1">{option.title}</h4>
                                            <p className="text-sm text-gray-600">{option.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Contact Us Tab */}
                {activeTab === 'contact' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-800">Get in touch with us</h3>
                        
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Clock size={20} className="text-sky-600" />
                                Support Hours
                            </h4>
                            <p className="text-gray-600 mb-2">Our customer support team is available:</p>
                            <ul className="text-gray-600 list-disc pl-5 space-y-1">
                                <li>24/7 for urgent booking issues</li>
                                <li>9:00 AM - 9:00 PM IST for general inquiries</li>
                                <li>Email support within 24 hours</li>
                            </ul>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {contactMethods.map((method, index) => (
                                <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
                                    <div className="bg-sky-100 text-sky-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                        {method.icon}
                                    </div>
                                    <h4 className="font-bold text-gray-800 mb-1">{method.title}</h4>
                                    <p className="text-sky-600 font-medium mb-1">{method.detail}</p>
                                    <p className="text-xs text-gray-500">{method.availability}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h4 className="font-bold text-gray-800 mb-4">Send us a message</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                                        <option>Select a subject</option>
                                        <option>Booking Issue</option>
                                        <option>Payment Problem</option>
                                        <option>Account Access</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                        placeholder="Describe your issue in detail..."
                                    ></textarea>
                                </div>
                                <button className="w-full bg-sky-600 text-white py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* FAQs Tab */}
                {activeTab === 'faq' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h3>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-5">
                                        <h4 className="font-bold text-gray-800 mb-2">{faq.question}</h4>
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="bg-sky-50 rounded-xl p-6 mt-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-sky-100 text-sky-600 p-3 rounded-lg">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-2">Still need help?</h4>
                                    <p className="text-gray-600 mb-3">If you can't find what you're looking for, our support team is ready to assist you.</p>
                                    <button 
                                        className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
                                        onClick={() => setActiveTab('contact')}
                                    >
                                        Contact Support
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HotelSupport;