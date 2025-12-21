import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PaymentGateway() {
    const [selectedTab, setSelectedTab] = useState('razorpay');
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        key_id: '',
        secret_key: '',
        status: 0, // 0 - Disabled, 1 - Enabled
        payment_mode: 'live', // Default value
    });
    const [themeColor, setThemeColor] = useState('#0000ff');

    const tableData = [
        { id: 1, brand_name: 'Razorpay', status: 1 },
        { id: 2, brand_name: 'PayPal', status: 1 },
        { id: 3, brand_name: 'Stripe', status: 1 },
        // Removed Cash on Delivery
    ];

    const handleTabClick = (tab) => {
        setSelectedTab(tab);
        fetchPaymentData(tab);
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    };

    const fetchPaymentData = async (selectedTab) => {
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const ids = {
                razorpay: 1,
                paypal: 2,
                stripe: 3,
            };

            const paymentId = ids[selectedTab];
            const response = await axios.get(
                `https://yrpitsolutions.com/ecom_backend/api/admin/get_payment_keys_by_id/${paymentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200 && response.data.data) {
                const data = response.data.data;
                setFormValues({
                    key_id: data.key_id || '',
                    secret_key: data.secret_key || '',
                    status: data.status === '1' ? 1 : 0,
                    payment_mode: data.payment_mode || '', // Default to 'live' if not set
                });
            } else {
                console.error('Failed to fetch payment data');
            }
        } catch (error) {
            console.error('Error fetching payment data:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            let apiUrl = '';

            switch (selectedTab) {
                case 'razorpay':
                    apiUrl = `https://yrpitsolutions.com/ecom_backend/api/admin/update_razorpay_payment_key_by_id/1`;
                    break;
                case 'paypal':
                    apiUrl = `https://yrpitsolutions.com/ecom_backend/api/admin/update_paypal_payment_key_by_id/2`;
                    break;
                case 'stripe':
                    apiUrl = `https://yrpitsolutions.com/ecom_backend/api/admin/update_stripe_payment_key_by_id/3`;
                    break;
                default:
                    console.error('Unsupported payment method');
                    return;
            }

            const payload = {
                key_id: formValues.key_id,
                secret_key: formValues.secret_key,
                status: formValues.status,
                payment_mode: formValues.payment_mode,
            };

            const response = await axios.put(apiUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                fetchPaymentData(selectedTab); // Refresh after successful update
            } else {
                console.error('Failed to update payment data');
            }
        } catch (error) {
            console.error('Error updating payment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnableStatus = () => {
        setFormValues(prev => ({ ...prev, status: 1 }));
    };

    const handleDisableStatus = () => {
        setFormValues(prev => ({ ...prev, status: 0 }));
    };

    useEffect(() => {
        fetchPaymentData(selectedTab);
    }, [selectedTab]);

    const renderFormFields = () => (
        <form onSubmit={handleSubmit}>
            <h2 
                className="text-xl font-semibold mb-4 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
            >
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Status
            </h2>

            {/* Enable/Disable Button */}
            <div className="mb-4">
                <label 
                    className="block text-sm font-medium transition-colors duration-300"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Enable/Disable
                </label>
                <div
                    className={`relative inline-block w-14 h-5 m-3 rounded-full transition-all duration-300 ease-in-out
                        ${formValues.status === 1 ? 'bg-[#4318ff]' : 'bg-gray-500'}`}
                    style={{ borderRadius: '9999px' }}
                >
                    <button
                        type="button"
                        onClick={formValues.status === 1 ? handleDisableStatus : handleEnableStatus}
                        className={`absolute top-0 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-250 ease-in-out
                            ${formValues.status === 1 ? 'translate-x-9' : 'translate-x-0'}`}
                    />
                </div>
            </div>

            {/* Render fields only if it's not 'cod' */}
            {selectedTab !== 'cod' && (
                    <>
                    <div className="mb-4">
                        <label 
                            htmlFor="key_id" 
                            className="block text-sm font-medium transition-colors duration-300"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Key ID
                        </label>
                        <input
                            type="text"
                            id="key_id"
                            name="key_id"
                            value={formValues.key_id}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-md transition-colors duration-300"
                            readOnly={true}
                            style={{ 
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <label 
                            htmlFor="secret_key" 
                            className="block text-sm font-medium transition-colors duration-300"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Secret Key
                        </label>
                        <input
                            type="text"
                            id="secret_key"
                            name="secret_key"
                            value={formValues.secret_key}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-md transition-colors duration-300"
                            readOnly={true}
                            style={{ 
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </div>

                    {/* Payment Mode as Dropdown for all gateways */}
                    <div className="mb-4">
                        <label 
                            htmlFor="payment_mode" 
                            className="block text-sm font-medium transition-colors duration-300"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Payment Mode
                        </label>
                        <select
                            id="payment_mode"
                            name="payment_mode"
                            value={formValues.payment_mode}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-md transition-colors duration-300"
                            style={{
                                backgroundColor: 'var(--bg-input)',
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <option value="live">Live</option>
                            <option value="sandbox">Sandbox</option>
                        </select>
                    </div>
                </>
            )}

            <button
                type="submit"
                disabled={loading}
                className="relative bg-[#4318ff] text-white px-6 py-3 rounded-lg flex items-center ml-auto max-w-xs"
            >
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                    </div>
                ) : (
                    'Save Changes'
                )}
            </button>
        </form>
    );

    const activeTabs = tableData.filter(tab => tab.status === 1); // Ensure active status comparison is correct

    return (
        <>
            <div 
                className="container mx-auto flex p-8 transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg-primary)' }}
            >
                <div 
                    className="w-1/4 mr-8 p-5 rounded-lg transition-colors duration-300"
                    style={{ 
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    {activeTabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`w-full text-left py-2 px-6 mb-2 rounded-md transition-colors duration-300
                                ${selectedTab === tab.brand_name.toLowerCase() 
                                    ? 'bg-[#4318ff] text-white' 
                                    : 'text-black dark:text-white hover:bg-[#4318ff] hover:text-white'}`}
                            style={{ 
                                backgroundColor: selectedTab === tab.brand_name.toLowerCase() 
                                    ? '#4318ff' 
                                    : 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)'
                            }}
                            onClick={() => handleTabClick(tab.brand_name.toLowerCase())}
                        >
                            {tab.brand_name}
                        </button>
                    ))}
                </div>

                <div 
                    className="w-3/4 p-4 rounded-lg shadow-lg transition-colors duration-300"
                    style={{ 
                        backgroundColor: 'var(--bg-card)',
                        borderColor: themeColor 
                    }}
                >
                    {renderFormFields()}
                </div>
            </div>
        </>
    );
}

export default PaymentGateway;
