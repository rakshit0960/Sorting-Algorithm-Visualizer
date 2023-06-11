/* eslint-disable react/prop-types */

import "../index.css";
export default function OptionMenu({GenerateNewArray, changeSize}) {
  return (
    <>
      <div className="optionBox">
        <div className="flexItemOption">
          <select className="btnOption bg-lightBgColor">
            <option>Insertion Sort</option>
            <option>Bubble Sort</option>
            <option>Merge Sort</option>
            <option>Quick Sort</option>
            <option>Heap Sort</option>
          </select>
        </div>

        <div className="flexItemOption">
          <button className="btnOption" onClick={GenerateNewArray}>
            Generate New Array
          </button>
        </div>

        <div className="flexItemOption">
          <div className="flex justify-between items-center">
            <label className="mx-2" >Size</label>
            <input className="mr-16" type="range" min={3} max={20} onChange={(e) => changeSize(e.target.value)}></input>
          </div>
          <div className="flexItemOption">
            <label className="mx-2">Speed</label>
            <input type="range" min={0} max={10}></input>
          </div>
        </div>

        <div className="flexItemOption">
          <button className="btnOption">SORT</button>
        </div>
      </div>
    </>
  );
}
