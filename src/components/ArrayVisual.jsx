/* eslint-disable react/prop-types */
export default function ArrayVisual({ arrayInfo }) {
  return (
    <div
      className="mx-10 bg-bgColor flex justify-center items-end border-b-2 border-gray-6"
      style={{ height: "850px" }}
    >
      {arrayInfo.array.map((val, index) => {
        return (
          <ArrayBar
            key={index}
            height={val}
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

function ArrayBar({ height, color }) {
  return (
    <div
      className="bg-blue-500 w-10 text-center mx-1"
      style={{ height: `${height}px`, backgroundColor: color }}
    >
      {height}
    </div>
  );
}
