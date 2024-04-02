import { Chart as ChartJS, registerables } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(...registerables);

type BarChartProps = {
  unformattedData: any;
  label: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
};
export default function BarChart({
  unformattedData,
  label,
  backgroundColor,
  borderColor,
  borderWidth,
}: BarChartProps) {
  const formattedData = {
    labels: unformattedData?.map((data: any) => data.date),
    datasets: [
      {
        label: label,
        data: unformattedData?.map((data: any) => data.count),
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: borderWidth,
      },
    ],
  };
  return <Bar data={formattedData} />;
}
