import React, { useMemo } from "react";
import PieChart from "components/charts/PieChart";
import Card from "components/card";

const PieChartCard = ({ pieData = [], revenueBreakdown = {} }) => {
  // Colors for different categories
  const categoryColors = {
    Ecommerce: "#4318FF",
    Grocery: "#6AD2FF", 
    Food: "#05CD99",
    Hotel: "#FFB547",
    Taxi: "#EE5D50"
  };

  // Prepare chart data
  const chartSeries = useMemo(() => {
    if (pieData.length === 0) {
      return [63, 25, 12]; // Default values
    }
    return pieData.map(item => item.value);
  }, [pieData]);

  const chartOptions = useMemo(() => ({
    labels: pieData.length > 0 
      ? pieData.map(item => item.name)
      : ["Ecommerce", "Grocery", "Other"],
    colors: pieData.length > 0 
      ? pieData.map(item => categoryColors[item.name] || "#4318FF")
      : ["#4318FF", "#6AD2FF", "#05CD99"],
    chart: {
      width: "50px",
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    hover: { mode: null },
    plotOptions: {
      donut: {
        expandOnClick: false,
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
    fill: {
      colors: pieData.length > 0 
        ? pieData.map(item => categoryColors[item.name] || "#4318FF")
        : ["#4318FF", "#6AD2FF", "#05CD99"],
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily: undefined,
        backgroundColor: "#000000"
      },
    },
  }), [pieData]);

  // Get top 2 categories for display
  const topCategories = useMemo(() => {
    if (pieData.length === 0) {
      return [
        { name: "Ecommerce", percentage: "63", color: "#4318FF" },
        { name: "Grocery", percentage: "25", color: "#6AD2FF" }
      ];
    }
    const sorted = [...pieData].sort((a, b) => b.value - a.value);
    return sorted.slice(0, 2).map(item => ({
      name: item.name,
      percentage: item.percentage,
      color: categoryColors[item.name] || "#4318FF"
    }));
  }, [pieData]);

  return (
    <Card extra="rounded-[20px] p-3">
      <div className="flex flex-row justify-between px-3 pt-2">
        <div>
          <h4 className="text-lg font-bold text-navy-700 dark:text-white">
            Revenue Breakdown
          </h4>
        </div>
      </div>

      <div className="mb-auto flex h-[220px] w-full items-center justify-center">
        <PieChart options={chartOptions} series={chartSeries} />
      </div>
      
      <div className="flex flex-row !justify-between rounded-2xl px-6 py-3 shadow-2xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
        {topCategories.map((category, index) => (
          <React.Fragment key={category.name}>
            {index > 0 && <div className="h-11 w-px bg-gray-300 dark:bg-white/10" />}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <p className="ml-1 text-sm font-normal text-gray-600 dark:text-gray-400">
                  {category.name}
                </p>
              </div>
              <p className="mt-px text-xl font-bold text-navy-700 dark:text-white">
                {category.percentage}%
              </p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};

export default PieChartCard;
