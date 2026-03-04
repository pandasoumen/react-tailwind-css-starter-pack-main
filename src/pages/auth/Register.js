// // import { useState, useEffect } from 'react';
// // import { useDispatch, useSelector } from 'react-redux';
// // import { register, reset } from '../../store/slices/authSlice';
// // import { toast } from 'react-toastify';
// // // *** CORRECTED IMPORT ***
// // import {  useNavigate } from 'react-router-dom'; 

// // export default function Register() {
// //   const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient' });
// //   const { name, email, password, role } = formData;

// //   const dispatch = useDispatch();
// //   // *** CORRECTED HOOK USAGE ***
// //   const navigate = useNavigate(); 
// //   const { user, isError, isSuccess, message } = useSelector((state) => state.auth);

// //   useEffect(() => {
// //     if (isError) toast.error(message);
    
// //     // *** CORRECTED NAVIGATION METHOD ***
// //     if (isSuccess || user) navigate('/'); 
    
// //     dispatch(reset());
// //   }, [user, isError, isSuccess, message, navigate, dispatch]); // navigate is in dependencies

// //   const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
// //   const onSubmit = (e) => {
// //     e.preventDefault();
// //     dispatch(register({ name, email, password, role }));
// //   };

// //   return (
// //     <div className="flex justify-center items-center min-h-screen bg-slate-900">
// //       <form onSubmit={onSubmit} className="bg-slate-800 p-8 rounded-xl w-full max-w-md">
// //         <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
// //         <input
// //           type="text"
// //           name="name"
// //           value={name}
// //           onChange={onChange}
// //           placeholder="Full Name"
// //           className="w-full mb-4 p-3 rounded bg-slate-700 text-white"
// //           required
// //         />
// //         <input
// //           type="email"
// //           name="email"
// //           value={email}
// //           onChange={onChange}
// //           placeholder="Email"
// //           className="w-full mb-4 p-3 rounded bg-slate-700 text-white"
// //           required
// //         />
// //         <input
// //           type="password"
// //           name="password"
// //           value={password}
// //           onChange={onChange}
// //           placeholder="Password"
// //           className="w-full mb-4 p-3 rounded bg-slate-700 text-white"
// //           required
// //         />
// //         <select
// //           name="role"
// //           value={role}
// //           onChange={onChange}
// //           className="w-full mb-6 p-3 rounded bg-slate-700 text-white"
// //         >
// //           <option value="patient">Patient</option>
// //           <option value="doctor">Doctor</option>
// //         </select>
// //         <button type="submit" className="w-full py-3 bg-primary text-secondary rounded-lg font-semibold">
// //           Register
// //         </button>
// //       </form>
// //     </div>
// //   );
// // }


// import React from "react";
// import { Link } from "react-router-dom";
// import RegisterForm from "../../components/auth/RegisterForm";

// function Register() {
//   return (
//     <div className="min-h-screen flex justify-center items-center bg-richblack-900 px-4">
//       <div className="w-full max-w-[450px] text-richblack-5">

//         <h1 className="text-3xl font-semibold mb-2">Create Account</h1>
//         <p className="text-richblack-200 mb-6 text-sm">
//           Join and start your journey
//         </p>

//         <RegisterForm />

//         <p className="mt-6 text-center text-richblack-200 text-sm">
//           Already have an account?{" "}
//           <Link to="/login" className="text-blue-100 font-semibold">
//             Log In
//           </Link>
//         </p>

//       </div>
//     </div>
//   );
// }

// export default Register;

import React from "react";
import RegisterForm from "../../components/auth/RegisterForm";

export default function Signup() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
        <RegisterForm />
      </div>
    </div>
  );
}

