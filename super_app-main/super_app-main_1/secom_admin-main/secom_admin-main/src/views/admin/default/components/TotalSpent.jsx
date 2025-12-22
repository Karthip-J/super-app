import React, { useMemo } from "react";
import {
  MdArrowDropUp,
  MdArrowDropDown,
  MdOutlineCalendarToday,
  MdBarChart,
} from "react-icons/md";
import Card from "components/card";
import LineChart from "components/charts/LineChart";

const TotalSpent = ({ totalRevenue = 0, monthlyData = [] }) => {
  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `₹${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  // Calculate growth percentage from monthly data
  const growthPercentage = useMemo(() => {
    if (monthlyData.length >= 2) {
      const currentMonth = monthlyData[monthlyData.length - 1]?.revenue || 0;
      const previousMonth = monthlyData[monthlyData.length - 2]?.revenue || 1;
      const growth = ((currentMonth - previousMonth) / previousMonth) * 100;
      return growth.toFixed(2);
    }
    return 0;
  }, [monthlyData]);

  const isPositiveGrowth = parseFloat(growthPercentage) >= 0;

  // Prepare chart data from monthlyData
  const chartData = useMemo(() => {
    if (monthlyData.length === 0) {
      return [
        {
          name: "Revenue",
          data: [0, 0, 0, 0, 0, 0],
          color: "#4318FF",
        },
        {
          name: "Orders",
          data: [0, 0, 0, 0, 0, 0],
          color: "#6AD2FF",
        },
      ];
    }

    return [
      {
        name: "Revenue",
        data: monthlyData.map(m => m.revenue / 1000), // Convert to K for better display
        color: "#4318FF",
      },
      {
        name: "Orders",
        data: monthlyData.map(m => m.orders * 100), // Scale orders for visibility
        color: "#6AD2FF",
      },
    ];
  }, [monthlyData]);

  const chartOptions = useMemo(() => ({
    legend: {
      show: false,
    },
    theme: {
      mode: "light",
    },
    chart: {
      type: "line",
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    tooltip: {
      style: {
        fontSize: "12px",
        fontFamily: undefined,
        backgroundColor: "#000000"
      },
      theme: 'dark',
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
    grid: {
      show: false,
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "12px",
          fontWeight: "500",
        },
      },
      type: "text",
      range: undefined,
      categories: monthlyData.length > 0 
        ? monthlyData.map(m => m.month.toUpperCase())
        : ["SEP", "OCT", "NOV", "DEC", "JAN", "FEB"],
    },
    yaxis: {
      show: false,
    },
  }), [monthlyData]);

  return (
    <Card extra="!p-[20px] text-center">
      <div className="flex justify-between">
        <button className="linear mt-1 flex items-center justify-center gap-2 rounded-lg bg-lightPrimary p-2 text-gray-600 transition duration-200 hover:cursor-pointer hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:hover:opacity-90 dark:active:opacity-80">
          <MdOutlineCalendarToday />
          <span className="text-sm font-medium text-gray-600 dark:text-white">This month</span>
        </button>
      </div>

      <div className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
        <div className="flex flex-col">
          <p className="mt-[20px] text-3xl font-bold text-navy-700 dark:text-white">
            {formatCurrency(totalRevenue)}
          </p>
          <div className="flex flex-col items-start">
            <p className="mt-2 text-sm text-gray-600">Total Revenue</p>
            <div className="flex flex-row items-center justify-center">
              {isPositiveGrowth ? (
                <MdArrowDropUp className="font-medium text-green-500" />
              ) : (
                <MdArrowDropDown className="font-medium text-red-500" />
              )}
              <p className={`text-sm font-bold ${isPositiveGrowth ? 'text-green-500' : 'text-red-500'}`}>
                {isPositiveGrowth ? '+' : ''}{growthPercentage}%
              </p>
            </div>
          </div>
        </div>
        <div className="h-full w-full">
          <LineChart
            options={chartOptions}
            series={chartData}
          />
        </div>
      </div>
    </Card>
  );
};

export default TotalSpent;
