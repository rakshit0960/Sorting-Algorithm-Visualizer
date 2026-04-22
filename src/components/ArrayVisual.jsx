/* eslint-disable react/prop-types */
const ARRAY_MAX = 800;

export default function ArrayVisual({ arrayInfo }) {
  return (
    <div
      className="mx-2 sm:mx-10 bg-bgColor flex justify-center items-end border-b-2 border-gray-6"
      style={{ height: "clamp(300px, 70vh, 850px)" }}
    >
      {arrayInfo.array.map((val, index) => {
        return (
          <ArrayBar
            key={index}
            value={val}
            color={
              arrayInfo.color.red.includes(index)
                ? "red"
                : arrayInfo.color.green.includes(index)
                ? "green"
                : arrayInfo.color.white.includes(index)
                ? "white"
                : ""
            }
          />
        );
      })}
    </div>
  );
}

function ArrayBar({ value, color }) {
  return (
    <div
      className="bg-blue-500 flex-1 min-w-0 mx-[1px] sm:mx-[2px] text-center text-[8px] sm:text-xs overflow-hidden"
      style={{
        height: `${(value / ARRAY_MAX) * 100}%`,
        backgroundColor: color,
      }}
    >
      {value}
    </div>
  );
}
