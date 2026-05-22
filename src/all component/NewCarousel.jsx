// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FcNext, FcPrevious } from "react-icons/fc";

// const Carousel = () => {
//   const [dataprev, setDataprev] = useState([]);
//   const [indexprev, setIndexprev] = useState(0);

//   const getData = () => {
//     axios.get("http://localhost:3000/carousel").then((res) => {
//       setDataprev(res.data);
//     });
//   };
       
//   useEffect(() => {
//     getData();
//   }, []);

//   const prevSlide = () => {
//     setIndexprev((prev) => (prev === 0 ? dataprev.length - 1 : prev - 1));
//   };

//   const nextSlide = () => {
//     setIndexprev((prev) => (prev === dataprev.length - 1 ? 0 : prev + 1));
//   };

//   return (
//     <div className="h-screen w-screen flex items-center justify-center">
//       <div className="relative h-[400px] w-[1200px] overflow-hidden  bg-blue-400 rounded-xl shadow-xl">
//         {dataprev.length > 0 && (
//           <img
//             key={dataprev[indexprev].id}
//             className="h-[400px] w-[1200px] object-left-top transition-all  duration-1000"
//             src={dataprev[indexprev].image}
//             alt={`Slide ${indexprev}`}
//           />
//         )}

//         {/* Navigation Buttons */}
//         <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 text-6xl text-white duration-500 transform -translate-y-1/2">
//           <button onClick={prevSlide}>
//             <FcPrevious />
//           </button>
//           <button onClick={nextSlide}>
//             <FcNext />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Carousel;
