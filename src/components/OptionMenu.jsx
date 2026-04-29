/* eslint-disable react/prop-types */

import "../index.css";
export default function OptionMenu({
  algorithm,
  setAlgorithm,
  GenerateNewArray,
  changeSize,
  setDelay,
  AnimateSort,
  delay,
  size,
}) {
  const Algorithms = ["BUBBLE SORT", "INSERTION SORT", "MERGE SORT"];
  return (
    <div className="optionBox">
      <div className="flexItemOption">
        <select
          className="btnOption bg-lightBgColor w-full sm:w-auto"
          onChange={(e) => setAlgorithm(e.target.value)}
          value={algorithm}
        >
          {Algorithms.map((option, index) => {
            return <option key={index}>{option}</option>;
          })}
        </select>
      </div>

      <div className="flexItemOption">
        <button className="btnOption w-full sm:w-auto" onClick={GenerateNewArray}>
          Generate New Array
        </button>
      </div>

      <div className="flexItemOption flex-col sm:flex-row gap-2 sm:gap-0">
        <div className="flex justify-between items-center w-full">
          <label className="mx-2">Size</label>
          <input
            className="flex-1 sm:flex-none sm:mr-16"
            type="range"
            min={3}
            max={40}
            value={size}
            onChange={(e) => changeSize(e.target.value)}
          />
        </div>
        <div className="flex justify-between items-center w-full">
          <label className="mx-2">Speed</label>
          <input
            className="flex-1 sm:flex-none"
            type="range"
            min={0}
            max={200}
            value={200 - delay}
            onChange={(e) => {
              setDelay(200 - e.target.value);
            }}
          />
        </div>
      </div>

      <div className="flexItemOption">
        <button className="btnOption w-full sm:w-auto" onClick={AnimateSort}>
          SORT
        </button>
      </div>
    </div>
  );
}
