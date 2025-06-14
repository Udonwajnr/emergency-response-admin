"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService"

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password)

      if (result.success) {
        localStorage.setItem("token", result.data.token)
        localStorage.setItem("user", JSON.stringify(result.data.user))
        setUser(result.data.user)
        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  const register = async (userData) => {
    try {
      const result = await authService.register(userData)
      return { success: result.success, message: result.message || result.data?.message }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  }

  const verifyOtp = async (email, otp) => {
    try {
      const result = await authService.verifyOtp(email, otp)
      return { success: result.success, message: result.message || result.data?.message }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const result = await authService.forgotPassword(email)
      return { success: result.success, message: result.message || result.data?.message }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  }

  const resetPassword = async (token, password) => {
    try {
      const result = await authService.resetPassword(token, password)
      return { success: result.success, message: result.message || result.data?.message }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        verifyOtp,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
