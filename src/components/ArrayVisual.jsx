/* eslint-disable react/prop-types */
export default function ArrayVisual({ array }) {
  return (
    <div className="mx-10 bg-bgColor flex justify-center items-end border-b-2 border-gray-6" style={{height: '850px'}}>
      {array.map((val, index) => {
        return <ArrayBar key={index} height={val}/>
      })}
    </div>
  );
}

function ArrayBar({ height }) {
  return <div className="bg-blue-500 w-10 text-center mx-1" style={{height: `${height}px`}}>{height}</div>;
}
