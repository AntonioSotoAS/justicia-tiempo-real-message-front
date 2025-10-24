import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 relative hidden lg:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <img 
              src="/logo-derecha.png" 
              alt="Logo Sistema de Justicia" 
              className="mx-auto max-w-lg w-full h-auto"
              style={{ maxHeight: '80vh' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
