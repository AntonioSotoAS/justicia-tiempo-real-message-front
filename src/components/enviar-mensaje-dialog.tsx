'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EnviarMensajeDialogProps {
  juecesSeleccionados: number;
  onEnviarMensaje: (datos: {
    encuesta: string;
    telefono: string;
    whatsapp: string;
    fecha: Date | undefined;
    hora: string;
  }) => void;
}

export function EnviarMensajeDialog({ 
  juecesSeleccionados, 
  onEnviarMensaje 
}: EnviarMensajeDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    encuesta: '',
    telefono: '(01) 410-1010 anexo 2245',
    whatsapp: '943 189 536',
    fecha: undefined as Date | undefined,
    hora: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnviarMensaje(formData);
    setOpen(false);
    // Limpiar formulario después de enviar
    setFormData({
      encuesta: '',
      telefono: '(01) 410-1010 anexo 2245',
      whatsapp: '943 189 536',
      fecha: undefined,
      hora: ''
    });
  };

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm"
          className="whitespace-nowrap"
          disabled={juecesSeleccionados === 0}
        >
          Enviar Mensaje ({juecesSeleccionados})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enviar Mensaje a Magistrados(a)s</DialogTitle>
          <DialogDescription>
            Configura los datos para enviar mensajes a {juecesSeleccionados} Magistrados(a) seleccionados.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="encuesta">Encuesta de retroalimentación / URL para subir</Label>
            <Input
              id="encuesta"
              type="url"
              placeholder="https://ejemplo.com/encuesta"
              value={formData.encuesta}
              onChange={(e) => handleInputChange('encuesta', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Esta URL se usará tanto para la encuesta como para subir información
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="+57 300 123 4567"
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+57 300 123 4567"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <DatePicker
                value={formData.fecha}
                onChange={(date) => handleInputChange('fecha', date)}
                placeholder="Seleccionar fecha"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Hora</Label>
              <TimePicker
                value={formData.hora}
                onChange={(time) => handleInputChange('hora', time)}
                placeholder="Seleccionar hora"
              />
            </div>
          </div>

          {/* Previsualización del mensaje */}
          {(formData.encuesta || formData.telefono || formData.whatsapp || formData.fecha || formData.hora) && (
            <div className="space-y-2">
              <Label>Previsualización del mensaje</Label>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Datos del mensaje para {juecesSeleccionados} Magistrados(a):</strong>
                </div>
                <div className="space-y-2 text-sm">
                  {formData.encuesta && (
                    <div>
                      <strong>📋 Encuesta:</strong> {formData.encuesta}
                    </div>
                  )}
                  {formData.telefono && (
                    <div>
                      <strong>📞 Teléfono:</strong> {formData.telefono}
                    </div>
                  )}
                  {formData.whatsapp && (
                    <div>
                      <strong>💬 WhatsApp:</strong> {formData.whatsapp}
                    </div>
                  )}
                  {formData.fecha && (
                    <div>
                      <strong>📅 Fecha:</strong> {formData.fecha.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                  {formData.hora && (
                    <div>
                      <strong>🕐 Hora:</strong> {formData.hora}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={!formData.encuesta}
            >
              Enviar Mensajes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
