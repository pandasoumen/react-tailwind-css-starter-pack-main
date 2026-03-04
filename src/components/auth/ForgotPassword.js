import { useState } from "react";
import { useDispatch } from "react-redux";
import { sendResetEmail } from "../../services/operations/authAPI";

function ForgotPasswordForm() {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(sendResetEmail(email));
  };

  return (
    <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit}>

      <label>
        <p className="text-sm text-richblack-5 mb-1">Email</p>
        <input
          required
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-richblack-800 text-richblack-5"
        />
      </label>

      <button className="bg-yellow-50 text-richblack-900 py-2 rounded-lg font-semibold">
        Send Reset Link
      </button>

    </form>
  );
}

export default ForgotPasswordForm;
