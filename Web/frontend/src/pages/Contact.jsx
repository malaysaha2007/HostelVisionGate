import Navbar from "../components/Navbar";
import ContactPortalHeader from "../components/ContactPortalHeader";
import Footer from "../components/Footer";

import "../styles/Contact.css";

function Contact() {

  return (

    <div className="contact-page">

<Navbar showLogin={true} />

      <ContactPortalHeader />

      <div className="contact-container">

  {/* Institute */}

  <div className="contact-card institute-card">

    <div className="card-header">

      <div className="card-icon">
        🏛️
      </div>

      <h2>
        Institute Information
      </h2>

    </div>

    <div className="card-divider"></div>

    <p>
      <strong>
        PDPM IIITDM Jabalpur
      </strong>
    </p>

    <p>
      Indian Institute of Information
      Technology, Design and Manufacturing,
      Jabalpur
    </p>

    <p>
      Dumna Airport Road,
      Jabalpur, Madhya Pradesh
    </p>

    <p>
      PIN Code: 482005
    </p>

  </div>

  {/* Hostel */}

  <div className="contact-card hostel-card">

    <div className="card-header">

      <div className="card-icon">
        🏠
      </div>

      <h2>
        Hostel Information
      </h2>

    </div>

    <div className="card-divider"></div>

    <div className="info-block">

      <h3>
        Hostel Administration Office
      </h3>

      <p>
        For hostel accommodation,
        room allocation and student
        support services.
      </p>

    </div>

    <div className="info-block">

      <h3>
        Warden / Caretaker
      </h3>

      <p>
        Available for student support,
        discipline and daily operations.
      </p>

    </div>

    <div className="info-block">

      <h3>
        Main Gate Security
      </h3>

      <p>
        Handles entry-exit related
        monitoring and assistance.
      </p>

    </div>

  </div>

  {/* Support */}

  <div className="contact-card support-card">

    <div className="card-header">

      <div className="card-icon">
        🎧
      </div>

      <h2>
        VisionGate Support
      </h2>

    </div>

    <div className="card-divider"></div>

    <p>

      For technical issues,
      login problems,
      face registration errors
      or portal-related queries,
      contact the VisionGate team.

    </p>

    <div className="support-box">

      <p>
        ✉ support@visiongate.in
      </p>

      <p>
        ☎ +91 90000 00000
      </p>

      <p>
        🕒 Mon - Sat | 9 AM - 6 PM
      </p>

    </div>

  </div>

      </div>
      <div className="help-banner">

  <div className="help-icon">
    i
  </div>

  <div>

    <h3>
      Need Help?
    </h3>

    <p>
      Our team is here to help you.
      Reach out through the details above
      and we'll get back to you as soon
      as possible.
    </p>

  </div>

</div>

      <Footer />

    </div>

  );

}

export default Contact;