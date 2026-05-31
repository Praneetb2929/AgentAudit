import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

const getRiskColor = (score) => {
  if (score <= 20) return "#4ade80"; // Green
  if (score <= 45) return "#facc15"; // Yellow
  if (score <= 70) return "#f97316"; // Orange
  return "#ef4444"; // Red
};

export default function RiskGauge({ score, level }) {
  const color = getRiskColor(score);

  const data = [
    {
      value: score,
      fill: color,
    },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: 220,
        height: 220,
      }}
    >
      <RadialBarChart
        width={220}
        height={220}
        cx={110}
        cy={110}
        innerRadius={70}
        outerRadius={95}
        startAngle={180}
        endAngle={-180}
        data={data}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          tick={false}
        />
        <RadialBar
          dataKey="value"
          cornerRadius={12}
          background={{ fill: "#141414" }}
        />
      </RadialBarChart>

      {/* Center Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            fontWeight: 800,
            color,
            lineHeight: 1,
            marginTop: "15px",
          }}
        >
          {score}
        </div>

        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color,
            textTransform: "uppercase",
            marginTop: "8px",
          }}
        >
          {level} Risk
        </div>
      </div>
    </div>
  );
}