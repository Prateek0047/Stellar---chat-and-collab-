import toast, { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotificationPage from "./pages/NotificationPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import {
  default as LoginPage,
  default as SignUpPage,
} from "./pages/SignUpPage.jsx";

const App = () => {
  // tanstack query
  return (
    <div className="h-screen" data-theme="luxury">
      <button onClick={() => toast.success("Hello World")}>
        Create a Toast
      </button>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboard" element={<OnboardingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
