import { useState } from "react";
import SortingVisualizer from "./components/SortingVisualizer";
import GraphVisualizer from "./components/GraphVisualizer";

function App() {
  const [view, setView] = useState("SORTING");

  return (
    <div className="w-full min-h-screen">
      <div className="mx-2 sm:mx-10 mb-2 flex flex-wrap justify-center gap-2 py-3 text-textColor">
        <button
          className={`btnOption ${view === "SORTING" ? "bg-customBlue border-customBlue" : ""}`}
          onClick={() => setView("SORTING")}
        >
          Sorting Algorithms
        </button>
        <button
          className={`btnOption ${view === "GRAPH" ? "bg-customBlue border-customBlue" : ""}`}
          onClick={() => setView("GRAPH")}
        >
          Graph Algorithms
        </button>
      </div>

      {view === "SORTING" ? <SortingVisualizer /> : <GraphVisualizer />}
    </div>
  );
}
export default App;
