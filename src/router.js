let routes = [];

export function createRoute(path, component){
  routes.push({path, component});
}
export function navigateRoute() {
  const path = window.location.pathname; // Get the current path
  console.log("Navigating to:", path);

  const route = routes.find(route => route.path === path);
  if (route) {
    const component = new route.component();
    document.getElementById('root').innerHTML = component.component();
  } else {
    document.getElementById('root').innerHTML = '404 - Not Found';
  }
}
