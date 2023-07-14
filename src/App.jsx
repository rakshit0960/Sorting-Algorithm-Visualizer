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
    color: { red: [], green: [], white: [] },
  });

  const [size, setSize] = useState(40);
  const [delay, setDelay] = useState(100);
  const [algorithm, setAlgorithm] = useState("MERGE SORT");
  const [isSorting, setIsSorting] = useState(false);

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
  }
  function GenerateNewArray() {
    if (isSorting) return;
    let newArray = [];
    const slope = (arrayMax - arrayMin) / size;
    for (let x = 0; x < size; x++) {
      newArray.push(Math.floor(slope * x + arrayMin));
    }

    shuffleArray(newArray);
    
    setArrayInfo({
      array: [...newArray],
      color: { red: [], green: [], white: [] },
    });
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
          color: { red: [j + 1, j], green: [], white: [] },
        });
        if (sortedArray[j] > sortedArray[j + 1]) {
          await sleep(delay);
          let temp = sortedArray[j];
          sortedArray[j] = sortedArray[j + 1];
          sortedArray[j + 1] = temp;
          setArrayInfo({
            array: sortedArray,
            color: { red: [], green: [j, j + 1], white: [] },
          });
        }
        await sleep(delay);
        setArrayInfo({
          array: sortedArray,
          color: { red: [], green: [], white: [] },
        });
      }
    }
  }

  async function insertionSort() {
    const sortedArray = [...arrayInfo.array];

    for (let i = 0; i < sortedArray.length; i++) {
      let j = i;
      setArrayInfo({
        array: sortedArray,
        color: { red: [j], green: [], white: [] },
      });
      await sleep(delay);

      while (j > 0 && sortedArray[j - 1] > sortedArray[j]) {
        setArrayInfo({
          array: sortedArray,
          color: { red: [j], green: [], white: [] },
        });
        await sleep(delay);
        let temp = sortedArray[j];
        sortedArray[j] = sortedArray[j - 1];
        sortedArray[j - 1] = temp;
        j--;
      }
      setArrayInfo({
        array: sortedArray,
        color: { red: [j], green: [], white: [] },
      });
      await sleep(delay);
      setArrayInfo({
        array: sortedArray,
        color: { red: [], green: [j], white: [] },
      });
      await sleep(delay);
      setArrayInfo({
        array: sortedArray,
        color: { red: [], green: [], white: [] },
      });
    }
  }

  async function merge(array, start, end, mid) {
    
    setArrayInfo({array: array, color: {red: [], green: [start, end], white: [mid]}})
    await sleep(delay)

    const mergedArray = [];
    let i = start,
      j = mid + 1;

    while (i <= mid && j <= end) {
      setArrayInfo({array: array, color: {red: [i, j], green: [start, end], white: [mid]}})
      await sleep(delay)

      if (array[i] <= array[j]) {
        mergedArray.push(array[i]);
        i++;
      } else {
        mergedArray.push(array[j]);
        j++;
      }
    }

    while (i <= mid) {
      setArrayInfo({array: array, color: {red: [i], green: [start, end], white: [mid]}})
      await sleep(delay)
      mergedArray.push(array[i]);
      i++;
    }

    while (j <= end) {
      setArrayInfo({array: array, color: {red: [j], green: [start, end], white: [mid]}})
      await sleep(delay)
      mergedArray.push(array[j]);
      j++;
    }

    for (let i = start, j = 0; i <= end; i++, j++) {
      setArrayInfo({array: array, color: {red: [i], green: [start, end], white: []}})
      await sleep(delay)
      array[i] = mergedArray[j];
    }
    setArrayInfo({array: array, color: {red: [], green: [], white: []}})
  }

  async function mergeSortHelper(array, start, end) {
    if (end <= start) return;

    const mid = Math.floor((start + end) / 2);

    await mergeSortHelper(array, start, mid);
    await mergeSortHelper(array, mid + 1, end);

    await merge(array, start, end, mid);
  }

  async function mergeSort() {
    let sortedArray = [...arrayInfo.array];
    await mergeSortHelper(sortedArray, 0, sortedArray.length - 1);
  }

  async function AnimateSort() {
    if (isSorting) return;
    setIsSorting(true);

    if (algorithm === "BUBBLE SORT") await BubbleSort();
    else if (algorithm == "INSERTION SORT") await insertionSort();
    else if (algorithm == "MERGE SORT") await mergeSort();

    setIsSorting(false);
  }

  return (
    <div className="w-full h-screen">
      <OptionMenu
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        GenerateNewArray={GenerateNewArray}
        changeSize={changeSize}
        setDelay={setDelay}
        AnimateSort={AnimateSort}
        delay={delay}
        size={size}
      />
      <ArrayVisual arrayInfo={arrayInfo} />
    </div>
  );
}
export default App;
