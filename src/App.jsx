import { useEffect, useState } from "react";
import ArrayVisual from "./components/ArrayVisual";
import OptionMenu from "./components/OptionMenu";

function App() {
  const arrayMin = 50; // Min Possible Value in Array
  const arrayMax = 800; // Max Possible Value in Array

  const [array, setArray] = useState([100, 200, 300]);
  const [Size, setSize] = useState(20);

  useEffect(() => {
    GenerateNewArray();
  }, []);

  function GenerateNewArray() {
    let newArray = [];
    for (let i = 0; i < Size; i++) {
      newArray.push(
        Math.round(Math.random() * (arrayMax - arrayMin) + arrayMin)
      );
    }
    setArray(newArray);
  }

  function changeSize(newVal) {
    setSize(newVal);
    GenerateNewArray();
  }

  return (
    <div className="w-full h-screen">
      <OptionMenu GenerateNewArray={GenerateNewArray} changeSize={changeSize} />
      <ArrayVisual array={array} />
    </div>
  );
}

export default App;
