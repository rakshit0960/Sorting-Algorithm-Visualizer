import { useEffect, useState } from "react";
import ArrayVisual from "./components/ArrayVisual";
import OptionMenu from "./components/OptionMenu";
const arrayMin = 50;
const arrayMax = 800;

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

function App() {
  const [arrayInfo, setArrayInfo] = useState({
    array: [],
    color: { red: [], green: [] },
  });
  
  const [Size, setSize] = useState(40);
  const [delay, setDelay] = useState(100);
  const [algorithm, setAlgorithm] = useState("INSERTION SORT");
  const [isSorting, setIsSorting] = useState(false);

  function GenerateNewArray() {
    if (isSorting) return;
    let newArray = [];
    for (let i = 0; i < Size; i++) {
      newArray.push(
        Math.round(Math.random() * (arrayMax - arrayMin) + arrayMin)
      );
    }
    setArrayInfo({ array: [...newArray], color: { red: [], green: [] } });
  }

  function changeSize(newVal) {
    setSize(newVal);
    GenerateNewArray();
  }

  useEffect(() => {
    GenerateNewArray();
  }, []);

  async function BubbleSort() {
    const sortedArray = [...arrayInfo.array];
    for (let i = 0; i < sortedArray.length - 1; i++) {
      for (let j = 0; j < sortedArray.length - i - 1; j++) {
        setArrayInfo({
          array: sortedArray,
          color: { red: [j + 1, j], green: [] },
        });
        if (sortedArray[j] > sortedArray[j + 1]) {
          await sleep(delay)
          let temp = sortedArray[j];
          sortedArray[j] = sortedArray[j + 1];
          sortedArray[j + 1] = temp;
          setArrayInfo({
            array: sortedArray,
            color: { red: [], green: [j, j + 1] },
          });
        }
        await sleep(delay)
        setArrayInfo({ array: sortedArray, color: { red: [], green: [] } });
      }
    }
  }

  async function insertionSort() {
    const sortedArray = [...arrayInfo.array];

    for (let i = 0; i < sortedArray.length; i++) {
      let j = i;
      setArrayInfo({ array: sortedArray, color: { red: [j], green: [] } });
      await sleep(delay)

      while (j > 0 && sortedArray[j - 1] > sortedArray[j]) {
        setArrayInfo({ array: sortedArray, color: { red: [j], green: [] } });
        await sleep(delay)
        let temp = sortedArray[j];
        sortedArray[j] = sortedArray[j - 1];
        sortedArray[j - 1] = temp;
        j--;
      }
      setArrayInfo({ array: sortedArray, color: { red: [j], green: [] } });
      await sleep(delay)
      setArrayInfo({ array: sortedArray, color: { red: [], green: [j] } });
      await sleep(delay)
      setArrayInfo({ array: sortedArray, color: { red: [], green: [] } });
    }
  }

  async function mergeSort() {
    
  }

  async function sortingCompleteAnimation() {

  }

  async function AnimateSort() {
    if (isSorting) return;
    setIsSorting(true);

    if (algorithm === "BUBBLE SORT") await BubbleSort();
    else if (algorithm == "INSERTION SORT") await insertionSort();
    else if (algorithm == "MERGE SORT") await mergeSort();


    await sortingCompleteAnimation();
    setIsSorting(false);
  }
  return (
    <div className="w-full h-screen">
      <OptionMenu
        setAlgorithm={setAlgorithm}
        GenerateNewArray={GenerateNewArray}
        changeSize={changeSize}
        setDelay={setDelay}
        AnimateSort={AnimateSort}
        delay={delay}
        size={Size}
      />
      <ArrayVisual arrayInfo={arrayInfo} />
    </div>
  );
}
export default App;
