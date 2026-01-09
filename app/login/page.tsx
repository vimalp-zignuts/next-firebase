"use client";

import { auth } from "@/config/FirebaseClientConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiHandler } from "@/lib/apiHandler";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

interface UserInterface {
  formType: "login" | "register";
  email: string;
  password: string;
}

const initialState: UserInterface = {
  formType: "login",
  email: "",
  password: "",
};

export default function LoginPage() {
  const [formState, setFormState] = useState<UserInterface>(initialState);
  const [errorState, setErrorState] = useState<UserInterface>(initialState);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { showError, showSuccess } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.email || !formState.password) {
      setErrorState((prev) => ({
        ...prev,
        email: !formState.email ? "Email is required" : "",
        password: !formState.password ? "Password is required" : "",
      }));
      return;
    }

    setLoading(true);

    try {
      let userCredential;

      if (formState.formType === "register") {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formState.email,
          formState.password
        );
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          formState.email,
          formState.password
        );
      }

      // Get ID token and send to server
      const idToken = await userCredential.user.getIdToken();

      const { data } = await apiHandler.auth.loginOrRegister(idToken);

      if (data.success) {
        await refreshAuth();
        showSuccess(`${formState.formType === 'login' ? 'Login' : 'Registration'} successful!`);
        router.push("/");
      } else {
        showError(data.error || "Authentication failed");
      }
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setErrorState((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFormTypeToggle = () => {
    setFormState((prev) => ({
      ...prev,
      formType: prev.formType === "login" ? "register" : "login",
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 sm:p-8 rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold text-center">
            {formState.formType === "login" ? "Login" : "Register"}
          </h2>

          <input
            type="email"
            name="email"
            value={formState.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
            className="w-full p-3 border rounded text-sm sm:text-base"
          />
          {errorState.email && (
            <p className="text-red-500 text-sm">{errorState.email}</p>
          )}

          <input
            type="password"
            name="password"
            value={formState.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
            className="w-full p-3 border rounded text-sm sm:text-base"
          />
          {errorState.password && (
            <p className="text-red-500 text-sm">{errorState.password}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading
              ? "Loading..."
              : formState.formType === "login"
              ? "Login"
              : "Register"}
          </button>

          <button
            type="button"
            onClick={handleFormTypeToggle}
            className="w-full text-blue-600 hover:text-blue-800 text-sm sm:text-base"
          >
            {formState.formType === "login"
              ? "Need to register?"
              : "Already have account?"}
          </button>
        </form>
      </div>
    </div>
  );
}
