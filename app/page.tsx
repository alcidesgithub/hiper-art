import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hiperfarma-blue/5 to-hiperfarma-yellow/5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/logo-hiperfarma.png" alt="Rede Hiperfarma Logo" className="h-16 mx-auto mb-4" />
          <p className="text-gray-600">Sistema de Geração de Materiais Promocionais</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
