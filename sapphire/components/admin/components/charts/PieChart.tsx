import { Chart as ChartJS, registerables } from "chart.js";
import React from "react";
import { Pie } from "react-chartjs-2";

ChartJS.register(...registerables);

type PieChartProps = {
  unformattedData: any;
  label: string;
  backgroundColors: string[];
  borderWidth: number;
};

const PieChart = ({
  unformattedData,
  label,
  backgroundColors,
  borderWidth,
}: PieChartProps) => {
  const formattedData = {
    labels: unformattedData?.map((data: any) =>
      data.type
        ? data.type
        : data.date
        ? data.date
        : data.name
        ? data.name
        : data._id
        ? data._id
        : data.package.replace("Sapphire", "")
    ),
    datasets: [
      {
        label: label,
        data: unformattedData?.map((data: any) => data.count),
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: borderWidth,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "right",
        padding: 20,
        align: "center",
        rtl: false,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
        },
      },
    },
    layout: {
      autoPadding: true,
    },
  };
  //@ts-ignore
  return <Pie data={formattedData} options={options} />;
};

export default PieChart;
