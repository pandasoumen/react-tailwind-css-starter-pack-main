// function ForgotPassword() {
//   return (
//     <div className="p-10 text-center">
//       <h2 className="text-3xl font-bold">Forgot Password</h2>
//     </div>
//   );
// }
// export default ForgotPassword;


import React from "react";
import { Link } from "react-router-dom";
import ForgotPasswordForm from "../../components/auth/ForgotPassword";

function ForgotPassword() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-richblack-900 px-4">
      <div className="w-full max-w-[450px] text-richblack-5">

        <h1 className="text-3xl font-semibold mb-2">Reset Password</h1>
        <p className="text-richblack-200 mb-6 text-sm">
          Enter your email to receive reset link
        </p>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-blue-100 text-sm">
          <Link to="/login">Back to Login</Link>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;
