import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { TokenExpiration } from 'views/auth/TokenExpiration ';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';



function Faq() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedQuestion, setselectedQuestion] = useState(null);
    const [question, setquestion] = useState('');
    const [answer, setanswer] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    const validationSchemaAdd = Yup.object({
        question: Yup.string().required('Question Name is required'),
        answer: Yup.string().required('answer Name is required'),

    });

    const validationSchemaEdit = Yup.object({
        question: Yup.string().required('Question Name is required'),
        answer: Yup.string().required('answer Name is required'),
    });

    const { register, reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            question: selectedQuestion?.question || '',
            answer: selectedQuestion?.answer || ''
        }
    });


    const fetchFaqData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_faq');
            let data = response.data;


            if (searchQuery.trim() !== '') {
                data = data.filter((faq) =>
                    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            setFilteredData(data);
            setTotalItems(data.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchFaqData();
    }, [itemsPerPage, currentPage, searchQuery]);

    useEffect(() => {
        if (searchQuery.trim() === '') {

            setFilteredData(tableData);
            setTotalItems(tableData.length);
        } else {

            const filtered = tableData.filter((faq) =>
                faq.faq_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
        }
    }, [searchQuery, tableData]);


    // Handle page change
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    useEffect(() => {
        if (searchQuery) {
            const filtered = tableData.filter((user) =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by name
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1); // Reset to first page when search query changes
        } else {
            setFilteredData(tableData); // If no search query, show all users
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);

    useEffect(() => {
        fetchFaqData();
    }, [itemsPerPage]);

    const handleAnswerChange = (value) => {
        setanswer(value);
    };

    const [error, setError] = useState(null);
    const handleFormSubmit = async (data) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('question', data.question);
        formData.append('answer', data.answer);
    
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const response = await axios.post(
                'https://yrpitsolutions.com/ecom_backend/api/admin/save_faq',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            
            if (response.status === 200) {
                setOpenAddModal(false);
                fetchFaqData();
                toast.success('FAQ added successfully!', {
                    progress: undefined, // Hide the progress bar
                    hideProgressBar: true,
                });
            }
        } catch (error) {
            console.error('Error saving FAQ:', error);
            toast.error('Error saving FAQ!', {
                progress: undefined, // Hide the progress bar
                hideProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Update Form (Edit FAQ)
    const handleFormUpdate = async (data) => {
        setLoading(true);
    
        const formData = new FormData();
        formData.append('question', data.question);
        formData.append('answer', data.answer);
        formData.append('_method', 'PUT');
    
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
    
            const response = await axios({
                method: 'POST',
                url: `https://yrpitsolutions.com/ecom_backend/api/admin/update_faq_by_id/${selectedQuestion.id}`, // URL with selected FAQ id
                data: formData,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            if (response.status === 200) {
                setOpenEditModal(false);
                fetchFaqData();
                toast.success('FAQ updated successfully!', {
                    progress: undefined, // Hide the progress bar
                    hideProgressBar: true,
                });
            }
        } catch (error) {
            console.error('Error updating FAQ:', error);
            toast.error('Error updating FAQ!', {
                progress: undefined, // Hide the progress bar
                hideProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    };


    const handleAddfaq = () => {
        setselectedQuestion(null);
        setValue('question', '');
        setValue('answer', '');
        setImagePreview(null);
        setOpenAddModal(true);
    };

    const handleEditRow = (faq) => {
        setselectedQuestion(faq);
        // setValue('question', faq.question);
        // setanswer('answer', faq.answer);

        setOpenEditModal(true);
    };


    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            
            // Perform the delete request
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_faq_by_id/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
    
            // Refresh FAQ data and close the delete dialog
            fetchFaqData();
            setOpenDeleteDialog(false);
    
            // Show success toast
            toast.success('FAQ deleted successfully!', {
                progress: undefined,  // Hide progress bar
                hideProgressBar: true,
            });
    
        } catch (error) {
            console.error('Error deleting FAQ:', error);
    
            // Show error toast
            toast.error('Error deleting FAQ!', {
                progress: undefined,  // Hide progress bar
                hideProgressBar: true,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
    };
    const handleBulkDelete = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
    
            // Iterate through selected rows and delete each FAQ
            for (let id of selectedRows) {
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_faq_by_id/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }
    
            // Refresh data and reset state
            await fetchFaqData();
            setSelectedRows([]); // Clear selection
            window.location.reload(); // Optionally refresh the page
    
            // Show success toast after bulk delete is complete
            toast.success('Selected FAQs deleted successfully!', {
                progress: undefined, // Hide the progress bar
                hideProgressBar: true,
            });
    
        } catch (error) {
            console.error('Error deleting selected FAQs:', error);
    
            // Show error toast if something goes wrong
            toast.error('Error deleting selected FAQs!', {
                progress: undefined, // Hide the progress bar
                hideProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRowSelection = (id) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(id)
                ? prevSelectedRows.filter((rowId) => rowId !== id)
                : [...prevSelectedRows, id]
        );
    };

    // Get paginated data
    const getPaginatedData = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);
    };
    const dropdownRef = useRef(null);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCloseAddModal = () => {
        setOpenAddModal(false);
        setanswer(null);
        reset();
    };

    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setanswer(null);
        reset();
    };

    useEffect(() => {
        if (selectedQuestion) {
            setValue('question', selectedQuestion.question); // Prefill question
            setValue('answer', selectedQuestion.answer); // Prefill answer
        }
    }, [selectedQuestion, setValue]);
    return (
        <div className=" min-h-screen pt-6">
             
            <TokenExpiration />
            <ToastContainer/>
            <div className="w-full mx-auto">
                <span className="flex mt-4 items-center w-full gap-6">
                    {/* Search bar */}
                    <div className="relative flex  flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
                        <div className="flex h-full w-full items-center rounded-full text-navy-700 dark:bg-navy-900 dark:text-white">
                            <p className="pl-3 pr-2 text-xl">
                                <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
                            </p>
                            <input
                                type="text"
                                placeholder="Search by Question..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAddfaq}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Question
                    </button>
                </span>





                {/* Add Modal */}
                {openAddModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-2xl p-8 w-[70%] max-w-3xl">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Add Question and Answer</h3>
                            <form onSubmit={handleSubmit(handleFormSubmit)}>
                                {/* Question Input */}
                                <div className="mb-6">
                                    <label htmlFor="question" className="block text-lg text-gray-600 font-medium mb-2">
                                        Question <span className="text-red-500 ">*</span>
                                    </label>
                                    <input
                                        name="question"
                                        type="text"
                                        id="question"
                                        {...register('question')}
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                        placeholder="Enter the question"
                                    />
                                    {errors.question && <p className="text-red-500 text-sm mt-2">{errors.question.message}</p>}
                                </div>

                                {/* Answer Input (React Quill) */}
                                <div className="mb-6">
                                    <label htmlFor="answer" className="block text-xl text-gray-600 font-medium mb-2">
                                        Answer <span className="text-red-500 ">*</span>
                                    </label>
                                    <Controller
                                        name="answer"
                                        control={control} // control from react-hook-form
                                        render={({ field }) => (
                                            <ReactQuill
                                                {...field} // This spreads the field value and onChange into ReactQuill
                                                value={field.value || ""} // Ensure it doesn't break if the value is undefined
                                                onChange={field.onChange} // This will automatically update the form state
                                                className="w-full rounded-lg h-[200px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                                                placeholder="Enter the answer"
                                            />
                                        )}
                                    />
                                    {errors.answer && <p className="text-red-500 text-sm mt-2">{errors.answer.message}</p>}
                                </div>

                                <div className="flex justify-end gap-4 mt-16">
                                    <button
                                        type="button"
                                        onClick={handleCloseAddModal}
                                        className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-400 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit(handleFormSubmit)}
                                        disabled={loading}
                                        className="relative bg-[#4318ff] text-white px-6 py-3 rounded-lg hover:bg-[#322bbf] transition-all"
                                    >
                                        {loading ? (
                                            <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                                                <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            'Create'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


                {/* Edit Modal */}
                {openEditModal && selectedQuestion && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-2xl p-8 w-[70%] max-w-3xl">
                            <h3 className="text-3xl font-semibold text-gray-800 mb-6">Edit Question and Answer</h3>
                            <form onSubmit={handleSubmit(handleFormUpdate)}>
                                {/* Question Input */}
                                <div className="mb-6">
                                    <label htmlFor="question" className="block text-xl text-gray-600 font-medium mb-2">
                                        Question <span className="text-red-500 ">*</span>
                                    </label>
                                    <input
                                        name="question"
                                        type="text"
                                        id="question"
                                        {...register('question')}
                                        // defaultValue={selectedQuestion?.question || ''}  
                                        className="w-full px-5 py-4 text-lg rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                                        placeholder="Enter the question"
                                    />

                                    {errors.question && <p className="text-red-500 text-sm mt-2">{errors.question.message}</p>}
                                </div>

                                {/* Answer Input (React Quill) */}
                                <div className="mb-6">
                                    <label htmlFor="answer" className="block text-xl text-gray-600 font-medium mb-2">
                                        Answer <span className="text-red-500 ">*</span>
                                    </label>
                                    <Controller
                                        name="answer"
                                        control={control}
                                        render={({ field }) => (
                                            <ReactQuill
                                                {...field}
                                                onChange={field.onChange}
                                                className="w-full rounded-lg h-[200px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                                                placeholder="Enter the answer"
                                            />
                                        )}
                                    />
                                    {errors.answer && <p className="text-red-500 text-sm mt-2">{errors.answer.message}</p>}
                                </div>


                                {/* Buttons */}
                                <div className="flex justify-end gap-4 mt-16">
                                    <button
                                        type="button"
                                        onClick={handleCloseEditModal}
                                        className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-400 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit(handleFormUpdate)}
                                        disabled={loading}
                                        className="relative bg-[#4318ff] text-white px-6 py-3 rounded-lg hover:bg-[#322bbf] transition-all"
                                    >
                                        {loading ? (
                                            <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                                                <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


                {/* Table */}
                <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-gray-600">
                                <th className="px-6 py-4 text-left">
                                    <div className="flex justify-between items-center">
                                        <input
                                            type="checkbox"
                                            // checked={selectedRows.length === getPaginatedData().length}
                                            checked={false} 
                                            onChange={() => {
                                                if (selectedRows.length === getPaginatedData().length) {
                                                    setSelectedRows([]);
                                                } else {
                                                    setSelectedRows(getPaginatedData().map((row) => row.id));
                                                }
                                            }}
                                        />
                                    </div>
                                </th>
                                {/* <th className="px-6 py-4 text-left">Image</th> */}
                                <th className="px-6 py-4 text-left">Question</th>
                                <th className="">
                                    {selectedRows.length > 0 && (
                                        <button
                                            onClick={handleBulkDelete}
                                            className={`text-gray-600 hover:text-red-600 text-xl flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="relative">
                                                    <div className="w-6 h-6 border-4 border-t-transparent border-red-600 rounded-full animate-spin"></div>
                                                </div>
                                            ) : (
                                                <FaTrashAlt />
                                            )}
                                        </button>
                                    )}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {getPaginatedData().length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-gray-500">
                                        No Questions found
                                    </td>
                                </tr>
                            ) : (
                                getPaginatedData().map((faq) => (
                                    <tr key={faq.id} className="border-t">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(faq.id)}
                                                onChange={() => handleRowSelection(faq.id)}
                                            />
                                        </td>
                                        {/* <td className="px-6 py-4">
                                            <img
                                                src={faq.photo || '/default-image.png'}
                                                alt={faq.faq_name}
                                                className="w-12 h-12 object-cover rounded-full"
                                            />
                                        </td> */}
                                        <td className="px-6 py-4">{faq.question}</td>
                                        {/* <td className="text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === faq.id ? null : faq.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openDropdown === faq.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-10"
                                                    >
                                                        <div
                                                            onClick={() => {
                                                                handleEditRow(faq);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <FaEdit className="mr-2 text-black" />
                                                            Edit
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                handleDeleteRow(faq.id);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <FaTrashAlt className="mr-2" />
                                                            Delete
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td> */}
                                        <td className="text-right">
                                            <div className="relative inline-block group">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === faq.id ? null : faq.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-10 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200  " style={{marginTop:"-30px"}}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            handleEditRow(faq);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700 cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            handleDeleteRow(faq.id);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-red-600  cursor-pointer"
                                                    >
                                                        <FaTrashAlt className="mr-2" />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                    <span className="mr-2">Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="border border-gray-300 px-4 py-2 rounded-md"
                    >
                        {[5, 10, 20, 50, 100].map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <span className="ml-2">entries</span>
                </div>

                <div className="flex space-x-4">
                    {/* Showing Item Range */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`${currentPage === 1
                            ? 'bg-[#4318ff] text-white opacity-50 cursor-not-allowed'
                            : 'bg-[#4318ff] text-white hover:bg-[#3700b3]'
                            } px-6 py-2 rounded-[20px]`}
                    >
                        Back
                    </button>
                    <span className="text-gray-600 mt-2">
                        {` ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} items`}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`${currentPage === totalPages || totalItems === 0
                            ? 'bg-[#4318ff] text-white opacity-50 cursor-not-allowed'
                            : 'bg-[#4318ff] text-white hover:bg-[#3700b3]'} px-6 py-2 rounded-[20px]`}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {openDeleteDialog && (
                <div className="fixed inset-0 flex items-center justify-center z-20 bg-gray-500 bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
                        <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this faq?</h2>
                        <div className="flex justify-end">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 mr-4 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirmation}
                                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center justify-center"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <FaSpinner className="animate-spin mr-2" />
                                ) : (
                                    'Delete'
                                )}
                                {isDeleting ? 'Deleting...' : ''}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>




    );
}

export default Faq;