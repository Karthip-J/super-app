import GroceryTable from '../views/admin/Sidenav_pages/GroceryTable';
import GroceryForm from '../views/admin/Sidenav_pages/GroceryForm';
import TaxiTable from '../views/admin/Sidenav_pages/TaxiTable';
import TaxiForm from '../views/admin/Sidenav_pages/TaxiForm';
import TaxiDriverTable from '../views/admin/Sidenav_pages/TaxiDriverTable';
import TaxiDriverForm from '../views/admin/Sidenav_pages/TaxiDriverForm';
import TaxiVehicleTable from '../views/admin/Sidenav_pages/TaxiVehicleTable';
import TaxiVehicleForm from '../views/admin/Sidenav_pages/TaxiVehicleForm';
import BrandTable from '../views/admin/Sidenav_pages/BrandTable';
import BrandForm from '../views/admin/Sidenav_pages/BrandForm';
import CategoryTable from '../views/admin/Sidenav_pages/CategoryTable';
import CategoryForm from '../views/admin/Sidenav_pages/CategoryForm';
import RestoCategoryTable from '../views/admin/Sidenav_pages/RestoCategoryTable';
import RestoCategoryForm from '../views/admin/Sidenav_pages/RestoCategoryForm';
import RestaurantTable from '../views/admin/Sidenav_pages/RestaurantTable';
import RestaurantForm from '../views/admin/Sidenav_pages/RestaurantForm';
import DishTable from '../views/admin/Sidenav_pages/DishTable';
import DishForm from '../views/admin/Sidenav_pages/DishForm';
import Staff from '../views/admin/Sidenav_pages/Staff';
import HotelList from '../views/admin/Hotel/HotelList';
import HotelForm from '../views/admin/Hotel/HotelForm';
import RoomList from '../views/admin/Hotel/RoomList';
import RoomForm from '../views/admin/Hotel/RoomForm';
import ProductTable from '../views/admin/Sidenav_pages/ProductTable';
import ProductForm from '../views/admin/Sidenav_pages/ProductForm';
import ProductView from '../views/admin/Sidenav_pages/ProductView';
import RestaurantOrders from '../views/admin/Sidenav_pages/RestaurantOrders';
import PorterTable from '../views/admin/Sidenav_pages/PorterTable';
import PorterDriverPage from '../views/admin/Sidenav_pages/PorterDriver';
import PorterVehiclePage from '../views/admin/Sidenav_pages/PorterVehicle';
import PorterDriverForm from '../views/admin/Sidenav_pages/PorterDriver/PorterDriverForm';
import PorterVehicleForm from '../views/admin/Sidenav_pages/PorterVehicle/PorterVehicleForm';
import HotelBookings from '../views/admin/Sidenav_pages/HotelBookings';
import RiderTable from '../views/admin/Sidenav_pages/RiderTable';
import QuickLinksTable from '../views/admin/Sidenav_pages/QuickLinksTable';
import MainDashboard from '../views/admin/default';

const adminRoutes = [
  {
    path: 'default',
    element: <MainDashboard />,
  },
  {
    path: 'categories',
    element: <CategoryTable />,
  },
  {
    path: 'categories/new',
    element: <CategoryForm />,
  },
  {
    path: 'categories/edit/:id',
    element: <CategoryForm />,
  },
  {
    path: 'restocategory',
    element: <RestoCategoryTable />,
  },
  {
    path: 'restocategory/new',
    element: <RestoCategoryForm />,
  },
  {
    path: 'restocategory/edit/:id',
    element: <RestoCategoryForm />,
  },
  {
    path: 'groceries',
    element: <GroceryTable />,
  },
  {
    path: 'groceries/new',
    element: <GroceryForm />,
  },
  {
    path: 'groceries/edit/:id',
    element: <GroceryForm />,
  },
  {
    path: 'taxi-rides',
    element: <TaxiTable />,
  },
  {
    path: 'taxi-rides/new',
    element: <TaxiForm />,
  },
  {
    path: 'taxi-rides/edit/:id',
    element: <TaxiForm />,
  },
  {
    path: 'taxi-drivers',
    element: <TaxiDriverTable />,
  },
  {
    path: 'taxi-drivers/new',
    element: <TaxiDriverForm />,
  },
  {
    path: 'taxi-drivers/edit/:id',
    element: <TaxiDriverForm />,
  },
  {
    path: 'taxi-vehicles',
    element: <TaxiVehicleTable />,
  },
  {
    path: 'taxi-vehicles/new',
    element: <TaxiVehicleForm />,
  },
  {
    path: 'taxi-vehicles/edit/:id',
    element: <TaxiVehicleForm />,
  },
  {
    path: 'brands',
    element: <BrandTable />,
  },
  {
    path: 'brands/new',
    element: <BrandForm />,
  },
  {
    path: 'brands/edit/:id',
    element: <BrandForm />,
  },
  {
    path: 'restaurant',
    element: <RestaurantTable />,
  },
  {
    path: 'restaurant/new',
    element: <RestaurantForm />,
  },
  {
    path: 'restaurant/edit/:id',
    element: <RestaurantForm />,
  },
  {
    path: 'dish',
    element: <DishTable />,
  },
  {
    path: 'dish/new',
    element: <DishForm />,
  },
  {
    path: 'dish/edit/:id',
    element: <DishForm />,
  },
  {
    path: 'staff',
    element: <Staff />,
  },
  {
    path: 'hotels',
    element: <HotelList />,
  },
  {
    path: 'hotels/new',
    element: <HotelForm />,
  },
  {
    path: 'hotels/edit/:id',
    element: <HotelForm />,
  },
  {
    path: 'hotels/:hotelId/rooms',
    element: <RoomList />,
  },
  {
    path: 'hotels/:hotelId/rooms/new',
    element: <RoomForm />,
  },
  {
    path: 'hotels/:hotelId/rooms/edit/:roomId',
    element: <RoomForm />,
  },
  {
    path: 'products',
    element: <ProductTable />,
  },
  {
    path: 'products/new',
    element: <ProductForm />,
  },
  {
    path: 'products/edit/:id',
    element: <ProductForm />,
  },
  {
    path: 'products/view/:id',
    element: <ProductView />,
  },
  {
    path: 'restaurant-orders',
    element: <RestaurantOrders />,
  },
  {
    path: 'porter-bookings',
    element: <PorterTable />,
  },
  {
    path: 'porter-drivers',
    element: <PorterDriverPage />,
  },
  {
    path: 'porter-drivers/new',
    element: <PorterDriverForm />,
  },
  {
    path: 'porter-drivers/edit/:id',
    element: <PorterDriverForm />,
  },
  {
    path: 'porter-vehicles',
    element: <PorterVehiclePage />,
  },
  {
    path: 'porter-vehicles/new',
    element: <PorterVehicleForm />,
  },
  {
    path: 'porter-vehicles/edit/:id',
    element: <PorterVehicleForm />,
  },
  {
    path: 'hotel-bookings',
    element: <HotelBookings />,
  },
  {
    path: 'riders',
    element: <RiderTable />,
  },
  {
    path: 'quick-links',
    element: <QuickLinksTable />,
  },
];

export default adminRoutes; 