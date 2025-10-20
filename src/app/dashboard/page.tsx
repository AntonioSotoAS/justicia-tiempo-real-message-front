export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6">
                <div className="grid auto-rows-min gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center p-3 sm:p-4">
                    <div className="text-center">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-1 sm:mb-2">Casos Activos</h3>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">24</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center p-3 sm:p-4">
                    <div className="text-center">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-1 sm:mb-2">Audiencias Hoy</h3>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">8</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center p-3 sm:p-4">
                    <div className="text-center">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-1 sm:mb-2">Resoluciones</h3>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">12</p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 min-h-[50vh] sm:min-h-[60vh] lg:min-h-[100vh] flex-1 rounded-xl lg:min-h-min p-3 sm:p-4 lg:p-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4">Bienvenido al Dashboard</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Sistema de gestión judicial en tiempo real. Aquí puedes monitorear casos, 
                    audiencias y resoluciones del sistema judicial.
                  </p>
                </div>
    </div>
  )
}
