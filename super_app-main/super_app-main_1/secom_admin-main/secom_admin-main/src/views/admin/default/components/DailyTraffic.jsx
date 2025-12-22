import React, { useMemo } from "react";
import BarChart from "components/charts/BarChart";
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import Card from "components/card";

const DailyTraffic = ({ traffic = 0, dailyData = [] }) => {
  // Calculate total orders from daily data (as traffic proxy)
  const totalTraffic = useMemo(() => {
    if (traffic > 0) return traffic;
    if (dailyData.length > 0) {
      return dailyData.reduce((sum, day) => sum + day.orders, 0) * 10; // Multiply for realistic traffic
    }
    return 2579; // Default fallback
  }, [traffic, dailyData]);

  // Calculate growth
  const growthPercentage = useMemo(() => {
    if (dailyData.length >= 2) {
      const current = dailyData[dailyData.length - 1]?.orders || 0;
      const previous = dailyData[dailyData.length - 2]?.orders || 1;
      return (((current - previous) / previous) * 100).toFixed(2);
    }
    return 2.45;
  }, [dailyData]);

  const isPositiveGrowth = parseFloat(growthPercentage) >= 0;

  // Prepare chart data
  const chartData = useMemo(() => {
    if (dailyData.length === 0) {
      return [
        {
          name: "Daily Traffic",
          data: [20, 30, 40, 20, 45, 50, 25],
          color: "#4318FF",
        },
      ];
    }

    return [
      {
        name: "Daily Traffic",
        data: dailyData.map(d => d.orders * 10), // Scale for visibility
        color: "#4318FF",
      },
    ];
  }, [dailyData]);

  const chartOptions = useMemo(() => ({
    chart: {
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      style: {
        fontSize: "12px",
        fontFamily: undefined,
        backgroundColor: "#000000"
      },
      onDatasetHover: {
        style: {
          fontSize: "12px",
          fontFamily: undefined,
        },
      },
      theme: "dark",
    },
    xaxis: {
      categories: dailyData.length > 0 
        ? dailyData.map(d => d.date)
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      show: false,
      labels: {
        show: true,
        style: {
          colors: "#A3AED0",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
      color: "black",
      labels: {
        show: false,
        style: {
          colors: "#CBD5E0",
          fontSize: "14px",
        },
      },
    },
    grid: {
      show: false,
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        colorStops: [
          [
            {
              offset: 0,
              color: "#4318FF",
              opacity: 1,
            },
            {
              offset: 100,
              color: "rgba(67, 24, 255, 1)",
              opacity: 0.28,
            },
          ],
        ],
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: "40px",
      },
    },
  }), [dailyData]);

  return (
    <Card extra="pb-7 p-[20px]">
      <div className="flex flex-row justify-between">
        <div className="ml-1 pt-2">
          <p className="text-sm font-medium leading-4 text-gray-600">
            Daily Traffic
          </p>
          <p className="text-[34px] font-bold text-navy-700 dark:text-white">
            {totalTraffic.toLocaleString()}{" "}
            <span className="text-sm font-medium leading-6 text-gray-600">
              Visitors
            </span>
          </p>
        </div>
        <div className="mt-2 flex items-start">
          <div className={`flex items-center text-sm ${isPositiveGrowth ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveGrowth ? (
              <MdArrowDropUp className="h-5 w-5" />
            ) : (
              <MdArrowDropDown className="h-5 w-5" />
            )}
            <p className="font-bold">
              {isPositiveGrowth ? '+' : ''}{growthPercentage}%
            </p>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full pt-10 pb-0">
        <BarChart
          chartData={chartData}
          chartOptions={chartOptions}
        />
      </div>
    </Card>
  );
};

export default DailyTraffic;
