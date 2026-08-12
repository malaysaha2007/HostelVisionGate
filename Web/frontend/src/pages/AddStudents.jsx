import { useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HostelPortalHeader from "../components/HostelPortalHeader";


import API from "../services/api";

import "../styles/AddStudents.css";

function AddStudents() {

  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const handleUpload = async () => {

    if (!file) {

      alert("Please Select Excel File");

      return;

    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      const response = await API.post(
        "/hostel/add-students",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      setResult(response.data);

    } catch (error) {

      console.error(error);

      alert("Upload Failed");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="add-students-page">

      <Navbar showLogout={true} />

      {/* HEADER */}

      <HostelPortalHeader />



      {/* MAIN */}

      <div className="add-container">

        <div className="add-card">

          <div className="upload-box">

            <h3>
              Upload Excel File
            </h3>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
            />

          </div>

          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={loading}
          >

            {
              loading
                ? "Importing..."
                : "Import Excel"
            }

          </button>

          {/* RESULT */}

          {result && (

            <div className="result-section">

              <div className="result success">

                ✔ Imported:
                {" "}
                {result.success_count}

              </div>

              <div className="result duplicate">

                ⚠ Duplicate:
                {" "}
                {result.duplicate_count}

              </div>

              <div className="result error">

                ❌ Errors:
                {" "}
                {result.error_count}

              </div>

              {/* ERROR TABLE */}

              {result?.errors?.length > 0 && (

                <div className="error-table">

                  <table>

                    <thead>

                      <tr>

                        <th>Row</th>

                        <th>Roll</th>

                        <th>Issue</th>

                      </tr>

                    </thead>

                    <tbody>

                      {result?.errors?.map(
                        (error, index) => (

                          <tr key={index}>

                            <td>
                              {error.row}
                            </td>

                            <td>
                              {error.roll}
                            </td>

                            <td>
                              {error.issue}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}

        </div>

      </div>

      <Footer />

   </div>

  );

}

export default AddStudents;