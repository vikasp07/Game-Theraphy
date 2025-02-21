// // // frontend/src/components/Register.js
// // import React, { useState } from "react";
// // import axios from "axios";
// // import { useNavigate } from "react-router-dom";

// // const Register = () => {
// //   const [user, setUser] = useState({
// //     name: "",
// //     email: "",
// //     password: "",
// //     mobile: "",
// //     role: "player",
// //     guardianEmail: "",
// //     selfMonitor: false,
// //   });

// //   const [errorMessage, setErrorMessage] = useState("");
// //   const navigate = useNavigate();

// //   const handleChange = (e) => {
// //     setUser({ ...user, [e.target.name]: e.target.value });
// //   };

// //   const handleCheckboxChange = () => {
// //     setUser((prevState) => ({
// //       ...prevState,
// //       selfMonitor: !prevState.selfMonitor,
// //       guardianEmail: prevState.selfMonitor ? "" : prevState.guardianEmail,
// //     }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const requestBody = { ...user };

// //       // Remove guardianEmail and selfMonitor for non-players
// //       if (user.role !== "player") {
// //         delete requestBody.guardianEmail;
// //         delete requestBody.selfMonitor;
// //       } else if (user.selfMonitor) {
// //         requestBody.guardianEmail = "";
// //       }

// //       // Registration API call
// //       const res = await axios.post(
// //         "http://localhost:5000/api/auth/register",
// //         requestBody,
// //         { headers: { "Content-Type": "application/json" } }
// //       );

// //       console.log("Request Body:", requestBody);
// //       // Use the returned token to create a new profile detail record
// //       await axios.post(
// //         "http://localhost:5000/api/detail",
// //         { name: requestBody.name, email: requestBody.email },
// //         { headers: { "x-auth-token": res.data.token, "Content-Type": "application/json" } }
// //       );

// //       alert("Registration successful!");
// //       navigate("/login");
// //     } catch (error) {
// //       setErrorMessage(error.response?.data?.msg || "Registration failed");
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
// //       <div className="bg-white p-8 rounded-lg shadow-md w-96">
// //         <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
// //           Register
// //         </h2>

// //         {errorMessage && (
// //           <p className="text-red-500 text-center mb-4">{errorMessage}</p>
// //         )}

// //         <form onSubmit={handleSubmit} className="space-y-4">
// //           <input
// //             type="text"
// //             name="name"
// //             placeholder="Name"
// //             onChange={handleChange}
// //             required
// //             className="w-full p-2 border border-gray-300 rounded-md"
// //           />
// //           <input
// //             type="email"
// //             name="email"
// //             placeholder="Email"
// //             onChange={handleChange}
// //             required
// //             className="w-full p-2 border border-gray-300 rounded-md"
// //           />
// //           <input
// //             type="password"
// //             name="password"
// //             placeholder="Password"
// //             onChange={handleChange}
// //             required
// //             className="w-full p-2 border border-gray-300 rounded-md"
// //           />
// //           <input
// //             type="tel"
// //             name="mobile"
// //             placeholder="Mobile Number"
// //             onChange={handleChange}
// //             required
// //             className="w-full p-2 border border-gray-300 rounded-md"
// //           />
// //           <select
// //             name="role"
// //             value={user.role}
// //             onChange={handleChange}
// //             required
// //             className="w-full p-2 border border-gray-300 rounded-md"
// //           >
// //             <option value="player">Player</option>
// //             <option value="doctor">Doctor</option>
// //             <option value="guardian">Guardian</option>
// //           </select>

// //           {user.role === "player" && (
// //             <>
// //               <input
// //                 type="email"
// //                 name="guardianEmail"
// //                 placeholder="Guardian's Email (if applicable)"
// //                 value={user.guardianEmail}
// //                 onChange={handleChange}
// //                 className="w-full p-2 border border-gray-300 rounded-md"
// //                 disabled={user.selfMonitor}
// //               />

// //               <label className="flex items-center">
// //                 <input
// //                   type="checkbox"
// //                   name="selfMonitor"
// //                   checked={user.selfMonitor}
// //                   onChange={handleCheckboxChange}
// //                   className="mr-2"
// //                 />
// //                 I will monitor my own progress
// //               </label>
// //             </>
// //           )}

// //           <button
// //             type="submit"
// //             className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
// //           >
// //             Register
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Register;

// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import {
//   TextField,
//   PrimaryButton,
//   Dropdown,
//   Checkbox,
//   Stack,
//   Card,
// } from "@fluentui/react";

// const roleOptions = [
//   { key: "player", text: "Player" },
//   { key: "doctor", text: "Doctor" },
//   { key: "guardian", text: "Guardian" },
// ];

// const Register = () => {
//   const [user, setUser] = useState({
//     name: "",
//     email: "",
//     password: "",
//     mobile: "",
//     role: "player",
//     guardianEmail: "",
//     selfMonitor: false,
//   });

