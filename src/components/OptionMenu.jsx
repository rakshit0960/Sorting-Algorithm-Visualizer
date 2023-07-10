/* eslint-disable react/prop-types */

import "../index.css";
export default function OptionMenu({
  setAlgorithm,
  GenerateNewArray,
  changeSize,
  setDelay,
  AnimateSort,
  delay,
  Size,
}) {
  const Algorithms = [
    "BUBBLE SORT",
    "INSERTION SORT",
    "MERGE SORT",
  ];
  return (
    <>
      <div className="optionBox">
        <div className="flexItemOption">
          <select className="btnOption bg-lightBgColor" onChange={e => setAlgorithm(e.target.value)}>
            {Algorithms.map((option, index) => {
              return <option key={index}>{option}</option>;
            })}
          </select>
        </div>

        <div className="flexItemOption">
          <button className="btnOption" onClick={GenerateNewArray}>
            Generate New Array
          </button>
        </div>

        <div className="flexItemOption">
          <div className="flex justify-between items-center">
            <label className="mx-2">Size</label>
            <input
              className="mr-16"
              type="range"
              min={3}
              max={40}
              value={Size}
              onChange={(e) => changeSize(e.target.value)}
            ></input>
          </div>
          <div className="flexItemOption">
            <label className="mx-2">Speed</label>
            <input
              type="range"
              min={0}
              max={200}
              value={200 - delay}
              onChange={(e) => {
                setDelay(200 - e.target.value);
              }}
            ></input>
          </div>
        </div>

        <div className="flexItemOption">
          <button className="btnOption" onClick={AnimateSort}>
            SORT
          </button>
        </div>
      </div>
    </>
  );
}
