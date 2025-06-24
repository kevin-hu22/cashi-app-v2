// src/navigation/NavigationService.js
import { CommonActions, createNavigationContainerRef, StackActions } from '@react-navigation/native';
import { ROUTES } from './navigationTypes';

/**
 * Servicio de navegación global
 * Permite navegar desde cualquier parte de la app sin prop drilling
 */
class NavigationService {
  constructor() {
    this.navigationRef = createNavigationContainerRef();
    this.isReady = false;
  }

  // ==================== CONFIGURACIÓN ====================

  /**
   * Marca el navegador como listo
   */
  setIsReady(ready) {
    this.isReady = ready;
  }

  /**
   * Verifica si el navegador está listo
   */
  checkIsReady() {
    if (!this.navigationRef.isReady() || !this.isReady) {
      console.warn('Navegador no está listo todavía');
      return false;
    }
    return true;
  }

  // ==================== NAVEGACIÓN BÁSICA ====================

  /**
   * Navega a una pantalla
   * @param {string} name - Nombre de la pantalla
   * @param {object} params - Parámetros de navegación
   */
  navigate(name, params) {
    if (!this.checkIsReady()) return;
    
    this.navigationRef.navigate(name, params);
  }

  /**
   * Navega hacia atrás
   */
  goBack() {
    if (!this.checkIsReady()) return;
    
    if (this.navigationRef.canGoBack()) {
      this.navigationRef.goBack();
    }
  }

  /**
   * Navega a la pantalla anterior en el stack
   * @param {number} count - Número de pantallas a retroceder
   */
  pop(count = 1) {
    if (!this.checkIsReady()) return;
    
    this.navigationRef.dispatch(StackActions.pop(count));
  }

  /**
   * Navega a la primera pantalla del stack
   */
  popToTop() {
    if (!this.checkIsReady()) return;
    
    this.navigationRef.dispatch(StackActions.popToTop());
  }

  // ==================== NAVEGACIÓN AVANZADA ====================

  /**
   * Resetea el stack de navegación
   * @param {string} routeName - Nombre de la ruta
   * @param {object} params - Parámetros
   */
  reset(routeName, params) {
    if (!this.checkIsReady()) return;
    
    this.navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      })
    );
  }

  /**
   * Resetea a múltiples rutas
   * @param {Array} routes - Array de rutas
   * @param {number} index - Índice de la ruta activa
   */
  resetWithMultipleRoutes(routes, index = 0) {
    if (!this.checkIsReady()) return;
    
    this.navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes,
      })
    );
  }

  /**
   * Reemplaza la pantalla actual
   * @param {string} name - Nombre de la pantalla
   * @param {object} params - Parámetros
   */
  replace(name, params) {
    if (!this.checkIsReady()) return;
    
    this.navigationRef.dispatch(
      StackActions.replace(name, params)
    );
  }

  /**
   * Agrega una nueva pantalla al stack
   * @param {string} name - Nombre de la pantalla
   * @param {object} params - Parámetros
   */
  push(name, params) {
    if (!this.checkIsReady()) return;
    
    this.navigationRef.dispatch(
      StackActions.push(name, params)
    );
  }

  // ==================== NAVEGACIÓN ESPECÍFICA ====================

  /**
   * Navega al home (resetea todo)
   */
  navigateToHome() {
    this.reset(ROUTES.MAIN.TABS);
  }

  /**
   * Navega al login (cierra sesión)
   */
  navigateToLogin() {
    this.reset('Auth');
  }

  /**
   * Navega al detalle de una venta
   * @param {string} saleId - ID de la venta
   */
  navigateToSaleDetail(saleId) {
    this.navigate(ROUTES.MAIN.SALE_DETAIL, { saleId });
  }

  /**
   * Navega a reportes
   * @param {object} options - Opciones de navegación
   */
  navigateToReports(options = {}) {
    this.navigate(ROUTES.MAIN.REPORTS, options);
  }

  /**
   * Navega a exportar
   * @param {object} options - Opciones de navegación
   */
  navigateToExport(options = {}) {
    this.navigate(ROUTES.MAIN.EXPORT, options);
  }

  /**
   * Navega al perfil
   */
  navigateToProfile() {
    this.navigate(ROUTES.MAIN.PROFILE);
  }

  // ==================== UTILIDADES ====================

  /**
   * Obtiene la ruta actual
   * @returns {object} Ruta actual
   */
  getCurrentRoute() {
    if (!this.checkIsReady()) return null;
    
    return this.navigationRef.getCurrentRoute();
  }

  /**
   * Obtiene el nombre de la pantalla actual
   * @returns {string} Nombre de la pantalla
   */
  getCurrentRouteName() {
    const route = this.getCurrentRoute();
    return route?.name || null;
  }

  /**
   * Obtiene los parámetros de la ruta actual
   * @returns {object} Parámetros
   */
  getCurrentRouteParams() {
    const route = this.getCurrentRoute();
    return route?.params || {};
  }

  /**
   * Verifica si puede navegar hacia atrás
   * @returns {boolean}
   */
  canGoBack() {
    if (!this.checkIsReady()) return false;
    
    return this.navigationRef.canGoBack();
  }

  /**
   * Agrega un listener de navegación
   * @param {function} callback - Función callback
   * @returns {function} Función para remover el listener
   */
  addListener(event, callback) {
    if (!this.navigationRef.current) return () => {};
    
    return this.navigationRef.current.addListener(event, callback);
  }

  /**
   * Ejecuta una acción cuando el navegador esté listo
   * @param {function} callback - Función a ejecutar
   */
  runWhenReady(callback) {
    const checkAndRun = () => {
      if (this.isReady && this.navigationRef.isReady()) {
        callback();
      } else {
        setTimeout(checkAndRun, 100);
      }
    };
    checkAndRun();
  }
}

// Crear y exportar instancia única
const navigationService = new NavigationService();

// Exportar funciones helper para uso directo
export const navigate = (name, params) => navigationService.navigate(name, params);
export const goBack = () => navigationService.goBack();
export const reset = (routeName, params) => navigationService.reset(routeName, params);
export const replace = (name, params) => navigationService.replace(name, params);
export const push = (name, params) => navigationService.push(name, params);
export const navigateToHome = () => navigationService.navigateToHome();
export const navigateToLogin = () => navigationService.navigateToLogin();
export const navigateToSaleDetail = (saleId) => navigationService.navigateToSaleDetail(saleId);

export default navigationService;