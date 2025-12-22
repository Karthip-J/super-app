import React from "react";
import MainDashboard from "views/admin/default";
import authRoutes from "./routes/auth.routes";
import { MdSupervisorAccount, MdLock, MdSecurity , MdHome, MdLocalShipping, MdRestaurant, MdCategory,
MdBrandingWatermark, MdViewQuilt, MdImage, MdPerson, MdPages, MdDescription, MdSettings, MdHelp,
MdStar, MdEmail, MdLibraryBooks, MdPayment, MdStore, MdInventory, MdColorLens, MdShoppingCart,
MdQuestionAnswer, MdTag, MdGroup, MdFormatSize, MdAttachMoney, MdScale, MdPeople, MdLocalPizza,
MdHotel, MdLocationCity, MdHelpOutline, MdLocalGroceryStore, MdDirectionsCar, MdDirectionsBike} from "react-icons/md";
import { AiOutlineShoppingCart, AiOutlineAppstore } from 'react-icons/ai';
import BrandTable from "views/admin/Sidenav_pages/BrandTable";
import CategoryTable from "views/admin/Sidenav_pages/CategoryTable";
import SubCategory from "views/admin/Sidenav_pages/Sub_Category";
import ProductForm from 'views/admin/Sidenav_pages/ProductForm';
import ProductVariation from "views/admin/Sidenav_pages/ProductVariation";
import Orders from "views/admin/Sidenav_pages/Orders";
import Discount from "views/admin/Sidenav_pages/Discount";
import Color from "views/admin/Sidenav_pages/Color";
import Tax from "views/admin/Sidenav_pages/Tax";
import GroupTax from "views/admin/Sidenav_pages/GroupTax";
import Users from "views/admin/Sidenav_pages/Users";
import Size from "views/admin/Sidenav_pages/Size";
import Tags from "views/admin/Sidenav_pages/Tags";
import Banner from "views/admin/Sidenav_pages/Banner";
import Profile from "views/admin/Sidenav_pages/Profile";
import Pages from "views/admin/Sidenav_pages/Pages";
import BlogCategory from "views/admin/Sidenav_pages/BlogCategory";
import BlogMain from "views/admin/Sidenav_pages/BlogMain";
import EmailConfiguration from "views/admin/Sidenav_pages/EmailConfiguration";
import HomePage from "views/admin/Sidenav_pages/HomePage";
import SectionName from "views/admin/Sidenav_pages/SectionName";
import Faq from "views/admin/Sidenav_pages/Faq";
import EmailTemplate from "views/admin/Sidenav_pages/EmailTemplate";
import Rating from "views/admin/Sidenav_pages/Rating";
import Enquiry from "views/admin/Sidenav_pages/Enquiry";
import PaymentGateway from "views/admin/Sidenav_pages/PaymentGateway";
import StockAdjustment from "views/admin/Sidenav_pages/StockAdjustment";
import Stocks from "views/admin/Sidenav_pages/Stocks";
import Units from "views/admin/Sidenav_pages/Units";
import Staff from "views/admin/Sidenav_pages/Staff";
import Role from "views/admin/Sidenav_pages/Role";
import Permissions from "views/admin/Sidenav_pages/Permissions";
import RolePermission from "views/admin/Sidenav_pages/RolePermission";
import Toppings from "views/admin/Sidenav_pages/Toppings";
import HotelAttributes from "views/admin/Sidenav_pages/HotelAttributes";
import HotelPolicy from "views/admin/Sidenav_pages/HotelPolicy";
import Hotel from "views/admin/Hotel";
import HotelFaqs from "views/admin/Sidenav_pages/HotelFaqs";
import AvailableRooms from "views/admin/Sidenav_pages/AvailableRooms";
import GroceryTable from "views/admin/Sidenav_pages/GroceryTable";
import GroceryForm from "views/admin/Sidenav_pages/GroceryForm";
import TaxiTable from "views/admin/Sidenav_pages/TaxiTable";
import TaxiForm from "views/admin/Sidenav_pages/TaxiForm";
import TaxiDriverTable from "views/admin/Sidenav_pages/TaxiDriverTable";
import TaxiDriverForm from "views/admin/Sidenav_pages/TaxiDriverForm";
import TaxiVehicleTable from "views/admin/Sidenav_pages/TaxiVehicleTable";
import TaxiVehicleForm from "views/admin/Sidenav_pages/TaxiVehicleForm";
import RestoCategoryTable from "views/admin/Sidenav_pages/RestoCategoryTable";
import RestoCategoryForm from "views/admin/Sidenav_pages/RestoCategoryForm";
import RestaurantTable from "views/admin/Sidenav_pages/RestaurantTable";
import DishTable from "views/admin/Sidenav_pages/DishTable";
import adminRoutes from './routes/admin.routes.js';
import ProductTable from 'views/admin/Sidenav_pages/ProductTable';
import HotelRoomStatusDashboard from 'views/admin/Hotel/HotelRoomStatusDashboard';
import HotelList from "views/admin/Hotel/HotelList";
import RestaurantOrders from "views/admin/Sidenav_pages/RestaurantOrders";
import GroceryOrders from "views/admin/Sidenav_pages/GroceryOrders";
import PorterTable from "views/admin/Sidenav_pages/PorterTable";
import PorterDriverPage from "views/admin/Sidenav_pages/PorterDriver";
import PorterVehiclePage from "views/admin/Sidenav_pages/PorterVehicle";
import HotelBookings from "views/admin/Sidenav_pages/HotelBookings";
import RiderTable from "views/admin/Sidenav_pages/RiderTable";
import QuickLinksTable from "views/admin/Sidenav_pages/QuickLinksTable";
import UrbanServicesDashboard from "./components/UrbanServices/Dashboard";
import ServiceCategories from "./components/UrbanServices/ServiceCategories";
import AddService from "./components/UrbanServices/AddService";
import ServicePartners from "./components/UrbanServices/ServicePartners";
import ServiceBookings from "./components/UrbanServices/ServiceBookings";

