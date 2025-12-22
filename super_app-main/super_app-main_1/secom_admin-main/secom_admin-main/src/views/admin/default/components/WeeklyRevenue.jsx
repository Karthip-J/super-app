import React, { useMemo } from "react";
import Card from "components/card";
import BarChart from "components/charts/BarChart";
import { MdBarChart } from "react-icons/md";

const WeeklyRevenue = ({ weeklyRevenue = 0, dailyData = [] }) => {
  // Prepare chart data from dailyData
  const chartData = useMemo(() => {
    if (dailyData.length === 0) {
      return [
        {
          name: "Revenue",
          data: [0, 0, 0, 0, 0, 0, 0],
          color: "#6AD2FF",
        },
        {
          name: "Orders",
          data: [0, 0, 0, 0, 0, 0, 0],
          color: "#4318FF",
        },
      ];
    }

    return [
      {
        name: "Revenue",
        data: dailyData.map(d => Math.round(d.revenue / 100)), // Scale down for chart
        color: "#6AD2FF",
      },
      {
        name: "Orders",
        data: dailyData.map(d => d.orders * 10), // Scale up for visibility
        color: "#4318FF",
      },
    ];
  }, [dailyData]);

  const chartOptions = useMemo(() => ({
    chart: {
      stacked: true,
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
      theme: 'dark',
      onDatasetHover: {
        style: {
          fontSize: "12px",
          fontFamily: undefined,
        },
      },
    },
    xaxis: {
      categories: dailyData.length > 0 
        ? dailyData.map((d, i) => String(17 + i)) // Day numbers
        : ["17", "18", "19", "20", "21", "22", "23"],
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
          colors: "#A3AED0",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
    },
    grid: {
      borderColor: "rgba(163, 174, 208, 0.3)",
      show: true,
      yaxis: {
        lines: {
          show: false,
          opacity: 0.5,
        },
      },
      row: {
        opacity: 0.5,
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#5E37FF", "#6AD2FF", "#E1E9F8"],
    },
    legend: {
      show: false,
    },
    colors: ["#5E37FF", "#6AD2FF", "#E1E9F8"],
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: "20px",
      },
    },
  }), [dailyData]);

  return (
    <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-2 text-center dark:!bg-navy-800">
      <div className="mb-auto flex items-center justify-between px-6">
        <h2 className="text-lg font-bold text-navy-700 dark:text-white">
          Weekly Revenue
        </h2>
      </div>

      <div className="md:mt-16 lg:mt-0">
        <div className="h-[250px] w-full xl:h-[350px]">
          <BarChart
            chartData={chartData}
            chartOptions={chartOptions}
          />
        </div>
      </div>
    </Card>
  );
};

export default WeeklyRevenue;