//   const [errorMessage, setErrorMessage] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e, value) => {
//     setUser({ ...user, [e.target.name]: value });
//   };

//   const handleRoleChange = (event, option) => {
//     setUser({ ...user, role: option.key });
//   };

//   const handleCheckboxChange = (e, checked) => {
//     setUser((prevState) => ({
//       ...prevState,
//       selfMonitor: checked,
//       guardianEmail: checked ? "" : prevState.guardianEmail,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const requestBody = { ...user };

//       // Remove guardianEmail and selfMonitor for non-players
//       if (user.role !== "player") {
//         delete requestBody.guardianEmail;
//         delete requestBody.selfMonitor;
//       } else if (user.selfMonitor) {
//         requestBody.guardianEmail = "";
//       }

//       // Registration API call
//       const res = await axios.post(
//         "http://localhost:5000/api/auth/register",
//         requestBody,
//         { headers: { "Content-Type": "application/json" } }
//       );

//       // Create a new profile record
//       await axios.post(
//         "http://localhost:5000/api/detail",
//         { name: requestBody.name, email: requestBody.email },
//         {
//           headers: {
//             "x-auth-token": res.data.token,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       alert("Registration successful!");
//       navigate("/login");
//     } catch (error) {
//       setErrorMessage(error.response?.data?.msg || "Registration failed");
//     }
//   };

//   return (
//     <Stack
//       horizontalAlign="center"
//       verticalAlign="center"
//       styles={{ root: { height: "100vh" } }}
//     >
//       <Card
//         tokens={{ childrenGap: 15, width: 400 }}
//         styles={{ root: { padding: 20 } }}
//       >
//         <h2 style={{ textAlign: "center", color: "#1d4ed8" }}>Register</h2>

//         {errorMessage && (
//           <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>
//         )}

//         <Stack tokens={{ childrenGap: 10 }} as="form" onSubmit={handleSubmit}>
//           <TextField
//             label="Name"
//             name="name"
//             required
//             onChange={handleChange}
//           />
//           <TextField
//             label="Email"
//             type="email"
//             name="email"
//             required
//             onChange={handleChange}
//           />
//           <TextField
//             label="Password"
//             type="password"
//             name="password"
//             required
//             onChange={handleChange}
//           />
//           <TextField
//             label="Mobile Number"
//             type="tel"
//             name="mobile"
//             required
//             onChange={handleChange}
//           />

//           <Dropdown
//             label="Role"
//             selectedKey={user.role}
//             options={roleOptions}
//             onChange={handleRoleChange}
//             required
//           />

//           {user.role === "player" && (
//             <>
//               <TextField
//                 label="Guardian's Email (if applicable)"
//                 name="guardianEmail"
//                 value={user.guardianEmail}
//                 onChange={handleChange}
//                 disabled={user.selfMonitor}
//               />

//               <Checkbox
//                 label="I will monitor my own progress"
//                 checked={user.selfMonitor}
//                 onChange={handleCheckboxChange}
//               />
//             </>
//           )}

//           <PrimaryButton text="Register" type="submit" />
//         </Stack>
//       </Card>
//     </Stack>
//   );
// };

// export default Register;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "player",
    guardianEmail: "",
    selfMonitor: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = () => {
    setUser((prevState) => ({
      ...prevState,
      selfMonitor: !prevState.selfMonitor,
      guardianEmail: prevState.selfMonitor ? "" : prevState.guardianEmail,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestBody = { ...user };

      if (user.role !== "player") {
        delete requestBody.guardianEmail;
        delete requestBody.selfMonitor;
      } else if (user.selfMonitor) {
        requestBody.guardianEmail = "";
      }

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        requestBody,
        { headers: { "Content-Type": "application/json" } }
      );

      await axios.post(
        "http://localhost:5000/api/detail",
        { name: requestBody.name, email: requestBody.email },
        {
          headers: {
            "x-auth-token": res.data.token,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="logo-container">
          <h1>GameTherapy</h1>
          <p>Create your account</p>
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <select
              name="role"
              value={user.role}
              onChange={handleChange}
              required
              className="select-field"
            >
              <option value="player">Player</option>
              <option value="doctor">Doctor</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>

          {user.role === "player" && (
            <>
              <div className="form-group">
                <input
                  type="email"
                  name="guardianEmail"
                  placeholder="Guardian's Email (if applicable)"
                  value={user.guardianEmail}
                  onChange={handleChange}
                  className="input-field"
                  disabled={user.selfMonitor}
                />
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="selfMonitor"
                    checked={user.selfMonitor}
                    onChange={handleCheckboxChange}
                  />
                  <span>I will monitor my own progress</span>
                </label>
              </div>
            </>
          )}

          <button type="submit" className="submit-button">
            Register
          </button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;