const routes = [
  ...authRoutes,
  // {
  //   name: "Dashboard",
  //   layout: "/admin",
  //   path: "default",
  //   icon: <MdHome className="h-6 w-6" />,
  //   component: <MainDashboard />,
  // },
  {
    name: "Ecommerce",
    layout: "/admin",
    icon: <MdShoppingCart className="h-6 w-6" />,
    subNav: [
      {
        name: "Brand",
        layout: "/admin",
        icon: <MdBrandingWatermark className="h-6 w-6" />,
        path: "brands",
        component: <BrandTable />,
      },
      {
        name: "Category",
        layout: "/admin",
        icon: <MdCategory className="h-6 w-6" />,
        path: "categories",
        component: <CategoryTable />,
      },
      // {
      //   name: "Sub-Category",
      //   layout: "/admin",
      //   path: "subCategory",
      //   icon: <FaTags className="h-6 w-6" />,
      //   component: <SubCategory />,
      // },
      {
        name: "Product",
        layout: "/admin",
        icon: <AiOutlineAppstore className="h-6 w-6" />,
        path: "products",
        component: <ProductTable />,
      },
      {
        name: "Orders",
        layout: "/admin",
        icon: <AiOutlineShoppingCart className="h-6 w-6" />,
        path: "orders",
        component: <Orders />,
      },
      {
        name: "Quick Links",
        layout: "/admin",
        icon: <MdViewQuilt className="h-6 w-6" />,
        path: "quick-links",
        component: <QuickLinksTable />,
      },
      // {
      //   name: "Discount",
      //   layout: "/admin",
      //   icon: <FaPercentage className="h-6 w-6" />,
      //   path: "discount",
      //   component: <Discount />,
      // },
      // {
      //   name: "Ratings",
      //   layout: "/admin",
      //   icon: <MdStar className="h-6 w-6" />, 
      //   path: "rating",
      //   component: <Rating />,
      // },
      // {
      //   name: "Stock Management",
      //   layout: "/admin",
      //   icon: <MdStore className="h-6 w-6" />, 
      //   path: "stockadjustment",
      //   component: <StockAdjustment />,
      // },
    ]
  },
  {
    name: "Restaurant",
    layout: "/admin",
    icon: <MdRestaurant className="h-6 w-6" />,
    subNav: [
      {
        name: " Category",
        layout: "/admin",
        icon: <MdCategory className="h-6 w-6" />,
        path: "restocategory",
        component: <RestoCategoryTable />,
      },
      {
        name: "Restaurant",
        layout: "/admin",
        icon: <MdRestaurant className="h-6 w-6" />,
        path: "restaurant",
        component: <RestaurantTable />,
      },
      {
        name: "Dishes",
        layout: "/admin",
        icon: <MdLocalPizza className="h-6 w-6" />,
        path: "dish",
        component: <DishTable />,
      },
      {
        name: "Orders",
        layout: "/admin",
        icon: <AiOutlineShoppingCart className="h-6 w-6" />,
        path: "restaurant-orders",
        component: <RestaurantOrders />,
      },
      // {
      //   name: "Toppings",
      //   layout: "/admin",
      //   icon: <MdLocalPizza className="h-6 w-6" />, 
      //   path: "Toppings",
      //   component: <Toppings />,
      // },
      // {
      //   name: "Stock Management",
      //   layout: "/admin",
      //   icon: <MdStore className="h-6 w-6" />, 
      //   path: "restostockadjustment",
      //   component: <StockAdjustment />,
      // },
    ]
  },
  {
    name: "Grocery",
    layout: "/admin",
    icon: <MdLocalGroceryStore className="h-6 w-6" />,
    subNav: [
      {
        name: "All Groceries",
        layout: "/admin",
        icon: <MdLocalGroceryStore className="h-6 w-6" />,
        path: "groceries",
        component: <GroceryTable />,
      },
      {
        name: "Orders",
        layout: "/admin",
        icon: <AiOutlineShoppingCart className="h-6 w-6" />,
        path: "grocery-orders",
        component: <GroceryOrders />,
      },
    ]
  },
  {
    name: "Taxi",
    layout: "/admin",
    icon: <MdDirectionsCar className="h-6 w-6" />,
    subNav: [
      {
        name: "Taxi Drivers",
        layout: "/admin",
        icon: <MdPerson className="h-6 w-6" />,
        path: "taxi-drivers",
        component: <TaxiDriverTable />,
      },
      {
        name: "Taxi Vehicles",
        layout: "/admin",
        icon: <MdDirectionsCar className="h-6 w-6" />,
        path: "taxi-vehicles",
        component: <TaxiVehicleTable />,
      },
      {
        name: "All Taxi Rides",
        layout: "/admin",
        icon: <MdDirectionsCar className="h-6 w-6" />,
        path: "taxi-rides",
        component: <TaxiTable />,
      },
    ]
  },
  {
    name: "Hotel",
    layout: "/admin",
    icon: <MdHotel className="h-6 w-6" />,
    subNav: [
      {
        name: "All Hotels",
        layout: "/admin",
        icon: <MdLocationCity className="h-6 w-6" />,
        path: "hotels",
        component: <HotelList />,
      },
      {
        name: "Hotel Attributes",
        layout: "/admin",
        icon: <MdSettings className="h-6 w-6" />,
        path: "hotelattributes",
        component: <HotelAttributes />,
      },
      {
        name: "Hotel Policy",
        layout: "/admin",
        icon: <MdDescription className="h-6 w-6" />,
        path: "hotelpolicy",
        component: <HotelPolicy />,
      },
      {
        name: "Hotel Bookings",
        layout: "/admin",
        icon: <MdPayment className="h-6 w-6" />,
        path: "hotel-bookings",
        component: <HotelBookings />,
      },
      // {
      //   name: "Manage Rooms",
      //   layout: "/admin",
      //   icon: <MdViewQuilt className="h-6 w-6" />,
      //   path: "manage-rooms",
      //   component: <ManageRooms />,
      // },
      // {
      //   name: "Hotel FAQs",
      //   layout: "/admin",
      //   icon: <MdHelpOutline className="h-6 w-6" />,
      //   path: "hotelfaqs",
      //   component: <HotelFaqs />,
      // },
    ]
  },
  {
    name: "Rider App",
    layout: "/admin",
    icon: <MdDirectionsBike className="h-6 w-6" />,
    subNav: [
      {
        name: "Rider Management",
        layout: "/admin",
        icon: <MdPerson className="h-6 w-6" />,
        path: "riders",
        component: <RiderTable />,
      },
    ]
  },
  {
    name: "User Management",
    layout: "/admin",
    icon: <MdPeople className="h-6 w-6" />,
    description: "Manage users, roles, and organizational assignments",
    subNav: [
      {
        name: "Users",
        layout: "/admin",
        icon: <MdPeople className="h-6 w-6" />,
        path: "users",
        component: <Users />,
      },
      {
        name: "Roles",
        layout: "/admin",
        icon: <MdSupervisorAccount className="h-6 w-6" />,
        path: "role",
        component: <Role />,
      },
      {
        name: "User Assignments",
        layout: "/admin",
        icon: <MdPerson className="h-6 w-6" />,
        path: "staff",
        component: <Staff />,
      },
      {
        name: "Permissions",
        layout: "/admin",
        path: "permissions",
        icon: <MdLock className="h-6 w-6" />,
        component: <Permissions />,
      },
    ]
  },
  {
    name: "System Settings",
    layout: "/admin",
    icon: <MdSettings className="h-6 w-6" />,
    subNav: [
      {
        name: "Profile",
        layout: "/admin",
        icon: <MdPerson className="h-6 w-6" />, 
        path: "profile",
        component: <Profile />,
      },
      {
        name: "Payment Gateway",
        layout: "/admin",
        icon: <MdPayment className="h-6 w-6" />, 
        path: "paymentgateway",
        component: <PaymentGateway />,
      },
      {
        name: "Email Configuration",
        layout: "/admin",
        icon: <MdSettings className="h-6 w-6" />, 
        path: "emailconfiguration",
        component: <EmailConfiguration />,
      },
      {
        name: "Email Template",
        layout: "/admin",
        icon: <MdEmail className="h-6 w-6" />, 
        path: "emailtemplate",
        component: <EmailTemplate />,
      },
      {
        name: "Taxes",
        layout: "/admin",
        icon: <MdAttachMoney className="h-6 w-6" />,
        path: "taxs",
        component: <Tax />,
      },
      {
        name: "Group Tax",
        layout: "/admin",
        icon: <MdGroup className="h-6 w-6" />,
        path: "grouptax",
        component: <GroupTax />,
      },
      {
        name: "Size",
        layout: "/admin",
        icon: <MdFormatSize className="h-6 w-6" />,
        path: "size",
        component: <Size />,
      },
      {
        name: "Color",
        layout: "/admin",
        icon: <MdColorLens className="h-6 w-6" />,
        path: "color",
        component: <Color />,
      },
      {
        name: "Units",
        layout: "/admin",
        icon: <MdScale className="h-6 w-6" />, 
        path: "units",
        component: <Units />,
      },
    ]
  },
  // {
  //   name: "Content Management",
  //   layout: "/admin",
  //   icon: <MdLibraryBooks className="h-6 w-6" />,
  //   subNav: [
  //     {
  //       name: "Pages",
  //       layout: "/admin",
  //       icon: <MdPages className="h-6 w-6" />,
  //       path: "pages",
  //       component: <Pages />,
  //     },
  //     {
  //       name: "Banner",
  //       layout: "/admin",
  //       icon: <MdImage className="h-6 w-6" />,
  //       path: "banner",
  //       component: <Banner />,
  //     },
  //     {
  //       name: "FAQ",
  //       layout: "/admin",
  //       icon: <MdHelp className="h-6 w-6" />,
  //       path: "faq",
  //       component: <Faq />,
  //     },
  //     {
  //       name: "Home Page",
  //       layout: "/admin",
  //       icon: <MdHome className="h-6 w-6" />,
  //       path: "homepage",
  //       component: <HomePage />,
  //     },
  //     {
  //       name: "Sections",
  //       layout: "/admin",
  //       icon: <MdLibraryBooks className="h-6 w-6" />,
  //       path: "sectionname",
  //       component: <SectionName />,
  //     },
  //     {
  //       name: "Blog Category",
  //       layout: "/admin",
  //       icon: <MdCategory className="h-6 w-6" />,
  //       path: "blogcategory",
  //       component: <BlogCategory />,
  //     },
  //     {
  //       name: "Blog Posts",
  //       layout: "/admin",
  //       icon: <MdDescription className="h-6 w-6" />,
  //       path: "blogmain",
  //       component: <BlogMain />,
  //     },
  //     {
  //       name: "Tags",
  //       layout: "/admin",
  //       icon: <MdTag className="h-6 w-6" />,
  //       path: "tags",
  //       component: <Tags />,
  //     },
  //     {
  //       name: "Enquiry",
  //       layout: "/admin",
  //       icon: <MdQuestionAnswer className="h-6 w-6" />, 
  //       path: "enquiry",
  //       component: <Enquiry />,
  //     },
  //   ]
  // },
  {
    name: "Porter",
    layout: "/admin",
    icon: <MdLocalShipping className="h-6 w-6" />,
    subNav: [
      {
        name: "Porter Drivers",
        layout: "/admin",
        icon: <MdPerson className="h-6 w-6" />,
        path: "porter-drivers",
        component: <PorterDriverPage />,
      },
      {
        name: "Porter Vehicles",
        layout: "/admin",
        icon: <MdDirectionsCar className="h-6 w-6" />,
        path: "porter-vehicles",
        component: <PorterVehiclePage />,
      },
      {
        name: "Porter Bookings",
        layout: "/admin",
        icon: <MdLocalShipping className="h-6 w-6" />,
        path: "porter-bookings",
        component: <PorterTable />,
      },
    ]
  },
  {
    name: "Urban Services",
    layout: "/admin",
    icon: <MdLocalShipping className="h-6 w-6" />,
    subNav: [
      {
        name: "Dashboard",
        layout: "/admin",
        icon: <MdHome className="h-6 w-6" />,
        path: "urban-services",
        component: <UrbanServicesDashboard />,
      },
      {
        name: "Service Categories",
        layout: "/admin",
        icon: <MdCategory className="h-6 w-6" />,
        path: "urban-services/categories",
        component: <ServiceCategories />,
      },
      {
        name: "Service Partners",
        layout: "/admin",
        icon: <MdPeople className="h-6 w-6" />,
        path: "urban-services/partners",
        component: <ServicePartners />,
      },
      {
        name: "Service Bookings",
        layout: "/admin",
        icon: <MdLocalShipping className="h-6 w-6" />,
        path: "urban-services/bookings",
        component: <ServiceBookings />,
      },
    ]
  },
  // Hidden routes (not shown in sidebar but accessible via direct URL)
  {
    name: "",
    layout: "/admin",
    path: "productvariation",
    component: <ProductVariation />,
  },
  {
    name: "",
    layout: "/admin",
    path: "stocks",
    component: <Stocks />,
  },
  {
    name: "",
    layout: "/admin",
    path: "available-rooms",
    component: <AvailableRooms />,
  },
  {
    name: "",
    layout: "/admin",
    path: "groceries/edit/:id",
    component: <GroceryForm />,
  },
  {
    name: "",
    layout: "/admin",
    path: "taxi-rides/edit/:id",
    component: <TaxiForm />,
  },
];

export default routes;
