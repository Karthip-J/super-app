import React from "react";
import { MdCheckCircle, MdPending, MdDeliveryDining, MdShoppingBag, MdHotel, MdRestaurant, MdLocalTaxi } from "react-icons/md";
import Card from "components/card";

const TaskCard = ({ pendingOrders = 0, completedOrders = 0 }) => {
  // Task items based on order stats
  const tasks = [
    {
      icon: <MdPending className="h-5 w-5 text-yellow-500" />,
      label: "Pending Orders",
      count: pendingOrders,
      color: "text-yellow-600 dark:text-yellow-400"
    },
    {
      icon: <MdCheckCircle className="h-5 w-5 text-green-500" />,
      label: "Completed Orders",
      count: completedOrders,
      color: "text-green-600 dark:text-green-400"
    },
    {
      icon: <MdShoppingBag className="h-5 w-5 text-blue-500" />,
      label: "Ecommerce Tasks",
      count: Math.floor(pendingOrders * 0.3),
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: <MdRestaurant className="h-5 w-5 text-orange-500" />,
      label: "Restaurant Orders",
      count: Math.floor(pendingOrders * 0.25),
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      icon: <MdDeliveryDining className="h-5 w-5 text-purple-500" />,
      label: "Grocery Deliveries",
      count: Math.floor(pendingOrders * 0.25),
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: <MdHotel className="h-5 w-5 text-indigo-500" />,
      label: "Hotel Bookings",
      count: Math.floor(pendingOrders * 0.1),
      color: "text-indigo-600 dark:text-indigo-400"
    },
    {
      icon: <MdLocalTaxi className="h-5 w-5 text-cyan-500" />,
      label: "Taxi Requests",
      count: Math.floor(pendingOrders * 0.1),
      color: "text-cyan-600 dark:text-cyan-400"
    },
  ];

  return (
    <Card extra="pb-7 p-[20px]">
      {/* task header */}
      <div className="relative flex flex-row justify-between">
        <div className="flex items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-100 dark:bg-white/5">
            <MdCheckCircle className="h-6 w-6 text-brand-500 dark:text-white" />
          </div>
          <h4 className="ml-4 text-xl font-bold text-navy-700 dark:text-white">
            Order Summary
          </h4>
        </div>
      </div>

      {/* task content */}
      <div className="h-full w-full overflow-y-auto max-h-[300px]">
        {tasks.map((task, index) => (
          <div key={index} className="mt-3 flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-navy-700">
                {task.icon}
              </div>
              <p className="text-sm font-semibold text-navy-700 dark:text-white">
                {task.label}
              </p>
            </div>
            <div className={`text-lg font-bold ${task.color}`}>
              {task.count}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-navy-600">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Active</span>
          <span className="text-xl font-bold text-navy-700 dark:text-white">
            {pendingOrders + completedOrders}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
