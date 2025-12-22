import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEllipsisV, FaEdit, FaTrashAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { SketchPicker } from 'react-color';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

const Color = () => {
    const [tableData, setTableData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newColor, setNewColor] = useState({ r: 255, g: 255, b: 255 });
    const [editColor, setEditColor] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [colorToDelete, setColorToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showModal) {
            setNewColor({ r: 0, g: 0, b: 0, a: 1 });  // Reset the color
            setLoading(false);  // Reset the loading state
        }
    }, [showModal]);  // Triggered whenever showModal changes


    // RGB to Hex conversion function
    const rgbToHex = (r, g, b) => {
        const toHex = (value) => {
            const hex = Math.max(0, Math.min(255, value)).toString(16);
            return hex.length === 1 ? `0${hex}` : hex;
        };
        return `#${toHex(parseInt(r))}${toHex(parseInt(g))}${toHex(parseInt(b))}`;
    };


    useEffect(() => {
        fetchColorData(); // Fetch color data when the component is mounted
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredData(tableData);
            setTotalItems(tableData.length);
        } else {
            const filtered = tableData.filter((color) =>
                color.color_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
        }
    }, [searchQuery, tableData]);


    // Handle row selection
    const handleRowSelection = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    // Handle color edit
    const handleEditRow = (color) => {
        setEditColor(color);
        setNewColor({ r: color.r, g: color.g, b: color.b });
        setShowModal(true);
    };

    // Handle color delete
    const handleDeleteRow = (id) => {
        setColorToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
        setColorToDelete(null);
    };

    useEffect(() => {
        fetchColorData();
    }, [itemsPerPage, currentPage, searchQuery]);

    const fetchColorData = async () => {
        try {
            const response = await axios.get(
                'https://yrpitsolutions.com/ecom_backend/api/admin/get_all_colours'
            );

            // Map the colors and add hexCode property
            const colorsWithHex = response.data.data.map((color) => ({
                ...color,
                hexCode: rgbToHex(color.r, color.g, color.b),
            }));

            // Filter the colors if a search query exists
            if (searchQuery.trim() !== '') {
                // Example filter assuming the colors have a `color_name` property
                colorsWithHex = colorsWithHex.filter((color) =>
                    color.color_name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Set the filtered or unfiltered colors to state
            setTableData(colorsWithHex);

        } catch (error) {
            console.error('Error fetching data:', error);
            setTableData([]); // Empty array if there's an error
        }
    };

    const handleAddColor = async () => {
        setLoading(true);
        const newColorHex = rgbToHex(newColor.r, newColor.g, newColor.b);
        const newColorData = {
            r: newColor.r,
            g: newColor.g,
            b: newColor.b,
            hexCode: newColorHex,
        };

        try {
            const token = localStorage.getItem('OnlineShop-accessToken');
            const response = await axios.post(
                'https://yrpitsolutions.com/ecom_backend/api/admin/save_colour',
                newColorData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Check if the response indicates success
            if (response.data) {
                setTableData((prevData) => [
                    ...prevData,
                    { ...newColorData, id: response.data.data.id },


                ]);
                toast.success('Color added successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                });
                setShowModal(false);
                fetchColorData();

                // Show success toast

            }

        } catch (error) {
            setLoading(false);
            console.error('Error adding color:', error);
            toast.error('Error adding color!', {
                progress: undefined, // Hide progress bar
                hideProgressBar: true,
            });
        }
    };


    const handleUpdateColor = async () => {
        setLoading(true);
        const updatedColorHex = rgbToHex(newColor.r, newColor.g, newColor.b);
        const updatedColorData = {
            r: newColor.r,
            g: newColor.g,
            b: newColor.b,
            hexCode: updatedColorHex,
        };

        try {
            const token = localStorage.getItem('OnlineShop-accessToken');
            const response = await axios.put(
                `https://yrpitsolutions.com/ecom_backend/api/admin/update_colour_by_id/${editColor.id}`,
                updatedColorData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setShowModal(false);
            fetchColorData();

            // Check for success
            if (response.data) {
                setTableData((prevData) =>
                    prevData.map((color) =>
                        color.id === editColor.id ? { ...color, ...updatedColorData } : color
                    )
                );

                // Show success toast
                toast.success('Color updated successfully!', {
                    progress: undefined, // Hide the progress bar
                    hideProgressBar: true,
                });
            } else {
                console.error('Error updating color:', response.data.message);
                toast.error('Error updating color!', {
                    progress: undefined, // Hide progress bar
                    hideProgressBar: true,
                });
            }
        } catch (error) {
            setLoading(false);
            console.error('Error updating color:', error);
            toast.error('Error updating color!', {
                progress: undefined, // Hide progress bar
                hideProgressBar: true,
            });
        }
    };


    const handleDeleteConfirmation = async () => {
        if (!colorToDelete) return;

        setIsDeleting(true);

        try {
            const token = localStorage.getItem('OnlineShop-accessToken');
            const response = await axios.delete(
                `https://yrpitsolutions.com/ecom_backend/api/admin/delete_colour_by_id/${colorToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
         
            // Check if the response is successful
            if (response.data) {
                setTableData((prevData) => prevData.filter((color) => color.id !== colorToDelete));
                toast.success('Color deleted successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                });
                fetchColorData();

                // Show success toast
               
            }
        } catch (error) {
            console.error('Error deleting color:', error);
            toast.error('Error deleting color. Please try again.', {
                progress: undefined, // Hide progress bar
            });
        } finally {
            setIsDeleting(false);
            setOpenDeleteDialog(false);
            setColorToDelete(null);
        }
    };


    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) return; // Prevent bulk delete if no rows are selected

        setIsDeleting(true);

        try {
            const token = localStorage.getItem('OnlineShop-accessToken');
            let successCount = 0;
            let errorCount = 0;

            // Loop through selected rows and delete them individually
            for (let colorToDelete of selectedRows) {
                const response = await axios.delete(
                    `https://yrpitsolutions.com/ecom_backend/api/admin/delete_colour_by_id/${colorToDelete}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    successCount++;
                    setTableData((prevData) =>
                        prevData.filter((color) => color.id !== colorToDelete)
                    );
                } else {
                    console.error('Error deleting color with ID:', colorToDelete, response.data.message);
                    errorCount++;
                }
            }

            // Fetch updated color data after deletion
            await fetchColorData();
            setSelectedRows([]); // Clear selected rows

            // Show success toast if any colors were deleted
            if (successCount > 0) {
                toast.success(`${successCount} colors deleted successfully!`, {
                    progress: undefined,  // Hide progress bar
                });
            }

            // Show error toast if any deletion failed
            if (errorCount > 0) {
                toast.error(`${errorCount} color(s) failed to delete.`, {
                    progress: undefined,  // Hide progress bar
                    hideProgressBar: true,
                });
            }

        } catch (error) {
            console.error('Error deleting colors:', error);

            // Show general error toast
            toast.error('Error deleting selected colors!', {
                progress: undefined,  // Hide progress bar
                hideProgressBar: true,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    useEffect(() => {
        fetchColorData();
    }, [itemsPerPage]);


    const getPaginatedData = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);
    };

    return (
        <div 
            className="min-h-screen pt-6 transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <ToastContainer />
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => {

                        setShowModal(true);
                        setEditColor(null);
                        setNewColor({ r: 255, g: 255, b: 255 });
                    }}
                    className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center mt-5"
                >
                    <FaPlus className="mr-2" /> Add Color
                </button>
            </div>

            {/* Modal for Adding Color */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div 
                        className="rounded-lg shadow-2xl p-12 w-[35%] max-h-[80%] overflow-y-auto transition-colors duration-300"
                        style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                        <h3 
                            className="text-lg font-semibold mb-4 text-center transition-colors duration-300"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Pick a Color
                        </h3>
                        <div className="flex justify-center mb-4">
                            <SketchPicker
                                color={newColor}
                                onChangeComplete={(color) => setNewColor(color.rgb)}
                            />
                        </div>
                        <div className="mt-4 flex justify-end space-x-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-md transition-colors duration-300"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddColor}
                                disabled={loading} // Disable button when loading
                                className="bg-[#4318ff] text-white px-4 py-2 rounded-md text-lg font-medium transition-colors duration-300"
                            >
                                {loading ? (
                                    <div className="spinner-border animate-spin w-5 h-5 border-4 border-t-4 border-white rounded-full"></div>
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Editing Color */}
            {showModal && editColor && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div 
                        className="rounded-lg shadow-2xl p-12 w-[35%] max-h-[80%] overflow-y-auto transition-colors duration-300"
                        style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                        <h3 
                            className="text-lg font-semibold mb-4 text-center transition-colors duration-300"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Edit Color
                        </h3>
                        <div className="flex justify-center mb-4">
                            <SketchPicker
                                color={newColor}
                                onChangeComplete={(color) => setNewColor(color.rgb)}
                            />
                        </div>
                        <div className="mt-4 flex justify-end space-x-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-md transition-colors duration-300"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateColor}
                                disabled={loading} // Disable button when loading
                                className="bg-[#4318ff] text-white px-4 py-2 rounded-md text-lg font-medium transition-colors duration-300"
                            >
                                {loading ? (
                                    <div className="spinner-border animate-spin w-5 h-5 border-4 border-t-4 border-white rounded-full"></div>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* table */}
            <div 
                className="mt-8 shadow-lg rounded-lg p-6 transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg-table)' }}
            >
                <table className="w-full table-auto">
                    <thead>
                        <tr style={{ color: 'var(--text-secondary)' }}>
                            <th className="px-6 py-4 text-left">
                                <div className="flex justify-between items-center">
                                    <input
                                        type="checkbox"
                                        // checked={selectedRows.length === getPaginatedData().length}
                                        checked={false}
                                        onChange={() =>
                                            selectedRows.length === getPaginatedData().length
                                                ? setSelectedRows([])
                                                : setSelectedRows(getPaginatedData().map((row) => row.id))
                                        }
                                        className="transition-colors duration-300"
                                        style={{ accentColor: 'var(--text-primary)' }}
                                    />
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-left transition-colors duration-300"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Color (RGB)
                            </th>
                            <th 
                                className="px-6 py-4 text-left transition-colors duration-300"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Hex Code
                            </th>
                            <th className="px-6 py-4 text-left" />
                            <th>
                                {selectedRows.length > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className={`text-gray-600 hover:text-red-600 text-xl flex items-center ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
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
                                <td 
                                    colSpan="5" 
                                    className="text-center py-6 transition-colors duration-300"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <div 
                                        className="text-lg font-semibold transition-colors duration-300"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        No Color Data Found
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            getPaginatedData().map((color) => (
                                <tr 
                                    key={color.id} 
                                    className="border-t transition-colors duration-300"
                                    style={{ borderColor: 'var(--border-color)' }}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(color.id)}
                                            onChange={() => handleRowSelection(color.id)}
                                            className="transition-colors duration-300"
                                            style={{ accentColor: 'var(--text-primary)' }}
                                        />
                                    </td>
                                    <td 
                                        className="px-6 py-4 transition-colors duration-300"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {`RGB(${color.r}, ${color.g}, ${color.b})`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-6 h-6 rounded-full"
                                                style={{ backgroundColor: color.hexCode }}
                                            />
                                            <span 
                                                className="transition-colors duration-300"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {color.hexCode}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="relative inline-block group">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === color.id ? null : color.id)}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                <FaEllipsisV />
                                            </button>
                                            <div
                                                className="absolute right-10 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200  " style={{ marginTop: "-30px" }}
                                            >
                                                <div
                                                    onClick={() => {
                                                        handleEditRow(color);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="flex items-center px-4 py-2 text-navy-700  cursor-pointer"
                                                >
                                                    <FaEdit className="mr-2 text-black" />
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        handleDeleteRow(color.id);
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

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                    <span 
                        className="mr-2 transition-colors duration-300"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Show
                    </span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="border px-4 py-2 rounded-md transition-colors duration-300"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-color)'
                        }}
                    >
                        {[5, 10, 20, 50, 100].map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <span 
                        className="ml-2 transition-colors duration-300"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        entries
                    </span>
                </div>

                <div className="flex space-x-4">
                    {/* Showing Item Range */}
                    <span 
                        className="transition-colors duration-300"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {`Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(
                            currentPage * itemsPerPage,
                            filteredData.length
                        )} of ${filteredData.length} items`}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`${currentPage === 1
                            ? 'bg-[#4318ff] text-white opacity-50 cursor-not-allowed'
                            : 'bg-[#4318ff] text-white hover:bg-[#3700b3]'
                            } px-6 py-2 rounded-md`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`${currentPage === totalPages || filteredData.length === 0
                            ? 'bg-[#4318ff] text-white opacity-50 cursor-not-allowed'
                            : 'bg-[#4318ff] text-white hover:bg-[#3700b3]'
                            } px-6 py-2 rounded-md`}
                    >
                        Next
                    </button>
                </div>
            </div>


            {/* Modal for Deleting Color */}
            {openDeleteDialog && (
                <div className="fixed inset-0 flex items-center justify-center z-20 bg-gray-500 bg-opacity-50">
                    <div 
                        className="p-6 rounded-md shadow-lg w-1/3 transition-colors duration-300"
                        style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                        <h2 
                            className="text-xl font-semibold mb-4 transition-colors duration-300"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Are you sure you want to delete this color?
                        </h2>
                        <div className="flex justify-end">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 mr-4 border rounded-md transition-colors duration-300"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirmation} // Trigger the delete API call
                                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center justify-center"
                                disabled={isDeleting} // Disable if deleting is in progress
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
};

export default Color;
