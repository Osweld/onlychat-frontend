# OnlyChat Frontend

Una aplicación de chat moderna y elegante construida con Angular 19.2.4. Esta es la interfaz de usuario para la plataforma OnlyChat que permite a los usuarios comunicarse en tiempo real.

## 🚀 Características

- 💬 Chat en tiempo real
- 🎨 Interfaz moderna y responsiva
- 🔐 Autenticación de usuarios
- 📱 Compatible con dispositivos móviles
- ⚡ Optimizado para rendimiento

## 🛠️ Tecnologías

- **Angular** 19.2.4
- **TypeScript**
- **Angular CLI**
- **Karma** (Testing)
- **RxJS** (Programación reactiva)

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Angular CLI](https://angular.dev/cli) globalmente instalado

```bash
npm install -g @angular/cli
```

## 🔧 Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/osweld/onlychat-frontend.git
   cd onlychat-frontend
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```
   Edita el archivo `environment.ts` con tus configuraciones.

## 🚀 Uso

### Servidor de desarrollo

Para iniciar el servidor de desarrollo:

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`. La aplicación se recargará automáticamente cuando modifiques los archivos fuente.

### Construcción para producción

Para construir el proyecto para producción:

```bash
ng build
```

Los archivos de construcción se almacenarán en el directorio `dist/`. Por defecto, la construcción de producción optimiza tu aplicación para rendimiento y velocidad.

Para construcción con configuración específica:

```bash
ng build --configuration production
```

## 🔧 Configuración

### Variables de entorno

Crea y configura los archivos de entorno:

- `src/environments/environment.ts` - Desarrollo
- `src/environments/environment.prod.ts` - Producción

Ejemplo de configuración:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://url/api',
  wsUrl: 'ws://url',
  appName: 'OnlyChat'
};
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**German Reyes** - [@osweld](https://github.com/osweld)

---

⭐ ¡¡Dale una estrella si te ha gustado el proyecto!
