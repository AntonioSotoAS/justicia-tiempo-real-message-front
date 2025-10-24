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
    // Campos del mensaje (fijos)
    encuesta?: string;
    telefono?: string;
    whatsapp?: string;
    fechaEnvio?: string;
    horaEnvio?: string;
    fechaCorte?: string;
  }) => void;
}

export function EnviarMensajeDialog({ 
  juecesSeleccionados, 
  onEnviarMensaje 
}: EnviarMensajeDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    // Campos del mensaje (fijos)
    encuesta: '',
    telefono: '(01) 410-1010 anexo 2245',
    whatsapp: '943 189 536',
    fechaEnvio: undefined as Date | undefined,
    horaEnvio: '',
    fechaCorte: new Date() as Date | undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Formatear datos del mensaje (los datos de jueces vienen de la selección)
    const datosFormateados = {
      encuesta: formData.encuesta || undefined,
      telefono: formData.telefono || undefined,
      whatsapp: formData.whatsapp || undefined,
      fechaEnvio: formData.fechaEnvio ? formData.fechaEnvio.toISOString() : undefined,
      horaEnvio: formData.horaEnvio || undefined,
      fechaCorte: formData.fechaCorte ? formData.fechaCorte.toISOString() : undefined
    };
    
    console.log('📤 ===== DATOS DEL MENSAJE ENVIADOS =====');
    console.log('📋 Datos formateados:', datosFormateados);
    console.log('📋 Datos originales del formulario:', formData);
    console.log('📤 ===== FIN DE DATOS DEL MENSAJE =====');
    
    onEnviarMensaje(datosFormateados);
    setOpen(false);
    // Limpiar formulario después de enviar
    setFormData({
      encuesta: '',
      telefono: '(01) 410-1010 anexo 2245',
      whatsapp: '943 189 536',
      fechaEnvio: undefined,
      horaEnvio: '',
      fechaCorte: new Date()
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
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
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

          <div className="space-y-2">
            <Label htmlFor="fechaCorte">Fecha de corte</Label>
            <DatePicker
              value={formData.fechaCorte}
              onChange={(date) => handleInputChange('fechaCorte', date)}
              placeholder="Seleccionar fecha de corte"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaEnvio">Fecha de envío</Label>
            <DatePicker
              value={formData.fechaEnvio}
              onChange={(date) => handleInputChange('fechaEnvio', date)}
              placeholder="Seleccionar fecha de envío"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horaEnvio">Hora de envío</Label>
            <TimePicker
              value={formData.horaEnvio}
              onChange={(time) => handleInputChange('horaEnvio', time)}
              placeholder="Seleccionar hora de envío"
            />
          </div>


          {/* Previsualización del mensaje */}
          {(formData.encuesta || formData.telefono || formData.whatsapp || formData.fechaEnvio || formData.horaEnvio || formData.fechaCorte) && (
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
                  {formData.fechaCorte && (
                    <div>
                      <strong>📅 Fecha de corte:</strong> {formData.fechaCorte.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                  {formData.fechaEnvio && (
                    <div>
                      <strong>📅 Fecha de envío:</strong> {formData.fechaEnvio.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                  {formData.horaEnvio && (
                    <div>
                      <strong>🕐 Hora de envío:</strong> {formData.horaEnvio}
                    </div>
                  )}
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  <strong>ℹ️ Nota:</strong> Los datos de los jueces (avance, nombre, etc.) se obtendrán automáticamente de la selección realizada.
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
