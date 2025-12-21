import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from "react-icons/fa";
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FiSearch } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { TokenExpiration } from "views/auth/TokenExpiration ";
import ReactQuill from "react-quill";
import Select from "react-select";
// import { Controller } from "react-hook-form";

function Posts() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryImage, setCategoryImage] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    const validationSchemaAdd = Yup.object({
        // title: Yup.string().required("Title is required"),
        // link: Yup.string().required("Link is required"),
        // photo: Yup.string().required("Photo is required"),
        // body: Yup.string().required("Description is required"),
        // tag_id: Yup.string().required("Tag is required"),
        // categories: Yup.string().required("Category Name is required"),
    });

    const validationSchemaEdit = Yup.object({
        // title: Yup.string().required("Title is required"),
        // link: Yup.string().required("Link is required"),
        // photo: Yup.string().required("Photo is required"),
        // body: Yup.string().required("Description is required"),
        // tag_id: Yup.string().required("Tag is required"),
        // categories: Yup.string().required("Category Name is required"),
    });

    const {
        reset,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(
            openAddModal ? validationSchemaAdd : validationSchemaEdit
        ),
        defaultValues: {
            title: selectedCategory ? selectedCategory.title : "",
            link: selectedCategory ? selectedCategory.link : "",
            photo: selectedCategory ? selectedCategory.photo : "",
            body: selectedCategory ? selectedCategory.body : "",
            tag_id: selectedCategory ? selectedCategory.tag_id : "",
            categories: selectedCategory ? selectedCategory.categories : "",
        },
    });

    useEffect(() => {
        if (selectedCategory) {
            setValue("title", selectedCategory.title);
            setValue("link", selectedCategory.link);
            setValue("photo", selectedCategory.photo);
            setValue("body", selectedCategory.body);
            setValue("tag_id", selectedCategory.tag_id);
            setValue("categories", selectedCategory.categories);
            // if (!categories.some(cat => cat.id === selectedCategory.category_id)) {
            //     fetchCategoryData(selectedCategory.brand_id);
            // }
        }
    }, [selectedCategory, setValue, categories]);

    useEffect(() => {
        const fetchBrandData = async () => {
            try {
                const response = await axios.get(
                    "https://yrpitsolutions.com/nivabackend/api/get_all_tags"
                );
                setBrands(response.data);
            } catch (error) {
                console.error("Error fetching brand data:", error);
            }
        };
        fetchBrandData();
    }, []);

    // useEffect(() => {
    //     if (selectedBrand) {
    //         fetchCategoryData(selectedBrand);
    //     }
    // }, [selectedBrand]);

    // const fetchCategoryData = async (brandId) => {
    //     if (!brandId) return;
    //     try {
    //         const response = await axios.get(`https://yrpitsolutions.com/nivabackend/api/readPostCategories`);
    //         // console.log('Categories fetched:', response.data);
    //         setCategories(response.data);
    //     } catch (error) {
    //         console.error('Error fetching categories:', error);
    //         setCategories([]);
    //     }
    // };
    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const response = await axios.get(
                    "https://yrpitsolutions.com/nivabackend/api/readPostCategories"
                );
                setCategoryData(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching Category data:", error);
                setCategoryData([]);
            }
        };
        fetchCategoryData();
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to the first page when search query changes
    };

    useEffect(() => {
        fetchSubCategoryData();
    }, [searchQuery, currentPage, itemsPerPage]);

    // Fetching the subcategory data (example)
    const fetchSubCategoryData = async () => {
        try {
            const response = await axios.get(
                "https://yrpitsolutions.com/nivabackend/api/readAllPosts"
            );
            console.log(response.data);
            // Apply the filter only to the subcategory's name
            // const filteredData = response.data.filter((posts) =>
            //   posts.title.toLowerCase().includes(searchQuery.toLowerCase())
            // );

            // Update table data with filtered data
            setTableData(response.data);

            // Dynamically calculate totalItems based on filtered data
            const filteredItemsCount = filteredData.length;
            setTotalItems(filteredItemsCount); // Set the total filtered items
        } catch (error) {
            console.error("Error fetching subcategory data:", error);
        }
    };

    // Fetch data when the component mounts or when itemsPerPage changes
    useEffect(() => {
        fetchSubCategoryData();
    }, [itemsPerPage]);

    // Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    // Filter categories based on search query
    useEffect(() => {
        if (searchQuery) {
            const filtered = tableData.filter((posts) =>
                posts.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length); // Update total items based on filtered data
        } else {
            setFilteredData(tableData); // Reset to all data if no search query
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);

    // Paginate the data based on current page and itemsPerPage
    const getPaginatedData = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end); // Paginate after filtering
    };

    // Calculate total pages based on filtered data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleCloseModal = () => {
        setOpenAddModal(false);
        fetchSubCategoryData();
    };

    const handleFormSubmit = async (data) => {
        setLoading(true);

        if (!data.photo || !(data.photo instanceof File)) {
            // setError("Brand Image is required ");
            return;
        }
        const formData = new FormData();
        if (Array.isArray(data.tag_id)) {
            data.tag_id.forEach((id) => {
                formData.append("tag_id[]", id); // Append each tag_id individually
            });
        }
        formData.append("categories", data.categories);
        formData.append("title", data.title);
        formData.append("link", data.link);
        formData.append("photo", data.photo);
        formData.append("body", data.body);

        try {
            const accessToken = localStorage.getItem("OnlineShop-accessToken");
            await axios.post(
                "https://yrpitsolutions.com/nivabackend/api/saveAllPosts",
                formData,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            reset();
            setOpenAddModal(false);
            fetchSubCategoryData();
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     if (selectedBrand) {
    //       fetchCategoryData(selectedBrand);
    //     }
    // }, [selectedBrand]);

    const handleFormUpdate = async (data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append("tag_id", data.tag_id);
        formData.append("category_id", data.category_id);
        formData.append("title", data.title);
        formData.append("link", data.link);
        formData.append("photo", data.photo);
        formData.append("body", data.body);

        try {
            const accessToken = localStorage.getItem("OnlineShop-accessToken");
            const url = `https://yrpitsolutions.com/nivabackend/api/updateAllPosts/${selectedCategory.id}`;
            formData.append("_method", "put");

            await axios.post(url, formData, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            fetchSubCategoryData();
            setOpenEditModal(false);
            // setCategoryImage(null);
            reset();
        } catch (error) {
            console.error("Error updating category:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        reset();
        setOpenAddModal(true);
        setSelectedBrand(null);
        setCategories([]);
        setValue("tag_id", "");
        setValue("category_id", "");
        setValue("title", "");
        setValue("link", "");
        setValue("photo", "");
        setValue("body", "");
    };

    const handleEditRow = (category) => {
        setSelectedCategory(category);
        setOpenEditModal(true);
        reset();
    };

    const handleRowSelection = (id) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(id)
                ? prevSelectedRows.filter((rowId) => rowId !== id)
                : [...prevSelectedRows, id]
        );
    };

    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);
        try {
            const accessToken = localStorage.getItem("OnlineShop-accessToken");
            await axios.delete(
                `https://yrpitsolutions.com/nivabackend/api/deleteAllPosts/${rowIdToDelete}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            fetchSubCategoryData();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error("Error deleting category:", error);
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
            const accessToken = localStorage.getItem("OnlineShop-accessToken");
            for (let id of selectedRows) {
                await axios.delete(
                    `https://yrpitsolutions.com/nivabackend/api/deleteAllPosts/${id}`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
            }
            await fetchSubCategoryData();
            setSelectedRows([]);
        } catch (error) {
            console.error("Error deleting selected Categorys:", error);
        } finally {
            setLoading(false);
        }
    };

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleImageSaveChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            // reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setValue("photo", file);
        }
    };
    return (
        <div className="min-h-screen pt-6">
            <TokenExpiration />
            <div className="mx-auto w-full">
                <span className="mt-4 flex w-full items-center gap-6">
                    {/* Search bar */}
                    <div className="relative flex  flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
                        <div className="flex h-full w-full items-center rounded-full text-navy-700 dark:bg-navy-900 dark:text-white">
                            <p className="pl-3 pr-2 text-xl">
                                <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
                            </p>
                            <input
                                type="text"
                                placeholder="Search by Title..."
                                onChange={(e) => setSearchQuery(e.target.value)} // Directly set the search query
                                value={searchQuery}
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAddCategory}
                        className="ml-auto flex items-center rounded-full  bg-[#4318ff] px-6 py-2 text-lg font-medium text-white"
                    >
                        <FaPlus className="mr-2" /> Add Posts
                    </button>
                </span>

                {openAddModal && !openEditModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenAddModal(false)}
                    >
                        <div
                            className="max-h-[75%] w-[60%] overflow-y-auto rounded-lg bg-white p-8 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
                                Add Posts
                            </h2>

                            <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-lg font-medium text-gray-600">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Title"
                                                className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-500">
                                            {errors.title.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-2 block text-lg font-medium text-gray-600">
                                        Link <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="link"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Link"
                                                className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.link && (
                                        <p className="text-sm text-red-500">
                                            {errors.link.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-2 block text-lg font-medium text-gray-600">
                                        Photo <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="photo"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSaveChange}
                                                className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none"
                                            />
                                            // <input
                                            //   type="file"
                                            //   // placeholder="Enter Variation Price"
                                            //   className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none"
                                            //   {...field}
                                            // />
                                        )}
                                    />
                                    {errors.photo && (
                                        <p className="text-sm text-red-500">
                                            {errors.photo.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="mb-6">
                                    <label className="mb-2 block text-lg font-medium text-gray-600">
                                        Tag<span className="text-red-500 ">*</span>
                                    </label>
                                    {/* <Controller
                    name="tag_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        isMulti
                        options={brands.map((brand) => ({
                          value: brand.id, // The value corresponds to tag id
                          label: brand.tag_name, // The label corresponds to the tag name
                        }))}
                        placeholder="Select Tags"
                        onChange={(selectedOptions) => {
                          // Map selected options to an array of tag ids and update the form value
                          field.onChange(
                            selectedOptions
                              ? selectedOptions.map((option) => option.value)
                              : []
                          );
                        }}
                        className="w-full"
                        classNamePrefix="react-select"
                      />
                    )}
                  /> */}
                                    <Controller
                                        name="tag_id"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                isMulti
                                                options={brands.map((brand) => ({
                                                    value: brand.id, // The value corresponds to tag id
                                                    label: brand.tag_name, // The label corresponds to the tag name
                                                }))}
                                                placeholder="Select Tags"
                                                onChange={(selectedOptions) => {
                                                    // Map selected options to an array of tag ids and update the form value
                                                    field.onChange(
                                                        selectedOptions
                                                            ? selectedOptions.map((option) => option.value) // Update only the selected tag IDs
                                                            : []
                                                    );
                                                }}
                                                value={brands.filter(brand =>
                                                    field.value && field.value.includes(brand.id) // Map tag IDs to the corresponding tag objects
                                                ).map(brand => ({
                                                    value: brand.id,
                                                    label: brand.tag_name, // Tag names will be displayed
                                                }))}
                                                className="w-full"
                                                classNamePrefix="react-select"
                                            />
                                        )}
                                    />

                                </div>

                                <div className="mb-6">
                                    <label className="mb-2 block text-lg font-medium text-gray-600">
                                        Category<span className="text-red-500 ">*</span>
                                    </label>
                                    <Controller
                                        name="categories"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none"
                                            >
                                                <option value="">Select a Category</option>
                                                {categoryData?.map((category) => (
                                                    <option key={category.id} value={category.categories}>
                                                        {category.categories}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label
                                    htmlFor="MAIL_HOST"
                                    className="block text-base font-medium text-gray-700"
                                >
                                    Description <span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="body"
                                    control={control}
                                    render={({ field }) => (
                                        <ReactQuill
                                            {...field}
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            placeholder="Enter a description"
                                            className="w-full rounded-md px-0 py-3 text-gray-800 focus:outline-none"
                                        />
                                    )}
                                />
                                {errors.body && (
                                    <p className="text-sm text-red-500">{errors.body.message}</p>
                                )}
                            </div>
                            <div className="mt-4 flex justify-end space-x-4">
                                <button
                                    onClick={() => setOpenAddModal(false)}
                                    className="rounded-md bg-gray-300 px-6 py-3 text-gray-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSubmit(handleFormSubmit)}
                                    disabled={loading}
                                    className="relative ml-auto flex max-w-xs items-center rounded-lg bg-[#4318ff] px-6 py-3 text-white"
                                >
                                    {loading ? (
                                        <div className="absolute inset-0 flex h-full w-full items-center justify-center">
                                            <div className="border-t-transparent h-6 w-6 animate-spin rounded-full border-4 border-white"></div>
                                        </div>
                                    ) : (
                                        "Create"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* {openEditModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
            onClick={() => setOpenEditModal(false)}
          >
            <div
              className="max-h-[75%] w-[60%] overflow-y-auto rounded-lg bg-white p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-6 text-2xl font-semibold text-gray-800">
                Edit Posts
              </h2>
 
              <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-lg font-medium text-gray-600">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="variation_price"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        placeholder="Enter Title"
                        className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none"
                        {...field}
                      />
                    )}
                  />
                  {errors.variation_price && (
                    <p className="text-sm text-red-500">
                      {errors.variation_price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-lg font-medium text-gray-600">
                    Link <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        placeholder="Enter Quantity"
                        className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none"
                        {...field}
                      />
                    )}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-500">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
              </div>
 
              <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-lg font-medium text-gray-600">
                    Blog Image <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="photo"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="file"
                        placeholder="Enter Variation Price"
                        className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none"
                        {...field}
                      />
                    )}
                  />
                  {errors.variation_price && (
                    <p className="text-sm text-red-500">
                      {errors.variation_price.message}
                    </p>
                  )}
                </div>
                <div className="mb-6">
                  <label className="mb-2 block text-lg font-medium text-gray-600">
                    Category
                  </label>
                  <Controller
                    name="blog_category_name_id"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none"
                      >
                        <option value="">Select a Category</option>
                        {CategoryData.map((categorydata) => (
                          <option key={categorydata.id} value={categorydata.id}>
                            {categorydata.category_name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.blog_category_name_id && (
                    <p className="text-sm text-red-500">
                      {errors.blog_category_name_id.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="MAIL_HOST"
                  className="block text-base font-medium text-gray-700"
                >
                  Description <span className="text-red-500 ">*</span>
                </label>
                <Controller
                  name="product_description"
                  control={control}
                  render={({ field }) => (
                    <ReactQuill
                      {...field}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Enter a description"
                      className="w-full rounded-md px-0 py-3 text-gray-800 focus:outline-none"
                    />
                  )}
                />
                {errors.MAIL_HOST && (
                  <p className="text-sm text-red-500">
                    {errors.MAIL_HOST.message}
                  </p>
                )}
              </div>
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={() => setOpenEditModal(false)}
                  className="rounded-md bg-gray-300 px-6 py-3 text-gray-800"
                >
                  Cancel
                </button>
 
                <button
                  onClick={handleSubmit(handleFormUpdate)}
                  disabled={loading}
                  className="relative ml-auto flex max-w-xs items-center rounded-lg bg-[#4318ff] px-6 py-3 text-white"
                >
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-t-transparent h-6 w-6 animate-spin rounded-full border-4 border-white"></div>
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )} */}

                {/* Table */}
                <div className="mt-8 rounded-lg bg-white p-6 shadow-lg">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-gray-600">
                                <th className="px-6 py-4 text-left">
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedRows.length === getPaginatedData().length
                                            }
                                            onChange={() => {
                                                if (selectedRows.length === getPaginatedData().length) {
                                                    setSelectedRows([]);
                                                } else {
                                                    setSelectedRows(
                                                        getPaginatedData().map((row) => row.id)
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">Photo</th>
                                <th className="px-6 py-4 text-left">Title</th>
                                <th className="px-6 py-4 text-left">Link</th>
                                <th className="px-6 py-4 text-left">Tag</th>
                                <th className="px-6 py-4 text-left">Category</th>
                                {/* <th className="px-6 py-4 text-left">Description</th> */}
                                <th className="">
                                    {selectedRows.length > 0 && (
                                        <button
                                            onClick={handleBulkDelete}
                                            className={`flex items-center text-xl text-gray-600 hover:text-red-600 ${loading ? "cursor-not-allowed opacity-50" : ""
                                                }`}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="relative">
                                                    <div className="border-t-transparent h-6 w-6 animate-spin rounded-full border-4 border-red-600"></div>
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
                            {getPaginatedData().length > 0 ? (
                                getPaginatedData().map((posts) => (
                                    <tr key={posts.id} className="border-t">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(posts.id)}
                                                onChange={() => handleRowSelection(posts.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <img
                                                src={posts.photo_url}
                                                alt="photo"
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                        </td>
                                        <td className="px-6 py-4">{posts.title}</td>
                                        <td className="px-6 py-4">{posts.link}</td>
                                        <td className="px-6 py-4">
                                            {" "}
                                            {posts?.tags?.map((tag, index) => (
                                                <span key={index}>
                                                    {tag.tag_name}
                                                    {index < posts.tags.length - 1 && ", "}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4">{posts.categories}</td>
                                        <td className="text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() =>
                                                        setOpenDropdown(
                                                            openDropdown === posts.id ? null : posts.id
                                                        )
                                                    }
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openDropdown === posts.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-0 z-10 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg"
                                                    >
                                                        {/* <div
                              onClick={() => {
                                handleEditRow(posts);
                                setOpenDropdown(null);
                              }}
                              className="flex cursor-pointer items-center px-4 py-2 text-navy-700 hover:bg-gray-200"
                            >
                              <FaEdit className="text-black mr-2" />
                              Edit
                            </div> */}
                                                        <div
                                                            onClick={() => {
                                                                handleDeleteRow(posts.id);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex cursor-pointer items-center px-4 py-2 text-red-600 hover:bg-gray-200"
                                                        >
                                                            <FaTrashAlt className="mr-2" />
                                                            Delete
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No Posts data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="mr-2">Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="rounded-md border border-gray-300 px-4 py-2"
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
                            ? "cursor-not-allowed bg-[#4318ff] text-white opacity-50"
                            : "bg-[#4318ff] text-white hover:bg-[#3700b3]"
                            } rounded-[20px] px-6 py-2`}
                    >
                        Back
                    </button>
                    <span className="mt-2 text-gray-600">
                        {` ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(
                            currentPage * itemsPerPage,
                            totalItems
                        )} of ${totalItems} items`}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`${currentPage === totalPages || totalItems === 0
                            ? "cursor-not-allowed bg-[#4318ff] text-white opacity-50"
                            : "bg-[#4318ff] text-white hover:bg-[#3700b3]"
                            } rounded-[20px] px-6 py-2`}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {openDeleteDialog && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-gray-500 bg-opacity-50">
                    <div className="w-1/3 rounded-md bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-semibold">
                            Are you sure you want to delete this brand?
                        </h2>
                        <div className="flex justify-end">
                            <button
                                onClick={handleCancelDelete}
                                className="mr-4 rounded-md border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirmation}
                                className="flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <FaSpinner className="mr-2 animate-spin" />
                                ) : (
                                    "Delete"
                                )}
                                {isDeleting ? "Deleting..." : ""}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Posts;
