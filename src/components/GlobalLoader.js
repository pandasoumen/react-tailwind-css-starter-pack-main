import { useSelector } from "react-redux";

const GlobalLoader = () => {
  const { loading } = useSelector((state) => state.prescription);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow">
        Loading...
      </div>
    </div>
  );
};

export default GlobalLoader;
