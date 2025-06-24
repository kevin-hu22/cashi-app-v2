// src/navigation/navigationTypes.js

/**
 * Tipos de rutas para navegación type-safe
 * Útil si decides migrar a TypeScript en el futuro
 */
export const ROUTES = {
  // Auth Stack
  AUTH: {
    LOGIN: 'Login',
    SIGNUP: 'Signup',
    FORGOT_PASSWORD: 'ForgotPassword',
  },
  
  // Main Stack
  MAIN: {
    TABS: 'MainTabs',
    SALE_DETAIL: 'SaleDetail',
    PROFILE: 'Profile',
    REPORTS: 'Reports',
    EXPORT: 'Export',
  },
  
  // Tab Navigator
  TABS: {
    HOME: 'Home',
    SUMMARY: 'Summary',
    SETTINGS: 'Settings',
  },
};

/**
 * Parámetros de navegación para cada pantalla
 */
export const ROUTE_PARAMS = {
  [ROUTES.MAIN.SALE_DETAIL]: {
    saleId: 'string', // ID de la venta
  },
  [ROUTES.MAIN.REPORTS]: {
    initialPeriod: 'string', // 'day' | 'week' | 'month' | 'year'
    initialDate: 'Date', // Fecha inicial opcional
  },
  [ROUTES.MAIN.EXPORT]: {
    dateRange: 'object', // { start: Date, end: Date }
    preselectedType: 'string', // 'csv' | 'pdf' | 'excel'
  },
};

/**
 * Opciones de navegación predefinidas
 */
export const NAVIGATION_OPTIONS = {
  // Transiciones
  transitions: {
    slide: {
      animation: 'slide_from_right',
    },
    fade: {
      animation: 'fade',
    },
    modal: {
      presentation: 'modal',
      animation: 'slide_from_bottom',
    },
  },
  
  // Estilos de header
  headerStyles: {
    primary: {
      headerStyle: {
        backgroundColor: '#00151F',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 18,
      },
    },
    light: {
      headerStyle: {
        backgroundColor: '#F8F8F8',
      },
      headerTintColor: '#00151F',
      headerTitleStyle: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 18,
      },
    },
    transparent: {
      headerTransparent: true,
      headerTintColor: '#00151F',
      headerTitleStyle: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: 18,
      },
    },
  },
};

/**
 * Funciones de navegación helper
 */
export const navigationHelpers = {
  /**
   * Navega a la pantalla de detalle de venta
   * @param {object} navigation - Objeto de navegación
   * @param {string} saleId - ID de la venta
   */
  goToSaleDetail: (navigation, saleId) => {
    navigation.navigate(ROUTES.MAIN.SALE_DETAIL, { saleId });
  },
  
  /**
   * Navega a la pantalla de reportes
   * @param {object} navigation - Objeto de navegación
   * @param {object} options - Opciones de navegación
   */
  goToReports: (navigation, options = {}) => {
    navigation.navigate(ROUTES.MAIN.REPORTS, options);
  },
  
  /**
   * Navega a la pantalla de exportación
   * @param {object} navigation - Objeto de navegación
   * @param {object} options - Opciones de navegación
   */
  goToExport: (navigation, options = {}) => {
    navigation.navigate(ROUTES.MAIN.EXPORT, options);
  },
  
  /**
   * Navega al perfil
   * @param {object} navigation - Objeto de navegación
   */
  goToProfile: (navigation) => {
    navigation.navigate(ROUTES.MAIN.PROFILE);
  },
  
  /**
   * Regresa a la pantalla anterior
   * @param {object} navigation - Objeto de navegación
   */
  goBack: (navigation) => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  },
  
  /**
   * Navega al inicio (resetea el stack)
   * @param {object} navigation - Objeto de navegación
   */
  goToHome: (navigation) => {
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.MAIN.TABS }],
    });
  },
  
  /**
   * Navega al login (cierra sesión)
   * @param {object} navigation - Objeto de navegación
   */
  goToLogin: (navigation) => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  },
};