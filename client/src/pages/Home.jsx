import { Link } from "react-router-dom";

const Home = () => {

  return (

    <div className="min-h-screen bg-gray-100 p-8">


      <h1 className="text-4xl font-bold text-gray-800">
        Digital Queue Management System
      </h1>


      <p className="mt-3 text-gray-600">
        Manage your waiting time digitally and save time.
      </p>



      <div className="grid md:grid-cols-3 gap-6 mt-10">


        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold">
            Book Queue Token
          </h2>

          <p className="mt-2 text-gray-600">
            Generate your token without standing in line.
          </p>

          <Link
            to="/organizations"
            className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Get Token
          </Link>

        </div>



        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold">
            Check Queue Status
          </h2>

          <p className="mt-2 text-gray-600">
            View your current position and waiting time.
          </p>


          <Link
            to="/myqueue"
            className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            View Queue
          </Link>


        </div>




        <div className="bg-white p-6 rounded-xl shadow">


          <h2 className="text-xl font-bold">
            Admin Dashboard
          </h2>


          <p className="mt-2 text-gray-600">
            Manage customers and queue operations.
          </p>


          <Link
            to="/dashboard"
            className="inline-block mt-4 bg-purple-600 text-white px-4 py-2 rounded"
          >
            Dashboard
          </Link>


        </div>


      </div>



      <div className="mt-12 bg-blue-600 text-white p-8 rounded-xl">

        <h2 className="text-3xl font-bold">
          Why Digital Queue?
        </h2>

        <ul className="mt-4 space-y-2">
          <li>✅ Reduce waiting time</li>
          <li>✅ Real-time queue tracking</li>
          <li>✅ Better customer experience</li>
          <li>✅ Useful for Banks, Hospitals, Shops</li>
        </ul>

      </div>


    </div>

  );
};

export default Home;