'use client';

import { useState } from "react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData);
    } catch {
      // Los errores se manejan con toasts en el hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Ingresa tu email y contraseña para acceder a tu cuenta
          </p>
        </div>
        
        
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="usuario@ejemplo.com" 
            value={formData.email}
            onChange={handleChange}
            required 
            disabled={isLoading}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            value={formData.password}
            onChange={handleChange}
            required 
            disabled={isLoading}
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </Field>
        <Field>
        </Field>
      </FieldGroup>
    </form>
  )
}
